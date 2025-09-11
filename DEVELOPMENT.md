# Development Guide 🛠️

This document provides detailed explanations of the codebase architecture, implementation decisions, and development workflows.

## 📁 Project Structure

```
weather-app/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── components/             # React components
│   │   │   ├── ui/                 # Base UI components (shadcn/ui)
│   │   │   │   ├── button.tsx      # Button component with variants
│   │   │   │   ├── card.tsx        # Card layout components
│   │   │   │   ├── dialog.tsx      # Modal/dialog components
│   │   │   │   ├── input.tsx       # Form input components
│   │   │   │   └── ...             # Other UI primitives
│   │   │   └── weather/            # Weather-specific components
│   │   │       ├── add-to-favorites.tsx    # Favorites add/remove UI
│   │   │       ├── favorites-section.tsx   # Favorites sidebar
│   │   │       ├── main-weather-card.tsx   # Current weather display
│   │   │       ├── weather-icons.tsx       # Custom icon system
│   │   │       └── ...                     # Other weather components
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── use-favorites.ts    # Favorites CRUD operations
│   │   │   ├── use-geolocation.ts  # Browser geolocation API
│   │   │   ├── use-weather.ts      # Weather data fetching
│   │   │   └── use-toast.ts        # Toast notifications
│   │   ├── lib/                    # Utility functions
│   │   │   ├── queryClient.ts      # React Query configuration
│   │   │   └── utils.ts            # General utilities
│   │   ├── pages/                  # Page components
│   │   │   └── home.tsx            # Main application page
│   │   └── index.css               # Global styles and theme
│   └── attached_assets/            # Static assets
│       ├── icon-sunny.webp         # Custom weather icons
│       ├── icon-rain.webp
│       └── ...
├── server/                         # Backend Express application
│   ├── routes.ts                   # API route definitions
│   ├── storage.ts                  # Database operations interface
│   ├── db.ts                       # Database connection setup
│   └── index.ts                    # Server entry point
├── shared/                         # Shared code between frontend/backend
│   └── schema.ts                   # Zod schemas and database models
└── docs/                           # Documentation files
    ├── README.md                   # Main project documentation
    ├── CHANGELOG.md                # Version history and changes
    ├── DEVELOPMENT.md              # This file
    └── API_DOCUMENTATION.md        # API endpoint documentation
```

## 🏗️ Architecture Overview

### Frontend Architecture

The frontend follows a modern React architecture with these key patterns:

#### Component Composition
```typescript
// Main page structure
<Home>
  <Header />
  <SearchSection />
  <FavoritesSection />
  <WeatherContent>
    <MainWeatherCard />
    <WeatherMetrics />
    <DailyForecast />
    <HourlyForecast />
  </WeatherContent>
</Home>
```

#### Custom Hooks Pattern
Custom hooks encapsulate complex logic and provide clean APIs:

```typescript
// Example: useFavorites hook
export function useFavorites() {
  const favoritesQuery = useQuery({ queryKey: ["/api/favorites"] });
  const addMutation = useMutation({ ... });
  const removeMutation = useMutation({ ... });
  
  return {
    favorites: favoritesQuery.data || [],
    isLoading: favoritesQuery.isLoading,
    addFavorite: addMutation.mutate,
    removeFavorite: removeMutation.mutate,
    // ... other methods
  };
}
```

#### State Management
- **React Query**: Server state management with caching
- **useState**: Local component state
- **useEffect**: Side effects and lifecycle management

### Backend Architecture

The backend follows a layered architecture:

#### Layer Structure
1. **Routes Layer** (`routes.ts`): HTTP request/response handling
2. **Storage Layer** (`storage.ts`): Database operations interface
3. **Database Layer** (`db.ts`): Database connection and configuration

#### Interface Pattern
```typescript
// Storage interface for dependency injection
export interface IStorage {
  getFavoriteCities(): Promise<FavoriteCity[]>;
  addFavoriteCity(city: InsertFavoriteCity): Promise<FavoriteCity>;
  removeFavoriteCity(id: string): Promise<void>;
  // ... other methods
}

// Implementation
export class DatabaseStorage implements IStorage {
  async getFavoriteCities(): Promise<FavoriteCity[]> {
    return await db.select().from(favoriteCities).orderBy(desc(favoriteCities.addedAt));
  }
  // ... other implementations
}
```

## 🔧 Key Implementation Details

### Geolocation Integration

#### Automatic Detection
```typescript
// Implemented in client/src/pages/home.tsx
useEffect(() => {
  if (!hasAttemptedGeolocation && !weatherData && checkGeolocationSupport()) {
    setHasAttemptedGeolocation(true);
    
    const autoDetectLocation = async () => {
      try {
        const coords = await getCurrentPosition();
        searchWeatherByCoordinates({
          latitude: coords.latitude,
          longitude: coords.longitude,
          units,
        });
      } catch (error) {
        console.warn("Automatic geolocation failed:", error);
      }
    };

    autoDetectLocation();
  }
}, [hasAttemptedGeolocation, weatherData, getCurrentPosition, searchWeatherByCoordinates, units, checkGeolocationSupport]);
```

#### Manual Location Button
```typescript
// useGeolocation hook provides getCurrentPosition method
export function useGeolocation() {
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 600000, // 10 minutes
      });
    });
  };

  return { getCurrentPosition, checkGeolocationSupport };
}
```

### Favorites System Implementation

#### Database Schema
```typescript
// shared/schema.ts
export const favoriteCities = pgTable("favorite_cities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  country: varchar("country", { length: 255 }).notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});
```

#### API Endpoints
```typescript
// server/routes.ts - RESTful API design
app.get("/api/favorites", async (req, res) => {
  const favorites = await storage.getFavoriteCities();
  res.json(favorites);
});

app.post("/api/favorites", async (req, res) => {
  const cityData = insertFavoriteCitySchema.parse(req.body);
  const favoriteCity = await storage.addFavoriteCity(cityData);
  res.status(201).json(favoriteCity);
});

app.delete("/api/favorites/:id", async (req, res) => {
  const { id } = req.params;
  const existingCity = await storage.getFavoriteCity(id);
  if (!existingCity) {
    res.status(404).json({ message: "Favorite city not found" });
    return;
  }
  await storage.removeFavoriteCity(id);
  res.status(204).send();
});
```

#### Frontend Integration
```typescript
// React Query mutation with cache invalidation
const addFavoriteMutation = useMutation({
  mutationFn: async (cityData: InsertFavoriteCity) => {
    const response = await apiRequest("POST", "/api/favorites", cityData);
    return response.json();
  },
  onSuccess: (data: FavoriteCity) => {
    queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    toast({
      title: "City added to favorites",
      description: `${data.name} has been added to your favorites.`,
    });
  },
  onError: (error: any) => {
    toast({
      title: "Failed to add favorite",
      description: error.message || "Something went wrong while adding the city to favorites.",
      variant: "destructive",
    });
  },
});
```

### Weather Icons System

#### Custom Icon Implementation
```typescript
// client/src/components/weather/weather-icons.tsx
import iconSunny from "@assets/icon-sunny_1757617387016.webp";
import iconPartlyCloudy from "@assets/icon-partly-cloudy_1757617399895.webp";
// ... other imports

export function getWeatherIcon(weatherCode: number, className: string = "w-6 h-6") {
  // Weather code mapping based on Open-Meteo WMO codes
  if (weatherCode === 0) {
    return <img src={iconSunny} alt="Sunny" className={className} />;
  } else if (weatherCode === 1 || weatherCode === 2) {
    return <img src={iconPartlyCloudy} alt="Partly Cloudy" className={className} />;
  }
  // ... other mappings
}
```

#### Weather Code Mapping
The app uses Open-Meteo's WMO weather codes:
- `0`: Clear sky → Sunny icon
- `1-2`: Mainly clear, partly cloudy → Partly cloudy icon
- `3`: Overcast → Overcast icon
- `45-48`: Fog → Overcast icon (fallback)
- `51-57`: Drizzle → Drizzle icon
- `61-67`: Rain → Rain icon
- `71-77`: Snow → Snow icon
- `80-82`: Rain showers → Rain icon
- `85-86`: Snow showers → Snow icon
- `95-99`: Thunderstorm → Storm icon

### API Integration

#### Open-Meteo Weather API
```typescript
// server/routes.ts - Weather data fetching
async function fetchWeatherData(lat: number, lon: number, units: string) {
  const temperatureUnit = units === "imperial" ? "fahrenheit" : "celsius";
  const windSpeedUnit = units === "imperial" ? "mph" : "kmh";
  const precipitationUnit = units === "imperial" ? "inch" : "mm";

  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,showers,rain,precipitation,snowfall,surface_pressure,pressure_msl,cloud_cover,weather_code,wind_gusts_10m,wind_direction_10m,wind_speed_10m",
    hourly: "temperature_2m,snow_depth,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,vapour_pressure_deficit,visibility,cloud_cover_high,cloud_cover,weather_code,pressure_msl,surface_pressure,cloud_cover_low,cloud_cover_mid,evapotranspiration,et0_fao_evapotranspiration,soil_temperature_0cm,soil_temperature_6cm,soil_temperature_54cm,wind_speed_10m,wind_speed_120m,wind_direction_10m,wind_direction_80m,wind_direction_120m,wind_direction_180m,temperature_120m,temperature_180m,temperature_80m",
    daily: "rain_sum,showers_sum,snowfall_sum,precipitation_sum,precipitation_hours,precipitation_probability_max,weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,daylight_duration,sunshine_duration,uv_index_max,uv_index_clear_sky_max,sunset,et0_fao_evapotranspiration,shortwave_radiation_sum,wind_direction_10m_dominant,wind_speed_10m_max,wind_gusts_10m_max",
    temperature_unit: temperatureUnit,
    wind_speed_unit: windSpeedUnit,
    precipitation_unit: precipitationUnit,
    timezone: "auto",
    forecast_days: "7"
  });

  const response = await fetch(`${OPEN_METEO_BASE_URL}/forecast?${params}`);
  if (!response.ok) {
    throw new Error("Failed to fetch weather data from Open-Meteo");
  }
  return response.json();
}
```

## 🎨 Styling and Theming

### CSS Architecture

#### Tailwind Configuration
The app uses Tailwind CSS with custom color variables:

```css
/* client/src/index.css */
:root {
  --background: #f0f0f0;
  --foreground: #1a1a1a;
  --card: #fcfcfc;
  --weather-orange: hsl(28, 100%, 52%);
  --weather-blue: hsl(233, 67%, 56%);
  /* ... other variables */
}

.dark {
  --background: hsl(20, 14%, 4%);
  --foreground: hsl(45, 25%, 91%);
  --card: hsl(20, 14%, 8%);
  /* ... dark theme variables */
}
```

#### Custom Components
```css
.weather-app-bg {
  background: linear-gradient(135deg, hsl(248, 70%, 25%) 0%, hsl(233, 67%, 35%) 50%, hsl(243, 96%, 6%) 100%);
  min-height: 100vh;
}

.weather-card {
  background: linear-gradient(135deg, hsl(233, 67%, 45%) 0%, hsl(248, 70%, 28%) 100%);
  border-radius: 1rem;
  position: relative;
  overflow: hidden;
}
```

### Component Styling Patterns

#### Responsive Design
```typescript
// Example responsive grid layout
<div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
  <div className="xl:col-span-1">
    <FavoritesSection />
  </div>
  <div className="xl:col-span-3">
    <WeatherContent />
  </div>
</div>
```

#### Loading States
```typescript
// Skeleton loading pattern
{isLoading ? (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <Skeleton key={i} className="h-12 w-full" />
    ))}
  </div>
) : (
  <FavoritesList />
)}
```

## 🔧 Development Workflow

### Local Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Database Operations**
   ```bash
   npm run db:push      # Sync schema to database
   npm run db:studio    # Open database studio
   ```

### Code Quality Tools

#### TypeScript Configuration
```json
// tsconfig.json highlights
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

#### Linting and Formatting
The project uses ESLint and Prettier for code quality:
- TypeScript strict mode enabled
- React hooks rules enforced
- Import organization automated

### Testing Strategy

#### Test IDs Pattern
All interactive elements include test IDs for automated testing:

```typescript
// Example test ID patterns
<Button data-testid="button-submit">Submit</Button>
<Input data-testid="input-email" />
<div data-testid="text-temperature">{temperature}°</div>
<div data-testid="card-favorite-${city.id}">...</div>
```

#### Test ID Conventions
- **Interactive elements**: `{action}-{target}` (e.g., `button-submit`, `input-email`)
- **Display elements**: `{type}-{content}` (e.g., `text-temperature`, `img-weather`)
- **Dynamic elements**: `{type}-{description}-{id}` (e.g., `card-favorite-${id}`)

## 🚀 Deployment

### Build Process
```bash
npm run build        # Build for production
npm run preview      # Preview production build
```

### Environment Variables
```bash
# Required for production
DATABASE_URL=postgresql://...
PGHOST=...
PGPORT=...
PGUSER=...
PGPASSWORD=...
PGDATABASE=...
```

### Deployment Checklist
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Build process completes without errors
- [ ] API endpoints respond correctly
- [ ] Frontend assets load properly
- [ ] Geolocation permissions work
- [ ] Weather data displays correctly

## 🐛 Common Issues and Solutions

### Development Issues

#### Database Connection
```typescript
// Check database configuration
import { db } from './db';
const result = await db.select().from(favoriteCities).limit(1);
```

#### API Errors
```typescript
// Debug API requests
console.log('Request URL:', url);
console.log('Request body:', JSON.stringify(body));
console.log('Response status:', response.status);
console.log('Response body:', await response.text());
```

#### Geolocation Issues
```typescript
// Check geolocation support
if (!navigator.geolocation) {
  console.error('Geolocation not supported');
}

// Debug location requests
navigator.geolocation.getCurrentPosition(
  (position) => console.log('Location:', position.coords),
  (error) => console.error('Location error:', error),
  { enableHighAccuracy: true, timeout: 10000 }
);
```

### Performance Optimization

#### React Query Optimization
```typescript
// Efficient query key structure
const queryKey = ['/api/favorites'];           // Good
const queryKey = [`/api/favorites/${id}`];     // Avoid - harder to invalidate

// Proper cache invalidation
queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
```

#### Image Optimization
```typescript
// Optimize weather icons
<img 
  src={iconSunny} 
  alt="Sunny" 
  className={className}
  loading="lazy"
  width="64"
  height="64"
/>
```

---

This development guide provides comprehensive details about the codebase implementation. For API-specific documentation, see `API_DOCUMENTATION.md`.