import { Sun, AlertTriangle } from "lucide-react";

interface UVIndexProps {
  uvIndex: number;
  maxUVToday?: number;
}

export default function UVIndex({ uvIndex, maxUVToday }: UVIndexProps) {
  const getUVCategory = (uv: number) => {
    if (uv <= 2) return { level: "Low", color: "bg-green-500", textColor: "text-green-500", desc: "No protection needed" };
    if (uv <= 5) return { level: "Moderate", color: "bg-yellow-500", textColor: "text-yellow-500", desc: "Wear sunscreen" };
    if (uv <= 7) return { level: "High", color: "bg-orange-500", textColor: "text-orange-500", desc: "Protection essential" };
    if (uv <= 10) return { level: "Very High", color: "bg-red-500", textColor: "text-red-500", desc: "Extra protection" };
    return { level: "Extreme", color: "bg-purple-600", textColor: "text-purple-500", desc: "Avoid sun exposure" };
  };

  const category = getUVCategory(uvIndex);
  const maxCategory = maxUVToday ? getUVCategory(maxUVToday) : null;
  
  // Calculate percentage for visual bar (max UV is typically 11+)
  const percentage = Math.min((uvIndex / 11) * 100, 100);

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sun className="w-5 h-5 text-yellow-400" />
          UV Index
        </h3>
        {uvIndex > 7 && (
          <AlertTriangle className="w-5 h-5 text-red-400" />
        )}
      </div>

      <div className="space-y-4">
        {/* Current UV Index */}
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold text-white">{uvIndex}</span>
            <span className={`text-lg font-semibold ${category.textColor}`}>
              {category.level}
            </span>
          </div>
          
          {/* UV Index Bar */}
          <div className="relative h-3 bg-white/10 rounded-full overflow-hidden mb-2">
            <div 
              className={`absolute h-full ${category.color} transition-all duration-500 rounded-full`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          <p className="text-sm text-white/70">{category.desc}</p>
        </div>

        {/* Max UV Today */}
        {maxUVToday && maxCategory && (
          <div className="pt-3 border-t border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Peak today:</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-white">{maxUVToday}</span>
                <span className={`text-sm font-medium ${maxCategory.textColor}`}>
                  {maxCategory.level}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Protection Tips */}
        {uvIndex > 2 && (
          <div className="pt-3 border-t border-white/10">
            <p className="text-xs text-white/60">
              💡 Tip: {uvIndex > 7 ? "Seek shade during midday hours" : "Apply SPF 30+ sunscreen"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}