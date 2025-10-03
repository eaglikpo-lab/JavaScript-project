const apiKey = "ea5d0fdaeac747502f8d70675c7c011b"; // à remplacer par ta clé OpenWeather


document.addEventListener("DOMContentLoaded", () => {
    const searchBtn = document.getElementById("searchBtn");
    const cityInput = document.getElementById("cityInput");

    searchBtn.addEventListener("click", () => {
        const city = cityInput.value.trim();
        if (city) {
            
            getWeather(city);
            // getCoordinates(city);
            displayWeather(city);
        }
    });

    
    async function getWeather(city) {
        try {
        const apiKey = "ea5d0fdaeac747502f8d70675c7c011b"; // à remplacer par ta clé OpenWeather
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=fr`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.cod === 200) {
            document.getElementById("cityName").textContent = data.name;
            document.getElementById("temperature").textContent = `${Math.round(data.main.temp)}°C`;
            document.getElementById("description").textContent = data.weather[0].description;
            document.getElementById("feelsLike").textContent = `${Math.round(data.main.feels_like)}°C`;
            document.getElementById("humidity").textContent = `${data.main.humidity}%`;
            document.getElementById("wind").textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
            document.getElementById("pressure").textContent = `${data.main.pressure} hPa`;

            // Icône météo simple
            document.getElementById("weatherIcon").textContent = getWeatherIcon(data.weather[0].main);
        } else {
            alert("Ville introuvable !");
        }
        } catch (err) {
        console.error(err);
        }
    }
  


    // 1. Récupérer coordonnées (lat, lon) de la ville
    async function getCoordinates(city) {
        
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&lang=fr`;
        const res = await fetch(url);
        const data = await res.json();
        return { lat: data.coord.lat, lon: data.coord.lon, name: data.name };
    }

    // 2. Récupérer météo avec One Call API
   /* async function getWeather(lat, lon) {
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily,alerts&units=metric&lang=fr&appid=${apiKey}`;
    const res = await fetch(url);
    return res.json();
    }*/


    async function getWeather(city) {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=fr&appid=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();
        return data; // retourne tout l'objet JSON complet
    }


    async function displayWeather(city) {
    try {
        // --- Récupérer les données météo ---
        const weather = await getWeather(city);

        // --- Infos principales ---
        /*document.getElementById("city").textContent = weather.city.name;
        const current = weather.list[0]; // première entrée = maintenant / prochaine tranche 3h
        document.getElementById("temp").textContent = `Température : ${current.main.temp} °C`;
        document.getElementById("condition").textContent = `Condition : ${current.weather[0].description}`;*/

        // --- Prévisions 24h ---
        const forecast = weather.list.slice(0, 8); // 8 * 3h = 24h
        const hours = forecast.map(item => {
        const date = new Date(item.dt * 1000);
        return `${date.getHours()}h`;
        });
        const temperatures = forecast.map(item => item.main.temp);
        const precipitations = forecast.map(item => item.pop * 100); // % probabilité pluie

        // === Graphique Température ===
        new Chart(document.getElementById("tempChart"), {
        type: "line",
        data: {
            labels: hours,
            datasets: [{
            label: "Température (°C)",
            data: temperatures,
            borderColor: "red",
            backgroundColor: "rgba(255,0,0,0.2)",
            fill: true,
            tension: 0.3
            }]
        },
        options: { responsive: true, plugins: { legend: { display: true } } }
        });

        // === Graphique Précipitations ===
        new Chart(document.getElementById("precipChart"), {
        type: "bar",
        data: {
            labels: hours,
            datasets: [{
            label: "Précipitations (%)",
            data: precipitations,
            backgroundColor: "rgba(0,123,255,0.6)"
            }]
        },
        options: { responsive: true, plugins: { legend: { display: true } }, scales: { y: { beginAtZero: true, max: 100 } } }
        });

    } catch (error) {
        console.error("Erreur dans displayWeather :", error);
    }
    }

   /* // 3. Afficher météo + graphiques
    async function displayWeather(city) {
    try {
        // --- Coordonnées ---
        const coords = await getCoordinates(city);
        console.log(coords);
        console.log(coords.lat, typeof coords.lat);
        console.log(coords.lon);


        // --- Données météo ---
            //const weather = await getWeather(coords.lat, coords.lon);
        const weather = await getWeather(city);

        console.log(weather);
        

        // --- Infos principales ---
    /* document.getElementById("city").textContent = coords.name;
        document.getElementById("temp").textContent = `Température : ${weather.current.temp} °C`;
        document.getElementById("condition").textContent = `Condition : ${weather.current.weather[0].description}`;

        // --- Prévisions 24h ---
        const hours = weather.hourly.slice(0, 24).map((h, i) => {
        const date = new Date(h.dt * 1000);
        return `${date.getHours()}h`;
        });

        const temperatures = weather.hourly.slice(0, 24).map(h => h.temp);
        const precipitations = weather.hourly.slice(0, 24).map(h => h.pop * 100); // "probabilité de pluie" (%)

        // === Graphique Température ===
        new Chart(document.getElementById("tempChart"), {
        type: "line",
        data: {
            labels: hours,
            datasets: [{
            label: "Température (°C)",
            data: temperatures,
            borderColor: "red",
            backgroundColor: "rgba(255,0,0,0.2)",
            fill: true,
            tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: true } }
        }
        });

        // === Graphique Précipitations ===
        new Chart(document.getElementById("precipChart"), {
        type: "bar",
        data: {
            labels: hours,
            datasets: [{
            label: "Précipitations (%)",
            data: precipitations,
            backgroundColor: "rgba(0,123,255,0.6)"
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: true } },
            scales: { y: { beginAtZero: true, max: 100 } }
        }
        });

    } catch (error) {
        console.error("Erreur :", error);
    }
}*/





function getWeatherIcon(condition) {
    switch (condition.toLowerCase()) {
      case "clear": return "☀️";
      case "clouds": return "☁️";
      case "rain": return "🌧️";
      case "thunderstorm": return "⛈️";
      case "snow": return "❄️";
      default: return "🌤️";
    }
  }
});


// Détection automatique selon l'heure
function setThemeByTime() {
  const hour = new Date().getHours();
  if (hour >= 19 || hour < 7) {
    document.body.classList.add("dark");
    document.body.classList.remove("light");
  } else {
    document.body.classList.add("light");
    document.body.classList.remove("dark");
  }
}

// Bascule manuelle avec le bouton
document.getElementById("toggleTheme").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
});

// Initialisation au chargement
setThemeByTime();

