import { WeatherData } from "@shared/schema";
import { UnitsConfig } from "@/pages/home";

interface WeatherMetricsProps {
  weatherData: WeatherData;
  unitsConfig: UnitsConfig;
}

export default function WeatherMetrics({ weatherData, unitsConfig }: WeatherMetricsProps) {
  const formatTemperature = (temp: number) => {
    const symbol = unitsConfig.temperature === "celsius" ? "°" : "°F";
    return `${temp}${symbol}`;
  };

  const formatWindSpeed = (speed: number) => {
    const unit = unitsConfig.windSpeed === "kmh" ? "km/h" : "mph";
    return `${speed} ${unit}`;
  };

  const formatPrecipitation = (precip: number) => {
    const unit = unitsConfig.precipitation === "mm" ? "mm" : "in";
    return `${precip} ${unit}`;
  };

  const metrics = [
    {
      label: "Feels Like",
      value: formatTemperature(weatherData.current.feelsLike),
      testId: "metric-feels-like"
    },
    {
      label: "Humidity",
      value: `${weatherData.current.humidity}%`,
      testId: "metric-humidity"
    },
    {
      label: "Wind",
      value: formatWindSpeed(weatherData.current.windSpeed),
      testId: "metric-wind"
    },
    {
      label: "Precipitation",
      value: formatPrecipitation(weatherData.current.precipitation),
      testId: "metric-precipitation"
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6" data-testid="grid-weather-metrics">
      {metrics.map((metric) => (
        <div key={metric.label} className="metric-card p-4 rounded-lg" data-testid={metric.testId}>
          <p className="text-muted-foreground text-sm mb-1">{metric.label}</p>
          <p className="text-xl font-semibold text-foreground">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}
