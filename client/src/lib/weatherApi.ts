import { WeatherData, WeatherRequest } from "@/types/schema";

const OPEN_METEO_BASE = "https://api.open-meteo.com/v1";

// Weather code descriptions based on Open-Meteo WMO codes
function getWeatherDescription(code: number): string {
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
}

// Format time from ISO string to "3 PM" format
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", { 
    hour: "numeric", 
    hour12: true 
  });
}

// Get day name from date string
function getDayName(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  
  // Check if it's today
  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }
  
  // Check if it's tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  }
  
  // Otherwise show the day name
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function mapOpenMeteoToWeatherData(params: {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  units: "metric" | "imperial";
  current: any;
  hourly: any;
  daily: any;
}): WeatherData {
  const { city, country, latitude, longitude, units, current, hourly, daily } = params;

  // Map hourly data (take first 8 hours)
  const hourlyItems = (hourly.time as string[]).slice(0, 8).map((t, i) => ({
    time: formatTime(t),
    temperature: Math.round(hourly.temperature_2m[i] || 0),
    weatherCode: hourly.weather_code?.[i] || 0,
    windSpeed: Math.round(hourly.wind_speed_10m?.[i] || 0),
    precipitation: Math.round(hourly.precipitation?.[i] || 0),
    description: getWeatherDescription(hourly.weather_code?.[i] || 0),
  }));

  // Map daily data (take first 7 days)
  const dailyItems = (daily.time as string[]).slice(0, 7).map((d, i) => ({
    date: d,
    dayName: getDayName(d),
    maxTemp: Math.round(daily.temperature_2m_max[i] || 0),
    minTemp: Math.round(daily.temperature_2m_min[i] || 0),
    weatherCode: daily.weather_code?.[i] || 0,
    precipitation: Math.round(daily.precipitation_sum?.[i] || 0),
    description: getWeatherDescription(daily.weather_code?.[i] || 0),
  }));

  return {
    location: {
      city,
      country,
      coordinates: { latitude, longitude },
    },
    current: {
      temperature: Math.round(current.temperature_2m || 0),
      feelsLike: Math.round(current.apparent_temperature || current.temperature_2m || 0), // Fixed: fallback to actual temp
      humidity: Math.round(current.relative_humidity_2m || 0),
      windSpeed: Math.round(current.wind_speed_10m || 0),
      precipitation: Math.round(current.precipitation || 0),
      weatherCode: current.weather_code || 0,
      description: getWeatherDescription(current.weather_code || 0),
    },
    hourly: hourlyItems,
    daily: dailyItems,
  };
}

export async function searchByCity({ city, units }: WeatherRequest): Promise<WeatherData> {
  // Use Open-Meteo geocoding to resolve city → lat/lon
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
  );
  
  if (!geoRes.ok) {
    throw new Error("Failed to search for city");
  }
  
  const geoJson = await geoRes.json();
  if (!geoJson.results || geoJson.results.length === 0) {
    throw new Error("City not found");
  }
  const loc = geoJson.results[0];

  return getWeather({
    latitude: loc.latitude,
    longitude: loc.longitude,
    city: loc.name,
    country: loc.country || "",
    units,
  });
}

export async function getWeather(params: {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  units: "metric" | "imperial";
}): Promise<WeatherData> {
  const { latitude, longitude, city, country, units } = params;
  const tempUnit = units === "metric" ? "celsius" : "fahrenheit";
  const windUnit = units === "metric" ? "kmh" : "mph";
  const precipUnit = units === "metric" ? "mm" : "inch";

  // Updated URL with all the fields we need including apparent_temperature and weather_code
  const url = `${OPEN_METEO_BASE}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,precipitation,weather_code&hourly=temperature_2m,precipitation,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&temperature_unit=${tempUnit}&wind_speed_unit=${windUnit}&precipitation_unit=${precipUnit}&timezone=auto&forecast_days=7`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Weather service unavailable: ${res.status}`);
  }
  
  const json = await res.json();
  
  // Handle case where location name might not be provided
  let locationCity = city;
  let locationCountry = country;
  
  // If we don't have city/country, try reverse geocoding
  if (!city || city === "Your location") {
    try {
      const reverseGeoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`
      );
      if (reverseGeoRes.ok) {
        const reverseGeoJson = await reverseGeoRes.json();
        if (reverseGeoJson.results && reverseGeoJson.results.length > 0) {
          locationCity = reverseGeoJson.results[0].name || "Current Location";
          locationCountry = reverseGeoJson.results[0].country || "";
        }
      }
    } catch (error) {
      console.warn("Reverse geocoding failed:", error);
      locationCity = "Current Location";
    }
  }
  
  return mapOpenMeteoToWeatherData({
    city: locationCity,
    country: locationCountry,
    latitude,
    longitude,
    units,
    current: json.current,
    hourly: json.hourly,
    daily: json.daily,
  });
}