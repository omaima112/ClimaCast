import type { Express } from "express";
import { createServer, type Server } from "http";
import { weatherRequestSchema, weatherDataSchema } from "@shared/schema";
import { z } from "zod";

const OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1";
const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1";

// Weather code mapping for Open-Meteo WMO codes
const getWeatherDescription = (code: number): string => {
  const weatherCodes: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
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
    `${GEOCODING_API_URL}/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
  );

  if (!response.ok) {
    throw new Error(`Geocoding service unavailable: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.results || data.results.length === 0) {
    throw new Error("City not found. Please check the spelling and try again.");
  }

  const result = data.results[0];
  return {
    latitude: result.latitude,
    longitude: result.longitude,
    city: result.name,
    country: result.country,
  };
}

async function fetchWeatherData(lat: number, lon: number, units: string) {
  // Convert units - Open-Meteo uses different unit system
  const temperatureUnit = units === "imperial" ? "fahrenheit" : "celsius";
  const windSpeedUnit = units === "imperial" ? "mph" : "kmh";
  const precipitationUnit = units === "imperial" ? "inch" : "mm";

  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m",
    hourly: "temperature_2m,weather_code,time",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,time",
    temperature_unit: temperatureUnit,
    wind_speed_unit: windSpeedUnit,
    precipitation_unit: precipitationUnit,
    timezone: "auto",
    forecast_days: "7"
  });

  const response = await fetch(`${OPEN_METEO_BASE_URL}/forecast?${params}`);

  if (!response.ok) {
    throw new Error("Failed to fetch weather data from Open-Meteo");
  }

  const data = await response.json();
  return data;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Search weather by coordinates (for geolocation)
  app.post("/api/weather/coordinates", async (req, res) => {
    try {
      const coordinatesRequest = z.object({
        latitude: z.number(),
        longitude: z.number(),
        units: z.enum(["metric", "imperial"]).default("metric"),
      });

      const { latitude, longitude, units } = coordinatesRequest.parse(req.body);

      // Get location name from coordinates (reverse geocoding)
      const locationResponse = await fetch(
        `${GEOCODING_API_URL}/search?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`
      );

      let locationData = { name: "Unknown", country: "Unknown" };
      if (locationResponse.ok) {
        const locationResult = await locationResponse.json();
        if (locationResult.results && locationResult.results.length > 0) {
          locationData = {
            name: locationResult.results[0].name,
            country: locationResult.results[0].country,
          };
        }
      }

      // Fetch weather data from Open-Meteo
      const weatherData = await fetchWeatherData(latitude, longitude, units);

      // Process daily forecast
      const dailyForecast = weatherData.daily.time.slice(0, 7).map((date: string, index: number) => ({
        date,
        dayName: getDayName(date),
        maxTemp: Math.round(weatherData.daily.temperature_2m_max[index]),
        minTemp: Math.round(weatherData.daily.temperature_2m_min[index]),
        weatherCode: weatherData.daily.weather_code[index],
        description: getWeatherDescription(weatherData.daily.weather_code[index]),
      }));

      // Process hourly forecast (next 8 hours)
      const hourlyForecast = weatherData.hourly.time.slice(0, 8).map((time: string, index: number) => ({
        time: formatTime(new Date(time).getTime() / 1000),
        temperature: Math.round(weatherData.hourly.temperature_2m[index]),
        weatherCode: weatherData.hourly.weather_code[index],
        description: getWeatherDescription(weatherData.hourly.weather_code[index]),
      }));

      const weatherDataResponse = {
        location: {
          city: locationData.name,
          country: locationData.country,
          coordinates: {
            latitude,
            longitude,
          },
        },
        current: {
          temperature: Math.round(weatherData.current.temperature_2m),
          feelsLike: Math.round(weatherData.current.apparent_temperature),
          humidity: Math.round(weatherData.current.relative_humidity_2m),
          windSpeed: Math.round(weatherData.current.wind_speed_10m),
          precipitation: weatherData.current.precipitation || 0,
          weatherCode: weatherData.current.weather_code,
          description: getWeatherDescription(weatherData.current.weather_code),
        },
        daily: dailyForecast,
        hourly: hourlyForecast,
        lastUpdated: new Date().toISOString(),
      };

      const validatedData = weatherDataSchema.parse(weatherDataResponse);
      res.json(validatedData);
    } catch (error) {
      console.error("Geolocation weather API error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

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
