# WeatherAPP

## Overview

WeatherAPP is a responsive weather application built as a submission for the Frontend Mentor 30-Day Hackathon. The application provides real-time weather information including current conditions, 7-day forecasts, and hourly forecasts with a beautiful dark-themed UI. Users can search for weather by city name or automatically detect their location, with support for unit conversion between metric and imperial systems.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Styling**: Tailwind CSS with custom theme variables for consistent design system
- **UI Components**: Shadcn/ui component library providing accessible, pre-built components
- **Icons**: Lucide React for consistent iconography
- **State Management**: React hooks combined with TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Build System**: Vite for fast development and optimized builds
- **API Proxy**: Express server acts as a proxy to external weather APIs
- **Database**: PostgreSQL with Drizzle ORM for data persistence
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Schema**: Centralized schema definitions in TypeScript with Zod validation
- **Migrations**: Drizzle-kit for database schema migrations
- **Connection**: Neon Database serverless PostgreSQL connection

### Component Architecture
- **Layout**: Mobile-first responsive design with breakpoint-based styling
- **Composition**: Modular weather components (header, search, main card, metrics, forecasts)
- **Error Handling**: Comprehensive error boundaries and loading states
- **Accessibility**: WCAG-compliant components with proper ARIA attributes

### State Management Pattern
- **Server State**: TanStack Query for API data fetching, caching, and synchronization
- **Client State**: React useState and useReducer for local component state
- **Form State**: React Hook Form for form validation and submission
- **Global State**: Context API for theme and unit preferences

## External Dependencies

### Weather Data API
- **Primary Service**: Open-Meteo API for weather data and geocoding
- **Features**: Current weather, daily forecasts, hourly forecasts, location search
- **Rate Limiting**: Built-in caching through TanStack Query to minimize API calls

### Database Infrastructure
- **Provider**: Neon Database (serverless PostgreSQL)
- **Features**: Favorite cities storage, weather alerts, user preferences
- **Connection**: WebSocket-based connection with automatic scaling

### UI and Styling
- **Component Library**: Radix UI primitives for accessible components
- **Styling Framework**: Tailwind CSS for utility-first styling
- **Fonts**: Google Fonts (DM Sans, Bricolage Grotesque) for typography
- **Icons**: Lucide React icon library

### Development Tools
- **Build Tool**: Vite for development server and production builds
- **Type Checking**: TypeScript with strict configuration
- **Code Quality**: ESLint and Prettier for code formatting
- **Version Control**: Git with conventional commit patterns

### Deployment and Hosting
- **Target Platform**: Netlify for static site hosting
- **Environment**: Node.js runtime with environment variable configuration
- **Asset Optimization**: Vite-based asset bundling and optimization