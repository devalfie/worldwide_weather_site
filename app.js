// Weather SVG icons library
const icons = {
    sun: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor"/><path stroke-linecap="round" d="M12 2v2 M12 20v2 M2 12h2 M20 12h2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M4.93 19.07l1.41-1.41 M17.66 6.34l1.41-1.41" stroke="currentColor"/></svg>`,
    cloudSun: `<svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="3" stroke="currentColor" fill="none"/><path stroke-linecap="round" stroke-linejoin="round" d="M8 3V2 M3 8H2 M4.5 4.5L3.8 3.8 M12 5l.8-.8" stroke="currentColor"/><path stroke-linecap="round" stroke-linejoin="round" d="M7 18h10a4 4 0 0 0 .4-7.98 A6 6 0 0 0 6.2 11.5 A3.5 3.5 0 0 0 7 18" stroke="currentColor" fill="none"/></svg>`,
    cloud: `<svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18h11a4 4 0 0 0 .3-7.99 A6 6 0 0 0 6.1 11.4 A3.5 3.5 0 0 0 6 18" stroke="currentColor" fill="none"/></svg>`,
    rain: `<svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 15h11a4 4 0 0 0 .3-7.99 A6 6 0 0 0 6.1 8.4 A3.5 3.5 0 0 0 6 15" stroke="currentColor" fill="none"/><path stroke-linecap="round" d="M8 18l-1 2 M12 18l-1 2 M16 18l-1 2" stroke="currentColor"/></svg>`,
    snow: `<svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 14h11a4 4 0 0 0 .3-7.99 A6 6 0 0 0 6.1 7.4 A3.5 3.5 0 0 0 6 14" stroke="currentColor" fill="none"/><circle cx="8" cy="18" r="0.7" fill="currentColor"/><circle cx="12" cy="20" r="0.7" fill="currentColor"/><circle cx="16" cy="18" r="0.7" fill="currentColor"/></svg>`,
    thunder: `<svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 14h11a4 4 0 0 0 .3-7.99 A6 6 0 0 0 6.1 7.4 A3.5 3.5 0 0 0 6 14" stroke="currentColor" fill="none"/><path stroke-linejoin="round" d="M13 14l-3 5h3l-1 3 4-6h-3z" stroke="currentColor" fill="none"/></svg>`,
    fog: `<svg viewBox="0 0 24 24"><path stroke-linecap="round" d="M4 8h16 M6 12h12 M4 16h16" stroke="currentColor"/></svg>`
};

// City lists for the side grids (12 each)
const leftCities = ["London", "Paris", "Madrid", "Berlin", "Rome", "Amsterdam", "Dublin", "Lisbon", "Athens", "Vienna", "Prague", "Warsaw"];
const rightCities = ["New York", "Toronto", "Los Angeles", "Tokyo", "Seoul", "Singapore", "Sydney", "Dubai", "Bangkok", "Chicago", "Vancouver", "Melbourne"];

// App state
let currentUnit = "fahrenheit";
let activeMainCity = "San Francisco";

// Map WMO weather codes to text and icons
const getWeatherCondition = (code) => {
    if (code === 0) return { text: "Clear & Sunny", icon: "sun" };
    if (code <= 2) return { text: "Mostly Sunny", icon: "cloudSun" };
    if (code === 3) return { text: "Cloudy", icon: "cloud" };
    if (code === 45 || code === 48) return { text: "Foggy", icon: "fog" };
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { text: "Rain", icon: "rain" };
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return { text: "Snow", icon: "snow" };
    if (code >= 95) return { text: "Thunderstorm", icon: "thunder" };
    return { text: "Fair Weather", icon: "sun" };
};

// Geocode city name to lat/lon
async function findCity(cityName) {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
    const data = await res.json();
    if (!data.results?.length) throw new Error(`Could not find ${cityName}`);
    return data.results[0];
}

// Fetch weather for a grid tile city
async function getCityTileWeather(cityName) {
    try {
        const city = await findCity(cityName);
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,weather_code&temperature_unit=${currentUnit}&timezone=auto`);
        const data = await res.json();
        return { name: city.name, temperature: Math.round(data.current.temperature_2m), weatherCode: data.current.weather_code };
    } catch {
        return { name: cityName, temperature: "--", weatherCode: 3 };
    }
}

// Create a DOM element for a city tile with skeleton loader styling
function createCityTile(cityName) {
    const tile = document.createElement("div");
    tile.className = "city-tile city-tile-loading";
    tile.innerHTML = `
        <div class="city-tile-icon skeleton" style="width: 20px; height: 20px; border-radius: 50%;"></div>
        <div class="city-tile-name skeleton" style="width: 60px; height: 10px;">${cityName}</div>
        <div class="city-tile-temperature skeleton" style="width: 30px; height: 14px;">--</div>
    `;
    tile.addEventListener("click", () => loadMainCityWeather(cityName));
    return tile;
}

// Populate a city grid panel
async function loadCityGrid(cityNames, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    const items = cityNames.map(name => ({ name, tile: createCityTile(name) }));
    items.forEach(item => container.appendChild(item.tile));

    await Promise.all(items.map(async item => {
        const weather = await getCityTileWeather(item.name);
        const { icon } = getWeatherCondition(weather.weatherCode);
        const theme = icon === "sun" || icon === "cloudSun" ? "sunny" : icon === "rain" ? "rain" : icon === "thunder" ? "thunderstorm" : "cloudy";
        
        item.tile.className = `city-tile ${theme}`;
        item.tile.innerHTML = `
            <div class="city-tile-icon">${icons[icon]}</div>
            <div class="city-tile-name">${weather.name}</div>
            <div class="city-tile-temperature">${weather.temperature === "--" ? "--" : `${weather.temperature}°`}</div>
        `;
    }));
}

// Toggle skeleton loader on center panel elements
function setMainLoading(isLoading) {
    const targets = [
        document.getElementById("center-temperature"),
        document.getElementById("center-condition"),
        document.getElementById("center-highLow"),
        ...document.querySelectorAll(".detail-tile .value"),
        document.getElementById("center-forecast")
    ];

    targets.forEach(el => {
        if (isLoading) {
            el.classList.add("skeleton");
        } else {
            el.classList.remove("skeleton");
        }
    });

    if (isLoading) {
        document.getElementById("center-mainIcon").innerHTML = `<div class="skeleton" style="width: 45px; height: 45px; border-radius: 50%;"></div>`;
    }
}

// Fetch weather for the main center panel
async function loadMainCityWeather(cityName) {
    const errorMsg = document.getElementById("searchError");
    const searchBar = document.getElementById("searchBar");
    errorMsg.textContent = "";
    errorMsg.classList.remove("visible");
    searchBar.classList.remove("error-shake");

    setMainLoading(true);

    try {
        const city = await findCity(cityName);
        activeMainCity = city.name;
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_gusts_10m,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&temperature_unit=${currentUnit}&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto`);
        updateMainUI(city.name, await res.json());
    } catch {
        setMainLoading(false);
        errorMsg.textContent = `Could not find "${cityName}".`;
        errorMsg.classList.add("visible");
        searchBar.classList.add("error-shake");
        setTimeout(() => searchBar.classList.remove("error-shake"), 300);
    }
}

// Update the main center UI with weather data
function updateMainUI(cityName, data) {
    setMainLoading(false);
    const cur = data.current, daily = data.daily;
    const cond = getWeatherCondition(cur.weather_code);

    document.getElementById("locationInput").value = cityName;
    document.getElementById("center-mainIcon").innerHTML = icons[cond.icon];
    document.getElementById("center-temperature").textContent = `${Math.round(cur.temperature_2m)}°`;
    document.getElementById("center-condition").textContent = cond.text;
    document.getElementById("center-highLow").textContent = `H: ${Math.round(daily.temperature_2m_max[0])}°  L: ${Math.round(daily.temperature_2m_min[0])}°`;

    document.getElementById("center-val-humidity").textContent = `${cur.relative_humidity_2m}%`;
    document.getElementById("center-val-wind").textContent = `${Math.round(cur.wind_speed_10m)} mph`;
    document.getElementById("center-val-feels").textContent = `${Math.round(cur.apparent_temperature)}°`;
    document.getElementById("center-val-pressure").textContent = `${Math.round(cur.pressure_msl)} hPa`;
    document.getElementById("center-val-clouds").textContent = `${cur.cloud_cover}%`;
    document.getElementById("center-val-gusts").textContent = `${Math.round(cur.wind_gusts_10m ?? 0)} mph`;
    document.getElementById("center-val-uv").textContent = daily.uv_index_max?.[0]?.toFixed(1) ?? "--";
    document.getElementById("center-val-precip").textContent = `${cur.precipitation ?? 0} in`;
    document.getElementById("center-val-visibility").textContent = cur.visibility ? `${(cur.visibility / 1609.344).toFixed(1)} mi` : "--";

    const forecastEl = document.getElementById("center-forecast");
    forecastEl.innerHTML = "";
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 0; i < 5; i++) {
        if (!daily.time[i]) continue;
        const d = new Date(`${daily.time[i]}T12:00:00`);
        const dayName = i === 0 ? "Today" : days[d.getDay()];
        const iconName = getWeatherCondition(daily.weather_code[i]).icon;

        forecastEl.innerHTML += `
            <div class="day-col">
                <span class="day">${dayName}</span>
                <div>${icons[iconName]}</div>
                <div class="temps">
                    <span class="high">${Math.round(daily.temperature_2m_max[i])}°</span>
                    <span class="low">${Math.round(daily.temperature_2m_min[i])}°</span>
                </div>
            </div>`;
    }
}

// Initialise event listeners and initial load
document.addEventListener("DOMContentLoaded", () => {
    loadMainCityWeather(activeMainCity);
    loadCityGrid(leftCities, "leftCityGrid");
    loadCityGrid(rightCities, "rightCityGrid");

    const input = document.getElementById("locationInput");
    input.addEventListener("keydown", e => {
        if (e.key === "Enter" && input.value.trim()) {
            loadMainCityWeather(input.value.trim());
            input.blur();
        }
    });

    const toggleBtn = document.getElementById("unitToggleBtn");
    toggleBtn.addEventListener("click", () => {
        currentUnit = currentUnit === "fahrenheit" ? "celsius" : "fahrenheit";
        toggleBtn.textContent = currentUnit === "fahrenheit" ? "°F" : "°C";
        loadMainCityWeather(activeMainCity);
        loadCityGrid(leftCities, "leftCityGrid");
        loadCityGrid(rightCities, "rightCityGrid");
    });
});