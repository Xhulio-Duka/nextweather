# NextWeather

A web app for checking current weather and short-term forecasts for any location.

## What it does

- Requests the user’s current location by default, with a Seattle fallback when location access is unavailable
- Displays the current temperature, feels-like temperature, conditions, humidity, wind speed, and rain likelihood
- Shows the previous and upcoming 24-hour periods with temperature and rain probability
- Shows a seven-day outlook with daily high and low temperatures
- Lets users search for a city, state, country, or coordinates
- Lets users refresh the weather outlook

## Stack

Next.js 16 + React 19 + TypeScript
Tailwind CSS 4 + shadcn/ui
Visual Crossing Weather API

## Structure

app/page.tsx                    # weather dashboard and search interactions
app/api/weather/route.ts        # secure server-side Visual Crossing request
app/globals.css                 # theme tokens and global styling

## Getting started

Add `VISUAL_CROSSING_API_KEY` to the project environment, then run:

```bash
pnpm install
pnpm dev
```

Production build:

```bash
pnpm build
pnpm start
```
