import { z } from "zod";
import { pgTable, varchar, timestamp, text, real, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations, sql } from "drizzle-orm";

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

// Database Tables
export const favoriteCities = pgTable("favorite_cities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  country: varchar("country", { length: 255 }).notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const weatherAlerts = pgTable("weather_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  city: varchar("city", { length: 255 }).notNull(),
  country: varchar("country", { length: 255 }).notNull(),
  alertType: varchar("alert_type", { length: 100 }).notNull(), // severe, warning, watch, etc.
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  severity: varchar("severity", { length: 50 }).notNull(), // minor, moderate, severe, extreme
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const alertPreferences = pgTable("alert_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  country: varchar("country", { length: 255 }).notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  
  // Temperature thresholds
  minTempThreshold: real("min_temp_threshold"),
  maxTempThreshold: real("max_temp_threshold"),
  
  // Wind speed threshold (km/h)
  windSpeedThreshold: real("wind_speed_threshold"),
  
  // Precipitation threshold (mm)
  precipitationThreshold: real("precipitation_threshold"),
  
  // Severe weather codes to alert on
  severeCodes: varchar("severe_codes", { length: 500 }).default("95,96,99"), // thunderstorms by default
  
  isEnabled: boolean("is_enabled").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Zod Schemas for Database Models
export const insertFavoriteCitySchema = createInsertSchema(favoriteCities).omit({
  id: true,
  addedAt: true,
});

export const selectFavoriteCitySchema = createSelectSchema(favoriteCities);

export const insertWeatherAlertSchema = createInsertSchema(weatherAlerts).omit({
  id: true,
  createdAt: true,
});

export const selectWeatherAlertSchema = createSelectSchema(weatherAlerts);

export const insertAlertPreferenceSchema = createInsertSchema(alertPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectAlertPreferenceSchema = createSelectSchema(alertPreferences);

// Types
export type WeatherRequest = z.infer<typeof weatherRequestSchema>;
export type Coordinates = z.infer<typeof coordinatesSchema>;
export type CurrentWeather = z.infer<typeof currentWeatherSchema>;
export type DailyForecastItem = z.infer<typeof dailyForecastItemSchema>;
export type HourlyForecastItem = z.infer<typeof hourlyForecastItemSchema>;
export type WeatherData = z.infer<typeof weatherDataSchema>;

export type FavoriteCity = z.infer<typeof selectFavoriteCitySchema>;
export type InsertFavoriteCity = z.infer<typeof insertFavoriteCitySchema>;
export type WeatherAlert = z.infer<typeof selectWeatherAlertSchema>;
export type InsertWeatherAlert = z.infer<typeof insertWeatherAlertSchema>;
export type AlertPreference = z.infer<typeof selectAlertPreferenceSchema>;
export type InsertAlertPreference = z.infer<typeof insertAlertPreferenceSchema>;
