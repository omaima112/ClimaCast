import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { WeatherData, WeatherRequest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CoordinatesRequest {
  latitude: number;
  longitude: number;
  units: "metric" | "imperial";
}

export function useWeather() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const { toast } = useToast();

  const searchMutation = useMutation({
    mutationFn: async (request: WeatherRequest) => {
      const response = await apiRequest("POST", "/api/weather/search", request);
      return response.json();
    },
    onSuccess: (data: WeatherData) => {
      setWeatherData(data);
      toast({
        title: "Weather data updated",
        description: `Showing weather for ${data.location.city}, ${data.location.country}`,
      });
    },
    onError: (error: any) => {
      console.error("Weather search error:", error);
      toast({
        title: "Error fetching weather",
        description: error.message || "Failed to fetch weather data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const coordinatesMutation = useMutation({
    mutationFn: async (request: CoordinatesRequest) => {
      const response = await apiRequest("POST", "/api/weather/coordinates", request);
      return response.json();
    },
    onSuccess: (data: WeatherData) => {
      setWeatherData(data);
      toast({
        title: "Location detected",
        description: `Showing weather for ${data.location.city}, ${data.location.country}`,
      });
    },
    onError: (error: any) => {
      console.error("Coordinates weather error:", error);
      toast({
        title: "Error fetching location weather",
        description: error.message || "Failed to fetch weather data for your location.",
        variant: "destructive",
      });
    },
  });

  return {
    weatherData,
    isLoading: searchMutation.isPending || coordinatesMutation.isPending,
    error: searchMutation.error?.message || coordinatesMutation.error?.message || null,
    searchWeather: searchMutation.mutate,
    searchWeatherByCoordinates: coordinatesMutation.mutate,
  };
}
