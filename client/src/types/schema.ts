export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationInfo {
  city: string;
  country: string;
  coordinates: Coordinates;
}

export interface WeatherRequest {
  city: string;
  units: "metric" | "imperial";
}

export interface HourlyForecastItem {
  weatherCode: number;
  time: string;
  temperature: number;
  windSpeed: number;
  precipitation: number;
  description: string;
}

export interface DailyForecastItem {
  weatherCode: number;
  dayName: string;
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitation: number;
  description: string;
  sunrise?: string;
  sunset?: string;
  uvIndex?: number;
}

export interface WeatherData {
  location: LocationInfo;
  current: {
    feelsLike: number;
    weatherCode: number;
    temperature: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    uvIndex: number;
    pressure: number;
    description: string;
  };
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  todaySunrise?: string;
  todaySunset?: string;
}

export interface FavoriteCity {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

export interface InsertFavoriteCity {
  name: string;
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}