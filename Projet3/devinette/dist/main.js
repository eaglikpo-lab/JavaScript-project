"use strict";
// Object.defineProperty(exports, "__esModule", { value: true });
function el(id) {
    const node = document.getElementById(id);
    if (!node)
        throw new Error(`Élément #${id} introuvable`);
    return node;
}
// ===== DOM =====
const menu = el("menu");
const game = el("game");
const startBtn = el("startBtn");
const restartBtn = el("restartBtn");
const instruction = el("instruction");
const guessInput = el("guessInput");
const submitGuess = el("submitGuess");
const hintBtn = el("hintBtn");
const feedback = el("feedback");
const tentativesEl = el("tentatives");
const scoreEl = el("score");
const timerEl = el("timer");
// ===== État =====
let mode;
let difficulte;
let timer = 0;
let answer;
let tentatives = 0;
let score = 0;
let countdownId = null;
let revealedLetters = [];
// ===== Données =====
const mots = ["chat", "soleil", "voiture", "maison", "ordinateur"];
const difficulteMap = {
    facile: 10,
    moyen: 7,
    difficile: 5,
};
// ===== Utils niveau =====
function getLevel() {
    return parseInt(localStorage.getItem("level") || "1", 10);
}
function increaseLevel() {
    const lvl = getLevel();
    localStorage.setItem("level", String(lvl + 1));
}
// ===== Démarrage =====
startBtn.addEventListener("click", () => {
    const modeSel = el("mode").value;
    const diffSel = el("difficulte").value;
    // gardes strictes (optionnel)
    const isMode = (x) => x === "nombre" || x === "mot" || x === "math" || x === "couleur";
    const isDiff = (x) => x === "facile" || x === "moyen" || x === "difficile";
    if (!isMode(modeSel)) {
        alert("Mode invalide");
        return;
    }
    if (!isDiff(diffSel)) {
        alert("Difficulté invalide");
        return;
    }
    mode = modeSel;
    difficulte = diffSel;
    tentatives = difficulteMap[difficulte];
    score = 100;
    revealedLetters = [];
    menu.classList.add("hidden");
    game.classList.remove("hidden");
    initGame();
});
submitGuess.addEventListener("click", checkGuess);
hintBtn.addEventListener("click", giveHint);
restartBtn.addEventListener("click", () => {
    stopTimer();
    menu.classList.remove("hidden");
    game.classList.add("hidden");
    feedback.textContent = "";
    feedback.className = "";
    guessInput.value = "";
});
// ===== Jeu =====
function initGame() {
    const level = getLevel();
    // verrouillage de modes (exemple)
    if ((mode === "mot" && level < 3) ||
        (mode === "math" && level < 5) ||
        (mode === "couleur" && level < 7)) {
        const confirmed = window.confirm("🚫 Mode verrouillé ! Rejouer ?");
        if (confirmed) {
            menu.classList.remove("hidden");
            game.classList.add("hidden");
            feedback.textContent = "";
            guessInput.value = "";
        }
        return;
    }
    guessInput.value = "";
    feedback.textContent = "";
    feedback.className = "";
    tentativesEl.textContent = String(tentatives);
    scoreEl.textContent = String(score);
    if (mode === "nombre") {
        answer = Math.floor(Math.random() * 100) + 1;
        instruction.textContent = "Devine un nombre entre 1 et 100";
    }
    else if (mode === "mot") {
        answer = mots[Math.floor(Math.random() * mots.length)] ?? "";
        instruction.textContent = "Devine le mot mystère";
    }
    else if (mode === "math") {
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        answer = a + b;
        instruction.textContent = `Résous : ${a} + ${b}`;
    }
    else { // "couleur"
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        answer = `rgb(${r},${g},${b})`;
        instruction.textContent = "Trouve la couleur (format rgb(r,g,b))";
    }
    // timer
    timer = difficulte === "facile" ? 60 : (difficulte === "moyen" ? 45 : 30);
    timerEl.textContent = `⏳ Temps restant : ${timer}s`;
    startTimer();
}
function startTimer() {
    stopTimer();
    countdownId = window.setInterval(() => {
        timer--;
        timerEl.textContent = `⏳ Temps restant : ${timer}s`;
        if (timer <= 0)
            endGame(false);
    }, 1000);
}
function stopTimer() {
    if (countdownId !== null) {
        clearInterval(countdownId);
        countdownId = null;
    }
}
function checkGuess() {
    const raw = guessInput.value.trim();
    if (!raw)
        return;
    let correct = false;
    if (mode === "nombre") {
        const num = parseInt(raw, 10);
        if (!Number.isNaN(num))
            correct = (num === answer);
        feedback.textContent = !correct ? (num < answer ? "Trop bas !" : "Trop haut !") : "";
    }
    else if (mode === "mot") {
        correct = raw.toLowerCase() === String(answer).toLowerCase();
        if (!correct)
            feedback.textContent = "Mauvais mot !";
    }
    else if (mode === "math") {
        const num = parseInt(raw, 10);
        if (!Number.isNaN(num))
            correct = (num === answer);
        if (!correct)
            feedback.textContent = "Mauvaise réponse !";
    }
    else if (mode === "couleur") {
        // normaliser les espaces
        const norm = raw.replace(/\s+/g, "");
        const correctNorm = String(answer).replace(/\s+/g, "");
        correct = norm === correctNorm;
        if (!correct)
            feedback.textContent = "Mauvaise couleur !";
    }
    if (correct) {
        endGame(true);
        return;
    }
    feedback.className = "error";
    tentatives--;
    score -= 5;
    tentativesEl.textContent = String(tentatives);
    scoreEl.textContent = String(score);
    if (tentatives <= 0)
        endGame(false);
}
function saveScore(playerName, score) {
    let scores = JSON.parse(localStorage.getItem("highscores") || "[]");
    scores.push({ name: playerName, score: score, date: new Date().toLocaleString() });
    // tri du plus grand au plus petit
    scores.sort((a, b) => b.score - a.score);
    // garder que les 10 meilleurs
    scores = scores.slice(0, 10);
    localStorage.setItem("highscores", JSON.stringify(scores));
}
function showHighScores() {
    let scores = JSON.parse(localStorage.getItem("highscores") || "[]");
    let html = "<h3>🏆 Meilleurs Scores</h3><ol>";
    scores.forEach(s => {
        html += `<li>${s.name} — ${s.score} pts (${s.date})</li>`;
    });
    html += "</ol>";
    return html;
}
function updateStats(win, score) {
    const stats = JSON.parse(localStorage.getItem("stats") || '{"played": 0,"won": 0,"lost": 0,"best": 0,"totalScore": 0 }');
    stats.played++;
    if (win)
        stats.won++;
    else
        stats.lost++;
    stats.totalScore += score;
    if (score > stats.best)
        stats.best = score;
    localStorage.setItem("stats", JSON.stringify(stats));
}
function showStats() {
    const s = JSON.parse(localStorage.getItem("stats") || "{}");
    const played = s.played ?? 0;
    const avg = played ? ((s.totalScore ?? 0) / played).toFixed(1) : "0";
    return `
    <h3>📊 Statistiques</h3>
    <p>Parties jouées : ${played}</p>
    <p>Gagnées : ${s.won ?? 0}</p>
    <p>Perdues : ${s.lost ?? 0}</p>
    <p>Meilleur score : ${s.best ?? 0}</p>
    <p>Score moyen : ${avg}</p>
  `;
}
function endGame(win) {
    stopTimer();
    if (win) {
        feedback.textContent = "🎉 Bravo, tu as gagné !";
        feedback.className = "success";
        const playerName = window.prompt("Bravo ! Entre ton pseudo pour enregistrer ton score :");
        if (playerName)
            saveScore(playerName, score);
        increaseLevel();
    }
    else {
        feedback.textContent = `💀 Perdu ! Réponse : ${String(answer)}`;
        feedback.className = "error";
    }
    feedback.innerHTML += showHighScores();
    updateStats(win, score);
    feedback.innerHTML += showStats();
    restartBtn.classList.remove("hidden");
}
function giveHint() {
    if (score < 10) {
        feedback.textContent = "Pas assez de points pour un indice !";
        return;
    }
    score -= 10;
    scoreEl.textContent = String(score);
    if (mode === "nombre") {
        feedback.textContent = answer % 2 === 0 ? "Indice : c'est pair" : "Indice : c'est impair";
    }
    else if (mode === "mot") {
        /*let hint = answer[0] + "*".repeat(answer.length - 1);
        feedback.textContent = `Indice : ${hint}`;*/
        const word = String(answer);
        let positions = [...Array(word.length).keys()]; // tableau des indices possibles
        let available = positions.filter(i => !revealedLetters.includes(i)); // retirer les positions déjà révélées
        if (available.length === 0) {
            feedback.textContent = "Toutes les lettres sont déjà révélées !";
            return;
        }
        // choisir une position aléatoire encore cachée
        let randIndex = available[Math.floor(Math.random() * available.length)];
        revealedLetters.push(randIndex);
        // construire l’indice
        let hint = word
            .split("")
            .map((ch, i) => (revealedLetters.includes(i) ? ch : "*"))
            .join("");
        feedback.textContent = `Indice : ${hint}`;
    }
    else if (mode === "math") {
        feedback.textContent = "Indice : résultat proche de " + (answer + (Math.random() < 0.5 ? -2 : 2));
    }
    else if (mode === "couleur") {
        //feedback.textContent = `Indice : commence par ${answer.slice(0, 3)}...`;
        // let r = parseInt(word.slice(1, 3), 16);
        // let g = parseInt(word.slice(3, 5), 16);
        // let b = parseInt(word.slice(5, 7), 16);
        // answer est du type "rgb(r,g,b)"
        const m = String(answer).match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i);
        if (!m) {
            feedback.textContent = "Indice indisponible.";
            return;
        }
        const [, rs, gs, bs] = m;
        const r = parseInt(rs, 10), g = parseInt(gs, 10), b = parseInt(bs, 10);
        // Créer une variation (±30 max par canal, bornée 0-255)
        function vary(c) {
            let delta = Math.floor(Math.random() * 61) - 30; // entre -30 et +30
            return Math.max(0, Math.min(255, c + delta));
        }
        let rVar = vary(r);
        let gVar = vary(g);
        let bVar = vary(b);
        let hintColor = `rgb(${rVar}, ${gVar}, ${bVar})`;
        feedback.innerHTML = `Indice : une variante proche de la couleur 
      <div style="width:40px;height:40px;background:${hintColor};margin:10px auto;border:1px solid #100f0fff"></div>`;
    }
}
//# sourceMappingURL=main.js.map