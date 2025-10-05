const apiKey = "ea5d0fdaeac747502f8d70675c7c011b"; // à remplacer par ta clé OpenWeather
let tempChart;
let precipChart;

async function Weather(data) {
  if (data.cod === "200") {
    // --- Infos Ville ---
    document.getElementById("cityName").textContent = data.city.name;

    // --- Données actuelles (on prend la 1ère prévision = maintenant) ---
    const current = data.list[0];
    document.getElementById("temperature").textContent = `${Math.round(current.main.temp)}°C`;
    document.getElementById("description").textContent = current.weather[0].description;
    document.getElementById("feelsLike").textContent = `${Math.round(current.main.feels_like)}°C`;
    document.getElementById("humidity").textContent = `${current.main.humidity}%`;
    document.getElementById("wind").textContent = `${Math.round(current.wind.speed * 3.6)} km/h`;
    document.getElementById("pressure").textContent = `${current.main.pressure} hPa`;

    // --- Lever & coucher du soleil (depuis city) ---
    const sunrise = new Date(data.city.sunrise * 1000).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const sunset = new Date(data.city.sunset * 1000).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    document.getElementById("sunrise").textContent = `🌅 Lever du soleil : ${sunrise}`;
    document.getElementById("sunset").textContent = `🌇 Coucher du soleil : ${sunset}`;

    // --- Qualité de l’air (API séparée) ---
    const { lat, lon } = data.city.coord;
    const airUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const airRes = await fetch(airUrl);
    const airData = await airRes.json();
    const aqi = airData.list[0].main.aqi;
    const aqiLevels = ["", "Bon", "Acceptable", "Modéré", "Mauvais", "Très mauvais"];
    document.getElementById("air").textContent = `💨 Qualité de l'air : ${aqiLevels[aqi]}`;

    // --- Icône météo ---
    document.getElementById("weatherIcon").textContent = getWeatherIcon(current.weather[0].main);

    // --- Alertes météo (optionnel si API activée) ---
    displayAlerts(lat, lon);
    addHistory(data.city.name); // enregistrer dans l’historique

    return data;
  } else {
    alert("Ville introuvable !");
  }
}

function initWeather() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        console.log("Position détectée :", lat, lon);
        getWeatherByCoords(lat, lon);

      },
      (err) => {
        console.warn("Utilisateur a refusé la géoloc :", err);
        // Recherche manuelle 
        document.getElementById("searchContainer").style.display = "block";
      }
    );
  } else {
    console.warn("Géolocalisation non supportée.");
    document.getElementById("searchContainer").style.display = "block";
  }
}


async function getWeatherByCoords(lat, lon) {
  const cacheKey = `weather_coords_${lat.toFixed(3)}_${lon.toFixed(3)}`;

  const online = navigator.onLine;

  if (online) {
    try {
      //const cacheKey = `weather_coords_${lat.toFixed(3)}_${lon.toFixed(3)}`;
      const cachedData = getSmartCache(cacheKey);

      if (cachedData) {
        console.log("🟢 Données récupérées du cache (coordonnées)");
        return Weather(cachedData);
      }

      console.log("🌐 Appel API par coordonnées :", lat, lon);
  
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      console.log("response", data);
              
      console.log("Prévisions via position :", data);
      saveToCache(cacheKey, data);

      await Weather(data); // fonction d'affichage
      displayWeather(data.city.name);
    } catch (err) {
      console.error("Erreur API (coords)", err);
    }
  } else {
    console.warn("📴 Pas de connexion, affichage du cache...");
    const cached = getFromCache(cacheKey);
    if (cached) await Weather(cached);
    else alert("Aucune donnée météo disponible hors-ligne 😞");
  }
}


async function getWeather(city) {
  const cacheKey = `weather_city_${city.toLowerCase()}`;
  const online = navigator.onLine;

  if (online) {
    try {
      //const cacheKey = `weather_city_${city.toLowerCase()}`;
      const cachedData = getSmartCache(cacheKey);

      if (cachedData) {
        console.log("🟢 Données récupérées du cache :", city);
        return Weather(cachedData);
      }

      // Récupération des coordonnées via la ville ---
      console.log("🌐 Appel API pour :", city);
      const coordUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=fr`;
      const coordRes = await fetch(coordUrl);
      const coordData = await coordRes.json();

      if (coordData.cod !== 200) {
        alert("Ville introuvable !");
        return;
      }

      const { lat, lon } = coordData.coord;

      // Récupération des prévisions avec forecast ---
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${apiKey}`;
      const forecastRes = await fetch(forecastUrl);
      const forecastData = await forecastRes.json();

      console.log("Prévisions via ville :", forecastData);

      // Affichage des informations ---
      saveToCache(cacheKey, forecastData);
      await Weather(forecastData);

    } catch (err) {
      console.error(err);
    }
  } else {
    console.warn("📴 Pas de connexion, affichage du cache...");
    const cached = getFromCache(cacheKey);
    if (cached) await Weather(cached);
    else alert("Aucune donnée météo disponible hors-ligne 😞");
  }
}


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


function displayForecast(weather) {   // previsions 7 jours (ici 5)
  const forecastContainer = document.getElementById("forecastContainer");
  forecastContainer.innerHTML = "";

  // Groupage par jour
  const days = {};
  weather.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toISOString().split("T")[0]; // ex "2025-10-03"

    if (!days[dayKey]) {
      days[dayKey] = {
        temps: [],
        icons: []
      };
    }
    days[dayKey].temps.push(item.main.temp);
    days[dayKey].icons.push(item.weather[0].icon);
  });

  // Transformation en tableau de prévisions
  const forecastDays = Object.keys(days).slice(0, 5).map(key => {
    const temps = days[key].temps;
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    const icon = days[key].icons[0]; // première icône du jour
    return { date: key, min, max, icon };
  });

  // Génération du HTML
  forecastDays.forEach(day => {
    const date = new Date(day.date);
    const options = { weekday: "long", day: "numeric", month: "short" };
    const label = date.toLocaleDateString("fr-FR", options);

    const card = document.createElement("div");
    card.classList.add("forecast-day");
    card.innerHTML = `
      <h4>${label}</h4>
      <img src="https://openweathermap.org/img/wn/${day.icon}.png" alt="icon">
      <p>Min: ${Math.round(day.min)}°C</p>
      <p>Max: ${Math.round(day.max)}°C</p>
    `;
    forecastContainer.appendChild(card);
  });
}


//  Afficher météo + graphiques

async function displayWeather(city) {
  try {

    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=fr&appid=${apiKey}`; 
    const res = await fetch(url);
    const weather = await res.json();
    console.log(weather); // retourne tout l'objet JSON complet

    displayForecast(weather); // prévision sur 5 jours
    
    // --- Prévisions 24h ---
    const forecast = weather.list.slice(0, 8); // 8 * 3h = 24h  40=5jours
    const hours = forecast.map(item => {
      const date = new Date(item.dt * 1000);
      return `${date.getHours()}h`;
    });
    const temperatures = forecast.map(item => item.main.temp);
    const precipitations = forecast.map(item => item.pop * 100); // % probabilité pluie

    if (tempChart || precipChart) {
      tempChart.destroy();
      precipChart.destroy();
    }

    // === Graphique Température ===
        tempChart = new Chart(document.getElementById("tempChart"), {
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
        precipChart = new Chart(document.getElementById("precipChart"), {
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

async function displayAlerts(lat, lon) {
  const alertsContainer = document.getElementById("alerts");
  
  try {
    // Simulation d'une fausse alerte pour tester l’UI
    const fakeAlert = {
      sender_name: "⚡ Service météo",
      event: "Orages violents (simulation)",
      start: new Date().toLocaleString("fr-FR"),
      end: new Date(Date.now() + 3*60*60*1000).toLocaleString("fr-FR"),
      description: "Des pluies abondantes et un risque de grêle sont attendus."
    };

    alertsContainer.innerHTML = `
      <div class="alert-box">
        <h4>🚨 ${fakeAlert.event}</h4>
        <p><strong>Émis par :</strong> ${fakeAlert.sender_name}</p>
        <p><strong>Début :</strong> ${fakeAlert.start}</p>
        <p><strong>Fin :</strong> ${fakeAlert.end}</p>
        <p>${fakeAlert.description}</p>
      </div>
    `;

  } catch (error) {
    alertsContainer.textContent = "Pas d’alertes météo disponibles.";
  }
}



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
  document.getElementById("toggleTheme").classList.toggle("light");
});

// Initialisation au chargement
setThemeByTime();


// --- Fonction autocomplétion ---
async function fetchCitySuggestions(query) {
  if (!query) {
    autocompleteList.innerHTML = "";
    return;
  }

  try {
    // OpenWeather Geocoding API
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`;
    const res = await fetch(url);
    const cities = await res.json();

    // Affichage des suggestions
    autocompleteList.innerHTML = "";
    cities.forEach(city => {
      const li = document.createElement("li");
      li.textContent = `${city.name}, ${city.country}`;
      li.addEventListener("click", () => {
        cityInput.value = city.name;
        autocompleteList.innerHTML = "";
        getWeather(city.name); // lance la recherche météo
        displayWeather(city.name);
      });
      autocompleteList.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}


function saveFavorites() {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function saveHistory() {
  localStorage.setItem("history", JSON.stringify(history));
}

// Ajouter une ville en favoris
function addFavorite(city) {
  if (!favorites.includes(city)) {
    favorites.push(city);
    saveFavorites();
    renderFavorites();
  }
}

// Ajouter à l’historique
function addHistory(city) {
  // éviter doublons
  history = history.filter(c => c !== city);
  history.unshift(city); // ajoute au début
  if (history.length > 5) history.pop(); // garder 5 max
  saveHistory();
  renderHistory();
}

// Afficher les listes
function renderFavorites() {
  favoritesList.innerHTML = favorites
    .map(c => `<li>${c}</li>`)
    .join("");
}

function renderHistory() {
  historyList.innerHTML = history
    .map(c => `<li>${c}</li>`)
    .join("");
}


// --- Lancement au chargement
window.addEventListener("load", initWeather);

const cityInput = document.getElementById("cityInput");
const autocompleteList = document.getElementById("autocompleteList");
const searchBtn = document.getElementById("searchBtn");

document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("searchBtn");
  const cityInput = document.getElementById("cityInput");

  cityInput.addEventListener("input", (e) => {
    fetchCitySuggestions(e.target.value);
  });
  searchBtn.addEventListener("click", () => {
    const input = cityInput.value.trim();

    if (!input) {
      alert("Veuillez entrer un nom de ville ou des coordonnées !");
      return;
    }

    
    const coordPattern = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;   // regex de coordonnées GPS

    if (coordPattern.test(input)) {
      const [lat, lon] = input.split(",").map(coord => parseFloat(coord.trim()));
      console.log("📍 Coordonnées détectées :", lat, lon);
      getWeatherByCoords(lat, lon);
    } else {
      console.log("🏙️ Ville détectée :", input);
      getWeather(input);
      displayWeather(input);

    }
      
  });
});

const favoritesList = document.getElementById("favoritesList");
const historyList = document.getElementById("historyList");

// Charger les données au démarrage
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];

document.getElementById("favBtn").addEventListener("click", () => {
  const city = document.getElementById("cityName").textContent;
  addFavorite(city);
});

// Click sur un favori ou une ville récente → recharge météo
[favoritesList, historyList].forEach(list => {
  list.addEventListener("click", e => {
    if (e.target.tagName === "LI") {
      const city = e.target.textContent;
      getWeather(city);
      displayWeather(city);
    }
  });
});

// Affichage initial
renderFavorites();
renderHistory();