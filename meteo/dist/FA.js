"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveToCache = saveToCache;
exports.getFromCache = getFromCache;
exports.getSmartCache = getSmartCache;
function saveToCache(key, data) {
    const cacheEntry = {
        timestamp: Date.now(),
        data
    };
    localStorage.setItem(key, JSON.stringify(cacheEntry));
}
function getFromCache(key) {
    const cached = localStorage.getItem(key);
    if (!cached)
        return null;
    const parsed = JSON.parse(cached);
    console.log("💾 Dernière donnée enregistrée :", new Date(parsed.timestamp).toLocaleString());
    return parsed.data; // Pas de vérification d'expiration ici
}
function getSmartCache(key, maxAge = 10 * 60 * 1000) {
    const cached = localStorage.getItem(key);
    if (!cached)
        return null;
    const parsed = JSON.parse(cached);
    const isExpired = (Date.now() - parsed.timestamp) > maxAge;
    return isExpired ? null : parsed.data;
}
const clearCache = document.getElementById("clearCache");
clearCache.addEventListener("click", () => {
    localStorage.clear();
    alert("Cache vidé !");
});
//# sourceMappingURL=FA.js.map