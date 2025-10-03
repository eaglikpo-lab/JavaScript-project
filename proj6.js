const apiKey = "ea5d0fdaeac747502f8d70675c7c011b"; // à remplacer par ta clé OpenWeather

async function getWeather(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=fr`;

    const res = await fetch(url);
    const data = await res.json();
    console.log(data);
          

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
      return data;
    } else {
      alert("Ville introuvable !");
    }
  } catch (err) {
    console.error(err);
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


function displayForecast(weather) {
  const forecastContainer = document.getElementById("forecastContainer");
  forecastContainer.innerHTML = "";

  // Grouper par jour
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

  // Transformer en tableau de prévisions
  const forecastDays = Object.keys(days).slice(0, 5).map(key => {
    const temps = days[key].temps;
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    const icon = days[key].icons[0]; // première icône du jour
    return { date: key, min, max, icon };
  });

  // Générer le HTML
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

    displayForecast(weather);
    
    // --- Prévisions 24h ---
    const forecast = weather.list.slice(0, 8); // 8 * 3h = 24h  40=5jours
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



document.addEventListener("DOMContentLoaded", () => {
    const searchBtn = document.getElementById("searchBtn");
    const cityInput = document.getElementById("cityInput");

    searchBtn.addEventListener("click", () => {
        const city = cityInput.value.trim();
        if (city) {
            
            getWeather(city);
            displayWeather(city);
        }
    });
});

