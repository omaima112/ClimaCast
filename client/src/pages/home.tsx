import { useState, useEffect } from "react";
import { Loader2, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

import Header from "@/components/weather/header";
import SearchSection from "@/components/weather/search-section";
import MainWeatherCard from "@/components/weather/main-weather-card";
import WeatherMetrics from "@/components/weather/weather-metrics";
import DailyForecast from "@/components/weather/daily-forecast";
import HourlyForecast from "@/components/weather/hourly-forecast";
import { FavoritesSection } from "@/components/weather/favorites-section";
import WeatherSuggestions from "@/components/weather/WeatherSuggestions";
import WeatherCharts from "@/components/weather/weather-charts";
import CompareLocations from "@/components/weather/compare-locations";

import { useWeather } from "@/hooks/use-weather";
import { useGeolocation } from "@/hooks/use-geolocation";

import type { WeatherData, FavoriteCity } from "@/types/schema";

// ---------------- Types ----------------
export type Units = "metric" | "imperial";

export interface UnitsConfig {
  temperature: "celsius" | "fahrenheit";
  windSpeed: "kmh" | "mph";
  precipitation: "mm" | "inches";
}

export interface HomeProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

// ---------------- Component ----------------
export default function Home({ theme, toggleTheme }: HomeProps) {
  // ---------------- State ----------------
  const [units, setUnits] = useState<Units>("metric");
  const [unitsConfig, setUnitsConfig] = useState<UnitsConfig>({
    temperature: "celsius",
    windSpeed: "kmh",
    precipitation: "mm",
  });
  const [hasAttemptedGeolocation, setHasAttemptedGeolocation] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // ---------------- Hooks ----------------
  const {
    weatherData,
    isLoading,
    error,
    searchWeather,
    searchWeatherByCoordinates,
  } = useWeather();

  const { getCurrentPosition, checkGeolocationSupport } = useGeolocation();

  // ---------------- Effects ----------------
  useEffect(() => {
    if (!hasAttemptedGeolocation && !weatherData && checkGeolocationSupport()) {
      setHasAttemptedGeolocation(true);

      const autoDetectLocation = async () => {
        try {
          const coords = await getCurrentPosition();
          searchWeatherByCoordinates({
            latitude: coords.latitude,
            longitude: coords.longitude,
            units,
          });
        } catch (error) {
          console.warn("Automatic geolocation failed:", error);
        }
      };

      autoDetectLocation();
    }
  }, [
    hasAttemptedGeolocation,
    weatherData,
    getCurrentPosition,
    searchWeatherByCoordinates,
    units,
    checkGeolocationSupport,
  ]);

  // ---------------- Handlers ----------------
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
    } catch (error) {
      console.error("Geolocation error:", error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleFavoriteSelect = (favoriteCity: FavoriteCity) => {
    searchWeatherByCoordinates({
      latitude: favoriteCity.latitude,
      longitude: favoriteCity.longitude,
      units,
    });
  };

  const handleUnitsChange = (newUnits: Units, newUnitsConfig: UnitsConfig) => {
    setUnits(newUnits);
    setUnitsConfig(newUnitsConfig);

    if (weatherData) {
      if (weatherData.location.coordinates) {
        searchWeatherByCoordinates({
          latitude: weatherData.location.coordinates.latitude,
          longitude: weatherData.location.coordinates.longitude,
          units: newUnits,
        });
      } else {
        searchWeather({ city: weatherData.location.city, units: newUnits });
      }
    }
  };

  // ---------------- Render ----------------
  return (
    <div className="weather-app-bg min-h-screen">
      <div className="min-h-screen p-4 lg:p-8">
        {/* Theme toggle button */}
        <div className="flex justify-end mb-4">
          <Button
            onClick={toggleTheme}
            variant="ghost"
            className="flex items-center gap-2 text-white hover:bg-white/10"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-4 h-4" />
                Switch to Light Mode
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" />
                Switch to Dark Mode
              </>
            )}
          </Button>
        </div>

        {/* Header */}
        <Header
          units={units}
          unitsConfig={unitsConfig}
          onUnitsChange={handleUnitsChange}
        />

        <div className="max-w-7xl mx-auto">
          {/* Search section */}
          <SearchSection
            onSearch={handleSearch}
            onLocationSearch={handleLocationSearch}
            isLoading={isLoading}
            isLocationLoading={isGettingLocation}
            isLocationSupported={checkGeolocationSupport()}
            error={error}
          />

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Favorites */}
            <div className="xl:col-span-1">
              <FavoritesSection onCitySelect={handleFavoriteSelect} />
            </div>

            {/* Main Weather Content */}
            {weatherData ? (
              <div className="xl:col-span-3 animate-fade-in">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <div className="xl:col-span-2 space-y-6">
                    <MainWeatherCard
                      weatherData={weatherData}
                      unitsConfig={unitsConfig}
                    />
                    
                    {/* Weather Suggestions */}
                    <WeatherSuggestions weatherData={weatherData} />
                    
                    <WeatherMetrics
                      weatherData={weatherData}
                      unitsConfig={unitsConfig}
                    />

                    {/* Comparison Toggle */}
                    <div className="flex gap-2">
                      <Button
                        variant={showComparison ? "default" : "outline"}
                        onClick={() => setShowComparison(!showComparison)}
                        className="text-white border-white/20 hover:bg-white/10"
                      >
                        {showComparison ? "Hide" : "Show"} Location Comparison
                      </Button>
                    </div>

                    {/* Location Comparison */}
                    {showComparison && (
                      <CompareLocations
                        currentWeather={weatherData}
                        unitsConfig={unitsConfig}
                        units={units}
                      />
                    )}

                    {/* Weather Charts */}
                    <WeatherCharts
                      weatherData={weatherData}
                      unitsConfig={unitsConfig}
                    />
                    
                    <DailyForecast
                      dailyForecast={weatherData.daily}
                      unitsConfig={unitsConfig}
                    />
                  </div>
                  <div className="xl:col-span-1">
                    <HourlyForecast
                      hourlyForecast={weatherData.hourly}
                      unitsConfig={unitsConfig}
                    />
                  </div>
                </div>
              </div>
            ) : (
              // Empty state
              <div className="xl:col-span-3 flex items-center justify-center">
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🌤️</div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Welcome to Weather App
                  </h2>
                  <p className="text-muted-foreground">
                    Search for a city or use your current location to get
                    started
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Loading Overlay */}
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

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}