import { saveToCache, getFromCache, getSmartCache } from "./FA.js";
// import { Chart } from "chart.js";
// import { Chart, registerables } from "chart.js";
// Chart.register(...registerables);


const apiKey: string = "ea5d0fdaeac747502f8d70675c7c011b"; // à remplacer par ta clé OpenWeather
let tempChart: any;
let precipChart: any;

// --- Types des données OpenWeather ---
interface WeatherMain {
  temp: number;
  feels_like: number;
  humidity: number;
  pressure: number;
}

interface WeatherWind {
  speed: number;
}

interface WeatherDescription {
  main: string;
  description: string;
  icon: string;
}

interface WeatherListItem {
  dt: number;
  main: WeatherMain;
  weather: WeatherDescription[];
  wind: WeatherWind;
}

interface CityInfo {
  name: string;
  sunrise: number;
  sunset: number;
  coord: { lat: number; lon: number };
}

export interface ForecastData {
  cod: string;
  city: CityInfo;
  list: WeatherListItem[];
}

// --- Fonction principale ---
async function Weather(data: ForecastData): Promise<ForecastData | void> {
  if (data.cod === "200") {
    // --- Infos Ville ---
    (document.getElementById("cityName") as HTMLElement).textContent = data.city.name;

    // --- Données actuelles ---
    const current = data.list[0];
    if (current) {
      (document.getElementById("temperature") as HTMLElement).textContent = `${Math.round(current.main.temp)}°C`;
      if (current.weather[0]) (document.getElementById("description") as HTMLElement).textContent = current.weather[0].description;
      (document.getElementById("feelsLike") as HTMLElement).textContent = `${Math.round(current.main.feels_like)}°C`;
      (document.getElementById("humidity") as HTMLElement).textContent = `${current.main.humidity}%`;
      (document.getElementById("wind") as HTMLElement).textContent = `${Math.round(current.wind.speed * 3.6)} km/h`;
      (document.getElementById("pressure") as HTMLElement).textContent = `${current.main.pressure} hPa`;

      // --- Lever & coucher du soleil ---
      const sunrise = new Date(data.city.sunrise * 1000).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      const sunset = new Date(data.city.sunset * 1000).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      (document.getElementById("sunrise") as HTMLElement).textContent = `🌅 Lever du soleil : ${sunrise}`;
      (document.getElementById("sunset") as HTMLElement).textContent = `🌇 Coucher du soleil : ${sunset}`;

      // --- Qualité de l’air ---
      const { lat, lon } = data.city.coord;
      console.log(lat);

      const airUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
      const airRes = await fetch(airUrl);
      const airData = await airRes.json();
      const aqi = airData.list[0].main.aqi;
      const aqiLevels = ["", "Bon", "Acceptable", "Modéré", "Mauvais", "Très mauvais"];
      (document.getElementById("air") as HTMLElement).textContent = `💨 Qualité de l'air : ${aqiLevels[aqi]}`;

      // --- Icône météo ---
      if (current.weather[0]) (document.getElementById("weatherIcon") as HTMLElement).textContent = getWeatherIcon(current.weather[0].main);
      
      // --- Alertes météo ---
      displayAlerts(lat, lon);
      addHistory(data.city.name);
    }

    return data;
  } else {
    alert("Ville introuvable !");
  }
}

// --- Initialisation ---
function initWeather(): void {
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
        (document.getElementById("searchContainer") as HTMLElement).style.display = "block";
      }
    );
  } else {
    console.warn("Géolocalisation non supportée.");
    (document.getElementById("searchContainer") as HTMLElement).style.display = "block";
  }
}

// --- Par coordonnées ---
async function getWeatherByCoords(lat: number, lon: number): Promise<void> {
  const cacheKey = `weather_coords_${lat.toFixed(3)}_${lon.toFixed(3)}`;
  const online = navigator.onLine;

  if (online) {
    try {
      const cachedData = getSmartCache(cacheKey);
      if (cachedData) {
        console.log("🟢 Données récupérées du cache (coordonnées)");
        // return Weather(cachedData);
        await Weather(cachedData);
        return;
      }

      console.log("🌐 Appel API par coordonnées :", lat, lon);
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${apiKey}`;
      const res = await fetch(url);
      const data: ForecastData = await res.json();

      saveToCache(cacheKey, data);
      await Weather(data);
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

// --- Par nom de ville ---
async function getWeather(city: string): Promise<void> {
  const cacheKey = `weather_city_${city.toLowerCase()}`;
  const online = navigator.onLine;

  if (online) {
    try {
      const cachedData = getSmartCache(cacheKey);
      if (cachedData) {
        console.log("🟢 Données récupérées du cache :", city);
        // return Weather(cachedData);
        await Weather(cachedData);
      }

      console.log("🌐 Appel API pour :", city);
      const coordUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=fr`;
      const coordRes = await fetch(coordUrl);
      const coordData = await coordRes.json();

      if (coordData.cod !== 200) {
        alert("Ville introuvable !");
        return;
      }

      const { lat, lon } = coordData.coord;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${apiKey}`;
      const forecastRes = await fetch(forecastUrl);
      const forecastData: ForecastData = await forecastRes.json();

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

// --- Icônes ---
function getWeatherIcon(condition: string): string {
  switch (condition.toLowerCase()) {
    case "clear": return "☀️";
    case "clouds": return "☁️";
    case "rain": return "🌧️";
    case "thunderstorm": return "⛈️";
    case "snow": return "❄️";
    default: return "🌤️";
  }
}

// --- Prévisions ---
function displayForecast(weather: ForecastData): void {
  const forecastContainer = document.getElementById("forecastContainer") as HTMLElement;
  forecastContainer.innerHTML = "";

  const days: Record<string, { temps: number[]; icons: string[] }> = {};
  weather.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dayKey: string = date.toISOString().split("T")[0] || "";

    if (!days[dayKey]) days[dayKey] = { temps: [], icons: [] };
    days[dayKey].temps.push(item.main.temp);
    if (item.weather[0]) days[dayKey].icons.push(item.weather[0].icon);
  });

  const forecastDays = Object.keys(days).slice(0, 5).map(key => {
    if (days[key]) {
      const temps = days[key].temps;
      const min = Math.min(...temps);
      const max = Math.max(...temps);
      const icon = days[key].icons[0];
      return { date: key, min, max, icon };
    }
  });

  forecastDays.forEach(day => {
    if (!day) return;
    const date = new Date(day.date);
    const label = date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short" });

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

async function displayWeather(city: string) {
  try {

    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=fr&appid=${apiKey}`;
    const res = await fetch(url);
    const weather = await res.json();
    console.log(weather); // retourne tout l'objet JSON complet

    displayForecast(weather); // prévision sur 5 jours

    // --- Prévisions 24h ---
    const forecast = weather.list.slice(0, 8); // 8 * 3h = 24h  40=5jours
    const hours = forecast.map((item: any) => {
      const date = new Date(item.dt * 1000);
      return `${date.getHours()}h`;
    });
    const temperatures = forecast.map((item: any) => item.main.temp);
    const precipitations = forecast.map((item: any) => item.pop * 100); // % probabilité pluie

    if (tempChart || precipChart) {
      tempChart.destroy();
      precipChart.destroy();
    }

    // === Graphique Température ===
    // tempChart = new Chart(document.getElementById("tempChart"), {
    //   type: "line",
    //   data: {
    //     labels: hours,
    //     datasets: [{
    //       label: "Température (°C)",
    //       data: temperatures,
    //       borderColor: "red",
    //       backgroundColor: "rgba(255,0,0,0.2)",
    //       fill: true,
    //       tension: 0.3
    //     }]
    //   },
    //   options: { responsive: true, plugins: { legend: { display: true } } }
    // });

    // === Graphique Précipitations ===
    // precipChart = new Chart(document.getElementById("precipChart"), {
    //   type: "bar",
    //   data: {
    //     labels: hours,
    //     datasets: [{
    //       label: "Précipitations (%)",
    //       data: precipitations,
    //       backgroundColor: "rgba(0,123,255,0.6)"
    //     }]
    //   },
    //   options: { responsive: true, plugins: { legend: { display: true } }, scales: { y: { beginAtZero: true, max: 100 } } }
    // });

  } catch (error) {
    console.error("Erreur dans displayWeather :", error);
  }
}

async function displayAlerts(lat: number, lon: number) {
  const alertsContainer = document.getElementById("alerts") as HTMLElement;

  try {
    // Simulation d'une fausse alerte pour tester l’UI
    const fakeAlert = {
      sender_name: "⚡ Service météo",
      event: "Orages violents (simulation)",
      start: new Date().toLocaleString("fr-FR"),
      end: new Date(Date.now() + 3 * 60 * 60 * 1000).toLocaleString("fr-FR"),
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
const toggleTheme = document.getElementById("toggleTheme") as HTMLElement;
toggleTheme.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
  toggleTheme.classList.toggle("light");
});

// Initialisation au chargement
setThemeByTime();

async function fetchCitySuggestions(query: string) {
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
    cities.forEach((city: any) => {
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
function addFavorite(city: string) {
  if (!favorites.includes(city)) {
    favorites.push(city);
    saveFavorites();
    renderFavorites();
  }
}

// Ajouter à l’historique
function addHistory(city: string) {
  // éviter doublons
  history = history.filter((c: any) => c !== city);
  history.unshift(city); // ajoute au début
  if (history.length > 5) history.pop(); // garder 5 max
  saveHistory();
  renderHistory();
}


// Afficher les listes
function renderFavorites() {
  favoritesList.innerHTML = favorites
    .map((c: any) => `<li>${c}</li>`)
    .join("");
}

function renderHistory() {
  historyList.innerHTML = history
    .map((c: any) => `<li>${c}</li>`)
    .join("");
}

// --- Lancement au chargement
window.addEventListener("load", initWeather);

const cityInput = document.getElementById("cityInput") as HTMLInputElement;
const autocompleteList = document.getElementById("autocompleteList") as HTMLElement;
const searchBtn = document.getElementById("searchBtn") as HTMLButtonElement;

document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("searchBtn") as HTMLButtonElement;
  const cityInput = document.getElementById("cityInput") as HTMLInputElement;

  cityInput.addEventListener("input", (e) => {
    const target = e.target as HTMLInputElement;
    fetchCitySuggestions(target.value);
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
      getWeatherByCoords(lat as number, lon as number);
    } else {
      console.log("🏙️ Ville détectée :", input);
      getWeather(input);
      displayWeather(input);

    }

  });
});

const favoritesList = document.getElementById("favoritesList") as HTMLElement;
const historyList = document.getElementById("historyList") as HTMLElement;

// Charger les données au démarrage
let favorites = JSON.parse(localStorage.getItem("favorites") ?? "[]");
let history = JSON.parse(localStorage.getItem("history") ?? "[]");


const favBtn = document.getElementById("favBtn") as HTMLButtonElement;
favBtn.addEventListener("click", () => {
  const city = document.getElementById("cityName")?.textContent;
  if (!city) return;
  addFavorite(city);
});

// Click sur un favori ou une ville récente → recharge météo
[favoritesList, historyList].forEach(list => {
  list.addEventListener("click", e => {
    const target = e.target as HTMLElement;
    if (target.tagName === "LI") {
      const city = target.textContent;
      getWeather(city);
      displayWeather(city);
    }
  });
});

// Affichage initial
renderFavorites();
renderHistory();