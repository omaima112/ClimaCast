# WeatherAPP 🌤️

A comprehensive, full-stack weather application built for the Frontend Mentor Hackathon (Sept–Oct 2025).  
Built with React, TypeScript, Express.js, and PostgreSQL, featuring beautiful custom weather icons, geolocation detection, and favorite cities management.

## ✨ Features

### Core Weather Functionality
- **Real-time Weather Data**: Current conditions, hourly forecasts, and 7-day forecasts using Open-Meteo API
- **City Search**: Search weather by city name with intelligent geocoding
- **Automatic Location Detection**: Browser geolocation API automatically detects your location on app load
- **Unit Conversion**: Toggle between Imperial and Metric (Celsius/Fahrenheit, km/h/mph, mm/inches)
- **Custom Weather Icons**: Beautiful pixelated weather icons for all weather conditions

### Advanced Features
- **Favorite Cities Management**: Save unlimited favorite locations with custom names
- **Quick Access**: One-click weather lookup from favorites sidebar
- **Geolocation Integration**: "My Location" button for instant local weather
- **Persistent Storage**: PostgreSQL database for reliable data persistence
- **Real-time Updates**: Live weather data with smooth loading states and error handling

### User Experience
- **Responsive Design**: Mobile-first design that scales beautifully to all screen sizes
- **Dark Theme**: Beautiful darker gradient backgrounds with atmospheric feel
- **Loading States**: Smooth animations and skeleton loaders
- **Toast Notifications**: User-friendly feedback for all actions
- **Welcome Screen**: Intuitive onboarding for new users

### Technical Features
- **Progressive Web App Ready**: Optimized for mobile installation
- **Type Safety**: Full TypeScript implementation across frontend and backend
- **API Integration**: RESTful API with comprehensive error handling
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod schemas for runtime type validation
- **Testing Ready**: Comprehensive test IDs on all interactive elements

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript for component-based architecture
- **Vite** for lightning-fast development and optimized builds
- **Tailwind CSS** with custom dark theme and animations
- **TanStack Query** for efficient data fetching and caching
- **Radix UI** for accessible, unstyled component primitives
- **React Hook Form** with Zod validation for forms
- **Wouter** for lightweight client-side routing

### Backend
- **Node.js** with Express.js for the API server
- **TypeScript** for type-safe backend development
- **PostgreSQL** database for reliable data persistence
- **Drizzle ORM** for type-safe database operations
- **Zod** for request/response validation
- **Open-Meteo API** for free, reliable weather data

### Infrastructure
- **Replit** hosting with automatic deployments
- **Built-in PostgreSQL** database with automatic backups
- **Environment configuration** for seamless development

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Modern web browser with geolocation support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/omaima112/WeatherAPP.git
   cd WeatherAPP
   ```

2. **Install dependencies**
   ```bash
   npm install
   