# Glassmorphism Weather Dashboard

A sleek, responsive weather dashboard built with **HTML5**, **CSS3**, and **Vanilla JavaScript**. It features live global weather data, interactive city grids, unit toggling, smooth skeleton loaders, and a modern glassmorphism design.

## Features

* **Global City Grids:** Side panels displaying live weather conditions and temperatures for 24 major international cities.
* **Interactive Search:** Search for any city worldwide with automatic coordinate geocoding and error handling (shake animation).
* **Detailed Metrics:** Real-time metrics including humidity, wind speed, wind gusts, "feels like" temperature, atmospheric pressure, cloud cover, UV index, precipitation, and visibility.
* **5-Day Forecast:** Daily forecast breakdown with high/low temperatures and weather condition icons.
* **Unit Toggle:** Instantly switch between Fahrenheit (°F) and Celsius (°C).
* **Skeleton Loaders:** Smooth pulse animation placeholders while data is being fetched.
* **Responsive Design:** Fully adaptable layout optimized for desktops, tablets, and mobile devices.

## Tech Stack

* **HTML5** & **CSS3** (Custom Properties, Grid, Flexbox, Backdrop Filter)
* **JavaScript (ES6+)** (Async/Await, Fetch API)
* **APIs Used:**
  * [Open-Meteo Geocoding API](https://open-meteo.com/) for location search.
  * [Open-Meteo Weather Forecast API](https://open-meteo.com/) for current and 5-day forecast data.

## Project Structure

```text
├── index.html       # Main application layout structure
├── styles.css       # Glassmorphism styling, layout grids, and animations
└── app.js           # API fetching logic, state management, and DOM updates