import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  Zap, 
  CloudDrizzle,
  Eye,
  Wind,
  CloudHail
} from "lucide-react";

export function getWeatherIcon(weatherCode: number, className: string = "w-6 h-6") {
  // Weather code mapping based on OpenWeatherMap API codes
  if (weatherCode >= 200 && weatherCode < 300) {
    // Thunderstorm
    return <Zap className={`${className} text-yellow-400`} />;
  } else if (weatherCode >= 300 && weatherCode < 400) {
    // Drizzle
    return <CloudDrizzle className={`${className} text-blue-400`} />;
  } else if (weatherCode >= 500 && weatherCode < 600) {
    // Rain
    return <CloudRain className={`${className} text-blue-500`} />;
  } else if (weatherCode >= 600 && weatherCode < 700) {
    // Snow
    return <CloudSnow className={`${className} text-blue-200`} />;
  } else if (weatherCode >= 700 && weatherCode < 800) {
    // Atmosphere (mist, fog, etc.)
    return <Eye className={`${className} text-gray-400`} />;
  } else if (weatherCode === 800) {
    // Clear sky
    return <Sun className={`${className} text-weather-orange`} />;
  } else if (weatherCode > 800 && weatherCode < 900) {
    // Clouds
    if (weatherCode === 801) {
      // Few clouds
      return <Cloud className={`${className} text-gray-300`} />;
    } else {
      // More clouds
      return <Cloud className={`${className} text-gray-400`} />;
    }
  } else {
    // Default/unknown
    return <Sun className={`${className} text-weather-orange`} />;
  }
}
