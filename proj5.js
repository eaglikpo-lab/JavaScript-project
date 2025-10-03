let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let lives = 3;
let countdown = 0;


quizContainer = document.getElementsByClassName("quiz-container");
quizMessage = document.getElementById("quiz-message");
feedbackEl = document.getElementById("feedback");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");



document.getElementById("startBtn").addEventListener("click", () => {
    const category = document.getElementById("category").value;
    const mode = document.getElementById("mode").value;
    console.log(category, typeof category);
    console.log(mode, typeof mode);

    startQuiz(category, mode);
});


async function startQuiz(category ="culture", mode = "sequentiel") {
    // 1. Réinitialiser l’état du quiz
    //currentQuestionIndex = 0;
    console.log("index question à quiz actuelle"+currentQuestionIndex);
    score = 0;
    lives = 3; // ou configurable*
    scoreEl.textContent = score;
    livesEl.textContent = lives;



    quizData = await loadQuiz(category, mode); // fonction qui retourne un tableau d’objets questions
    console.log(quizData);
    console.log(quizData[currentQuestionIndex]);
    
    if (quizData.length === 0) {
        quizMessage.innerHTML = "<p>Aucune question disponible pour cette catégorie.</p>";
        return;
    }

    document.getElementById("home").classList.add("hidden");  // cacher la page d’accueil

    document.getElementById("quizPage").classList.remove("hidden"); // montrer la page du quiz

    showQuestion(quizData[currentQuestionIndex]); //   Afficher la première question

}

function shuffle(array) {  // Mélanger le quiz au besoin
    for (let i = array.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));  // Generate a random index between 0 and i (inclusive)

        [array[i], array[j]] = [array[j], array[i]];    // Swap elements at indices i and j
    }
    return array;
}

/*function loadQuiz(category, mode) {

    let questions = [];

    if (category === "culture") questions = cultureQuestions;
    if (category === "informatique") questions = informatiqueQuestions;
    if (category === "histoire") questions = histoireQuestions;
    
    // Mode = aléatoire → on mélange le tableau
    if (mode === "aleatoire") {
        return shuffle([...questions]); // on clone avant de mélanger
    }

    return [...questions];  // Séquentiel → on garde l’ordre défini
}*/

async function loadQuiz(category, mode){
    let questions = [];

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


function showQuestion() {
    feedbackEl.textContent = "";
    feedbackEl.style.backgroundColor = "none";

    const q = quizData[currentQuestionIndex];
    console.log(q);
    
        console.log("question index: "+currentQuestionIndex);

    //const q = n;
    const container = document.getElementById("quizContainer");

    let html = `<h2>${q.question}</h2>`;

    if (q.type === "qcm") {
        html += q.options.map((opt, i) =>
        `<button class="optionBtn" data-index="${i}">${opt}</button>`
        ).join("");
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
    const timerEl = document.getElementById("timer");
    let timeLimit = 45;
    
    if (countdown) clearInterval(countdown);     // arrêter l'ancien interval si existant
    timerEl.textContent = `⏳ Temps restant : ${timeLimit}s`;

    countdown = setInterval(() => {
        timeLimit--;
        timerEl.textContent = `⏳ Temps restant : ${timeLimit}s`;
        if (timeLimit <= 0){
            clearInterval(countdown); // arrêter le timer
            feedback.textContent = "⏰ Temps écoulé !";
            lives--; // retirer une vie 
            score--;
            nextQuestionAfterDelay();
            //endGame(false);
        }
    }, 1000);
}       

function nextQuestionAfterDelay() {
    setTimeout(() => {
        currentQuestionIndex++;
        console.log("index apres temps passée pr actuelle question"+currentQuestionIndex);
        
        if (currentQuestionIndex < quizData.length && lives > 0) {
            slideToNextQuestion();
        } else {
            endQuiz();
        }
    }, 1000); // délai pour voir le feedback
}


function checkAnswer(e) {
    console.log(currentQuestionIndex);
    clearInterval(countdown); // arrêter le timer de la question
    const selected = e.target.getAttribute("data-index");
    const q = quizData[currentQuestionIndex];
    console.log(q);
    
    let isCorrect = false;

    if (q.type === "qcm") {
        isCorrect = parseInt(selected) === q.answer[0];
        //console.log("parseInt(selected)" + parseInt(selected));
        //console.log("q.answer",q.answer);   
    } else if (q.type === "vf") {
        isCorrect = (selected === "true") === q.answer;
    }

    // Feedback gestion
    if (isCorrect) {
        console.log("correcte reponse");
        score += 2;
        e.target.classList.add("correct");
        feedbackEl.textContent = "✅ Bravo, bonne réponse !";
        feedbackEl.style.backgroundColor = "aliceblue";

    } else {
        lives--;
        e.target.classList.add("wrong");

        let bonneReponse;
        if (q.type === "qcm") {
            bonneReponse = q.answer[0];
        } else if (q.type === "vraiFaux") {
            bonneReponse = q.answer;
        }
        feedbackEl.textContent = `❌ Mauvaise réponse. La bonne réponse était : ${bonneReponse}`;
        feedbackEl.style.backgroundColor = "brown";
    }
    
    scoreEl.textContent = `Score : ${score}`;
    livesEl.textContent = `Vies : ${lives}`;
    updateProgressBar();        // Afichage de la barre de progression

    setTimeout(() => {
        currentQuestionIndex++; // index suivant 
        console.log("index apres reponse/choix pr actuelle question"+currentQuestionIndex);

        if (currentQuestionIndex < quizData.length && lives > 0) {
            slideToNextQuestion();          // slide animation vers question suivante
        } else {
            endQuiz();
        }
    }, 3000); // 3 seconde pour que le joueur voie le feedback
}

function slideToNextQuestion() {
    const container = document.getElementById("quizContainer");

    container.classList.add("hidden-slide"); // Animation ajout

    setTimeout(() => {
        container.classList.remove("hidden-slide"); // retirer la classe pour l’animation d’entrée
        showQuestion(); // afficher la question suivante

    }, 500);    // Après 500ms (durée de l'animation CSS)
}


function updateProgressBar() {
    const progressEl = document.getElementById("progression-bar");
    const percent = ((currentQuestionIndex + 1) / quizData.length) * 100;
    progressEl.style.width = percent + "%";
    progressEl.style.backgroundColor = "#058014ff";
    progressEl.style.display = "inline-block";
    progressEl.style.marginLeft = "10px";
}


function endQuiz() {
    clearInterval(countdown); // stop timer
    //timerEl.textContent = "";
    livesEl.textContent = "";
    scoreEl.textContent = "";
    //progressEl.style.display= "none"
    currentQuestionIndex = 0;

    const container = document.getElementById("quizContainer");
    const feedback = document.getElementById("feedback");

    // Demander pseudo
    let playerName = prompt("Bravo ! Entre ton pseudo pour enregistrer ton score :");
    if (playerName) {
        saveScore(playerName, score, category);
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
        document.getElementById("quizPage").classList.add("hidden");
        document.getElementById("home").classList.remove("hidden");
    });
    container.appendChild(restartBtn);
}


function saveScore(playerName, score, category) {
    let scores = JSON.parse(localStorage.getItem("quizScores")) || [];
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
    scores = scores.slice(0, 10);

    localStorage.setItem("quizScores", JSON.stringify(scores));
}


function showStats() {
    container = document.getElementById("quizContainer");
    const scores = JSON.parse(localStorage.getItem("quizScores")) || [];

    if (scores.length === 0) {
        alert("Aucun score enregistré !");
        return;
    }

    // Grouper par catégorie
    let statsHTML = "<h3>Statistiques par catégorie :</h3>";
    let grouped = {};

    console.log(scores);
    
    scores.forEach(s => {
        if (!grouped[s.category]) grouped[s.category] = [];
        console.log(s.category);
        grouped[s.category].push(s);
    });
    console.log(grouped);
    

    for (let cat in grouped) {
        statsHTML += `<h4>${cat}</h4><ul>`;
        console.log(grouped[cat]);
        
        grouped[cat].forEach(s => {
            statsHTML += `<li>${s.name} : ${s.score} points (${s.date})</li>`;
        });
        statsHTML += "</ul>";
    }

    container.innerHTML = statsHTML;

     // Bouton rejouer
    const restartBtn = document.createElement("button");
    restartBtn.textContent = "Rejouer";
    restartBtn.addEventListener("click", () => {
        document.getElementById("quizPage").classList.add("hidden");
        document.getElementById("home").classList.remove("hidden");
    });
    container.appendChild(restartBtn);

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


// Importer un fichier JSON
/*function importQuiz(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);

            // Fusionner avec nos questions existantes
            if (importedData.informatique) {
                informatiqueQuestions = [...informatiqueQuestions, ...importedData.informatique];
            }

            if (importedData.histoire) {
                histoireQuestions = [...histoireQuestions, ...importedData.histoire];
            }

            if (importedData.culture) {
                histoireQuestions = [...histoireQuestions, ...importedData.histoire];
            }

        alert("Import réussi ✅");
        } catch (err) {
        alert("Erreur lors de l'import JSON ❌");
        }
    };
}*/


function importQuiz(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);

            // Stocke dans une variable globale
            allQuizzes = importedData;  
            console.log("Quiz importé :", allQuizzes);

            alert("Import réussi !");
        } catch (err) {
            alert("Erreur JSON : " + err.message);
        }
    };
    reader.readAsText(file);
}


document.getElementById("btnExport").addEventListener("click", exportQuiz);
document.getElementById("inputImport").addEventListener("change", importQuiz);
