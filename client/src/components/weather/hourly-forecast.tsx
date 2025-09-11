import { useState } from "react";
import { HourlyForecastItem } from "@shared/schema";
import { getWeatherIcon } from "./weather-icons";
import { UnitsConfig } from "@/pages/home";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface HourlyForecastProps {
  hourlyForecast: HourlyForecastItem[];
  unitsConfig: UnitsConfig;
}

export default function HourlyForecast({ hourlyForecast, unitsConfig }: HourlyForecastProps) {
  const [selectedDay, setSelectedDay] = useState("Tuesday");

  const formatTemperature = (temp: number) => {
    const symbol = unitsConfig.temperature === "celsius" ? "°" : "°F";
    return `${temp}${symbol}`;
  };

  const daysOfWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6" data-testid="section-hourly-forecast">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground" data-testid="heading-hourly-forecast">
          Hourly forecast
        </h3>
        <Select value={selectedDay} onValueChange={setSelectedDay}>
          <SelectTrigger className="w-32" data-testid="select-day">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {daysOfWeek.map((day) => (
              <SelectItem key={day} value={day} data-testid={`option-day-${day.toLowerCase()}`}>
                {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {hourlyForecast.map((hour, index) => (
          <div 
            key={`${hour.time}-${index}`} 
            className="hourly-item flex items-center justify-between p-3 rounded-lg"
            data-testid={`item-hourly-${index}`}
          >
            <div className="flex items-center gap-3">
              <div data-testid={`icon-hourly-${index}`}>
                {getWeatherIcon(hour.weatherCode, "w-5 h-5")}
              </div>
              <span className="text-sm text-foreground" data-testid={`text-time-${index}`}>
                {hour.time}
              </span>
            </div>
            <span className="font-semibold text-foreground" data-testid={`text-hourly-temp-${index}`}>
              {formatTemperature(hour.temperature)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
