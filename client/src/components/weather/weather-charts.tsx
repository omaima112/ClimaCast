import { WeatherData } from "@/types/schema";
import { UnitsConfig } from "@/pages/home";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface WeatherChartsProps {
  weatherData: WeatherData;
  unitsConfig: UnitsConfig;
}

export default function WeatherCharts({
  weatherData,
  unitsConfig,
}: WeatherChartsProps) {
  const temperatureData = weatherData.hourly
    ?.slice(0, 12)
    .map((hour) => ({
      time:
        hour.time.includes("PM") || hour.time.includes("AM")
          ? hour.time
          : `${hour.time}:00`,
      temperature: hour.temperature,
    })) ?? [];

  // FIXED: Using REAL wind data from hourly forecast
  const windData = weatherData.hourly
    ?.slice(0, 12)
    .map((hour) => ({
      time:
        hour.time.includes("PM") || hour.time.includes("AM")
          ? hour.time
          : `${hour.time}:00`,
      windSpeed: hour.windSpeed,
    })) ?? [];

  const tempUnit = unitsConfig.temperature === "celsius" ? "°C" : "°F";
  const windUnit = unitsConfig.windSpeed === "kmh" ? "km/h" : "mph";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Temperature Trend (Next 12 Hours)
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={temperatureData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="time"
              stroke="rgba(255,255,255,0.6)"
              tick={{ fill: "rgba(255,255,255,0.6)" }}
              fontSize={12}
            />
            <YAxis
              stroke="rgba(255,255,255,0.6)"
              tick={{ fill: "rgba(255,255,255,0.6)" }}
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(30,30,60,0.9)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: number) => [`${value}${tempUnit}`, "Temperature"]}
            />
            <Legend wrapperStyle={{ color: "rgba(255,255,255,0.8)" }} />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#FF8C00"
              strokeWidth={3}
              dot={{ fill: "#FF8C00", r: 4 }}
              activeDot={{ r: 6 }}
              name={`Temperature (${tempUnit})`}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Wind Speed Trend (Next 12 Hours)
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={windData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="time"
              stroke="rgba(255,255,255,0.6)"
              tick={{ fill: "rgba(255,255,255,0.6)" }}
              fontSize={12}
            />
            <YAxis
              stroke="rgba(255,255,255,0.6)"
              tick={{ fill: "rgba(255,255,255,0.6)" }}
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(30,30,60,0.9)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: number) => [`${value} ${windUnit}`, "Wind Speed"]}
            />
            <Legend wrapperStyle={{ color: "rgba(255,255,255,0.8)" }} />
            <Line
              type="monotone"
              dataKey="windSpeed"
              stroke="#4B9EFF"
              strokeWidth={3}
              dot={{ fill: "#4B9EFF", r: 4 }}
              activeDot={{ r: 6 }}
              name={`Wind Speed (${windUnit})`}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}