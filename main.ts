// -------------------------------------------------------
// Types & helpers
// -------------------------------------------------------
interface Contact {
  id: number;
  nom: string;
  prenom: string;
  phones: string[];
  emails: string[];
  adresse?: string;
  notes?: string;
  favoris: boolean;
  groupes: string[];
  tags: string[];
  dateAjout: Date;
  derniereModif: Date;
  photo?: string;
}

// Si cette fonction existe ailleurs (globale)
declare function showDetail(id: number): void;

// Helper DOM: prévient sans casser l’app
function getEl<T extends HTMLElement>(id: string, required = true): T | null {
  const el = document.getElementById(id) as T | null;
  if (!el && required) {
    console.warn(`⚠️ Élément #${id} introuvable — fonctionnalité correspondante désactivée.`);
  }
  return el;
}

function validateInput(input: HTMLInputElement, regex: RegExp, msg: string): boolean {
  const small = input.nextElementSibling as HTMLElement | null;
  if (!regex.test(input.value)) {
    if (small) {
      small.textContent = msg;
      small.style.display = 'block';
    }
    return false;
  }
  if (small) small.style.display = 'none';
  return true;
}

// -------------------------------------------------------
// App
// -------------------------------------------------------
function init(): void {
  // État
  let contacts: Contact[] = [];
  let currentTags: string[] = [];

  // DOM (tous optionnels : on désactive seulement les parties manquantes)
  const form = getEl<HTMLFormElement>('contact-form');
  const contactList = getEl<HTMLElement>('contact-list');
  const phoneContainer = getEl<HTMLElement>('phone-container');
  const emailContainer = getEl<HTMLElement>('email-container');
  const groupSelect = getEl<HTMLSelectElement>('group-select');
  const newGroupInput = getEl<HTMLInputElement>('new-group', /*required*/ false);
  const addGroupBtn = getEl<HTMLButtonElement>('add-group', /*required*/ false);
  const tagInput = getEl<HTMLInputElement>('tag-input', /*required*/ false);
  const tagContainer = getEl<HTMLElement>('tag-container', /*required*/ false);
  const container = getEl<HTMLElement>('contacts-container', /*required*/ false);

  // Boutons add
  const addPhoneBtn = getEl<HTMLButtonElement>('add-phone', /*required*/ false);
  if (addPhoneBtn && phoneContainer) {
    addPhoneBtn.addEventListener('click', () => {
      const wrapper = document.createElement('div');
      wrapper.classList.add('phone-wrapper');

      const input = document.createElement('input');
      input.type = 'tel';
      input.name = 'telephone[]';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = '❌';
      btn.addEventListener('click', () => wrapper.remove());

      wrapper.appendChild(input);
      wrapper.appendChild(btn);
      phoneContainer.appendChild(wrapper);
    });
  } else {
    console.warn('🧩 Ajout téléphone désactivé (bouton ou conteneur manquant).');
  }

  const addEmailBtn = getEl<HTMLButtonElement>('add-email', /*required*/ false);
  if (addEmailBtn && emailContainer) {
    addEmailBtn.addEventListener('click', () => {
      const wrapper = document.createElement('div');
      wrapper.classList.add('email-wrapper');

      const input = document.createElement('input');
      input.type = 'email';
      input.name = 'email[]';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = '❌';
      btn.addEventListener('click', () => wrapper.remove());

      wrapper.appendChild(input);
      wrapper.appendChild(btn);
      emailContainer.appendChild(wrapper);
    });
  } else {
    console.warn('🧩 Ajout email désactivé (bouton ou conteneur manquant).');
  }

  // Groupes (optionnel)
  if (addGroupBtn && groupSelect && newGroupInput) {
    addGroupBtn.addEventListener('click', () => {
      const newGroup = newGroupInput.value.trim();
      if (!newGroup) return;

      const exists = Array.from(groupSelect.options).some(
        (opt) => opt.value.toLowerCase() === newGroup.toLowerCase()
      );
      if (!exists) {
        const option = document.createElement('option');
        option.value = newGroup;
        option.textContent = newGroup;
        option.selected = true;
        groupSelect.appendChild(option);
      }
      newGroupInput.value = '';
    });
  } else {
    console.warn('🧩 Ajout de groupe désactivé (éléments manquants).');
  }

  // Soumission formulaire (si présent)
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Champs requis pour créer un contact
      const nom = getEl<HTMLInputElement>('nom');
      const prenom = getEl<HTMLInputElement>('prenom');
      const adInput = getEl<HTMLInputElement>('adresse', /*required*/ false);
      const notesInput = getEl<HTMLInputElement>('notes', /*required*/ false);
      const favorisInput = getEl<HTMLInputElement>('favoris', /*required*/ false);

      if (!nom || !prenom) {
        console.warn('⛔ Impossible de valider le formulaire (nom/prénom manquants).');
        return;
      }
      if (!contactList) {
        console.warn('⛔ Liste de contacts introuvable, rendu annulé.');
        return;
      }

      const adresse = adInput?.value ?? '';
      const notes = notesInput?.value ?? '';
      const favoris = !!favorisInput?.checked;

      // Récup des inputs dynamiques (si conteneurs présents)
      const phones = phoneContainer
        ? Array.from(phoneContainer.querySelectorAll<HTMLInputElement>('input'))
            .map((i) => i.value.trim())
            .filter((v) => v !== '')
        : [];

      const emails = emailContainer
        ? Array.from(emailContainer.querySelectorAll<HTMLInputElement>('input'))
            .map((i) => i.value.trim())
            .filter((v) => v !== '')
        : [];

      const groupes = groupSelect
        ? Array.from(groupSelect.selectedOptions).map((opt) => opt.value)
        : [];

      // Validation basique
      if (!validateInput(nom, /^[a-zA-ZÀ-ÿ\s-]+$/, 'Nom invalide')) return;
      if (!validateInput(prenom, /^[a-zA-ZÀ-ÿ\s-]+$/, 'Prénom invalide')) return;

      for (const tel of phones) {
        const telRegex = /^\+?\d{6,15}$/;
        if (!telRegex.test(tel)) {
          alert('Téléphone invalide !');
          return;
        }
      }

      for (const mail of emails) {
        const mailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!mailRegex.test(mail)) {
          alert('Email invalide !');
          return;
        }
      }

      // Création contact
      const now = new Date();
      const contact: Contact = {
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
        derniereModif: now,
      };

      contacts.push(contact);
      renderContacts(contacts, contactList, container);

      // Reset
      form.reset();
      if (phoneContainer) phoneContainer.innerHTML = `<input type="tel" name="telephone[]">`;
      if (emailContainer) emailContainer.innerHTML = `<input type="email" name="email[]">`;
      currentTags = [];
      renderTags(currentTags, tagContainer, tagInput);
    });
  } else {
    console.warn('🧩 Formulaire introuvable — la création de contact est désactivée.');
  }

  // Tags (optionnel)
  if (tagInput && tagContainer) {
    tagInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && tagInput.value.trim() !== '') {
        e.preventDefault();
        const tag = tagInput.value.trim();
        if (!currentTags.includes(tag)) {
          currentTags.push(tag);
          renderTags(currentTags, tagContainer, tagInput);
        }
        tagInput.value = '';
      }
    });
  } else {
    console.warn('🧩 Gestion des tags désactivée (éléments manquants).');
  }
}

// -------------------------------------------------------
// Rendering (purs, sans dépendance globale)
// -------------------------------------------------------
function renderTags(currentTags: string[], tagContainer: HTMLElement | null, tagInput: HTMLInputElement | null): void {
  if (!tagContainer || !tagInput) return;

  tagContainer.querySelectorAll('.tag').forEach((t) => t.remove());

  currentTags.forEach((tag) => {
    const span = document.createElement('span');
    span.textContent = tag;
    span.classList.add('tag');

    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'x';
    close.addEventListener('click', () => {
      const idx = currentTags.indexOf(tag);
      if (idx >= 0) currentTags.splice(idx, 1);
      renderTags(currentTags, tagContainer, tagInput);
    });

    span.appendChild(close);
    tagContainer.insertBefore(span, tagInput);
  });
}

function renderContacts(
  list: Contact[],
  contactList: HTMLElement | null,
  container: HTMLElement | null
): void {
  if (!contactList) return;

  contactList.innerHTML = '';
  if (list.length === 0) {
    contactList.innerHTML = '<p>Aucun contact trouvé</p>';
    return;
  }

  const isListView = container?.classList.contains('list-view') ?? true;

  list.forEach((c) => {
    const div = document.createElement('div');
    div.classList.add('contact-item');

    if (isListView) {
      div.innerHTML = `
        <strong>${c.nom} ${c.prenom}</strong> ${c.favoris ? '⭐' : ''}<br>
        Tel: ${c.phones[0] || '-'} | Mail: ${c.emails[0] || '-'}<br>
        <em>Groupes:</em> ${c.groupes?.length ? c.groupes.join(', ') : '-'}<br>
        <button type="button" onclick="showDetail(${c.id})">Détails</button>
        ${c.phones[0] ? `<a href="tel:${c.phones[0]}">📞 Appeler</a>` : ''}
        ${c.emails[0] ? `<a href="mailto:${c.emails[0]}">✉️ Email</a>` : ''}
      `;
    } else {
      const photo = c.photo || 'https://via.placeholder.com/60';
      div.innerHTML = `
        <img src="${photo}" class="contact-photo" alt="photo de ${c.nom}">
        <div><strong>${c.nom}</strong><br>${c.prenom} ${c.favoris ? '⭐' : ''}</div>
        <button type="button" onclick="showDetail(${c.id})">Détails</button>
      `;
    }

    contactList.appendChild(div);
  });
}

// -------------------------------------------------------
// Boot
// -------------------------------------------------------
document.addEventListener('DOMContentLoaded', init);
