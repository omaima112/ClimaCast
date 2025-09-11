import { WeatherData } from "@shared/schema";
import { getWeatherIcon } from "./weather-icons";
import { UnitsConfig } from "@/pages/home";

interface MainWeatherCardProps {
  weatherData: WeatherData;
  unitsConfig: UnitsConfig;
}

export default function MainWeatherCard({ weatherData, unitsConfig }: MainWeatherCardProps) {
  const formatTemperature = (temp: number) => {
    const symbol = unitsConfig.temperature === "celsius" ? "°C" : "°F";
    return `${temp}${symbol}`;
  };

  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString("en-US", { 
      weekday: "long", 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  return (
    <div className="weather-card p-8 text-white relative z-10" data-testid="card-main-weather">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="mb-6 lg:mb-0">
          <h3 className="text-2xl font-bold mb-2" data-testid="text-location">
            {weatherData.location.city}, {weatherData.location.country}
          </h3>
          <p className="text-neutral-200 mb-6" data-testid="text-date">
            {formatDate()}
          </p>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="weather-icon" data-testid="icon-weather">
            {getWeatherIcon(weatherData.current.weatherCode, "w-20 h-20 text-weather-orange")}
          </div>
          <div className="text-right">
            <div className="text-6xl font-bold" data-testid="text-temperature">
              {formatTemperature(weatherData.current.temperature)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
