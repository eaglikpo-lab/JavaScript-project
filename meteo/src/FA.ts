import type {ForecastData} from './main'

export function saveToCache(key: string, data: ForecastData) {
  const cacheEntry = {
    timestamp: Date.now(),
    data
  };
  localStorage.setItem(key, JSON.stringify(cacheEntry));
}


export function getFromCache(key:string) {
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  const parsed = JSON.parse(cached);
  console.log("💾 Dernière donnée enregistrée :", new Date(parsed.timestamp).toLocaleString());
  return parsed.data; // Pas de vérification d'expiration ici
}

export function getSmartCache(key:string, maxAge = 10 * 60 * 1000) { // 10 minutes par défaut
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  const parsed = JSON.parse(cached);
  const isExpired = (Date.now() - parsed.timestamp) > maxAge;

  return isExpired ? null : parsed.data;
}

const clearCache = document.getElementById("clearCache") as HTMLElement;
clearCache.addEventListener("click", () => {
  localStorage.clear();
  alert("Cache vidé !");
});