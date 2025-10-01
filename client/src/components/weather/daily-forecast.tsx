import { DailyForecastItem } from "@/types/schema";
import { getWeatherIcon } from "./weather-icons";
import { UnitsConfig } from "@/pages/home";

interface DailyForecastProps {
  dailyForecast: DailyForecastItem[];
  unitsConfig: UnitsConfig;
}

export default function DailyForecast({ dailyForecast, unitsConfig }: DailyForecastProps) {
  const formatTemperature = (temp: number) => {
    const symbol = unitsConfig.temperature === "celsius" ? "°C" : "°F";
    return `${temp}${symbol}`;
  };

  const formatDayName = (date: string) => {
    const dayDate = new Date(date);
    return dayDate.toLocaleDateString("en-US", { weekday: "short" });
  };

  return (
    <div className="mt-8" data-testid="section-daily-forecast">
      <h3 className="text-xl font-semibold text-white mb-6" data-testid="heading-daily-forecast">
        Daily forecast
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {dailyForecast.map((day, index) => (
          <div 
            key={`${day.date}-${index}`} 
            className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 p-4 rounded-xl text-center group cursor-pointer"
            data-testid={`card-daily-forecast-${index}`}
          >
            <p className="text-sm text-white/80 mb-3 font-medium" data-testid={`text-day-${index}`}>
              {formatDayName(day.date)}
            </p>
            <div className="mx-auto mb-3 transition-transform group-hover:scale-110" data-testid={`icon-daily-${index}`}>
              {getWeatherIcon(day.weatherCode, "w-8 h-8 mx-auto")}
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-white" data-testid={`text-max-temp-${index}`}>
                {formatTemperature(day.maxTemp)}
              </p>
              <p className="text-sm text-white/60" data-testid={`text-min-temp-${index}`}>
                {formatTemperature(day.minTemp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}