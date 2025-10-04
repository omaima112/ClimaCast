# Frontend Mentor - Weather App Solution

This is my solution to the [Weather app challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/weather-app-K1FhddVm49).  
I built this project during the 30-Day Hackathon, and it became a full journey of designing, coding, and refining every small detail to make it feel polished.

---

## Table of contents

- [Overview](#overview)  
- [The challenge](#the-challenge)  
- [Screenshot](#screenshot)  
- [Links](#links)  
- [My process](#my-process)  
- [Built with](#built-with)  
- [What I learned](#what-i-learned)  
- [Continued development](#continued-development)  
- [Useful resources](#useful-resources)  
- [Author](#author)  
- [Acknowledgments](#acknowledgments)  

---

## Overview

### The challenge

Users should be able to:

- Search for weather information by entering a location in the search bar  
- View current weather conditions including temperature, weather icon, and location details  
- See extra metrics like "feels like" temperature, humidity percentage, wind speed, and precipitation amounts  
- Browse weather forecast with daily high/low temperatures and weather icons  
- View an hourly forecast showing temperature changes throughout the day   
- Toggle between Imperial and Metric units (Celsius/Fahrenheit, km/h or mph, millimeters for precipitation)  
- Experience a responsive UI that adapts to mobile, tablet, and desktop  
- Get hover and focus states for all interactive elements  

---
#### UI/UX Improvements
- **Removed Duplicate Notifications**
-  Fixed multiple toast messages
-  Single success notification for geolocation
-  Cleaner user experience
-  Consistent feedback patterns
----
## Screenshot


<img width="682" height="1008" alt="pic6" src="https://github.com/user-attachments/assets/7970041c-dcda-4ff2-9a65-077ff49f5d33" /> <img width="740" height="1007" alt="pic7" src="https://github.com/user-attachments/assets/cb20fbbe-a78f-4268-9e10-661b5a9062c3" />


---

## Links

- **Solution URL**:  (https://www.frontendmentor.io/solutions/responsive-weather-app-with-react-typescript-tailwind-and-vite-R8LaGrUGem)
- **Live Site URL**: (https://clima-cast-murex.vercel.app/)
---

## My process

I started by setting up the project with **Vite + React + TypeScript**, then added Tailwind for styling.  
I built modular components for the main weather card, search bar, hourly/daily forecasts, and metrics.  
During the process I kept refining the design, from dark mode to little details like icon consistency and orb visuals in the corner to make the UI feel alive.  

One of my favorite parts of the code is the **dynamic weather icon system**, where the correct SVGs load depending on the weather type and time of day:

```ts
import { Sun, Cloud, CloudRain, Snowflake } from "lucide-react";

export const getWeatherIcon = (condition: string) => {
  switch (condition.toLowerCase()) {
    case "clear":
      return <Sun />;
    case "rain":
      return <CloudRain />;
    case "snow":
      return <Snowflake />;
    default:
      return <Cloud />;
  }
}; 
```
## 🔧 Development Workflow

### Local Development Setup 
1. **Install Dependencies**
```bash
npm install
```
2. **Start Development Server**
  ``` bash
  npm run dev
```
-----

That piece tied the visuals directly to live data, which felt rewarding to see working.

---

## Built with

- **React 18 + TypeScript** – components and type safety  
- **Tailwind CSS** – utility-first styling  
- **Shadcn/ui** – accessible UI components  
- **Lucide React** – icons  
- **TanStack Query** – server state management  
- **Wouter** – lightweight routing  
- **Vite** – build system and fast dev server


<img width="1918" height="1016" alt="pic1" src="https://github.com/user-attachments/assets/86b5e93e-8788-40e1-9fc5-2dfaa018790e" /><img width="1894" height="1055" alt="pic2" src="https://github.com/user-attachments/assets/e33e1c06-0c46-43e0-b024-ac9e7738f9d8" />



---

## What I learned

- How to handle client-side state and server state differently using TanStack Query and hooks  
- Structuring React components so forecasts, cards, and metrics are modular and reusable  
- Managing theme toggles and unit preferences with Context API  
- The importance of version control discipline (rebases, clean commits, fixing merge conflicts properly)  

---

## Continued development

- Improve animations for weather transitions  
- Add more visual polish for forecast cards  
- Expand accessibility testing beyond keyboard navigation  

---

## Useful resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs) – for fast styling setup  
- [TanStack Query](https://tanstack.com/query/latest) – helped me structure API data handling  
- [Lucide Icons](https://lucide.dev/) – clean and consistent icons  

---

## Author

- GitHub – [omaima112](https://github.com/omaima112)
- Frontend Mentor – [@omaima112](https://www.frontendmentor.io/profile/omaima112)  


---

## Acknowledgments

Big thanks to the Frontend Mentor community and the hackathon setup that kept me consistent and motivated throughout this build. This project taught me consistency, debugging patience, and how to keep shipping even when things broke at midnight.
:)
