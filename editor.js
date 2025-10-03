editorBtn = document.getElementById("editorBtn");
retour = document.getElementById("backBtn");
editModal = document.getElementById("editorModal");
home = document.getElementById("home");
type = document.getElementById("editorType");

// Click sur bouton: editeur de quiz
editorBtn.addEventListener("click", () => {
  document.getElementById("home").classList.add("hidden");
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
    const type = document.getElementById("editorType").value;
    console.log(type);
    
  const optionsDiv = document.getElementById("editorOptions");
  optionsDiv.innerHTML = "";

  if (type === "qcm") {
    optionsDiv.innerHTML = `
      <label>Options (séparées par virgule) :</label>
      <input type="text" id="editorQcmOptions" placeholder="ex: Réponse1, Réponse2, Réponse3">
    `;
  }
}

// Aperçu en temps réel
document.getElementById("editorForm").addEventListener("input", showPreview);

function showPreview() {
  const type = document.getElementById("editorType").value;
  const question = document.getElementById("editorQuestion").value;
  const preview = document.getElementById("preview");

  let html = `<h4>${question}</h4>`;

  if (type === "qcm") {
    const opts = document.getElementById("editorQcmOptions")?.value.split(",") || [];
    html += opts.map((opt, i) => `<button>${opt.trim()}</button>`).join(" ");
  } else if (type === "vraiFaux") {
    html += `<button>Vrai</button> <button>Faux</button>`;
  }

  preview.innerHTML = html;
}

// Sauvegarde de la question
document.getElementById("editorForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const category = document.getElementById("editorCategory").value;
    const type = document.getElementById("editorType").value;
    const question = document.getElementById("editorQuestion").value;
    let answer = document.getElementById("editorAnswer").value;

    let newQuestion = { type, question };

    if (type === "qcm") {
        const opts = document.getElementById("editorQcmOptions").value.split(",").map(o => o.trim());
        newQuestion.options = opts;
        newQuestion.answer = [parseInt(answer)];
    } else if (type === "vraiFaux") {
        newQuestion.answer = (answer.toLowerCase() === "true" || answer.toLowerCase() === "vrai");
    }

    // Récupérer les questions déjà enregistrées
    let saved = JSON.parse(localStorage.getItem(category + "Questions")) || [];
    saved.push(newQuestion);
    localStorage.setItem(category + "Questions", JSON.stringify(saved));

    alert("✅ Question enregistrée !");
    document.getElementById("editorForm").reset();
    document.getElementById("preview").innerHTML = "";
});
