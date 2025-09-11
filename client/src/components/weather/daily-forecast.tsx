import { DailyForecastItem } from "@shared/schema";
import { getWeatherIcon } from "./weather-icons";
import { UnitsConfig } from "@/pages/home";

interface DailyForecastProps {
  dailyForecast: DailyForecastItem[];
  unitsConfig: UnitsConfig;
}

export default function DailyForecast({ dailyForecast, unitsConfig }: DailyForecastProps) {
  const formatTemperature = (temp: number) => {
    const symbol = unitsConfig.temperature === "celsius" ? "°" : "°F";
    return `${temp}${symbol}`;
  };

  return (
    <div className="mt-8" data-testid="section-daily-forecast">
      <h3 className="text-xl font-semibold text-foreground mb-4" data-testid="heading-daily-forecast">
        Daily forecast
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {dailyForecast.map((day, index) => (
          <div 
            key={day.date} 
            className="forecast-card p-4 rounded-lg text-center"
            data-testid={`card-daily-forecast-${index}`}
          >
            <p className="text-sm text-muted-foreground mb-3" data-testid={`text-day-${index}`}>
              {day.dayName}
            </p>
            <div className="mx-auto mb-3" data-testid={`icon-daily-${index}`}>
              {getWeatherIcon(day.weatherCode, "w-8 h-8 mx-auto")}
            </div>
            <p className="text-sm font-semibold text-foreground" data-testid={`text-max-temp-${index}`}>
              {formatTemperature(day.maxTemp)}
            </p>
            <p className="text-xs text-muted-foreground" data-testid={`text-min-temp-${index}`}>
              {formatTemperature(day.minTemp)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
