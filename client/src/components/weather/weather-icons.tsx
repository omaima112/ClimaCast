// Import custom weather icons
import iconSunny from "@assets/icon-sunny_1757617387016.webp";
import iconPartlyCloudy from "@assets/icon-partly-cloudy_1757617399895.webp";
import iconOvercast from "@assets/icon-overcast_1757617399895.webp";
import iconRain from "@assets/icon-rain_1757617399895.webp";
import iconDrizzle from "@assets/icon-drizzle_1757617405942.webp";
import iconSnow from "@assets/icon-snow_1757617387015.webp";
import iconStorm from "@assets/icon-storm_1757617387016.webp";

export function getWeatherIcon(weatherCode: number, className: string = "w-6 h-6") {
  // Weather code mapping based on Open-Meteo WMO codes
  if (weatherCode === 0) {
    // Clear sky
    return <img src={iconSunny} alt="Sunny" className={className} />;
  } else if (weatherCode === 1 || weatherCode === 2) {
    // Mainly clear, partly cloudy
    return <img src={iconPartlyCloudy} alt="Partly Cloudy" className={className} />;
  } else if (weatherCode === 3) {
    // Overcast
    return <img src={iconOvercast} alt="Overcast" className={className} />;
  } else if (weatherCode >= 45 && weatherCode <= 48) {
    // Fog and depositing rime fog
    return <img src={iconOvercast} alt="Foggy" className={className} />;
  } else if (weatherCode >= 51 && weatherCode <= 57) {
    // Drizzle: Light, moderate, and dense intensity
    return <img src={iconDrizzle} alt="Drizzle" className={className} />;
  } else if (weatherCode >= 61 && weatherCode <= 67) {
    // Rain: Slight, moderate and heavy intensity
    return <img src={iconRain} alt="Rain" className={className} />;
  } else if (weatherCode >= 71 && weatherCode <= 77) {
    // Snow fall: Slight, moderate, and heavy intensity
    return <img src={iconSnow} alt="Snow" className={className} />;
  } else if (weatherCode >= 80 && weatherCode <= 82) {
    // Rain showers: Slight, moderate, and violent
    return <img src={iconRain} alt="Rain Showers" className={className} />;
  } else if (weatherCode >= 85 && weatherCode <= 86) {
    // Snow showers slight and heavy
    return <img src={iconSnow} alt="Snow Showers" className={className} />;
  } else if (weatherCode >= 95 && weatherCode <= 99) {
    // Thunderstorm: Slight or moderate, with slight and heavy hail
    return <img src={iconStorm} alt="Thunderstorm" className={className} />;
  } else {
    // Default/unknown - use sunny as fallback
    return <img src={iconSunny} alt="Weather" className={className} />;
  }
}
