import { WeatherData } from "@/types/schema";
import { getWeatherIcon } from "./weather-icons";
import { UnitsConfig } from "@/pages/home";
import { AddToFavorites } from "./add-to-favorites";

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
    <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 rounded-2xl p-8 text-white relative overflow-hidden mb-6" data-testid="card-main-weather">
      <div className="absolute top-4 right-8 w-20 h-20 bg-orange-400/20 rounded-full"></div>
      <div className="absolute bottom-8 left-4 w-12 h-12 bg-white/10 rounded-full"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2" data-testid="text-location">
              {weatherData.location.city}, {weatherData.location.country}
            </h2>
            <p className="text-white/80 text-lg" data-testid="text-date">
              {formatDate()}
            </p>
          </div>
          <AddToFavorites weatherData={weatherData} />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="weather-icon" data-testid="icon-weather">
              {getWeatherIcon(weatherData.current.weatherCode, "w-16 h-16")}
            </div>
            <div>
              <div className="text-7xl font-bold leading-none" data-testid="text-temperature">
                {formatTemperature(weatherData.current.temperature)}
              </div>
              <p className="text-white/70 text-lg mt-2">
                {weatherData.current.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}