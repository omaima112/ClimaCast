export interface WeatherApiError {
  message: string;
  errors?: Array<{
    path: string[];
    message: string;
  }>;
}

export interface GeolocationCoords {
  latitude: number;
  longitude: number;
}

export interface WeatherSearchParams {
  city: string;
  units: "metric" | "imperial";
}
