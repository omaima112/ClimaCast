import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { WeatherData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Units } from "@/pages/home";

interface GeolocationCoords {
  latitude: number;
  longitude: number;
}

interface GeolocationRequest {
  latitude: number;
  longitude: number;
  units: Units;
}

export function useGeolocation() {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { toast } = useToast();

  const weatherByLocationMutation = useMutation({
    mutationFn: async (request: GeolocationRequest) => {
      const response = await apiRequest("POST", "/api/weather/coordinates", request);
      return response.json();
    },
    onSuccess: (data: WeatherData) => {
      toast({
        title: "Location detected",
        description: `Showing weather for ${data.location.city}, ${data.location.country}`,
      });
    },
    onError: (error: any) => {
      console.error("Geolocation weather error:", error);
      toast({
        title: "Error fetching location weather",
        description: error.message || "Failed to fetch weather data for your location.",
        variant: "destructive",
      });
    },
  });

  const getCurrentPosition = useCallback((): Promise<GeolocationCoords> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          let errorMessage = "Failed to get your location";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied. Please enable location access in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
          }
          
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }, []);

  const getWeatherByLocation = useCallback(async (units: Units, onSuccess: (data: WeatherData) => void): Promise<WeatherData | null> => {
    setIsGettingLocation(true);
    
    try {
      const coords = await getCurrentPosition();
      
      const result = await weatherByLocationMutation.mutateAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
        units,
      });
      
      // Call the success callback to update the main weather state
      onSuccess(result);
      
      return result;
    } catch (error: any) {
      toast({
        title: "Location error",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGettingLocation(false);
    }
  }, [getCurrentPosition, weatherByLocationMutation, toast]);

  const checkGeolocationSupport = useCallback(() => {
    return "geolocation" in navigator;
  }, []);

  return {
    getWeatherByLocation,
    getCurrentPosition,
    checkGeolocationSupport,
    isGettingLocation: isGettingLocation || weatherByLocationMutation.isPending,
    error: weatherByLocationMutation.error?.message || null,
    isSupported: checkGeolocationSupport(),
  };
}