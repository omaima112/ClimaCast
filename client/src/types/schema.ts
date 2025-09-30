export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationInfo {
  city: string;
  country: string;
  coordinates?: Coordinates | null;
}

export interface WeatherRequest {
  city: string;
  units: "metric" | "imperial";
}

export interface HourlyForecastItem {
  weatherCode: number;
  time: string;          // e.g. "14:00"
  temperature: number;   // in °C or °F
  windSpeed?: number;    // in km/h or mph (optional)
  precipitation?: number; // in mm (optional)
  icon?: string;         // weather icon code (optional)
  description?: string;  // weather description (optional)
}

export interface DailyForecastItem {
  weatherCode: number;
  dayName: string;       // Changed from ReactNode to string
  date: string;          // e.g. "2025-09-27"
  maxTemp: number;       // max temperature
  minTemp: number;       // min temperature
  precipitation?: number; // in mm (optional)
  icon?: string;         // weather icon code (optional)
  description?: string;  // weather description (optional)
}

export interface WeatherData {
  dailyForecast: any;
  hourlyForecast: any;
  location: LocationInfo;
  current: {
    feelsLike: number;
    weatherCode: number;
    temperature: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    description: string;
    icon?: string;
  };
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
}

export interface FavoriteCity {
  id: string;     // unique identifier
  name: string;   // display name
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