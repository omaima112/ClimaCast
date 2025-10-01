import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, ChevronDown } from "lucide-react";
import { Units, UnitsConfig } from "@/pages/home";

interface HeaderProps {
  units: Units;
  unitsConfig: UnitsConfig;
  onUnitsChange: (units: Units, unitsConfig: UnitsConfig) => void;
}

export default function Header({ units, unitsConfig, onUnitsChange }: HeaderProps) {
  const [isUnitsOpen, setIsUnitsOpen] = useState(false);

  const handleUnitsToggle = () => {
    setIsUnitsOpen(!isUnitsOpen);
  };

  const handleQuickSwitch = () => {
    const newUnits: Units = units === "metric" ? "imperial" : "metric";
    const newUnitsConfig: UnitsConfig = newUnits === "metric" 
      ? { temperature: "celsius", windSpeed: "kmh", precipitation: "mm" }
      : { temperature: "fahrenheit", windSpeed: "mph", precipitation: "inches" };
    
    onUnitsChange(newUnits, newUnitsConfig);
    setIsUnitsOpen(false);
  };

  const handleTemperatureChange = (temp: "celsius" | "fahrenheit") => {
    const newUnitsConfig = { ...unitsConfig, temperature: temp };
    const newUnits: Units = temp === "celsius" ? "metric" : "imperial";
    onUnitsChange(newUnits, newUnitsConfig);
  };

  const handleWindSpeedChange = (speed: "kmh" | "mph") => {
    const newUnitsConfig = { ...unitsConfig, windSpeed: speed };
    onUnitsChange(units, newUnitsConfig);
  };

  const handlePrecipitationChange = (precip: "mm" | "inches") => {
    const newUnitsConfig = { ...unitsConfig, precipitation: precip };
    onUnitsChange(units, newUnitsConfig);
  };

  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="6" fill="#FF8C00"/>
            <path d="M16 2V6M16 26V30M30 16H26M6 16H2M25.66 6.34L22.83 9.17M9.17 22.83L6.34 25.66M25.66 25.66L22.83 22.83M9.17 9.17L6.34 6.34" 
                  stroke="#FF8C00" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 className="text-2xl font-heading font-bold text-white" data-testid="app-title">Weather Now</h1>
      </div>
      
      <div className="relative">
        <Button
          variant="ghost"
          onClick={handleUnitsToggle}
          className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
          data-testid="button-units-toggle"
        >
          <Settings className="w-4 h-4" />
          <span data-testid="text-units-display">Units</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
        
        {isUnitsOpen && (
          <div 
            className="absolute right-0 top-full mt-2 w-64 bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-xl p-4 z-50"
            data-testid="dropdown-units"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Quick Switch</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleQuickSwitch}
                  data-testid="button-quick-switch"
                >
                  Switch to {units === "metric" ? "Imperial" : "Metric"}
                </Button>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Temperature</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={unitsConfig.temperature === "celsius" ? "default" : "secondary"}
                    onClick={() => handleTemperatureChange("celsius")}
                    data-testid="button-celsius"
                  >
                    Celsius (°C)
                  </Button>
                  <Button
                    size="sm"
                    variant={unitsConfig.temperature === "fahrenheit" ? "default" : "secondary"}
                    onClick={() => handleTemperatureChange("fahrenheit")}
                    data-testid="button-fahrenheit"
                  >
                    Fahrenheit (°F)
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Wind Speed</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={unitsConfig.windSpeed === "kmh" ? "default" : "secondary"}
                    onClick={() => handleWindSpeedChange("kmh")}
                    data-testid="button-kmh"
                  >
                    km/h
                  </Button>
                  <Button
                    size="sm"
                    variant={unitsConfig.windSpeed === "mph" ? "default" : "secondary"}
                    onClick={() => handleWindSpeedChange("mph")}
                    data-testid="button-mph"
                  >
                    mph
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Precipitation</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={unitsConfig.precipitation === "mm" ? "default" : "secondary"}
                    onClick={() => handlePrecipitationChange("mm")}
                    data-testid="button-mm"
                  >
                    Millimeters (mm)
                  </Button>
                  <Button
                    size="sm"
                    variant={unitsConfig.precipitation === "inches" ? "default" : "secondary"}
                    onClick={() => handlePrecipitationChange("inches")}
                    data-testid="button-inches"
                  >
                    Inches (in)
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
