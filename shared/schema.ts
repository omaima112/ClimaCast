import { z } from "zod";

export const weatherRequestSchema = z.object({
  city: z.string().min(1, "City name is required"),
  units: z.enum(["metric", "imperial"]).default("metric"),
});

export const coordinatesSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export const currentWeatherSchema = z.object({
  temperature: z.number(),
  feelsLike: z.number(),
  humidity: z.number(),
  windSpeed: z.number(),
  precipitation: z.number(),
  weatherCode: z.number(),
  description: z.string(),
});

export const dailyForecastItemSchema = z.object({
  date: z.string(),
  dayName: z.string(),
  maxTemp: z.number(),
  minTemp: z.number(),
  weatherCode: z.number(),
  description: z.string(),
});

export const hourlyForecastItemSchema = z.object({
  time: z.string(),
  temperature: z.number(),
  weatherCode: z.number(),
  description: z.string(),
});

export const weatherDataSchema = z.object({
  location: z.object({
    city: z.string(),
    country: z.string(),
    coordinates: coordinatesSchema,
  }),
  current: currentWeatherSchema,
  daily: z.array(dailyForecastItemSchema),
  hourly: z.array(hourlyForecastItemSchema),
  lastUpdated: z.string(),
});

export type WeatherRequest = z.infer<typeof weatherRequestSchema>;
export type Coordinates = z.infer<typeof coordinatesSchema>;
export type CurrentWeather = z.infer<typeof currentWeatherSchema>;
export type DailyForecastItem = z.infer<typeof dailyForecastItemSchema>;
export type HourlyForecastItem = z.infer<typeof hourlyForecastItemSchema>;
export type WeatherData = z.infer<typeof weatherDataSchema>;
