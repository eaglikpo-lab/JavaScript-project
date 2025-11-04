var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { informatiqueQuestions } from './data/informatique';
import { cultureQuestions } from './data/culture';
import { histoireQuestions } from './data/histoire';
let allQuizzes = {
    culture: cultureQuestions,
    informatique: informatiqueQuestions,
    histoire: histoireQuestions
};
let quizData = [];
let currentQuestionIndex = 0;
let currentCategory = "culture";
let score = 0;
let lives = 3;
let countdown = null;
// const quizContainer = document.getElementsByClassName("quiz-container");
const quizMessage = document.getElementById("quiz-message");
const feedbackEl = document.getElementById("feedback");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const startBtn = document.getElementById("startBtn");
startBtn.addEventListener("click", () => {
    const categoryInp = document.getElementById("category");
    const category = categoryInp.value;
    const modeInp = document.getElementById("mode");
    const mode = modeInp.value;
    console.log(category, typeof category);
    console.log(mode, typeof mode);
    startQuiz(category, mode);
});
function startQuiz() {
    return __awaiter(this, arguments, void 0, function* (category = "culture", mode = "sequentiel") {
        var _a, _b;
        // 1. Réinitialiser l’état du quiz
        //currentQuestionIndex = 0;
        console.log("index question à quiz actuelle" + currentQuestionIndex);
        score = 0;
        lives = 3; // ou configurable*
        currentCategory = category; // ← mémoriser
        if (scoreEl !== null)
            scoreEl.textContent = `${score}`;
        if (livesEl !== null)
            livesEl.textContent = `${lives}`;
        quizData = yield loadQuiz(category, mode); // fonction qui retourne un tableau d’objets questions
        console.log(quizData);
        console.log(quizData[currentQuestionIndex]);
        if (quizData.length === 0 && quizMessage !== null) {
            quizMessage.innerHTML = "<p>Aucune question disponible pour cette catégorie.</p>";
            return;
        }
        (_a = document.getElementById("home")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden"); // cacher la page d’accueil
        (_b = document.getElementById("quizPage")) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden"); // montrer la page du quiz
        showQuestion(quizData[currentQuestionIndex]); //   Afficher la première question
    });
}
function loadQuiz(category, mode) {
    return __awaiter(this, void 0, void 0, function* () {
        let questions = [];
        if (category === "api") {
            questions = yield fetchQuestionsFromAPI("informatique", 10);
            console.log(questions);
        }
        else {
            // Fichier JSON importé
            if (typeof allQuizzes !== "undefined" && allQuizzes[category]) {
                questions = allQuizzes[category];
                console.log("quiz exporté");
            }
            else {
                // Questions locales
                if (category === "culture")
                    questions = cultureQuestions;
                if (category === "informatique")
                    questions = informatiqueQuestions;
                if (category === "histoire")
                    questions = histoireQuestions;
            }
        }
        // Gestion du mode de jeu
        if (mode === "aleatoire") {
            return shuffle([...questions]); // mélange si mode aléatoire
        }
        return [...questions]; // séquentiel → ordre défini
    });
}
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // Generate a random index between 0 and i (inclusive)
        // [array[i], array[j]] = [array[j], array[i]];    // Swap elements at indices i and j
        const t = array[i];
        array[i] = array[j];
        array[j] = t;
    }
    return array;
}
function showQuestion(q) {
    if (!feedbackEl)
        return;
    feedbackEl.textContent = "";
    feedbackEl.style.backgroundColor = "none";
    // const q = quizData[qId];
    console.log(q);
    console.log("question index: " + currentQuestionIndex);
    //const q = n;
    const container = document.getElementById("quizContainer");
    let html = `<h2>${q.question}</h2>`;
    if (q.type === "qcm" && q.options) {
        html += q.options
            .map((opt, i) => `<button class="optionBtn" data-index="${i}">${opt}</button>`)
            .join("");
    }
    else if (q.type === "vf") {
        html += `
            <button class="optionBtn" data-index="true">Vrai</button>
            <button class="optionBtn" data-index="false">Faux</button>
        `;
    }
    container.innerHTML = html;
    startTimer(); // Mis en marche du compteur
    document.querySelectorAll(".optionBtn").forEach(btn => {
        btn.addEventListener("click", checkAnswer);
    });
}
function startTimer() {
    const timerEl = document.getElementById("timer");
    let timeLimit = 45;
    if (countdown)
        clearInterval(countdown); // arrêter l'ancien interval si existant
    timerEl.textContent = `⏳ Temps restant : ${timeLimit}s`;
    countdown = setInterval(() => {
        timeLimit--;
        timerEl.textContent = `⏳ Temps restant : ${timeLimit}s`;
        if (timeLimit <= 0) {
            if (countdown)
                clearInterval(countdown); // arrêter le timer
            if (feedbackEl)
                feedbackEl.textContent = "⏰ Temps écoulé !";
            lives--; // retirer une vie 
            score--;
            nextQuestionAfterDelay();
            //endGame(false);
        }
    }, 1000);
}
function fetchQuestionsFromAPI() {
    return __awaiter(this, arguments, void 0, function* (category = "general", amount = 5) {
        let url = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;
        if (category === "informatique")
            url = `https://opentdb.com/api.php?amount=${amount}&category=18&type=multiple`;
        if (category === "histoire")
            url = `https://opentdb.com/api.php?amount=${amount}&category=23&type=multiple`;
        try {
            const res = yield fetch(url);
            const data = yield res.json();
            // Transformer les questions de l’API au format de ton appli
            return data.results.map((q) => {
                const options = [...q.incorrect_answers, q.correct_answer];
                // Mélanger les options
                for (let i = options.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [options[i], options[j]] = [options[j], options[i]];
                }
                return {
                    type: q.type === "boolean" ? "vf" : "qcm",
                    question: q.question,
                    options: options,
                    // answer: [options.indexOf(q.correct_answer)]
                    answer: q.type === "boolean"
                        ? q.correct_answer.toLowerCase() === "true"
                        : [options.indexOf(q.correct_answer)]
                };
            });
        }
        catch (err) {
            console.error("Erreur API", err);
            return [];
        }
    });
}
function nextQuestionAfterDelay() {
    setTimeout(() => {
        currentQuestionIndex++;
        console.log("index apres temps passée pr actuelle question" + currentQuestionIndex);
        if (currentQuestionIndex < quizData.length && lives > 0) {
            slideToNextQuestion();
        }
        else {
            endQuiz();
        }
    }, 1000); // délai pour voir le feedback
}
function checkAnswer(e) {
    console.log(currentQuestionIndex);
    if (countdown)
        clearInterval(countdown); // arrêter le timer de la question
    const target = e.target;
    const selected = target.getAttribute("data-index");
    const q = quizData[currentQuestionIndex];
    console.log(q);
    // if (q?.type === "qcm") {
    //     if (selected) isCorrect = parseInt(selected) === q.answer[0]; 
    // } else if (q?.type === "vf") {
    //     isCorrect = (selected === "true") === q?.answer;
    // }
    let isCorrect = false;
    if ((q === null || q === void 0 ? void 0 : q.type) === "qcm" && selected != null) {
        isCorrect = Number(selected) === q.answer[0]; // ✅ plus d’erreur
    }
    else if ((q === null || q === void 0 ? void 0 : q.type) === "vf" && selected != null) {
        isCorrect = (selected === "true") === q.answer; // ✅
    }
    // Feedback gestion
    if (isCorrect) {
        console.log("correcte reponse");
        score += 2;
        target.classList.add("correct");
        if (feedbackEl) {
            feedbackEl.textContent = "✅ Bravo, bonne réponse !";
            feedbackEl.style.backgroundColor = "aliceblue";
        }
    }
    else {
        lives--;
        target.classList.add("wrong");
        let bonneReponse;
        if ((q === null || q === void 0 ? void 0 : q.type) === "qcm") {
            bonneReponse = q.answer[0];
        }
        else if ((q === null || q === void 0 ? void 0 : q.type) === "vf") {
            bonneReponse = q === null || q === void 0 ? void 0 : q.answer;
        }
        if (feedbackEl) {
            feedbackEl.textContent = `❌ Mauvaise réponse. La bonne réponse était : ${bonneReponse}`;
            feedbackEl.style.backgroundColor = "brown";
        }
    }
    if (scoreEl)
        scoreEl.textContent = `Score : ${score}`;
    if (livesEl)
        livesEl.textContent = `Vies : ${lives}`;
    updateProgressBar(); // Afichage de la barre de progression
    setTimeout(() => {
        currentQuestionIndex++; // index suivant 
        console.log("index apres reponse/choix pr actuelle question" + currentQuestionIndex);
        if (currentQuestionIndex < quizData.length && lives > 0) {
            slideToNextQuestion(); // slide animation vers question suivante
        }
        else {
            endQuiz();
        }
    }, 3000); // 3 seconde pour que le joueur voie le feedback
}
function slideToNextQuestion() {
    const container = document.getElementById("quizContainer");
    container.classList.add("hidden-slide"); // Animation ajout
    setTimeout(() => {
        container.classList.remove("hidden-slide"); // retirer la classe pour l’animation d’entrée
        showQuestion(quizData[currentQuestionIndex]); // afficher la question suivante
    }, 500); // Après 500ms (durée de l'animation CSS)
}
function updateProgressBar() {
    const progressEl = document.getElementById("progression-bar");
    const percent = ((currentQuestionIndex + 1) / quizData.length) * 100;
    if (progressEl) {
        progressEl.style.width = percent + "%";
        progressEl.style.backgroundColor = "#058014ff";
        progressEl.style.display = "inline-block";
        progressEl.style.marginLeft = "10px";
    }
}
function endQuiz() {
    if (countdown)
        clearInterval(countdown); // stop timer
    //timerEl.textContent = "";
    if (livesEl)
        livesEl.textContent = "";
    if (scoreEl)
        scoreEl.textContent = "";
    //progressEl.style.display= "none"
    currentQuestionIndex = 0;
    const container = document.getElementById("quizContainer");
    const feedback = document.getElementById("feedback");
    // Demander pseudo
    let playerName = prompt("Bravo ! Entre ton pseudo pour enregistrer ton score :");
    if (playerName) {
        saveScore(playerName, score, currentCategory);
    }
    // Résumé final
    container.innerHTML = `
        <h2>🎉 Fin du Quiz !</h2>
        <p>Score final : <strong>${score}</strong> / ${quizData.length}</p>
        <p>Vies restantes : ${lives}</p>
    `;
    feedback.textContent = "Merci d’avoir joué 🙌";
    feedback.style.background = "green";
    // Bouton pour voir stats
    const statsBtn = document.createElement("button");
    statsBtn.textContent = "Voir statistiques";
    statsBtn.addEventListener("click", showStats);
    container.appendChild(statsBtn);
    // Bouton rejouer
    const restartBtn = document.createElement("button");
    restartBtn.textContent = "Rejouer";
    restartBtn.addEventListener("click", () => {
        const quizPage = document.getElementById("quizPage");
        quizPage.classList.add("hidden");
        const home = document.getElementById("home");
        home.classList.remove("hidden");
    });
    container.appendChild(restartBtn);
}
function saveScore(playerName, score, category) {
    const raw = localStorage.getItem("quizScores");
    const scores = raw ? JSON.parse(raw) : [];
    // let scores = JSON.parse(localStorage.getItem("quizScores")) || [];
    scores.push({
        category: category,
        name: playerName,
        score: score,
        date: new Date().toLocaleString()
    });
    // tri du plus grand au plus petit
    scores.sort((a, b) => b.score - a.score);
    // garder que les 10 meilleurs
    const top10 = scores.slice(0, 10);
    // localStorage.setItem("quizScores", JSON.stringify(scores));
    localStorage.setItem("quizScores", JSON.stringify(top10));
}
function showStats() {
    var _a;
    var _b;
    const container = document.getElementById("quizContainer");
    if (!container)
        return;
    const raw = localStorage.getItem("quizScores");
    const scores = raw ? JSON.parse(raw) : [];
    // const scores = JSON.parse(localStorage.getItem("quizScores")) || [];
    if (scores.length === 0) {
        alert("Aucun score enregistré !");
        return;
    }
    // petit helper pour éviter les surprises avec innerHTML
    const esc = (s) => String(s !== null && s !== void 0 ? s : "").replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    // grouper par catégorie
    const grouped = {};
    for (const s of scores) {
        (grouped[_b = s.category] || (grouped[_b] = [])).push(s);
    }
    // trier chaque groupe du meilleur au moins bon (optionnel)
    for (const cat in grouped) {
        (_a = grouped[cat]) === null || _a === void 0 ? void 0 : _a.sort((a, b) => b.score - a.score);
    }
    // construire le HTML (simple)
    let statsHTML = "<h3>Statistiques par catégorie :</h3>";
    for (const cat in grouped) {
        statsHTML += `<h4>${esc(cat)}</h4><ul>`;
        if (grouped[cat]) {
            for (const s of grouped[cat]) {
                statsHTML += `<li>${esc(s.name)} : ${esc(s.score)} points (${esc(s.date)})</li>`;
            }
        }
        statsHTML += "</ul>";
    }
    container.innerHTML = statsHTML;
    // Bouton rejouer
    const restartBtn = document.createElement("button");
    restartBtn.textContent = "Rejouer";
    restartBtn.addEventListener("click", () => {
        const quizPage = document.getElementById("quizPage");
        quizPage.classList.add("hidden");
        const home = document.getElementById("home");
        home.classList.remove("hidden");
    });
    container.appendChild(restartBtn);
    const clearBtn = document.createElement("button");
    clearBtn.textContent = "Effacer scores";
    clearBtn.style.marginLeft = "8px";
    clearBtn.addEventListener("click", () => {
        if (confirm("Effacer tous les scores ?")) {
            localStorage.removeItem("quizScores");
            container.innerHTML = "<h3>Aucun score enregistré.</h3>";
        }
    });
    container.appendChild(clearBtn);
}
// Exporter toutes les questions en JSON
function exportQuiz() {
    const allQuestions = {
        informatique: informatiqueQuestions,
        histoire: histoireQuestions,
        culture: cultureQuestions
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allQuestions, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "quiz_export.json");
    dlAnchor.click();
}
function importQuiz(event) {
    var _a;
    const input = event.target;
    const file = (_a = input.files) === null || _a === void 0 ? void 0 : _a[0];
    // const file = event.target.files[0];
    if (!file) {
        alert("Aucun fichier sélectionné !");
        return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
        var _a;
        try {
            const result = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
            const importedData = JSON.parse(result);
            // const importedData = JSON.parse(e.target.result);
            // Stocke dans une variable globale
            allQuizzes = importedData;
            console.log("Quiz importé :", allQuizzes);
            alert("Import réussi !");
        }
        catch (err) {
            alert("Erreur JSON : " + err.message);
        }
    };
    reader.readAsText(file);
}
const btnExport = document.getElementById("btnExport");
btnExport.addEventListener("click", exportQuiz);
const inputImport = document.getElementById("inputImport");
if (inputImport)
    inputImport.addEventListener("change", importQuiz);
//# sourceMappingURL=main.js.map