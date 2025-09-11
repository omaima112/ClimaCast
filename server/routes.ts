import type { Express } from "express";
import { createServer, type Server } from "http";
import { weatherRequestSchema, weatherDataSchema } from "@shared/schema";
import { z } from "zod";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || process.env.API_KEY || "demo_key";
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

// Weather code mapping for Open Weather API
const getWeatherDescription = (code: number): string => {
  const weatherCodes: Record<number, string> = {
    200: "Thunderstorm with light rain",
    201: "Thunderstorm with rain",
    202: "Thunderstorm with heavy rain",
    210: "Light thunderstorm",
    211: "Thunderstorm",
    212: "Heavy thunderstorm",
    221: "Ragged thunderstorm",
    230: "Thunderstorm with light drizzle",
    231: "Thunderstorm with drizzle",
    232: "Thunderstorm with heavy drizzle",
    300: "Light intensity drizzle",
    301: "Drizzle",
    302: "Heavy intensity drizzle",
    310: "Light intensity drizzle rain",
    311: "Drizzle rain",
    312: "Heavy intensity drizzle rain",
    313: "Shower rain and drizzle",
    314: "Heavy shower rain and drizzle",
    321: "Shower drizzle",
    500: "Light rain",
    501: "Moderate rain",
    502: "Heavy intensity rain",
    503: "Very heavy rain",
    504: "Extreme rain",
    511: "Freezing rain",
    520: "Light intensity shower rain",
    521: "Shower rain",
    522: "Heavy intensity shower rain",
    531: "Ragged shower rain",
    600: "Light snow",
    601: "Snow",
    602: "Heavy snow",
    611: "Sleet",
    612: "Light shower sleet",
    613: "Shower sleet",
    615: "Light rain and snow",
    616: "Rain and snow",
    620: "Light shower snow",
    621: "Shower snow",
    622: "Heavy shower snow",
    701: "Mist",
    711: "Smoke",
    721: "Haze",
    731: "Sand/dust whirls",
    741: "Fog",
    751: "Sand",
    761: "Dust",
    762: "Volcanic ash",
    771: "Squalls",
    781: "Tornado",
    800: "Clear sky",
    801: "Few clouds",
    802: "Scattered clouds",
    803: "Broken clouds",
    804: "Overcast clouds",
  };
  return weatherCodes[code] || "Unknown weather condition";
};

const getDayName = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "short" });
};

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString("en-US", { 
    hour: "numeric", 
    hour12: true 
  });
};

async function fetchCoordinates(city: string) {
  const response = await fetch(
    `${OPENWEATHER_BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}`
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("City not found. Please check the spelling and try again.");
    }
    throw new Error(`Weather service unavailable: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    latitude: data.coord.lat,
    longitude: data.coord.lon,
    city: data.name,
    country: data.sys.country,
  };
}

async function fetchWeatherData(lat: number, lon: number, units: string) {
  const currentResponse = await fetch(
    `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${OPENWEATHER_API_KEY}`
  );

  const forecastResponse = await fetch(
    `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${OPENWEATHER_API_KEY}`
  );

  if (!currentResponse.ok || !forecastResponse.ok) {
    throw new Error("Failed to fetch weather data");
  }

  const currentData = await currentResponse.json();
  const forecastData = await forecastResponse.json();

  return { currentData, forecastData };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Search weather by city
  app.post("/api/weather/search", async (req, res) => {
    try {
      const { city, units } = weatherRequestSchema.parse(req.body);

      // Get coordinates for the city
      const locationData = await fetchCoordinates(city);

      // Fetch weather data
      const { currentData, forecastData } = await fetchWeatherData(
        locationData.latitude,
        locationData.longitude,
        units
      );

      // Process daily forecast (get one entry per day for next 7 days)
      const dailyMap = new Map();
      forecastData.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!dailyMap.has(date) && dailyMap.size < 7) {
          dailyMap.set(date, {
            date: new Date(item.dt * 1000).toISOString().split('T')[0],
            dayName: getDayName(new Date(item.dt * 1000).toISOString()),
            maxTemp: Math.round(item.main.temp_max),
            minTemp: Math.round(item.main.temp_min),
            weatherCode: item.weather[0].id,
            description: getWeatherDescription(item.weather[0].id),
          });
        }
      });

      // Process hourly forecast (next 24 hours)
      const hourlyForecast = forecastData.list.slice(0, 8).map((item: any) => ({
        time: formatTime(item.dt),
        temperature: Math.round(item.main.temp),
        weatherCode: item.weather[0].id,
        description: getWeatherDescription(item.weather[0].id),
      }));

      const weatherData = {
        location: {
          city: locationData.city,
          country: locationData.country,
          coordinates: {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
          },
        },
        current: {
          temperature: Math.round(currentData.main.temp),
          feelsLike: Math.round(currentData.main.feels_like),
          humidity: currentData.main.humidity,
          windSpeed: Math.round(currentData.wind.speed),
          precipitation: currentData.rain?.["1h"] || currentData.snow?.["1h"] || 0,
          weatherCode: currentData.weather[0].id,
          description: getWeatherDescription(currentData.weather[0].id),
        },
        daily: Array.from(dailyMap.values()),
        hourly: hourlyForecast,
        lastUpdated: new Date().toISOString(),
      };

      // Validate the response
      const validatedData = weatherDataSchema.parse(weatherData);
      res.json(validatedData);
    } catch (error) {
      console.error("Weather API error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
