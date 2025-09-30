const form = document.getElementById("contact-form");
const contactList = document.getElementById("contact-list");

const phoneContainer = document.getElementById("phone-container");
const emailContainer = document.getElementById("email-container");

document.getElementById("add-phone").addEventListener("click", () => {
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

document.getElementById("add-email").addEventListener("click", () => {

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

// Tableau pour stocker les contacts
let contacts = [];

// Validation simple
function validateInput(input, regex, msg) {
  const small = input.nextElementSibling;
  if (!regex.test(input.value)) {
    small.textContent = msg;
    small.style.display = "block";
    return false;
  }
  small.style.display = "none";
  return true;
}

const groupSelect = document.getElementById("group-select");
const newGroupInput = document.getElementById("new-group");
const addGroupBtn = document.getElementById("add-group");

// Ajouter dynamiquement un nouveau groupe
addGroupBtn.addEventListener("click", () => {
  const newGroup = newGroupInput.value.trim();
  if (newGroup !== "") {
    // Vérifier si ce groupe existe déjà
    const exists = [...groupSelect.options].some(opt => opt.value.toLowerCase() === newGroup.toLowerCase());
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
    const adresse = document.getElementById("adresse").value;
    const notes = document.getElementById("notes").value;
    const favoris = document.getElementById("favoris").checked; // ✅ récupération
    
    let phones = [...phoneContainer.querySelectorAll("input")].map(i => i.value);
    let emails = [...emailContainer.querySelectorAll("input")].map(i => i.value);

    let groupes = [...groupSelect.selectedOptions].map(opt => opt.value);

    // Validation
    if (!validateInput(nom, /^[a-zA-ZÀ-ÿ\s-]+$/, "Nom invalide")) return;
    if (!validateInput(prenom, /^[a-zA-ZÀ-ÿ\s-]+$/, "Prénom invalide")) return;

    for (let tel of phones) {
        telRegex = /^\+?\d{6,15}$/;
        if (tel.trim() !== "" && !telRegex.test(tel)) {
            alert("Téléphone invalide !");
            return;
        }
        //if (!/^\+?\d{6,15}$/.test(tel)) { alert("Téléphone invalide"); return; }
    }
    
    for (let mail of emails) {
        mailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (mail.trim() !== "" && !mailRegex.test(mail)) {
            alert("Email invalide !");
            return;
        }
        //if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) { alert("Email invalide"); return; }

    }    
    
    const contact = { 
        id: Date.now(), nom: nom.value, prenom: prenom.value,
        phones, emails, adresse, notes, favoris, groupes
    };
    
    contacts.push(contact);
    renderContacts();

    form.reset();
    phoneContainer.innerHTML = `<input type="tel" name="telephone[]" required>`;
    emailContainer.innerHTML = `<input type="email" name="email[]" required>`;
});

// Affichage
/*function renderContacts() {
  contactList.innerHTML = "";
  contacts.forEach(c => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${c.nom} ${c.prenom}</strong><br>
      <em>Téléphones:</em> ${c.phones.join(", ")}<br>
      <em>Emails:</em> ${c.emails.join(", ")}<br>
      <em>Adresse:</em> ${c.adresse || "-"}<br>
      <em>Notes:</em> ${c.notes || "-"}<br>
      <div class="actions">
        <button onclick="editContact(${c.id})">Modifier</button>
        <button onclick="deleteContact(${c.id})">Supprimer</button>
      </div>
    `;
    contactList.appendChild(li);
  });
}*/

/*function renderContacts(list=null) {
    container.innerHTML = "";
    
    //const data = researchContacts.length || searchInput.value ? researchContacts : list || contacts;

    let data;
    if (searchInput.value) {
        data = researchContacts;   // résultat de recherche
    } else if (list) {
        data = list;               // tri / filtrage
    } else {
        data = contacts;           // liste complète
    }

    console.log(data);
    
    if (data.length === 0) {
        container.innerHTML = "<p>Aucun contact trouvé</p>";
        return;
    }

    data.forEach(c => {
        const div = document.createElement("div");
        div.classList.add("contact-item");

        if (container.classList.contains("list-view")) {
        // Vue liste = aperçu
        div.innerHTML = `
            <strong>${c.nom} ${c.prenom}</strong><br> ${c.favoris ? "⭐" : ""}
            Tel: ${c.phones[0] || "-"} | Mail: ${c.emails[0] || "-"}<br>
            <em>Groupes:</em> ${c.groupes && c.groupes.length ? c.groupes.join(", ") : "-"}<br>
            <button onclick="showDetail(${c.id})">Détails</button>
            <a href="tel:${c.phones[0]}">📞 Appeler</a>
            <a href="mailto:${c.emails[0]}">✉️ Email</a>
        `;
        } else {
        // Vue grille = photo + nom
        div.innerHTML = `
            <img src="${c.photo || 'https://via.placeholder.com/60'}" class="contact-photo">
            <div><strong>${c.nom}</strong><br>${c.prenom}</div>
            <button onclick="showDetail(${c.id})">Details</button>

        
        `;
        }

        // contactList.appendChild(div);
        container.appendChild(div);
    });
}*/


// Affiche toute une liste
function renderContacts(list = contacts) {
    contactList.innerHTML = "";

    if (list.length === 0) {
        contactList.innerHTML = "<p>Aucun contact trouvé</p>";
        return;
    }

    list.forEach(c => renderContact(c));
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
    } else {
        div.innerHTML = `
            <img src="${c.photo || 'https://via.placeholder.com/60'}" class="contact-photo">
            <div><strong>${c.nom}</strong><br>${c.prenom}</div>
            <button onclick="showDetail(${c.id})">Détails</button>
        `;
    }

    contactList.appendChild(div);
}



// Affichage de la vue détail 
function showDetail(id) {
    const c = contacts.find(ct => ct.id === id);
    /*alert(`
        ${c.nom} ${c.prenom}
        Téléphones: ${c.phones.join(", ")}
        Emails: ${c.emails.join(", ")}
        Adresse: ${c.adresse}
        Notes: ${c.notes}
    `);*/
    
    contactList.innerHTML = "";
    
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${c.nom} ${c.prenom}</strong><br>
      <em>Téléphones:</em> ${c.phones.join(", ")}<br>
      <em>Emails:</em> ${c.emails.join(", ")}<br>
      <em>Adresse:</em> ${c.adresse || "-"}<br>
      <em>Notes:</em> ${c.notes || "-"}<br>
      <div class="actions">
        <button onclick="editContact(${c.id})">Modifier</button>
        <button onclick="deleteContact(${c.id})">Supprimer</button>
      </div>
    `;
    container.appendChild(li);
}

function toggleFavorite(id) {
  const c = contacts.find(ct => ct.id === id);
  c.favoris = !c.favoris;
  renderContacts();
}


// Suppression
function deleteContact(id) {
  if (confirm("Supprimer ce contact ?")) {
    contacts = contacts.filter(c => c.id !== id);
    renderContacts(contacts);
  }
}

const filterSelect = document.getElementById("contact-filter");

function applyFilter() {    // Fonction de filtrage
    const filterValue = filterSelect.value;

    let filteredContacts = contacts; 

    if (filterValue === "all") { 
        renderContacts(filteredContacts);
    } else if (filterValue === "first-letter") {
        let letter = prompt("Entrer la première lettre :");
        if (letter) {
            letter = letter.toLowerCase();
            filteredContacts = contacts.filter(c => c.nom.toLowerCase().startsWith(letter));   
            console.log("filtre lettre "+filteredContacts);
        }
    } 
    else if (filterValue === "group") {
        let group = prompt("Entrer un groupe (famille, travail, amis...) :");
        if (group) {
            group = group.toLowerCase();
            filteredContacts = contacts.filter(c => c.groupes && c.groupes.includes(group));
            console.log("filtre groupe"+filteredContacts);

        }
    } 
    else if (filterValue === "favoris") {
        filteredContacts = contacts.filter(c => c.favoris);
        console.log("filtre fav"+filteredContacts);

    }

    renderContacts(filteredContacts);
}


const sortSelect = document.getElementById("contact-sort");

function applySort() {  // Fonction de tri
    const sortValue = sortSelect.value;

    let sortedContacts = [...contacts]; // on clone le tableau pour ne pas le modifier directement

    if (sortValue === "nom") {
        sortedContacts.sort((a, b) => a.nom.localeCompare(b.nom));
    } 
    else if (sortValue === "date-ajout") {
        sortedContacts.sort((a, b) => new Date(a.dateAjout) - new Date(b.dateAjout));
    } 
    else if (sortValue === "date-modif") {
        sortedContacts.sort((a, b) => new Date(b.dateModif) - new Date(a.dateModif));
    }

    renderContacts(sortedContacts);
}


sortSelect.addEventListener("change", () => {
    container.textContent = "";
    applySort();
});   // déclenche le tri quand on change de critère

filterSelect.addEventListener("change", applyFilter);   // Quand l’utilisateur change le filtre


// Edition via modal
const modal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-form");
const closeModal = document.getElementById("close-modal");

function editContact(id) {
    const c = contacts.find(ct => ct.id === id);
    editForm.innerHTML = `
        <input type="hidden" id="edit-id" value="${c.id}">
        <label>Nom</label><input type="text" id="edit-nom" value="${c.nom}">
        <label>Prénom</label><input type="text" id="edit-prenom" value="${c.prenom}">
        <label>Téléphones</label><input type="text" id="edit-phones" value="${c.phones.join(", ")}">
        <label>Emails</label><input type="text" id="edit-emails" value="${c.emails.join(", ")}">
        <label>Adresse</label><input type="text" id="edit-adresse" value="${c.adresse}">
        <label>Notes</label><textarea id="edit-notes">${c.notes}</textarea>

        <label>Groupes</label>
        <select id="edit-group-select" multiple>
            ${[...groupSelect.options].map(opt => 
                `<option value="${opt.value}" ${c.groupes.includes(opt.value) ? "selected" : ""}>${opt.textContent}</option>`
            ).join("")}
        </select>

        <button type="submit">Sauvegarder</button>
    `;
    modal.style.display = "flex";
}

editForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = parseInt(document.getElementById("edit-id").value);
    const c = contacts.find(ct => ct.id === id);
    c.nom = document.getElementById("edit-nom").value;
    c.prenom = document.getElementById("edit-prenom").value;
    c.phones = document.getElementById("edit-phones").value.split(",").map(p => p.trim());
    c.emails = document.getElementById("edit-emails").value.split(",").map(m => m.trim());
    c.adresse = document.getElementById("edit-adresse").value;
    c.notes = document.getElementById("edit-notes").value;
    
    c.groupes = [...document.getElementById("edit-group-select").selectedOptions].map(opt => opt.value);
    modal.style.display = "none";
    renderContacts(c);
});

closeModal.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; };



const container = document.getElementById("contact-container");
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
    } else {
        researchContacts = contacts.filter(contact => {
            return (
                contact.nom.toLowerCase().includes(keyword) ||
                contact.prenom.toLowerCase().includes(keyword) ||
                contact.phones.some(p => p.includes(keyword)) ||
                contact.emails.some(p => p.toLowerCase().includes(keyword))
            );
        });
    }

    renderContacts( researchContacts);
});



/*document.getElementById("show-favorites").addEventListener("click", () => {
  researchContacts = contacts.filter(c => c.favoris);
  renderContacts();
});*/

