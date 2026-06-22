const form = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");

const weatherCard = document.getElementById("weatherCard");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const weatherType = document.getElementById("weatherType");

const errorBox = document.getElementById("error");
const loader = document.getElementById("loader");

form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (city === "") {
        showError("Please enter a city name");
        return;
    }

    await getWeather(city);
});

async function getWeather(city) {
    try {
        loader.style.display = "block";
        errorBox.innerHTML = "";
        weatherCard.style.display = "none";

        // Step 1: Get city latitude and longitude
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;

        const geoResponse = await fetch(geoUrl);

        if (!geoResponse.ok) {
            throw new Error("Failed to fetch city data");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results) {
            throw new Error("City not found");
        }

        const latitude = geoData.results[0].latitude;
        const longitude = geoData.results[0].longitude;
        const placeName = geoData.results[0].name;
        const country = geoData.results[0].country;

        // Step 2: Get weather data
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;

        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error("Failed to fetch weather data");
        }

        const weatherData = await weatherResponse.json();

        const current = weatherData.current;

        cityName.innerHTML = `${placeName}, ${country}`;
        temperature.innerHTML = current.temperature_2m;
        humidity.innerHTML = current.relative_humidity_2m;
        windSpeed.innerHTML = current.wind_speed_10m;
        weatherType.innerHTML = getWeatherDescription(current.weather_code);

        weatherCard.style.display = "block";

    } catch (error) {
        showError(error.message);
    } finally {
        loader.style.display = "none";
    }
}

function showError(message) {
    errorBox.innerHTML = message;
    weatherCard.style.display = "none";
}

function getWeatherDescription(code) {
    const weatherCodes = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        71: "Slight snow",
        73: "Moderate snow",
        75: "Heavy snow",
        80: "Rain showers",
        95: "Thunderstorm"
    };

    return weatherCodes[code] || "Unknown weather";
}