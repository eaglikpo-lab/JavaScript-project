const quizData = [
    const q = quizData[current];
    quizContainer.innerHTML = `<h3>${q.question}</h3>`;


if (q.type === "qcm") {
q.options.forEach((opt, i) => {
const btn = document.createElement("button");
btn.textContent = opt;
btn.onclick = () => checkAnswer(i);
quizContainer.appendChild(btn);
});
} else if (q.type === "vf") {
["Vrai", "Faux"].forEach((opt, i) => {
const btn = document.createElement("button");
btn.textContent = opt;
btn.onclick = () => checkAnswer(i === 0);
quizContainer.appendChild(btn);
});
} else if (q.type === "text") {
const input = document.createElement("input");
input.type = "text";
quizContainer.appendChild(input);
const btn = document.createElement("button");
btn.textContent = "Valider";
btn.onclick = () => checkAnswer(input.value);
quizContainer.appendChild(btn);
}
}


function checkAnswer(ans) {
const q = quizData[current];
let correct = false;


if (q.type === "qcm") correct = q.answer.includes(ans);
else if (q.type === "vf") correct = q.answer === ans;
else if (q.type === "text") correct = q.variants.includes(ans.trim());


if (correct) score++;
else lives--;


current++;
updateUI();
if (lives > 0) showQuestion(); else endQuiz();
}


function updateUI() {
    progress.textContent = `Question ${current}/${quizData.length}`;
    livesEl.textContent = `Vies: ${lives}`;
}


function endQuiz() {
quizContainer.innerHTML = `<h2>Résultats</h2><p>Score: ${score}/${quizData.length}</p>`;
}


// --- Gestion de l'Éditeur ---
const editorBtn = document.getElementById("editorBtn");
const editorModal = document.getElementById("editorModal");
const closeEditor = document.getElementById("closeEditor");
const editorForm = document.getElementById("editorForm");


editorBtn.addEventListener("click", () => editorModal.classList.remove("hidden"));
closeEditor.addEventListener("click", () => editorModal.classList.add("hidden"));


editorForm.addEventListener("submit", e => {
e.preventDefault();
const type = document.getElementById("questionType").value;
const text = document.getElementById("questionText").value;
quizData.push({ type, question: text, answer: null });
alert("Question ajoutée!");
editorModal.classList.add("hidden");
});