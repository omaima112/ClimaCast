import { useEffect, useState } from "react";

interface AnimatedWeatherBackgroundProps {
  weatherCode: number;
  className?: string;
}

export default function AnimatedWeatherBackground({ 
  weatherCode, 
  className = "" 
}: AnimatedWeatherBackgroundProps) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    left: number;
    delay: number;
    duration: number;
  }>>([]);

  const getWeatherType = (code: number) => {
    if (code === 0 || code === 1) return "clear";
    if (code === 2 || code === 3) return "cloudy";
    if (code >= 51 && code <= 67) return "rain";
    if (code >= 71 && code <= 77) return "snow";
    if (code >= 95) return "storm";
    return "cloudy";
  };

  const weatherType = getWeatherType(weatherCode);

  useEffect(() => {
    const count = weatherType === "rain" ? 50 : weatherType === "snow" ? 40 : 0;
    if (count === 0) {
      setParticles([]);
      return;
    }

    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 3,
    }));
    
    setParticles(newParticles);
  }, [weatherType]);

  const backgrounds: Record<string, string> = {
    clear: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    cloudy: "linear-gradient(135deg, #4a5568 0%, #2d3748 100%)",
    rain: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
    snow: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
    storm: "linear-gradient(135deg, #1a202c 0%, #2d3748 100%)",
  };

  return (
    <>
      <div 
        className={`fixed inset-0 -z-10 overflow-hidden transition-all duration-1000 ${className}`}
        style={{ background: backgrounds[weatherType] }}
      >
        {(weatherType === "cloudy" || weatherType === "rain" || weatherType === "storm") && (
          <>
            <div className="weather-cloud weather-cloud-1" />
            <div className="weather-cloud weather-cloud-2" />
            <div className="weather-cloud weather-cloud-3" />
          </>
        )}

        {weatherType === "clear" && (
          <div className="weather-sun-container">
            <div className="weather-sun" />
          </div>
        )}

        {(weatherType === "rain" || weatherType === "snow") && (
          <div className="weather-particles-container">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className={weatherType === "rain" ? "weather-raindrop" : "weather-snowflake"}
                style={{
                  left: `${particle.left}%`,
                  animationDelay: `${particle.delay}s`,
                  animationDuration: `${particle.duration}s`,
                }}
              />
            ))}
          </div>
        )}

        {weatherType === "storm" && (
          <div className="weather-lightning" />
        )}
      </div>

      <style>{`
        .weather-cloud {
          position: absolute;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 100px;
          backdrop-filter: blur(10px);
        }

        .weather-cloud::before,
        .weather-cloud::after {
          content: '';
          position: absolute;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 100px;
        }

        .weather-cloud-1 {
          width: 200px;
          height: 60px;
          top: 10%;
          animation: float-weather-cloud 40s linear infinite;
        }

        .weather-cloud-1::before {
          width: 100px;
          height: 80px;
          top: -40px;
          left: 30px;
        }

        .weather-cloud-1::after {
          width: 120px;
          height: 70px;
          top: -35px;
          right: 30px;
        }

        .weather-cloud-2 {
          width: 150px;
          height: 50px;
          top: 25%;
          animation: float-weather-cloud 35s linear infinite 5s;
        }

        .weather-cloud-2::before {
          width: 80px;
          height: 60px;
          top: -30px;
          left: 20px;
        }

        .weather-cloud-2::after {
          width: 90px;
          height: 55px;
          top: -28px;
          right: 20px;
        }

        .weather-cloud-3 {
          width: 180px;
          height: 55px;
          top: 40%;
          animation: float-weather-cloud 45s linear infinite 10s;
        }

        .weather-cloud-3::before {
          width: 90px;
          height: 70px;
          top: -35px;
          left: 25px;
        }

        .weather-cloud-3::after {
          width: 100px;
          height: 65px;
          top: -32px;
          right: 25px;
        }

        @keyframes float-weather-cloud {
          0% { transform: translateX(-10vw); }
          100% { transform: translateX(110vw); }
        }

        .weather-sun-container {
          position: absolute;
          top: 10%;
          right: 15%;
          animation: float-weather-gentle 6s ease-in-out infinite;
        }

        .weather-sun {
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, #ffd700 0%, #ff8c00 100%);
          border-radius: 50%;
          box-shadow: 0 0 60px rgba(255, 215, 0, 0.6);
          animation: pulse-weather-sun 3s ease-in-out infinite;
        }

        @keyframes float-weather-gentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes pulse-weather-sun {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 60px rgba(255, 215, 0, 0.6);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 80px rgba(255, 215, 0, 0.8);
          }
        }

        .weather-particles-container {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .weather-raindrop {
          position: absolute;
          width: 2px;
          height: 20px;
          background: linear-gradient(transparent, rgba(255, 255, 255, 0.6));
          animation: fall-weather-rain linear infinite;
          top: -20px;
        }

        .weather-snowflake {
          position: absolute;
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
          opacity: 0.8;
          animation: fall-weather-snow linear infinite;
          top: -10px;
        }

        @keyframes fall-weather-rain {
          to { transform: translateY(100vh); }
        }

        @keyframes fall-weather-snow {
          to { transform: translateY(100vh) rotate(360deg); }
        }

        .weather-lightning {
          position: absolute;
          width: 100%;
          height: 100%;
          animation: flash-weather 7s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes flash-weather {
          0%, 90%, 92%, 100% { background: transparent; }
          91% { background: rgba(255, 255, 255, 0.3); }
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}