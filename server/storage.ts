import { 
  favoriteCities, 
  weatherAlerts, 
  type FavoriteCity, 
  type InsertFavoriteCity,
  type WeatherAlert,
  type InsertWeatherAlert
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

// Storage interface for weather app features
export interface IStorage {
  // Favorite Cities
  getFavoriteCities(): Promise<FavoriteCity[]>;
  addFavoriteCity(city: InsertFavoriteCity): Promise<FavoriteCity>;
  removeFavoriteCity(id: string): Promise<void>;
  getFavoriteCity(id: string): Promise<FavoriteCity | undefined>;
  
  // Weather Alerts
  getActiveWeatherAlerts(): Promise<WeatherAlert[]>;
  getWeatherAlertsForCity(city: string, country: string): Promise<WeatherAlert[]>;
  addWeatherAlert(alert: InsertWeatherAlert): Promise<WeatherAlert>;
  deactivateWeatherAlert(id: string): Promise<void>;
  cleanupExpiredAlerts(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Favorite Cities
  async getFavoriteCities(): Promise<FavoriteCity[]> {
    return await db.select().from(favoriteCities).orderBy(desc(favoriteCities.addedAt));
  }

  async addFavoriteCity(city: InsertFavoriteCity): Promise<FavoriteCity> {
    const [favoriteCity] = await db
      .insert(favoriteCities)
      .values(city)
      .returning();
    return favoriteCity;
  }

  async removeFavoriteCity(id: string): Promise<void> {
    await db.delete(favoriteCities).where(eq(favoriteCities.id, id));
  }

  async getFavoriteCity(id: string): Promise<FavoriteCity | undefined> {
    const [city] = await db.select().from(favoriteCities).where(eq(favoriteCities.id, id));
    return city || undefined;
  }

  // Weather Alerts
  async getActiveWeatherAlerts(): Promise<WeatherAlert[]> {
    return await db
      .select()
      .from(weatherAlerts)
      .where(eq(weatherAlerts.isActive, true))
      .orderBy(desc(weatherAlerts.createdAt));
  }

  async getWeatherAlertsForCity(city: string, country: string): Promise<WeatherAlert[]> {
    return await db
      .select()
      .from(weatherAlerts)
      .where(
        and(
          eq(weatherAlerts.city, city),
          eq(weatherAlerts.country, country),
          eq(weatherAlerts.isActive, true)
        )
      )
      .orderBy(desc(weatherAlerts.startTime));
  }

  async addWeatherAlert(alert: InsertWeatherAlert): Promise<WeatherAlert> {
    const [weatherAlert] = await db
      .insert(weatherAlerts)
      .values(alert)
      .returning();
    return weatherAlert;
  }

  async deactivateWeatherAlert(id: string): Promise<void> {
    await db
      .update(weatherAlerts)
      .set({ isActive: false })
      .where(eq(weatherAlerts.id, id));
  }

  async cleanupExpiredAlerts(): Promise<void> {
    const now = new Date();
    await db
      .update(weatherAlerts)
      .set({ isActive: false })
      .where(and(
        eq(weatherAlerts.isActive, true),
        // Only deactivate if endTime is set and has passed
        sql`${weatherAlerts.endTime} IS NOT NULL AND ${weatherAlerts.endTime} < ${now}`
      ));
  }
}

export const storage = new DatabaseStorage();
