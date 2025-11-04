// interface Question {
//     question: string;
//     type: "qcm" | "vf";
//     options?: string[];
//     answer: string | boolean;
//     // autres champs selon ton JSON : id, catégorie, etc.
// }

import { Question } from "./main";

const editorBtn = document.getElementById("editorBtn") as HTMLButtonElement;
const retour = document.getElementById("backBtn") as HTMLButtonElement;
const editModal = document.getElementById("editorModal") as HTMLElement;
const home = document.getElementById("home") as HTMLElement;
const type = document.getElementById("editorType") as HTMLSelectElement;

// Click sur bouton: editeur de quiz
editorBtn.addEventListener("click", () => {
    home.classList.add("hidden");
    editModal.classList.remove("hidden");
});

// Click sur retour
retour.addEventListener("click", () => {
    editModal.classList.add("hidden");
    home.classList.remove("hidden");
});

// Génération dynamique des champs selon type
type.addEventListener("change", updateOptions);

function updateOptions() {
    const typeval = type.value;
    console.log(typeval);

    const optionsDiv = document.getElementById("editorOptions") as HTMLSelectElement;
    optionsDiv.innerHTML = "";

    if (typeval === "qcm") {
        optionsDiv.innerHTML = `
      <label>Options (séparées par virgule) :</label>
      <input type="text" id="editorQcmOptions" placeholder="ex: Réponse1, Réponse2, Réponse3">
    `;
    }
}

// Aperçu en temps réel
const editorForm = document.getElementById("editorForm") as HTMLFormElement;
editorForm.addEventListener("input", showPreview);

function showPreview() {
    const typeSel = document.getElementById("editorType") as HTMLSelectElement;
    const typeval = typeSel.value;

    const quest = document.getElementById("editorQuestion") as HTMLInputElement;
    const question = quest.value;

    const preview = document.getElementById("preview") as HTMLElement;

    let html = `<h4>${question}</h4>`;

    if (typeval === "qcm") {
        const optsInp = document.getElementById("editorQcmOptions") as HTMLInputElement;
        const opts = optsInp.value.split(",") || [];

        html += opts.map((opt) => `<button>${opt.trim()}</button>`).join(" ");
    } else if (typeval === "vraiFaux") {
        html += `<button>Vrai</button> <button>Faux</button>`;
    }

    preview.innerHTML = html;
}


// Sauvegarde de la question
editorForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const categorySel = document.getElementById("editorCategory") as HTMLSelectElement;
    const category = categorySel.value;

    const typeSel = document.getElementById("editorType") as HTMLSelectElement;
    const type = typeSel.value;

    const questInp = document.getElementById("editorQuestion") as HTMLInputElement;
    const question = questInp.value;

    let ansInp = document.getElementById("editorAnswer") as HTMLInputElement;
    let answer = ansInp.value;

    // let newQuestion: Question[] = [type, question];

    // --- Création d'une question ---
    const newQuestionvf: Question = {
        question,
        type: "vf",
        answer: false,
    };

    const newQuestionqcm: Question = {
        question,
        type: "qcm",
        answer: [],
        options: [],
    };

    let newQuestion;

    if (type === "qcm") {
        const optsInp = document.getElementById("editorQcmOptions") as HTMLSelectElement;
        const opts = optsInp.value.split(",").map(o => o.trim());

        newQuestionqcm.options = opts;
        newQuestionqcm.answer = [parseInt(answer)];
        newQuestion = newQuestionqcm;
    } else if (type === "vraiFaux") {
        newQuestionvf.answer = (answer.toLowerCase() === "true" || answer.toLowerCase() === "vrai");
        newQuestion = newQuestionvf;

    }

    // Récupérer les questions déjà enregistrées
    // --- Enregistrement dans le localStorage ---
    const key = category + "Questions";
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    saved.push(newQuestion);
    localStorage.setItem(key, JSON.stringify(saved));

    alert("✅ Question enregistrée !");
    editorForm.reset();


    const prev = document.getElementById("preview") as HTMLElement;
    prev.innerHTML = "";
});



