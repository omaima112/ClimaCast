import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { WeatherData, WeatherRequest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

  return {
    weatherData,
    isLoading: searchMutation.isPending,
    error: searchMutation.error?.message || null,
    searchWeather: searchMutation.mutate,
  };
}
