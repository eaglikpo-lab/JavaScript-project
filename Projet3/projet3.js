const menu = document.getElementById("menu");
const game = document.getElementById("game");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const instruction = document.getElementById("instruction");
const guessInput = document.getElementById("guessInput");
const submitGuess = document.getElementById("submitGuess");
const hintBtn = document.getElementById("hintBtn");
const feedback = document.getElementById("feedback");
const tentativesEl = document.getElementById("tentatives");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");


let mode, difficulte, timer, answer, tentatives, score = 0;

// Liste de mots pour le mode "mot"
const mots = ["chat", "soleil", "voiture", "maison", "ordinateur"];
// Niveaux de difficulté
const difficulteMap = {
  facile: 10,
  moyen: 7,
  difficile: 5
};

// Démarrer le jeu
startBtn.addEventListener("click", () => {
  mode = document.getElementById("mode").value;
  difficulte = document.getElementById("difficulte").value;
  tentatives = difficulteMap[difficulte];
  score = 100;

  menu.classList.add("hidden");
  game.classList.remove("hidden");

  initGame();
});

submitGuess.addEventListener("click", checkGuess);
hintBtn.addEventListener("click", giveHint);

restartBtn.addEventListener("click", () => {
  menu.classList.remove("hidden");
  game.classList.add("hidden");
  feedback.textContent = "";
  guessInput.value = "";
 // game.textContent = "";
});


function getLevel() {
  return parseInt(localStorage.getItem("level") || "1");
}

function increaseLevel() {
  let lvl = getLevel();
  localStorage.setItem("level", lvl + 1);
}

/*function updateModesVisibility() {
  let level = getLevel();
  document.querySelectorAll("#mode option").forEach(opt => {
    if (
      (opt.value === "mot" && level < 3) ||
      (opt.value === "math" && level < 5) ||
      (opt.value === "couleur" && level < 7)
    ) {
      opt.disabled = true;
      menu.textContent = "🚫 Mode verrouillé ! Atteins un niveau supérieur pour le débloquer.";
    }
  });
}*/


function initGame() {

  let level = getLevel();

  if ((mode === "mot" && level < 3) ||
    (mode === "math" && level < 5) ||
    (mode === "couleur" && level < 7)) {
    const confirmed = window.confirm(`🚫 Mode verrouillé ! Rejouer ?`);
    if (confirmed) {
      menu.classList.remove("hidden");
      game.classList.add("hidden");
      feedback.textContent = "";
      guessInput.value = "";
    }
    //feedback.textContent = "🚫 Mode verrouillé ! Atteins un niveau supérieur pour le débloquer.";
    return; // on bloque le démarrage
  }

    guessInput.value = "";
    feedback.textContent = "";
    feedback.className = "";
    tentativesEl.textContent = tentatives;
    scoreEl.textContent = score;

    if (mode === "nombre") {
      answer = Math.floor(Math.random() * 100) + 1;
      instruction.textContent = "Devine un nombre entre 1 et 100";
    } else if (mode === "mot") {
      answer = mots[Math.floor(Math.random() * mots.length)];
      instruction.textContent = "Devine le mot mystère";
    } else if (mode === "math") {
      let a = Math.floor(Math.random() * 10) + 1;
      let b = Math.floor(Math.random() * 10) + 1;
      answer = a + b;
      instruction.textContent = `Résous : ${a} + ${b}`;
    } else if (mode === "couleur") {
      let r = Math.floor(Math.random() * 256);
      let g = Math.floor(Math.random() * 256);
      let b = Math.floor(Math.random() * 256);
      answer = `rgb(${r},${g},${b})`;
      instruction.textContent = `Trouve la couleur (format rgb(r,g,b))`;
    }

    // timer
    let timeLimit = difficulte === "facile" ? 60 : difficulte === "moyen" ? 45 : 30;
    timer = timeLimit;
    countdown = setInterval(() => {
      timer--;
      timerEl.textContent = `⏳ Temps restant : ${timer}s`;
      if (timer <= 0) endGame(false);
    }, 1000);
  }


function checkGuess() {
  let guess = guessInput.value.trim().toLowerCase();
  if (!guess) return;

  if (mode === "nombre") {
    let num = parseInt(guess);
    if (isNaN(num)) return;
    if (num === answer) return endGame(true);
    feedback.textContent = num < answer ? "Trop bas !" : "Trop haut !";
    feedback.className = "error";
  } else if (mode === "mot") {
    if (guess === answer) return endGame(true);
    feedback.textContent = "Mauvais mot !";
    feedback.className = "error";
  } else if (mode === "math") {
    if (parseInt(guess) === answer) return endGame(true);
    feedback.textContent = "Mauvaise réponse !";
    feedback.className = "error";
  } else if (mode === "couleur") {
    if (guess === answer) return endGame(true);
    feedback.textContent = "Mauvaise couleur !";
    feedback.className = "error";
  }

  tentatives--;
  score -= 5;
  tentativesEl.textContent = tentatives;
  scoreEl.textContent = score;

  if (tentatives <= 0) endGame(false);
}

function endGame(win) {
  clearInterval(countdown);
  //feedback.textContent = win ? "🎉 Bravo, tu as gagné !" : `💀 Perdu ! Réponse : ${answer}`;
  //feedback.className = win ? "success" : "error";

  if (win) {
    feedback.textContent = "🎉 Bravo, tu as gagné !";
    feedback.className = "success";
    let playerName = prompt("Bravo ! Entre ton pseudo pour enregistrer ton score :");
    if (playerName) saveScore(playerName, score);
    increaseLevel();
  } else {
    feedback.textContent = `💀 Perdu ! Réponse : ${answer}`;
    feedback.className = "error";
  }
  feedback.innerHTML += showHighScores();
  restartBtn.classList.remove("hidden");

  updateStats(win, score);
  feedback.innerHTML += showStats();
}

let revealedLetters = [];
function giveHint() {
  if (score < 10) {
    feedback.textContent = "Pas assez de points pour un indice !";
    return;
  }
  score -= 10;
  scoreEl.textContent = score;

  if (mode === "nombre") {
    feedback.textContent = answer % 2 === 0 ? "Indice : c'est pair" : "Indice : c'est impair";
  } else if (mode === "mot") {
    /*let hint = answer[0] + "*".repeat(answer.length - 1);
    feedback.textContent = `Indice : ${hint}`;*/

    let positions = [...Array(answer.length).keys()]; // tableau des indices possibles

    let available = positions.filter(i => !revealedLetters.includes(i)); // retirer les positions déjà révélées

    if (available.length === 0) {
      feedback.textContent = "Toutes les lettres sont déjà révélées !";
      return;
    }

    // choisir une position aléatoire encore cachée
    let randIndex = available[Math.floor(Math.random() * available.length)];
    revealedLetters.push(randIndex);

    // construire l’indice
    let hint = answer
      .split("")
      .map((ch, i) => (revealedLetters.includes(i) ? ch : "*"))
      .join("");

    feedback.textContent = `Indice : ${hint}`;

  } else if (mode === "math") {
    feedback.textContent = "Indice : résultat proche de " + (answer + (Math.random() < 0.5 ? -2 : 2));
  } else if (mode === "couleur") {
    //feedback.textContent = `Indice : commence par ${answer.slice(0, 3)}...`;

    let r = parseInt(answer.slice(1, 3), 16);
    let g = parseInt(answer.slice(3, 5), 16);
    let b = parseInt(answer.slice(5, 7), 16);

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


function saveScore(playerName, score) {
  let scores = JSON.parse(localStorage.getItem("highscores")) || [];
  scores.push({ name: playerName, score: score, date: new Date().toLocaleString() });

  // tri du plus grand au plus petit
  scores.sort((a, b) => b.score - a.score);

  // garder que les 10 meilleurs
  scores = scores.slice(0, 10);

  localStorage.setItem("highscores", JSON.stringify(scores));
}

function showHighScores() {
  let scores = JSON.parse(localStorage.getItem("highscores")) || [];
  let html = "<h3>🏆 Meilleurs Scores</h3><ol>";
  scores.forEach(s => {
    html += `<li>${s.name} — ${s.score} pts (${s.date})</li>`;
  });
  html += "</ol>";
  return html;
}

function updateStats(win, score) {
  let stats = JSON.parse(localStorage.getItem("stats")) || {
    played: 0,
    won: 0,
    lost: 0,
    best: 0,
    totalScore: 0
  };

  stats.played++;
  if (win) stats.won++;
  else stats.lost++;

  stats.totalScore += score;
  if (score > stats.best) stats.best = score;

  localStorage.setItem("stats", JSON.stringify(stats));
}

function showStats() {
  let s = JSON.parse(localStorage.getItem("stats")) || {};
  return `
    <h3>📊 Statistiques</h3>
    <p>Parties jouées : ${s.played || 0}</p>
    <p>Gagnées : ${s.won || 0}</p>
    <p>Perdues : ${s.lost || 0}</p>
    <p>Meilleur score : ${s.best || 0}</p>
    <p>Score moyen : ${(s.played ? (s.totalScore / s.played).toFixed(1) : 0)}</p>
  `;
}




// Vérification de la réponse
/*submitGuess.addEventListener("click", () => {
  const userGuess = guessInput.value.trim();

  let correct = false;

  if (mode === "nombre") {
    correct = parseInt(userGuess) === answer; 
  } else if (mode === "mot") {
    correct = userGuess.toLowerCase() === answer;
  } else if (mode === "math") {
    correct = parseInt(userGuess) === answer;
  } else if (mode === "couleur") {
    correct = userGuess.replace(/\s/g, "") === answer;
  }

  if (correct) {
    feedback.textContent = "Bravo 🎉 !";
    feedback.className = "success";
    score += 10;
    scoreEl.textContent = score;
    setTimeout(initGame, 1000);
  } else {
    tentatives--;
    tentativesEl.textContent = tentatives;
    feedback.textContent = "Raté ❌";
    feedback.className = "error";

    if (tentatives <= 0) {
      feedback.textContent = `Perdu ! La réponse était : ${answer}`;
      submitGuess.disabled = true;
      setTimeout(() => {
        submitGuess.disabled = false;
        initGame();
      }, 2000);
    }
  }

  guessInput.value = "";
});*/
