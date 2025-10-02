import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWeatherIcon } from "./weather-icons";
import { UnitsConfig } from "@/pages/home";

interface HourlyForecastItem {
  time: string;
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  precipitation: number;
  description: string;
}

interface EnhancedHourlyForecastProps {
  hourlyForecast: HourlyForecastItem[];
  unitsConfig: UnitsConfig;
}

export default function EnhancedHourlyForecast({ 
  hourlyForecast,
  unitsConfig 
}: EnhancedHourlyForecastProps) {
  const [selectedDay] = useState(0);

  const formatTemperature = (temp: number) => {
    const symbol = unitsConfig.temperature === "celsius" ? "°C" : "°F";
    return `${temp}${symbol}`;
  };

  const formatTime = (timeString: string) => {
    if (timeString.includes("PM") || timeString.includes("AM")) {
      return timeString;
    }
    
    try {
      const [hours] = timeString.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  const limitedForecast = hourlyForecast.slice(0, 8);

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6" data-testid="section-hourly-forecast">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white" data-testid="heading-hourly-forecast">
          Hourly forecast
        </h3>
        <span className="text-sm text-white/60">Today</span>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {limitedForecast.map((hour, index) => (
          <div 
            key={`${hour.time}-${index}`} 
            className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            data-testid={`item-hourly-${index}`}
          >
            <div className="flex items-center gap-3">
              <div data-testid={`icon-hourly-${index}`}>
                {getWeatherIcon(hour.weatherCode, "w-6 h-6")}
              </div>
              <span className="text-sm text-white font-medium" data-testid={`text-time-${index}`}>
                {formatTime(hour.time)}
              </span>
            </div>
            <span className="font-semibold text-white text-lg" data-testid={`text-hourly-temp-${index}`}>
              {formatTemperature(hour.temperature)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}