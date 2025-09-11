import { useState } from "react";
import Header from "@/components/weather/header";
import SearchSection from "@/components/weather/search-section";
import MainWeatherCard from "@/components/weather/main-weather-card";
import WeatherMetrics from "@/components/weather/weather-metrics";
import DailyForecast from "@/components/weather/daily-forecast";
import HourlyForecast from "@/components/weather/hourly-forecast";
import { WeatherData } from "@shared/schema";
import { useWeather } from "@/hooks/use-weather";
import { useGeolocation } from "@/hooks/use-geolocation";
import { Loader2 } from "lucide-react";

export type Units = "metric" | "imperial";

export interface UnitsConfig {
  temperature: "celsius" | "fahrenheit";
  windSpeed: "kmh" | "mph";
  precipitation: "mm" | "inches";
}

export default function Home() {
  const [units, setUnits] = useState<Units>("metric");
  const [unitsConfig, setUnitsConfig] = useState<UnitsConfig>({
    temperature: "celsius",
    windSpeed: "kmh",
    precipitation: "mm",
  });
  
  const { weatherData, isLoading, error, searchWeather, searchWeatherByCoordinates } = useWeather();
  const { getCurrentPosition, checkGeolocationSupport } = useGeolocation();
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleSearch = (city: string) => {
    searchWeather({ city, units });
  };

  const handleLocationSearch = async () => {
    setIsGettingLocation(true);
    try {
      const coords = await getCurrentPosition();
      searchWeatherByCoordinates({
        latitude: coords.latitude,
        longitude: coords.longitude,
        units,
      });
    } catch (error: any) {
      console.error("Geolocation error:", error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleUnitsChange = (newUnits: Units, newUnitsConfig: UnitsConfig) => {
    setUnits(newUnits);
    setUnitsConfig(newUnitsConfig);
    
    // Re-fetch weather data with new units if we have current weather data
    if (weatherData) {
      searchWeather({ city: weatherData.location.city, units: newUnits });
    }
  };

  return (
    <div className="weather-app-bg min-h-screen">
      <div className="min-h-screen p-4 lg:p-8">
        <Header 
          units={units}
          unitsConfig={unitsConfig}
          onUnitsChange={handleUnitsChange}
        />
        
        <div className="max-w-7xl mx-auto">
          <SearchSection 
            onSearch={handleSearch} 
            onLocationSearch={handleLocationSearch}
            isLoading={isLoading} 
            isLocationLoading={isGettingLocation}
            isLocationSupported={checkGeolocationSupport()}
            error={error} 
          />
          
          {weatherData && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                <MainWeatherCard weatherData={weatherData} unitsConfig={unitsConfig} />
                <WeatherMetrics weatherData={weatherData} unitsConfig={unitsConfig} />
                <DailyForecast dailyForecast={weatherData.daily} unitsConfig={unitsConfig} />
              </div>
              <div className="xl:col-span-1">
                <HourlyForecast hourlyForecast={weatherData.hourly} unitsConfig={unitsConfig} />
              </div>
            </div>
          )}
          
          {isLoading && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-foreground">Loading weather data...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
