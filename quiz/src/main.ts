import { informatiqueQuestions } from './data/informatique.js';
import { cultureQuestions } from './data/culture.js';
import { histoireQuestions } from './data/histoire.js';

console.log(informatiqueQuestions);
// export interface Question {
//     question: string;
//     type: "qcm" | "vf";
//     options?: string[];
//     answer: number[] | boolean;
//     // autres champs selon ton JSON : id, catégorie, etc.
// };

type BaseQuestion = {
    question: string;
};

type QcmQuestion = BaseQuestion & {
    type: "qcm";
    options: string[];
    // conseille: une seule bonne réponse → number
    // (si tu veux garder un tableau, mets number[] ici)
    answer: number[];
};

type VfQuestion = BaseQuestion & {
    type: "vf";
    answer: boolean;
};

export type Question = QcmQuestion | VfQuestion;



let allQuizzes: Record<string, Question[]> = {
    culture: cultureQuestions,
    informatique: informatiqueQuestions,
    histoire: histoireQuestions
};

let quizData: Question[] = [];
let currentQuestionIndex: number = 0;
let currentCategory: string = "culture";
let score: number = 0;
let lives: number = 3;
let countdown: ReturnType<typeof setInterval> | null = null;

// const quizContainer = document.getElementsByClassName("quiz-container");
const quizMessage = document.getElementById("quiz-message") as HTMLElement | null;
const feedbackEl = document.getElementById("feedback") as HTMLElement | null;
const scoreEl = document.getElementById("score") as HTMLElement | null;
const livesEl = document.getElementById("lives") as HTMLElement | null;

const startBtn = document.getElementById("startBtn") as HTMLButtonElement;
startBtn.addEventListener("click", () => {
    console.log("click");
    
    const categoryInp = document.getElementById("category") as HTMLSelectElement;
    const category = categoryInp.value;

    const modeInp = document.getElementById("mode") as HTMLSelectElement;
    const mode = modeInp.value;

    console.log(category, typeof category);
    console.log(mode, typeof mode);

    startQuiz(category, mode);
});


async function startQuiz(category: string = "culture", mode: string = "sequentiel") {
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

    quizData = await loadQuiz(category, mode); // fonction qui retourne un tableau d’objets questions
    console.log(quizData);
    console.log(quizData[currentQuestionIndex]);

    if (quizData.length === 0 && quizMessage !== null) {
        quizMessage.innerHTML = "<p>Aucune question disponible pour cette catégorie.</p>";
        return;
    }

    document.getElementById("home")?.classList.add("hidden");  // cacher la page d’accueil

    document.getElementById("quizPage")?.classList.remove("hidden"); // montrer la page du quiz

    showQuestion(quizData[currentQuestionIndex] as Question); //   Afficher la première question

}

async function loadQuiz(category: string, mode: string): Promise<Question[]> {
    let questions: Question[] = [];

    if (category === "api") {
        questions = await fetchQuestionsFromAPI("informatique", 10);
        console.log(questions);

    } else {
        // Fichier JSON importé
        if (typeof allQuizzes !== "undefined" && allQuizzes[category]) {
            questions = allQuizzes[category];
            console.log("quiz exporté");

        } else {
            // Questions locales
            if (category === "culture") questions = cultureQuestions;
            if (category === "informatique") questions = informatiqueQuestions;
            if (category === "histoire") questions = histoireQuestions;
        }
    }

    // Gestion du mode de jeu
    if (mode === "aleatoire") {
        return shuffle([...questions]); // mélange si mode aléatoire
    }

    return [...questions]; // séquentiel → ordre défini
}

function shuffle(array: Question[]): Question[] {  // Mélanger le quiz au besoin
    for (let i = array.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));  // Generate a random index between 0 and i (inclusive)


        // [array[i], array[j]] = [array[j], array[i]];    // Swap elements at indices i and j
        const t = array[i]!;
        array[i] = array[j]!;
        array[j] = t;
    }
    return array;
}


function showQuestion(q: Question) {
    if (!feedbackEl) return;
    feedbackEl.textContent = "";
    feedbackEl.style.backgroundColor = "none";

    // const q = quizData[qId];
    console.log(q);

    console.log("question index: " + currentQuestionIndex);

    //const q = n;
    const container = document.getElementById("quizContainer") as HTMLElement;

    let html = `<h2>${q.question}</h2>`;

    if (q.type === "qcm" && q.options) {
        html += q.options
            .map((opt, i) => `<button class="optionBtn" data-index="${i}">${opt}</button>`)
            .join("");
    } else if (q.type === "vf") {
        html += `
            <button class="optionBtn" data-index="true">Vrai</button>
            <button class="optionBtn" data-index="false">Faux</button>
        `;
    }

    container.innerHTML = html;

    startTimer() // Mis en marche du compteur

    document.querySelectorAll(".optionBtn").forEach(btn => {
        btn.addEventListener("click", checkAnswer);
    });
}


function startTimer() {   // timer
    const timerEl = document.getElementById("timer") as HTMLElement;
    let timeLimit = 45;

    if (countdown) clearInterval(countdown);     // arrêter l'ancien interval si existant
    timerEl.textContent = `⏳ Temps restant : ${timeLimit}s`;

    countdown = setInterval(() => {
        timeLimit--;
        timerEl.textContent = `⏳ Temps restant : ${timeLimit}s`;
        if (timeLimit <= 0) {
            if (countdown) clearInterval(countdown); // arrêter le timer
            if (feedbackEl) feedbackEl.textContent = "⏰ Temps écoulé !";
            lives--; // retirer une vie 
            score--;
            nextQuestionAfterDelay();
            //endGame(false);
        }
    }, 1000);
}



async function fetchQuestionsFromAPI(category = "general", amount = 5) {
    let url = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;

    if (category === "informatique") url = `https://opentdb.com/api.php?amount=${amount}&category=18&type=multiple`;
    if (category === "histoire") url = `https://opentdb.com/api.php?amount=${amount}&category=23&type=multiple`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        // Transformer les questions de l’API au format de ton appli
        return data.results.map((q: any) => {
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

    } catch (err) {
        console.error("Erreur API", err);
        return [];
    }
}

function nextQuestionAfterDelay() {
    setTimeout(() => {
        currentQuestionIndex++;
        console.log("index apres temps passée pr actuelle question" + currentQuestionIndex);

        if (currentQuestionIndex < quizData.length && lives > 0) {
            slideToNextQuestion();
        } else {
            endQuiz();
        }
    }, 1000); // délai pour voir le feedback
}


function checkAnswer(e: Event) {
    console.log(currentQuestionIndex);
    if (countdown) clearInterval(countdown); // arrêter le timer de la question

    const target = e.target as HTMLElement;
    const selected = target.getAttribute("data-index");
    const q = quizData[currentQuestionIndex];
    console.log(q);

    // if (q?.type === "qcm") {
    //     if (selected) isCorrect = parseInt(selected) === q.answer[0]; 
    // } else if (q?.type === "vf") {
    //     isCorrect = (selected === "true") === q?.answer;
    // }

    let isCorrect = false;
    if (q?.type === "qcm" && selected != null) {
        isCorrect = Number(selected) === q.answer[0];          // ✅ plus d’erreur
    } else if (q?.type === "vf" && selected != null) {
        isCorrect = (selected === "true") === q.answer;     // ✅
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
    } else {
        lives--;
        target.classList.add("wrong");

        let bonneReponse;
        if (q?.type === "qcm") {
            bonneReponse = q.answer[0];
        } else if (q?.type === "vf") {
            bonneReponse = q?.answer;
        }
        if (feedbackEl) {
            feedbackEl.textContent = `❌ Mauvaise réponse. La bonne réponse était : ${bonneReponse}`;
            feedbackEl.style.backgroundColor = "brown";
        }
    }


    if (scoreEl) scoreEl.textContent = `Score : ${score}`;
    if (livesEl) livesEl.textContent = `Vies : ${lives}`;
    updateProgressBar();        // Afichage de la barre de progression

    setTimeout(() => {
        currentQuestionIndex++; // index suivant 
        console.log("index apres reponse/choix pr actuelle question" + currentQuestionIndex);

        if (currentQuestionIndex < quizData.length && lives > 0) {
            slideToNextQuestion();          // slide animation vers question suivante
        } else {
            endQuiz();
        }
    }, 3000); // 3 seconde pour que le joueur voie le feedback
}

function slideToNextQuestion() {
    const container = document.getElementById("quizContainer") as HTMLElement;

    container.classList.add("hidden-slide"); // Animation ajout

    setTimeout(() => {
        container.classList.remove("hidden-slide"); // retirer la classe pour l’animation d’entrée
        showQuestion(quizData[currentQuestionIndex] as Question); // afficher la question suivante

    }, 500);    // Après 500ms (durée de l'animation CSS)
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
    if (countdown) clearInterval(countdown); // stop timer
    //timerEl.textContent = "";
    if (livesEl) livesEl.textContent = "";
    if (scoreEl) scoreEl.textContent = "";
    //progressEl.style.display= "none"
    currentQuestionIndex = 0;

    const container = document.getElementById("quizContainer") as HTMLElement;
    const feedback = document.getElementById("feedback") as HTMLElement;

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
    const restartBtn = document.createElement("button") as HTMLButtonElement;
    restartBtn.textContent = "Rejouer";
    restartBtn.addEventListener("click", () => {
        const quizPage = document.getElementById("quizPage") as HTMLElement;
        quizPage.classList.add("hidden");

        const home = document.getElementById("home") as HTMLHtmlElement;
        home.classList.remove("hidden");
    });
    container.appendChild(restartBtn);
}


type ScoreEntry = {
    category: string;
    name: string;
    score: number;
    date: string;
};


function saveScore(playerName: string, score: number, category: string) {
    const raw = localStorage.getItem("quizScores");
    const scores: ScoreEntry[] = raw ? JSON.parse(raw) : [];
    // let scores = JSON.parse(localStorage.getItem("quizScores")) || [];
    scores.push(
        {
            category: category,
            name: playerName,
            score: score,
            date: new Date().toLocaleString()
        }
    );

    // tri du plus grand au plus petit
    scores.sort((a, b) => b.score - a.score);

    // garder que les 10 meilleurs
    const top10 = scores.slice(0, 10);

    // localStorage.setItem("quizScores", JSON.stringify(scores));
    localStorage.setItem("quizScores", JSON.stringify(top10));
}


function showStats() {
    const container = document.getElementById("quizContainer") as HTMLElement;
    if (!container) return;

    const raw = localStorage.getItem("quizScores");
    const scores: ScoreEntry[] = raw ? JSON.parse(raw) : [];
    // const scores = JSON.parse(localStorage.getItem("quizScores")) || [];

    if (scores.length === 0) {
        alert("Aucun score enregistré !");
        return;
    }

    // petit helper pour éviter les surprises avec innerHTML
    const esc = (s: unknown) =>
        String(s ?? "").replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

    // grouper par catégorie
    const grouped: Record<string, ScoreEntry[]> = {};
    for (const s of scores) {
        (grouped[s.category] ||= []).push(s);
    }

    // trier chaque groupe du meilleur au moins bon (optionnel)
    for (const cat in grouped) {
        grouped[cat]?.sort((a, b) => b.score - a.score);
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
        const quizPage = document.getElementById("quizPage") as HTMLElement;
        quizPage.classList.add("hidden");

        const home = document.getElementById("home") as HTMLElement;
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



function importQuiz(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    // const file = event.target.files[0];
    if (!file) {
        alert("Aucun fichier sélectionné !");
        return;
    } 

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const result = e.target?.result as string;
            const importedData = JSON.parse(result);
            // const importedData = JSON.parse(e.target.result);

            // Stocke dans une variable globale
            allQuizzes = importedData as Record<string, Question[]>;
            console.log("Quiz importé :", allQuizzes);

            alert("Import réussi !");
        } catch (err:any) {
            alert("Erreur JSON : " + err.message);
        }
    };
    reader.readAsText(file);
}


const btnExport = document.getElementById("btnExport") as HTMLButtonElement;
btnExport.addEventListener("click", exportQuiz);

const inputImport = document.getElementById("inputImport") as HTMLInputElement;
if (inputImport) inputImport.addEventListener("change", importQuiz);
