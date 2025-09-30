import { useState } from "react";
import { useWeather } from "@/hooks/use-weather";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { getWeatherIcon } from "@/components/weather/weather-icons";

import type { WeatherData } from "@/types/schema";
import type { UnitsConfig, Units } from "@/pages/home";

interface CompareLocationsProps {
  currentWeather: WeatherData;
  unitsConfig: UnitsConfig;
  units: Units;
}

export default function CompareLocations({ currentWeather, unitsConfig, units }: CompareLocationsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { weatherData: compareWeather, isLoading, searchWeather } = useWeather();

  const handleCompare = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchWeather({ city: searchQuery.trim(), units });
    }
  };

  const formatTemperature = (temp: number) => {
    const symbol = unitsConfig.temperature === "celsius" ? "°C" : "°F";
    return `${temp}${symbol}`;
  };

  const formatWindSpeed = (speed: number) => {
    const unit = unitsConfig.windSpeed === "kmh" ? " km/h" : " mph";
    return `${speed}${unit}`;
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-6">
      <h3 className="text-xl font-semibold text-white mb-4">Compare Locations</h3>

      <form onSubmit={handleCompare} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
          <Input
            type="text"
            placeholder="Enter city to compare..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !searchQuery.trim()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Compare"}
        </Button>
      </form>

      {compareWeather && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current Location */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-3">
              {currentWeather.location.city}, {currentWeather.location.country}
            </h4>
            <div className="flex items-center gap-4 mb-4">
              {getWeatherIcon(currentWeather.current.weatherCode, "w-12 h-12")}
              <div>
                <div className="text-3xl font-bold text-white">
                  {formatTemperature(currentWeather.current.temperature)}
                </div>
                <div className="text-white/70">{currentWeather.current.description}</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-white/80">
                <span>Feels Like:</span>
                <span className="font-semibold">{formatTemperature(currentWeather.current.feelsLike)}</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Humidity:</span>
                <span className="font-semibold">{currentWeather.current.humidity}%</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Wind:</span>
                <span className="font-semibold">{formatWindSpeed(currentWeather.current.windSpeed)}</span>
              </div>
            </div>
          </div>

          {/* Comparison Location */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-3">
              {compareWeather.location.city}, {compareWeather.location.country}
            </h4>
            <div className="flex items-center gap-4 mb-4">
              {getWeatherIcon(compareWeather.current.weatherCode, "w-12 h-12")}
              <div>
                <div className="text-3xl font-bold text-white">
                  {formatTemperature(compareWeather.current.temperature)}
                </div>
                <div className="text-white/70">{compareWeather.current.description}</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-white/80">
                <span>Feels Like:</span>
                <span className="font-semibold">{formatTemperature(compareWeather.current.feelsLike)}</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Humidity:</span>
                <span className="font-semibold">{compareWeather.current.humidity}%</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Wind:</span>
                <span className="font-semibold">{formatWindSpeed(compareWeather.current.windSpeed)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {compareWeather && (
        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h5 className="text-white font-semibold mb-2">Comparison Summary:</h5>
          <div className="text-sm text-white/80 space-y-1">
            <p>
              Temperature difference: {Math.abs(currentWeather.current.temperature - compareWeather.current.temperature).toFixed(1)}° 
              {currentWeather.current.temperature > compareWeather.current.temperature 
                ? ` (${currentWeather.location.city} is warmer)` 
                : ` (${compareWeather.location.city} is warmer)`}
            </p>
            <p>
              Humidity difference: {Math.abs(currentWeather.current.humidity - compareWeather.current.humidity)}% 
              {currentWeather.current.humidity > compareWeather.current.humidity 
                ? ` (${currentWeather.location.city} is more humid)` 
                : ` (${compareWeather.location.city} is more humid)`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}