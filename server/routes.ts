import type { Express } from "express";
import { createServer, type Server } from "http";
import { 
  weatherRequestSchema, 
  weatherDataSchema, 
  insertFavoriteCitySchema,
  insertAlertPreferenceSchema,
  insertWeatherAlertSchema 
} from "@shared/schema";
import { z } from "zod";
import { storage } from "./storage";

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
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,showers,rain,precipitation,snowfall,surface_pressure,pressure_msl,cloud_cover,weather_code,wind_gusts_10m,wind_direction_10m,wind_speed_10m",
    hourly: "temperature_2m,snow_depth,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,vapour_pressure_deficit,visibility,cloud_cover_high,cloud_cover,weather_code,pressure_msl,surface_pressure,cloud_cover_low,cloud_cover_mid,evapotranspiration,et0_fao_evapotranspiration,soil_temperature_0cm,soil_temperature_6cm,soil_temperature_54cm,wind_speed_10m,wind_speed_120m,wind_direction_10m,wind_direction_80m,wind_direction_120m,wind_direction_180m,temperature_120m,temperature_180m,temperature_80m",
    daily: "rain_sum,showers_sum,snowfall_sum,precipitation_sum,precipitation_hours,precipitation_probability_max,weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,daylight_duration,sunshine_duration,uv_index_max,uv_index_clear_sky_max,sunset,et0_fao_evapotranspiration,shortwave_radiation_sum,wind_direction_10m_dominant,wind_speed_10m_max,wind_gusts_10m_max",
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
        `${GEOCODING_API_URL}/reverse?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`
      );

      let locationData = { name: "Current Location", country: "" };
      if (locationResponse.ok) {
        const locationResult = await locationResponse.json();
        if (locationResult.results && locationResult.results.length > 0) {
          locationData = {
            name: locationResult.results[0].name || "Current Location",
            country: locationResult.results[0].country || "",
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
          precipitation: Math.round(weatherData.current.precipitation || 0),
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

      // Fetch weather data from Open-Meteo
      const weatherData = await fetchWeatherData(
        locationData.latitude,
        locationData.longitude,
        units
      );

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
          city: locationData.city,
          country: locationData.country,
          coordinates: {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
          },
        },
        current: {
          temperature: Math.round(weatherData.current.temperature_2m),
          feelsLike: Math.round(weatherData.current.apparent_temperature),
          humidity: Math.round(weatherData.current.relative_humidity_2m),
          windSpeed: Math.round(weatherData.current.wind_speed_10m),
          precipitation: Math.round(weatherData.current.precipitation || 0),
          weatherCode: weatherData.current.weather_code,
          description: getWeatherDescription(weatherData.current.weather_code),
        },
        daily: dailyForecast,
        hourly: hourlyForecast,
        lastUpdated: new Date().toISOString(),
      };

      // Validate the response
      const validatedData = weatherDataSchema.parse(weatherDataResponse);
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

  // Favorite Cities API endpoints
  
  // Get all favorite cities
  app.get("/api/favorites", async (req, res) => {
    try {
      const favorites = await storage.getFavoriteCities();
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorite cities:", error);
      res.status(500).json({ message: "Failed to fetch favorite cities" });
    }
  });

  // Add a new favorite city
  app.post("/api/favorites", async (req, res) => {
    try {
      const cityData = insertFavoriteCitySchema.parse(req.body);
      const favoriteCity = await storage.addFavoriteCity(cityData);
      res.status(201).json(favoriteCity);
    } catch (error) {
      console.error("Error adding favorite city:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid city data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to add favorite city" });
      }
    }
  });

  // Get a specific favorite city
  app.get("/api/favorites/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const favoriteCity = await storage.getFavoriteCity(id);
      
      if (!favoriteCity) {
        res.status(404).json({ message: "Favorite city not found" });
        return;
      }
      
      res.json(favoriteCity);
    } catch (error) {
      console.error("Error fetching favorite city:", error);
      res.status(500).json({ message: "Failed to fetch favorite city" });
    }
  });

  // Remove a favorite city
  app.delete("/api/favorites/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if city exists first
      const existingCity = await storage.getFavoriteCity(id);
      if (!existingCity) {
        res.status(404).json({ message: "Favorite city not found" });
        return;
      }
      
      await storage.removeFavoriteCity(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing favorite city:", error);
      res.status(500).json({ message: "Failed to remove favorite city" });
    }
  });

  // ==================== ALERT PREFERENCES ENDPOINTS ====================

  // Get all alert preferences
  app.get("/api/alert-preferences", async (req, res) => {
    try {
      const preferences = await storage.getAlertPreferences();
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching alert preferences:", error);
      res.status(500).json({ message: "Failed to fetch alert preferences" });
    }
  });

  // Add a new alert preference
  app.post("/api/alert-preferences", async (req, res) => {
    try {
      const preferenceData = insertAlertPreferenceSchema.parse(req.body);
      const alertPreference = await storage.addAlertPreference(preferenceData);
      res.status(201).json(alertPreference);
    } catch (error) {
      console.error("Error adding alert preference:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid preference data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to add alert preference" });
      }
    }
  });

  // Get a specific alert preference
  app.get("/api/alert-preferences/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const alertPreference = await storage.getAlertPreference(id);
      
      if (!alertPreference) {
        res.status(404).json({ message: "Alert preference not found" });
        return;
      }
      
      res.json(alertPreference);
    } catch (error) {
      console.error("Error fetching alert preference:", error);
      res.status(500).json({ message: "Failed to fetch alert preference" });
    }
  });

  // Update an alert preference
  app.put("/api/alert-preferences/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if preference exists first
      const existingPreference = await storage.getAlertPreference(id);
      if (!existingPreference) {
        res.status(404).json({ message: "Alert preference not found" });
        return;
      }

      const updateData = insertAlertPreferenceSchema.partial().parse(req.body);
      const updatedPreference = await storage.updateAlertPreference(id, updateData);
      res.json(updatedPreference);
    } catch (error) {
      console.error("Error updating alert preference:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid preference data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update alert preference" });
      }
    }
  });

  // Remove an alert preference
  app.delete("/api/alert-preferences/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if preference exists first
      const existingPreference = await storage.getAlertPreference(id);
      if (!existingPreference) {
        res.status(404).json({ message: "Alert preference not found" });
        return;
      }
      
      await storage.removeAlertPreference(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing alert preference:", error);
      res.status(500).json({ message: "Failed to remove alert preference" });
    }
  });

  // ==================== WEATHER ALERTS ENDPOINTS ====================

  // Get all active weather alerts
  app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = await storage.getActiveWeatherAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching weather alerts:", error);
      res.status(500).json({ message: "Failed to fetch weather alerts" });
    }
  });

  // Get alerts for a specific city
  app.get("/api/alerts/city/:city/:country", async (req, res) => {
    try {
      const { city, country } = req.params;
      const alerts = await storage.getWeatherAlertsForCity(decodeURIComponent(city), decodeURIComponent(country));
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching city alerts:", error);
      res.status(500).json({ message: "Failed to fetch city alerts" });
    }
  });

  // Manually add a weather alert
  app.post("/api/alerts", async (req, res) => {
    try {
      const alertData = insertWeatherAlertSchema.parse(req.body);
      const weatherAlert = await storage.addWeatherAlert(alertData);
      res.status(201).json(weatherAlert);
    } catch (error) {
      console.error("Error adding weather alert:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid alert data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to add weather alert" });
      }
    }
  });

  // Deactivate a weather alert
  app.delete("/api/alerts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deactivateWeatherAlert(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deactivating weather alert:", error);
      res.status(500).json({ message: "Failed to deactivate weather alert" });
    }
  });

  // ==================== ALERT CHECKING SYSTEM ====================

  // Function to check weather conditions against alert preferences
  async function checkWeatherForAlerts(lat: number, lon: number, city: string, country: string) {
    try {
      // Get current weather data
      const weatherData = await fetchWeatherData(lat, lon, "metric");
      const current = weatherData.current;
      
      // Get enabled alert preferences for this location or global preferences
      const allPreferences = await storage.getEnabledAlertPreferences();
      const locationPreferences = allPreferences.filter(pref => 
        pref.city === city && pref.country === country
      );

      const alerts = [];

      for (const preference of locationPreferences) {
        // Check temperature thresholds
        if (preference.minTempThreshold !== null && current.temperature_2m < preference.minTempThreshold) {
          alerts.push({
            city: preference.city,
            country: preference.country,
            alertType: "temperature",
            title: `Low Temperature Alert`,
            description: `Temperature has dropped to ${Math.round(current.temperature_2m)}°C, below your threshold of ${preference.minTempThreshold}°C`,
            severity: "moderate",
            startTime: new Date(),
            endTime: null,
            isActive: true,
          });
        }

        if (preference.maxTempThreshold !== null && current.temperature_2m > preference.maxTempThreshold) {
          alerts.push({
            city: preference.city,
            country: preference.country,
            alertType: "temperature",
            title: `High Temperature Alert`,
            description: `Temperature has risen to ${Math.round(current.temperature_2m)}°C, above your threshold of ${preference.maxTempThreshold}°C`,
            severity: "moderate",
            startTime: new Date(),
            endTime: null,
            isActive: true,
          });
        }

        // Check wind speed threshold
        if (preference.windSpeedThreshold !== null && current.wind_speed_10m > preference.windSpeedThreshold) {
          alerts.push({
            city: preference.city,
            country: preference.country,
            alertType: "wind",
            title: `High Wind Speed Alert`,
            description: `Wind speed has reached ${Math.round(current.wind_speed_10m)} km/h, above your threshold of ${preference.windSpeedThreshold} km/h`,
            severity: "warning",
            startTime: new Date(),
            endTime: null,
            isActive: true,
          });
        }

        // Check precipitation threshold
        if (preference.precipitationThreshold !== null && current.precipitation > preference.precipitationThreshold) {
          alerts.push({
            city: preference.city,
            country: preference.country,
            alertType: "precipitation",
            title: `Heavy Precipitation Alert`,
            description: `Heavy precipitation detected: ${current.precipitation}mm, above your threshold of ${preference.precipitationThreshold}mm`,
            severity: "warning",
            startTime: new Date(),
            endTime: null,
            isActive: true,
          });
        }

        // Check severe weather codes
        if (preference.severeCodes) {
          const severeCodes = preference.severeCodes.split(',').map(code => parseInt(code.trim()));
          if (severeCodes.includes(current.weather_code)) {
            const description = getWeatherDescription(current.weather_code);
            let severity = "moderate";
            
            // Determine severity based on weather code
            if ([95, 96, 99].includes(current.weather_code)) {
              severity = "severe"; // Thunderstorms
            } else if ([65, 67, 75, 77, 82].includes(current.weather_code)) {
              severity = "warning"; // Heavy rain/snow
            }

            alerts.push({
              city: preference.city,
              country: preference.country,
              alertType: "severe_weather",
              title: `Severe Weather Alert`,
              description: `${description} detected in your area. Please take appropriate precautions.`,
              severity,
              startTime: new Date(),
              endTime: null,
              isActive: true,
            });
          }
        }
      }

      // Save generated alerts to database
      for (const alert of alerts) {
        await storage.addWeatherAlert(alert);
      }

      return alerts;
    } catch (error) {
      console.error("Error checking weather for alerts:", error);
      return [];
    }
  }

  // Endpoint to manually trigger alert checking for a location
  app.post("/api/alerts/check", async (req, res) => {
    try {
      const checkRequest = z.object({
        latitude: z.number(),
        longitude: z.number(),
        city: z.string(),
        country: z.string(),
      });

      const { latitude, longitude, city, country } = checkRequest.parse(req.body);
      const generatedAlerts = await checkWeatherForAlerts(latitude, longitude, city, country);
      
      res.json({
        message: `Checked weather conditions for ${city}, ${country}`,
        alertsGenerated: generatedAlerts.length,
        alerts: generatedAlerts
      });
    } catch (error) {
      console.error("Error checking alerts:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to check weather alerts" });
      }
    }
  });

  // Endpoint to check alerts for all enabled alert preferences
  app.post("/api/alerts/check-all", async (req, res) => {
    try {
      const preferences = await storage.getEnabledAlertPreferences();
      let totalAlertsGenerated = 0;
      const results = [];

      for (const preference of preferences) {
        const alerts = await checkWeatherForAlerts(
          preference.latitude, 
          preference.longitude, 
          preference.city, 
          preference.country
        );
        totalAlertsGenerated += alerts.length;
        results.push({
          location: `${preference.city}, ${preference.country}`,
          alertsGenerated: alerts.length,
          alerts
        });
      }

      // Cleanup expired alerts
      await storage.cleanupExpiredAlerts();

      res.json({
        message: `Checked ${preferences.length} alert preference locations`,
        totalAlertsGenerated,
        results
      });
    } catch (error) {
      console.error("Error checking all alerts:", error);
      res.status(500).json({ message: "Failed to check all weather alerts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
