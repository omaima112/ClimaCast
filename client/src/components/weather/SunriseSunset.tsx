import { Sunrise, Sunset } from "lucide-react";

interface SunriseSunsetProps {
  sunrise: string;
  sunset: string;
}

export default function SunriseSunset({ sunrise, sunset }: SunriseSunsetProps) {
  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString("en-US", { 
        hour: "numeric", 
        minute: "2-digit",
        hour12: true 
      });
    } catch {
      return timeString;
    }
  };

  // Calculate progress for visual indicator
  const calculateDaylightProgress = () => {
    const now = new Date();
    const sunriseTime = new Date(sunrise);
    const sunsetTime = new Date(sunset);
    
    if (now < sunriseTime) return 0;
    if (now > sunsetTime) return 100;
    
    const totalDaylight = sunsetTime.getTime() - sunriseTime.getTime();
    const elapsed = now.getTime() - sunriseTime.getTime();
    return (elapsed / totalDaylight) * 100;
  };

  const progress = calculateDaylightProgress();

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Sun Times</h3>
      
      <div className="space-y-4">
        {/* Sunrise */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Sunrise className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">Sunrise</p>
              <p className="text-lg font-semibold text-white">{formatTime(sunrise)}</p>
            </div>
          </div>
        </div>

        {/* Daylight Progress Bar */}
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="absolute h-full bg-gradient-to-r from-orange-400 to-purple-500 transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-400 rounded-full shadow-lg transition-all duration-500"
            style={{ left: `${progress}%`, marginLeft: '-8px' }}
          />
        </div>

        {/* Sunset */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Sunset className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">Sunset</p>
              <p className="text-lg font-semibold text-white">{formatTime(sunset)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}