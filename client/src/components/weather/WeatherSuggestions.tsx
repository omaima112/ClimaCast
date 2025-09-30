import { WeatherData } from "@/types/schema";
import { Umbrella, Glasses, Wind, Snowflake, AlertTriangle, Sun } from "lucide-react";


interface WeatherSuggestionsProps {
  weatherData: WeatherData;
}

export default function WeatherSuggestions({ weatherData }: WeatherSuggestionsProps) {
  const getWeatherSuggestions = () => {
    const suggestions = [];
    const { weatherCode, temperature, windSpeed, precipitation } = weatherData.current;

    // Rain suggestions
    if (weatherCode >= 51 && weatherCode <= 67 || weatherCode >= 80 && weatherCode <= 82) {
      suggestions.push({
        icon: <Umbrella className="w-5 h-5" />,
        text: "Don't forget your umbrella! Rain is expected today.",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
      });
    }

    // Snow suggestions
    if (weatherCode >= 71 && weatherCode <= 77 || weatherCode >= 85 && weatherCode <= 86) {
      suggestions.push({
        icon: <Snowflake className="w-5 h-5" />,
        text: "Bundle up! Snow is in the forecast. Wear warm layers.",
        color: "text-cyan-500",
        bg: "bg-cyan-500/10",
      });
    }

    // Sunny/Hot weather
    if (weatherCode === 0 && temperature > 25) {
      suggestions.push({
        icon: <Glasses className="w-5 h-5" />,

        text: "It's sunny and hot! Wear sunglasses and apply sunscreen.",
        color: "text-orange-500",
        bg: "bg-orange-500/10",
      });
    } else if (weatherCode === 0) {
      suggestions.push({
        icon: <Sun className="w-5 h-5" />,
        text: "Perfect weather for outdoor activities!",
        color: "text-yellow-500",
        bg: "bg-yellow-500/10",
      });
    }

    // Windy conditions
    if (windSpeed > 30) {
      suggestions.push({
        icon: <Wind className="w-5 h-5" />,
        text: "High winds expected. Secure loose objects outdoors.",
        color: "text-purple-500",
        bg: "bg-purple-500/10",
      });
    }

    // Thunderstorm warnings
    if (weatherCode >= 95 && weatherCode <= 99) {
      suggestions.push({
        icon: <AlertTriangle className="w-5 h-5" />,
        text: "Thunderstorm alert! Stay indoors and avoid open areas.",
        color: "text-red-500",
        bg: "bg-red-500/10",
      });
    }

    // Cold temperature warning
    if (temperature < 5) {
      suggestions.push({
        icon: <Snowflake className="w-5 h-5" />,
        text: "Very cold temperatures. Dress in warm layers!",
        color: "text-blue-600",
        bg: "bg-blue-600/10",
      });
    }

    return suggestions;
  };

  const suggestions = getWeatherSuggestions();

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3" data-testid="weather-suggestions">
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          className={`flex items-center gap-3 p-4 rounded-xl border ${suggestion.bg} ${suggestion.color} border-current/20 backdrop-blur-sm transition-all hover:scale-[1.02]`}
          data-testid={`suggestion-${index}`}
        >
          <div className="flex-shrink-0">
            {suggestion.icon}
          </div>
          <p className="text-sm font-medium">{suggestion.text}</p>
        </div>
      ))}
    </div>
  );
}