# API Documentation 📡

Complete documentation for the Weather App REST API endpoints.

## Base URL

```text
https://your-replit-url.replit.app
# or for local development
http://localhost:5000
```

## Authentication

No authentication required. All endpoints are publicly accessible.

---

## Weather Endpoints

### Search Weather by City

Retrieve weather data for a specific city by name.

**Endpoint:** `POST /api/weather/search`

**Request Body:**

```json
{
  "city": "London",
  "units": "metric"
}
```

**Request Schema:**

```typescript
{
  city: string (required, min length: 1),
  units: "metric" | "imperial" (optional, default: "metric")
}
```

**Response (200 OK):**

```json
{
  "location": {
    "city": "London",
    "country": "United Kingdom",
    "coordinates": {
      "latitude": 51.5074,
      "longitude": -0.1278
    }
  },
  "current": {
    "temperature": 18,
    "feelsLike": 16,
    "humidity": 65,
    "windSpeed": 12,
    "precipitation": 0,
    "weatherCode": 1,
    "description": "Mainly clear"
  },
  "daily": [
    {
      "date": "2025-09-11",
      "dayName": "Wednesday",
      "maxTemp": 22,
      "minTemp": 15,
      "weatherCode": 2,
      "description": "Partly cloudy"
    },
    // ... 6 more days
  ],
  "hourly": [
    {
      "time": "18:00",
      "temperature": 18,
      "weatherCode": 1,
      "description": "Mainly clear"
    },
    // ... 7 more hours
  ],
  "lastUpdated": "2025-09-11T18:30:00.000Z"
}
```

**Error Responses:**

```json
// 400 Bad Request - Invalid input
{
  "message": "Invalid request data",
  "errors": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "City name is required",
      "path": ["city"]
    }
  ]
}

// 400 Bad Request - City not found
{
  "message": "City not found"
}

// 500 Internal Server Error
{
  "message": "Internal server error"
}
```

**Example Request:**

```bash
curl -X POST https://your-app.replit.app/api/weather/search \
  -H "Content-Type: application/json" \
  -d '{"city": "Paris", "units": "imperial"}'
```

---

### Get Weather by Coordinates

Retrieve weather data for specific geographic coordinates.

**Endpoint:** `POST /api/weather/coordinates`

**Request Body:**

```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "units": "metric"
}
```

**Request Schema:**

```typescript
{
  latitude: number (required),
  longitude: number (required),
  units: "metric" | "imperial" (optional, default: "metric")
}
```

**Response (200 OK):**
Same format as city search endpoint, but location may show "Current Location" if reverse geocoding fails.

**Error Responses:**

```json
// 400 Bad Request - Invalid coordinates
{
  "message": "Invalid request data",
  "errors": [
    {
      "code": "invalid_type",
      "expected": "number",
      "received": "string",
      "path": ["latitude"],
      "message": "Expected number, received string"
    }
  ]
}
```

**Example Request:**

```bash
curl -X POST https://your-app.replit.app/api/weather/coordinates \
  -H "Content-Type: application/json" \
  -d '{"latitude": 40.7128, "longitude": -74.0060, "units": "metric"}'
```

---

## Favorites Endpoints

### Get All Favorite Cities

Retrieve all saved favorite cities for the user.

**Endpoint:** `GET /api/favorites`

**Response (200 OK):**

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "My Home City",
    "city": "London",
    "country": "United Kingdom",
    "latitude": 51.5074,
    "longitude": -0.1278,
    "addedAt": "2025-09-11T15:30:00.000Z"
  },
  {
    "id": "987fcdeb-51a2-43d1-9c4f-123456789abc",
    "name": "Paris",
    "city": "Paris",
    "country": "France", 
    "latitude": 48.8566,
    "longitude": 2.3522,
    "addedAt": "2025-09-10T12:15:00.000Z"
  }
]
```

**Error Responses:**

```json
// 500 Internal Server Error
{
  "message": "Failed to fetch favorite cities"
}
```

**Example Request:**

```bash
curl -X GET https://your-app.replit.app/api/favorites
```

---

### Add Favorite City

Add a new city to the favorites list.

**Endpoint:** `POST /api/favorites`

**Request Body:**

```json
{
  "name": "My Vacation Spot",
  "city": "Barcelona",
  "country": "Spain",
  "latitude": 41.3851,
  "longitude": 2.1734
}
```

**Request Schema:**

```typescript
{
  name: string (required, max 255 chars),
  city: string (required, max 255 chars),
  country: string (required, max 255 chars),
  latitude: number (required),
  longitude: number (required)
}
```

**Response (201 Created):**

```json
{
  "id": "456789ab-cdef-1234-5678-90abcdef1234",
  "name": "My Vacation Spot",
  "city": "Barcelona",
  "country": "Spain",
  "latitude": 41.3851,
  "longitude": 2.1734,
  "addedAt": "2025-09-11T18:45:00.000Z"
}
```

**Error Responses:**

```json
// 400 Bad Request - Validation error
{
  "message": "Invalid city data",
  "errors": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "String must contain at least 1 character(s)",
      "path": ["name"]
    }
  ]
}

// 500 Internal Server Error
{
  "message": "Failed to add favorite city"
}
```

**Example Request:**

```bash
curl -X POST https://your-app.replit.app/api/favorites \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Work Location",
    "city": "New York",
    "country": "United States",
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

---

### Get Specific Favorite City

Retrieve details for a specific favorite city by ID.

**Endpoint:** `GET /api/favorites/:id`

**Path Parameters:**

- `id` (string, required): UUID of the favorite city

**Response (200 OK):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "My Home City",
  "city": "London",
  "country": "United Kingdom",
  "latitude": 51.5074,
  "longitude": -0.1278,
  "addedAt": "2025-09-11T15:30:00.000Z"
}
```

**Error Responses:**

```json
// 404 Not Found
{
  "message": "Favorite city not found"
}

// 500 Internal Server Error
{
  "message": "Failed to fetch favorite city"
}
```

**Example Request:**

```bash
curl -X GET https://your-app.replit.app/api/favorites/123e4567-e89b-12d3-a456-426614174000
```

---

### Remove Favorite City

Remove a city from the favorites list.

**Endpoint:** `DELETE /api/favorites/:id`

**Path Parameters:**

- `id` (string, required): UUID of the favorite city to remove

**Response (204 No Content):**
No response body.

**Error Responses:**

```json
// 404 Not Found
{
  "message": "Favorite city not found"
}

// 500 Internal Server Error
{
  "message": "Failed to remove favorite city"
}
```

**Example Request:**

```bash
curl -X DELETE https://your-app.replit.app/api/favorites/123e4567-e89b-12d3-a456-426614174000
```

---

## Data Models

### WeatherData

```typescript
interface WeatherData {
  location: {
    city: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  current: {
    temperature: number;        // Rounded to nearest integer
    feelsLike: number;         // Rounded to nearest integer
    humidity: number;          // Percentage (0-100)
    windSpeed: number;         // km/h or mph based on units
    precipitation: number;     // mm or inches based on units
    weatherCode: number;       // WMO weather code
    description: string;       // Human-readable description
  };
  daily: DailyForecastItem[]; // 7 days
  hourly: HourlyForecastItem[]; // 8 hours
  lastUpdated: string;       // ISO 8601 timestamp
}
```

### DailyForecastItem

```typescript
interface DailyForecastItem {
  date: string;           // YYYY-MM-DD format
  dayName: string;        // Full day name (e.g., "Wednesday")
  maxTemp: number;        // Rounded to nearest integer
  minTemp: number;        // Rounded to nearest integer
  weatherCode: number;    // WMO weather code
  description: string;    // Human-readable description
}
```

### HourlyForecastItem

```typescript
interface HourlyForecastItem {
  time: string;           // HH:MM format (24-hour)
  temperature: number;    // Rounded to nearest integer
  weatherCode: number;    // WMO weather code
  description: string;    // Human-readable description
}
```

### FavoriteCity

```typescript
interface FavoriteCity {
  id: string;             // UUID
  name: string;           // Display name (max 255 chars)
  city: string;           // Actual city name (max 255 chars)
  country: string;        // Country name (max 255 chars)
  latitude: number;       // Geographic latitude
  longitude: number;      // Geographic longitude
  addedAt: string;        // ISO 8601 timestamp
}
```

### InsertFavoriteCity

```typescript
interface InsertFavoriteCity {
  name: string;           // Display name (required, max 255 chars)
  city: string;           // Actual city name (required, max 255 chars)
  country: string;        // Country name (required, max 255 chars)
  latitude: number;       // Geographic latitude (required)
  longitude: number;      // Geographic longitude (required)
}
```

---

## Weather Codes

The API uses WMO (World Meteorological Organization) weather codes from Open-Meteo:

| Code | Description | Icon Mapping |
|------|-------------|--------------|
| 0 | Clear sky | Sunny |
| 1 | Mainly clear | Partly cloudy |
| 2 | Partly cloudy | Partly cloudy |
| 3 | Overcast | Overcast |
| 45 | Fog | Overcast |
| 48 | Depositing rime fog | Overcast |
| 51 | Light drizzle | Drizzle |
| 53 | Moderate drizzle | Drizzle |
| 55 | Dense drizzle | Drizzle |
| 56 | Light freezing drizzle | Drizzle |
| 57 | Dense freezing drizzle | Drizzle |
| 61 | Slight rain | Rain |
| 63 | Moderate rain | Rain |
| 65 | Heavy rain | Rain |
| 66 | Light freezing rain | Rain |
| 67 | Heavy freezing rain | Rain |
| 71 | Slight snow fall | Snow |
| 73 | Moderate snow fall | Snow |
| 75 | Heavy snow fall | Snow |
| 77 | Snow grains | Snow |
| 80 | Slight rain showers | Rain |
| 81 | Moderate rain showers | Rain |
| 82 | Violent rain showers | Rain |
| 85 | Slight snow showers | Snow |
| 86 | Heavy snow showers | Snow |
| 95 | Thunderstorm | Storm |
| 96 | Thunderstorm with slight hail | Storm |
| 99 | Thunderstorm with heavy hail | Storm |

---

## Error Handling

### Error Response Format

All API errors follow a consistent format:

```json
{
  "message": "Human-readable error message",
  "errors": [
    // Optional array of detailed validation errors
    {
      "code": "validation_error_code",
      "message": "Detailed error description",
      "path": ["field", "name"]
    }
  ]
}
```

### HTTP Status Codes

| Status | Description | When Used |
|--------|-------------|-----------|
| 200 | OK | Successful GET requests |
| 201 | Created | Successful POST requests |
| 204 | No Content | Successful DELETE requests |
| 400 | Bad Request | Invalid request data or validation errors |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Unexpected server errors |

### Common Error Scenarios

#### City Not Found

```json
// When searching for non-existent city
{
  "message": "City not found"
}
```

#### Validation Errors

```json
// When request data is invalid
{
  "message": "Invalid request data",
  "errors": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "City name is required",
      "path": ["city"]
    }
  ]
}
```

#### Geolocation Errors

```json
// When coordinates are invalid
{
  "message": "Invalid coordinates"
}
```

#### Database Errors

```json
// When database operations fail
{
  "message": "Failed to add favorite city"
}
```

---

## Rate Limiting

Currently, there are no rate limits implemented. However, the app relies on Open-Meteo API which has generous limits for free usage.

**Open-Meteo Limits:**

- No API key required
- 10,000 requests per day
- 5,000 requests per hour
- 600 requests per minute

---

## Integration Examples

### JavaScript/TypeScript

```typescript
// Weather search
const response = await fetch('/api/weather/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    city: 'London',
    units: 'metric'
  })
});

const weatherData = await response.json();

// Add favorite
const favoriteResponse = await fetch('/api/favorites', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'My City',
    city: 'London',
    country: 'United Kingdom',
    latitude: 51.5074,
    longitude: -0.1278
  })
});

const favorite = await favoriteResponse.json();
```

### Python

```python
import requests

# Weather search
response = requests.post('https://your-app.replit.app/api/weather/search', 
    json={
        'city': 'London',
        'units': 'metric'
    }
)
weather_data = response.json()

# Add favorite
favorite_response = requests.post('https://your-app.replit.app/api/favorites',
    json={
        'name': 'My City',
        'city': 'London', 
        'country': 'United Kingdom',
        'latitude': 51.5074,
        'longitude': -0.1278
    }
)
favorite = favorite_response.json()
```

### cURL Examples

```bash
# Search weather
curl -X POST https://your-app.replit.app/api/weather/search \
  -H "Content-Type: application/json" \
  -d '{"city": "Tokyo", "units": "imperial"}'

# Get coordinates weather
curl -X POST https://your-app.replit.app/api/weather/coordinates \
  -H "Content-Type: application/json" \
  -d '{"latitude": 35.6762, "longitude": 139.6503, "units": "metric"}'

# List favorites
curl -X GET https://your-app.replit.app/api/favorites

# Add favorite
curl -X POST https://your-app.replit.app/api/favorites \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tokyo Office",
    "city": "Tokyo",
    "country": "Japan",
    "latitude": 35.6762,
    "longitude": 139.6503
  }'

# Remove favorite
curl -X DELETE https://your-app.replit.app/api/favorites/123e4567-e89b-12d3-a456-426614174000
```

---

## Testing the API

### Unit Testing

```typescript
// Example Jest test
describe('Weather API', () => {
  test('should return weather data for valid city', async () => {
    const response = await request(app)
      .post('/api/weather/search')
      .send({ city: 'London', units: 'metric' });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('location');
    expect(response.body).toHaveProperty('current');
    expect(response.body).toHaveProperty('daily');
    expect(response.body).toHaveProperty('hourly');
  });
});
```

### Integration Testing

```typescript
// Example API integration test
describe('Favorites API', () => {
  test('should create and retrieve favorite city', async () => {
    // Create favorite
    const createResponse = await request(app)
      .post('/api/favorites')
      .send({
        name: 'Test City',
        city: 'London',
        country: 'UK',
        latitude: 51.5074,
        longitude: -0.1278
      });
    
    expect(createResponse.status).toBe(201);
    const createdFavorite = createResponse.body;
    
    // Retrieve favorite
    const getResponse = await request(app)
      .get(`/api/favorites/${createdFavorite.id}`);
    
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.name).toBe('Test City');
  });
});
```

---

This API documentation provides complete details for integrating with the Weather App backend. For frontend integration examples, see the `DEVELOPMENT.md` file.
 
 
