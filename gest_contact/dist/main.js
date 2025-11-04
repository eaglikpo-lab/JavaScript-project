"use strict";
// Object.defineProperty(exports, "__esModule", { value: true });
const form = document.getElementById('contact-form');
const contactList = document.getElementById("contact-list");
const phoneContainer = document.getElementById("phone-container");
const emailContainer = document.getElementById("email-container");
let contacts = []; // Tableau pour stocker les contacts
let currentTags = [];
const addPhoneBtn = document.getElementById('add-phone');
if (!addPhoneBtn)
    throw new Error('Bouton #add-phone introuvable.');
addPhoneBtn.addEventListener("click", () => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("phone-wrapper");
    const input = document.createElement("input");
    input.type = "tel";
    input.name = "telephone[]";
    //phoneContainer.appendChild(input);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "❌";
    btn.addEventListener("click", () => wrapper.remove());
    wrapper.appendChild(input);
    wrapper.appendChild(btn);
    phoneContainer.appendChild(wrapper);
});
const addEmailBtn = document.getElementById('add-email');
if (!addEmailBtn)
    throw new Error('Bouton #add-email introuvable.');
addEmailBtn.addEventListener("click", () => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("phone-wrapper");
    const input = document.createElement("input");
    input.type = "email";
    input.name = "email[]";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "❌";
    btn.addEventListener("click", () => wrapper.remove());
    wrapper.appendChild(input);
    wrapper.appendChild(btn);
    emailContainer.appendChild(wrapper);
});
// Validation simple
function validateInput(input, regex, msg) {
    const small = input.nextElementSibling;
    if (!regex.test(input.value)) {
        if (small) {
            small.textContent = msg;
            small.style.display = "block";
        }
        return false;
    }
    if (small)
        small.style.display = "none";
    return true;
}
const groupSelect = document.getElementById("group-select");
const newGroupInput = document.getElementById("new-group");
const addGroupBtn = document.getElementById("add-group");
// Ajouter dynamiquement un nouveau groupe
if (!addGroupBtn)
    throw new Error('Bouton #add-group introuvable.');
addGroupBtn?.addEventListener("click", () => {
    const newGroup = newGroupInput.value.trim();
    if (newGroup !== "") {
        // Vérifier si ce groupe existe déjà
        const exists = [...groupSelect?.options].some(opt => opt.value.toLowerCase() === newGroup.toLowerCase());
        if (!exists) {
            const option = document.createElement("option");
            option.value = newGroup;
            option.textContent = newGroup;
            option.selected = true; // auto-sélectionner
            groupSelect.appendChild(option);
        }
        newGroupInput.value = "";
    }
});
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nom = document.getElementById("nom");
    const prenom = document.getElementById("prenom");
    const adInput = document.getElementById("adresse");
    const adresse = adInput.value;
    const notesInput = document.getElementById("notes");
    const notes = notesInput.value;
    const favorisInput = document.getElementById("favoris");
    const favoris = favorisInput.checked;
    // On enlève les champs vides
    let phones = [...phoneContainer.querySelectorAll("input")]
        .map(i => i.value.trim())
        .filter(v => v !== "");
    let emails = [...emailContainer.querySelectorAll("input")]
        .map(i => i.value.trim())
        .filter(v => v !== "");
    let groupes = [...groupSelect.selectedOptions].map(opt => opt.value);
    // Validation basique
    if (!validateInput(nom, /^[a-zA-ZÀ-ÿ\s-]+$/, "Nom invalide"))
        return;
    if (!validateInput(prenom, /^[a-zA-ZÀ-ÿ\s-]+$/, "Prénom invalide"))
        return;
    for (let tel of phones) {
        const telRegex = /^\+?\d{6,15}$/;
        if (!telRegex.test(tel)) {
            alert("Téléphone invalide !");
            return;
        }
    }
    for (let mail of emails) {
        const mailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!mailRegex.test(mail)) {
            alert("Email invalide !");
            return;
        }
    }
    // Création de l'objet contact avec les dates
    const now = new Date();
    const contact = {
        id: Date.now(),
        nom: nom.value.trim(),
        prenom: prenom.value.trim(),
        phones,
        emails,
        adresse,
        notes,
        favoris,
        groupes,
        tags: [...currentTags],
        dateAjout: now,
        derniereModif: now
    };
    contacts.push(contact);
    renderContacts();
    // Reset formulaire
    form.reset();
    phoneContainer.innerHTML = `<input type="tel" name="telephone[]">`;
    emailContainer.innerHTML = `<input type="email" name="email[]">`;
    currentTags = [];
    renderTags(); // si tu veux vider les tags du formulaire
});
const tagInput = document.getElementById("tag-input");
const tagContainer = document.getElementById("tag-container");
tagInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && tagInput.value.trim() !== "") {
        e.preventDefault();
        const tag = tagInput.value.trim();
        console.log(tag);
        if (!currentTags.includes(tag)) {
            currentTags.push(tag);
            console.log(currentTags);
            renderTags();
        }
        tagInput.value = "";
    }
});
function renderTags() {
    // Efface les anciens badges
    tagContainer.querySelectorAll(".tag").forEach(t => t.remove());
    currentTags.forEach(tag => {
        const span = document.createElement("span");
        span.textContent = tag;
        span.classList.add("tag");
        // bouton "x" pour supprimer un tag
        const close = document.createElement("button");
        close.textContent = "x";
        close.onclick = () => {
            currentTags = currentTags.filter(t => t !== tag);
            renderTags();
        };
        span.appendChild(close);
        tagContainer.insertBefore(span, tagInput);
    });
}
// Affiche toute une liste de contacts
function renderContacts(list = contacts) {
    contactList.innerHTML = "";
    if (list.length === 0) {
        contactList.innerHTML = "<p>Aucun contact trouvé</p>";
        return;
    }
    list.forEach(c => renderContact(c));
}
const container = document.getElementById("contact-container");
// Affichage de la vue détail 
function showDetail(id) {
    const c = contacts.find(ct => ct.id === id);
    contactList.innerHTML = "";
    console.log('contact dans showdetails' + contacts);
    if (!c)
        return;
    const li = document.createElement("li");
    li.innerHTML = `
        <strong>${c.nom} ${c.prenom} ${c.favoris ? "⭐" : ""}</strong><br>
        <em>Téléphones:</em> ${c.phones.join(", ")}<br>
        <em>Emails:</em> ${c.emails.join(", ")}<br>
        <em>Adresse:</em> ${c.adresse || "-"}<br>
        <em><strong>Groupes:</strong> ${c.groupes?.length ? c.groupes.join(", ") : "-"}</p>
        <em><strong>Étiquettes:</strong> ${c.tags?.length ? c.tags.map(t => `<span class="tag">${t}</span>`).join(" ") : "-"}</p>
        <em>Notes:</em> ${c.notes || "-"}<br>
        <div class="actions">
            <button onclick="editContact(${c.id})">Modifier</button>
            <button onclick="deleteContact(${c.id})">Supprimer</button>
        </div>
    `;
    contactList.appendChild(li);
    li.style.display = "block";
}
// Affiche un seul contact
function renderContact(c) {
    const div = document.createElement("div");
    div.classList.add("contact-item");
    if (container.classList.contains("list-view")) {
        div.innerHTML = `
            <strong>${c.nom} ${c.prenom}</strong> ${c.favoris ? "⭐" : ""}<br>
            Tel: ${c.phones[0] || "-"} | Mail: ${c.emails[0] || "-"}<br>
            <em>Groupes:</em> ${c.groupes?.length ? c.groupes.join(", ") : "-"}<br>
            <button onclick="showDetail(${c.id})">Détails</button>
            <a href="tel:${c.phones[0]}">📞 Appeler</a>
            <a href="mailto:${c.emails[0]}">✉️ Email</a>
        `;
    }
    else {
        div.innerHTML = `
            <img src="${c.photo || 'https://via.placeholder.com/60'}" class="contact-photo">
            <div><strong>${c.nom}</strong><br>${c.prenom} ${c.favoris ? "⭐" : ""}</div>
            <button class="btn-detail" data-id="${c.id}">Détails</button>
        `;
    }
    contactList.appendChild(div);
}
// Délégation d'événements (un seul listener)
contactList.addEventListener('click', (e) => {
    const target = e.target;
    const id = Number(target.closest('[data-id]')?.dataset.id);
    if (!Number.isFinite(id))
        return;
    if (target.matches('.btn-detail')) {
        showDetail(id);
    }
    else if (target.matches('.btn-edit')) {
        editContact(id);
    }
    else if (target.matches('.btn-delete')) {
        deleteContact(id);
    }
});
// Suppression
function deleteContact(id) {
    if (confirm("Supprimer ce contact ?")) {
        contacts = contacts.filter(c => c.id !== id);
        renderContacts(contacts);
    }
}
const filterSelect = document.getElementById("contact-filter");
function applyFilter() {
    const filterValue = filterSelect.value;
    let filteredContacts = contacts;
    if (filterValue === "all") {
        renderContacts(filteredContacts);
    }
    else if (filterValue === "first-letter") {
        let letter = prompt("Entrer la première lettre :");
        if (letter) {
            letter = letter.toLowerCase();
            filteredContacts = contacts.filter(c => c.nom.toLowerCase().startsWith(letter));
            console.log("filtre lettre " + filteredContacts);
        }
    }
    else if (filterValue === "group") {
        let group = prompt("Entrer un groupe (famille, travail, amis...) :");
        if (group) {
            group = group.toLowerCase();
            filteredContacts = contacts.filter(c => c.groupes && c.groupes.includes(group));
            console.log("filtre groupe" + filteredContacts);
        }
    }
    else if (filterValue === "favoris") {
        filteredContacts = contacts.filter(c => c.favoris);
        console.log("filtre fav" + filteredContacts);
    }
    renderContacts(filteredContacts);
}
const sortSelect = document.getElementById("contact-sort");
function applySort() {
    const sortValue = sortSelect.value;
    let sortedContacts = [...contacts]; // on clone le tableau pour ne pas le modifier directement
    if (sortValue === "nom") {
        sortedContacts.sort((a, b) => a.nom.localeCompare(b.nom));
    }
    else if (sortValue === "date-ajout") {
        sortedContacts.sort((a, b) => new Date(a.dateAjout).getTime() - new Date(b.dateAjout).getTime());
    }
    else if (sortValue === "date-modif") {
        sortedContacts.sort((a, b) => new Date(b.derniereModif).getTime() - new Date(a.derniereModif).getTime());
    }
    renderContacts(sortedContacts);
}
sortSelect.addEventListener("change", () => {
    container.textContent = "";
    applySort();
}); // déclenche le tri quand on change de critère
filterSelect.addEventListener("change", applyFilter); // Quand l’utilisateur change le filtre
// Edition via modal
const modal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-form");
const closeModal = document.getElementById("close-modal");
let editTags = [];
let editPhones = [];
let editEmails = [];
function editContact(id) {
    const c = contacts.find(ct => ct.id === id);
    if (!c)
        return;
    editTags = [...(c.tags || [])];
    editPhones = [...(c.phones || [])];
    editEmails = [...(c.emails || [])];
    editForm.innerHTML = `
        <input type="hidden" id="edit-id" value="${c.id}">
        
        <label>Nom</label>
        <input type="text" id="edit-nom" value="${c.nom}">

        <label>Prénom</label>
        <input type="text" id="edit-prenom" value="${c.prenom}">

        <label>Téléphones</label>
        <div id="edit-phone-container"></div>
        <button type="button" id="edit-add-phone">+ Ajouter téléphone</button>

        <label>Emails</label>
        <div id="edit-email-container"></div>
        <button type="button" id="edit-add-email">+ Ajouter email</button>

        <label>Adresse</label>
        <input type="text" id="edit-adresse" value="${c.adresse}">

        <label>Notes</label>
        <textarea id="edit-notes">${c.notes}</textarea>

        <label>Groupes</label>
        <select id="edit-group-select" multiple>
            ${[...groupSelect.options].map(opt => `<option value="${opt.value}" ${c.groupes.includes(opt.value) ? "selected" : ""}>${opt.textContent}</option>`).join("")}
        </select>

        <label>Favoris</label>
        <input type="checkbox" id="edit-favoris" ${c.favoris ? "checked" : ""}>

        <label>Tags</label>
        <div id="edit-tag-container"></div>
        <input type="text" id="edit-tag-input" placeholder="Ajouter un tag">
        <button type="button" id="edit-add-tag">Ajouter</button>

        <button type="submit">Sauvegarder</button>
    `;
    modal.style.display = "flex";
    // Rendu des collections
    renderEditPhones();
    renderEditEmails();
    renderEditTags();
    // Ajout d’un téléphone
    document.getElementById("edit-add-phone")?.addEventListener("click", () => {
        editPhones.push("");
        renderEditPhones();
    });
    // Ajout d’un email
    document.getElementById("edit-add-email")?.addEventListener("click", () => {
        editEmails.push("");
        renderEditEmails();
    });
    // Ajout d’un tag
    document.getElementById("edit-add-tag")?.addEventListener("click", () => {
        const tagInput = document.getElementById("edit-tag-input");
        const tag = tagInput.value.trim();
        if (tag && !editTags.includes(tag)) {
            editTags.push(tag);
            tagInput.value = "";
            renderEditTags();
        }
    });
}
// ------- Rendu dynamiques -------
function renderEditPhones() {
    const container = document.getElementById("edit-phone-container");
    container.innerHTML = "";
    editPhones.forEach((p, i) => {
        const div = document.createElement("div");
        div.innerHTML = `
            <input type="tel" value="${p}" placeholder="Téléphone">
            <button type="button">✖</button>
        `;
        const input = div.querySelector("input");
        input.oninput = () => editPhones[i] = input.value;
        const button = div.querySelector("button");
        if (button) {
            button.onclick = () => {
                editPhones.splice(i, 1);
                renderEditPhones();
            };
        }
        container.appendChild(div);
    });
}
function renderEditEmails() {
    const container = document.getElementById("edit-email-container");
    container.innerHTML = "";
    editEmails.forEach((m, i) => {
        const div = document.createElement("div");
        div.innerHTML = `
            <input type="email" value="${m}" placeholder="Email">
            <button type="button">✖</button>
        `;
        const input = div.querySelector("input");
        input.oninput = () => editEmails[i] = input.value;
        const button = div.querySelector("button");
        if (button) {
            button.onclick = () => {
                editEmails.splice(i, 1);
                renderEditEmails();
            };
        }
        container.appendChild(div);
    });
}
function renderEditTags() {
    const container = document.getElementById("edit-tag-container");
    container.innerHTML = "";
    editTags.forEach((t, i) => {
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = t + " ✖";
        span.style.cursor = "pointer";
        span.onclick = () => {
            editTags.splice(i, 1);
            renderEditTags();
        };
        container.appendChild(span);
    });
}
// ------- Sauvegarde -------
editForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const editIdInput = document.getElementById("edit-id");
    const id = parseInt(editIdInput.value);
    const c = contacts.find(ct => ct.id === id);
    if (!c)
        return;
    const ednomInput = document.getElementById("edit-nom");
    c.nom = ednomInput.value;
    const edprenomInput = document.getElementById("edit-prenom");
    c.prenom = edprenomInput.value;
    c.phones = editPhones.filter(p => p.trim());
    c.emails = editEmails.filter(m => m.trim());
    const edAddInput = document.getElementById("edit-adresse");
    c.adresse = edAddInput.value;
    const edNotesInput = document.getElementById("edit-notes");
    c.notes = edNotesInput.value;
    const edFavInput = document.getElementById("edit-favoris");
    c.favoris = edFavInput.checked || false;
    const edGroupSelect = document.getElementById("edit-group-select");
    c.groupes = [...edGroupSelect.selectedOptions].map(opt => opt.value);
    c.tags = [...editTags];
    c.derniereModif = new Date();
    modal.style.display = "none";
    renderContacts();
});
// Fermeture
closeModal.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target == modal)
    modal.style.display = "none"; };
const btnListView = document.getElementById("list-view");
const btnGridView = document.getElementById("grid-view");
btnListView.addEventListener("click", () => {
    container.className = "list-view";
    renderContacts();
});
btnGridView.addEventListener("click", () => {
    container.className = "grid-view";
    renderContacts();
});
// Gestion de la recherche
const searchInput = document.getElementById("search");
let researchContacts = [];
searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.trim().toLowerCase();
    if (keyword.trim() === "") {
        researchContacts = contacts;
    }
    else {
        researchContacts = contacts.filter(contact => {
            return (contact.nom.toLowerCase().includes(keyword) ||
                contact.prenom.toLowerCase().includes(keyword) ||
                contact.phones.some(p => p.includes(keyword)) ||
                contact.emails.some(p => p.toLowerCase().includes(keyword)));
        });
    }
    renderContacts(researchContacts);
});
function importJSON(text) {
    console.log("Import lancé");
    try {
        const imported = JSON.parse(text);
        //console.log(imported);
        console.log("Après parse :", imported);
        imported.forEach((c) => {
            c.id = parseInt(c.id);
            // Optionnel : vérifier qu’il n’y a pas déjà le même id
            if (!contacts.some(existing => existing.id === c.id)) {
                // On reconvertit les dates si besoin
                c.dateAjout = new Date(c.dateAjout);
                c.derniereModif = new Date(c.derniereModif);
                contacts.push(c);
            }
        });
        renderContacts();
        alert("Import JSON terminé !");
    }
    catch (err) {
        if (err instanceof Error) {
            alert("Erreur JSON : " + err.message);
        }
        else {
            alert("Erreur inconnue lors de l’import JSON.");
        }
    }
}
const importFileInput = document.getElementById("import-file");
const importBtn = document.getElementById("import-btn");
importBtn.addEventListener("click", () => {
    const file = importFileInput.files?.[0];
    if (!file)
        return alert("Veuillez sélectionner un fichier !");
    console.log("Contacts avant import :", contacts);
    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content !== "string")
            return alert("Erreur de lecture du fichier.");
        if (file.name.endsWith(".json")) {
            importJSON(content);
        }
        else if (file.name.endsWith(".csv")) {
            importCSV(content);
        }
        else {
            alert("Format non supporté !");
        }
    };
    reader.readAsText(file);
});
function importCSV(text) {
    console.log("Import lancé");
    const lines = text.trim().split("\n");
    const headers = lines.shift()?.split(",").map(h => h.trim());
    if (!headers)
        return alert("Fichier CSV vide ou invalide !");
    lines.forEach(line => {
        const values = parseCSVLine(line); // fonction qui gère les champs entre guillemets
        const obj = {};
        headers.forEach((h, i) => {
            let v = values[i] || "";
            if (["phones", "emails", "groupes", "tags"].includes(h))
                v = v.split(";").filter((s) => s);
            if (["favoris"].includes(h))
                v = v.toLowerCase() === "true";
            if (["dateAjout", "derniereModif"].includes(h))
                v = new Date(v);
            obj[h] = v;
        });
        // Evite doublons par id
        obj.id = parseInt(obj.id);
        if (!contacts.some(c => c.id === obj.id))
            contacts.push(obj);
    });
    renderContacts();
    console.log(contacts);
    alert("Import CSV terminé !");
}
// parse CSV ligne complexe avec guillemets
function parseCSVLine(line) {
    const regex = /(".*?"|[^",]+)(?=\s*,|\s*$)/g;
    const matches = [];
    let match;
    while ((match = regex.exec(line)) !== null) {
        if (match[1] !== undefined) {
            matches.push(match[1].replace(/^"|"$/g, ''));
        }
    }
    return matches;
}
// Export de fichier CSV/JSON
function exportJSON() {
    const dataStr = JSON.stringify(contacts, null, 2); // indentation 2 espaces
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts.json";
    a.click();
    URL.revokeObjectURL(url);
}
function exportCSV() {
    // En-têtes
    const headers = ["id", "nom", "prenom", "phones", "emails", "adresse", "notes", "groupes", "tags", "favoris", "dateAjout", "derniereModif"];
    const rows = contacts.map(c => [
        c.id,
        `"${c.nom}"`,
        `"${c.prenom}"`,
        `"${c.phones.join(";")}"`,
        `"${c.emails.join(";")}"`,
        `"${c.adresse}"`,
        `"${c.notes}"`,
        `"${c.groupes.join(";")}"`,
        `"${c.tags.join(";")}"`,
        c.favoris,
        c.dateAjout instanceof Date ? c.dateAjout.toISOString() : c.dateAjout,
        c.derniereModif instanceof Date ? c.derniereModif.toISOString() : c.derniereModif
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts.csv";
    a.click();
    URL.revokeObjectURL(url);
}
const exportJSON_button = document.getElementById("exportJSON");
exportJSON_button.addEventListener("click", () => {
    exportJSON();
    return alert("Exportation au format JSON terminé.");
});
const exportCSVBtn = document.getElementById("exportCSV");
exportCSVBtn.addEventListener("click", () => {
    exportCSV();
    return alert("Exportation au format CSV terminé.");
});
//# sourceMappingURL=main.js.map