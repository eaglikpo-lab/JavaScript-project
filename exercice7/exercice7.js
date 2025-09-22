class CardGenerator {

    constructor(selector) {
        this.container = document.querySelector(selector);
        this.cards = [];        // tableau interne
        this.nextId = 1;        // compteur d’ID
    }

    // Méthodes de création
    createCard(data) {
        const cardData = {
            ...data,
            id: this.nextId++,
            date: new Date() // date de création
        };

        const fromSort = arguments[1] === true; // Indique si la création vient d'un tri
        if (!fromSort) this.cards.push(cardData);

        const card = document.createElement('div');
        card.className = 'card';
        console.log(cardData);
        console.log(card);
        card.dataset.id = cardData.id;  // Ajout de l'attribut data-id pour idnetifier la carte
        card.innerHTML = this.generateCardHTML(cardData); // Utilisation de la méthode pour générer le HTML

        if (cardData.color) card.style.backgroundColor = cardData.color;
        if (cardData.image) {
            card.style.backgroundImage = `url(${cardData.image})`;
            card.style.backgroundSize = 'cover';
            card.style.backgroundPosition = 'center';
        }


        //  Rendre la carte déplaçable (Drag & Drop)
        card.setAttribute('draggable', true);

        //  Drag start
        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', card.dataset.id);
        });

        return card;
    }


    insertCard(card, position = "end") {
        if (position === "start") {
            this.container.insertBefore(card, this.container.firstChild);
            this.saveToLocalStorage();

        } else if (position === "end") {
            this.container.appendChild(card);
            this.saveToLocalStorage();
            
        } else if (typeof position === "number") {
            if (position < 0 || position > this.container.children.length) {
                console.error("Position invalide");
                return;
            }
            this.container.insertBefore(card, this.container.children[position]);

            this.saveToLocalStorage();
        }
    }

    generateCardHTML(data) {
        return `
            <div class="cardData">
                <h3>${data.title}</h3>
                <p>${data.description || ''}</p>
            </div>
        `;
    }


    // Méthodes de gestion des cartes
    deleteCard(id) {
        const index = this.cards.findIndex(card => card.id === id); // Chercher la carte par ID
        
        // Supprime la carte du tableau interne si trouvée
        if (index !== -1) {
            this.cards.splice(index, 1); //Supprime 1 item du tableau interne à l'index trouvé
            

            // Supprimer la carte du DOM
            const cardElement = this.container.querySelector(`.card[data-id='${id}']`);
            if (cardElement) {
                this.container.removeChild(cardElement);
            }
        }
        this.saveToLocalStorage();
    }

    editCard(id, newData) { // modifie une carte existante
        const index = this.cards.findIndex(card => card.id === id);
        if (index !== -1) {
            this.cards[index] = { ...this.cards[index], ...newData }; // Met à jour les données dans le tableau interne

            // Met à jour le DOM
            const cardElement = this.container.querySelector(`.card[data-id='${id}']`);
            if (cardElement) {
                cardElement.innerHTML = this.generateCardHTML(this.cards[index]);
            }
        }
        this.saveToLocalStorage();
    }

    clearAll() { // Supprime toutes les cartes
        this.cards = [];
        this.container.innerHTML = ''; // Vide le conteneur
        this.saveToLocalStorage();
    }

    sortCards(criteria) { // Trie les cartes selon un critère (title, id, date)
        if (criteria === 'title') {
            this.cards.sort((a, b) => a.title.localeCompare(b.title));
        } else if (criteria === 'id') {
            this.cards.sort((a, b) => a.id - b.id);
        } else if (criteria === 'date') {
            this.cards.sort((a, b) => a.date - b.date);
        }

        // Re-organiser les cartes dans le DOM
        this.container.innerHTML = '';
        this.cards.forEach(cardData => {
            const cardElement = this.createCard(cardData, true); // true pour indiquer que c'est depuis le tri
            this.container.appendChild(cardElement);
        });

       this.saveToLocalStorage(); 
    }

    saveToLocalStorage() {
    localStorage.setItem('cards', JSON.stringify(this.cards));
}

}



// --- Interaction avec le formulaire ---

const form = document.getElementById('formulaire');
const addBtn = document.getElementById('add-card');
const clearBtn = document.getElementById('clear-cards');
const sortBtn = document.getElementById('sort-title');

const cardGen = new CardGenerator('#cards-container'); // Initialiser avec le sélecteur du conteneur


    const savedCards = JSON.parse(localStorage.getItem('cards') || '[]');
        savedCards.forEach(data => {
            const card = cardGen.createCard(data, true); // true = ne pas repusher dans this.cards
            cardGen.insertCard(card, "end");
        });


    const container = document.querySelector('#cards-container');

    //  Drag over pour autoriser le drop
    container.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    // Drop
    container.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        const draggedCard = container.querySelector(`.card[data-id='${draggedId}']`);
        const dropTarget = e.target.closest('.card');

        if (draggedCard && dropTarget && draggedCard !== dropTarget) {
            container.insertBefore(draggedCard, dropTarget);

            // Mettre à jour l’ordre interne
            cardGen.cards = Array.from(container.children).map(cardEl =>
                cardGen.cards.find(c => c.id == cardEl.dataset.id)
            );
        }
    });


    // Ajouter une carte
    addBtn.addEventListener('click', function (e) {
        e.preventDefault(); // Empêche le rechargement de la page

        // Récupérer la valeur des champs du formulaire
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const color = document.getElementById('color').value;
        const image = document.getElementById('image').value;

        // Validation simple
        if (!title) {
            alert('Le titre est requis');
            return;
        }

        // Créer la carte
        const cardData = { title, description, color, image };
        const card = cardGen.createCard(cardData);

        

        // Insérer la carte dans le conteneur
        cardGen.insertCard(card, "end");

    // Réinitialiser le formulaire
        form.reset();
        }
    );

    // Effacer toutes les cartes
    clearBtn.addEventListener('click', function () {
        cardGen.clearAll();
    });

    // Trier les cartes par titre
    sortBtn.addEventListener('click', function () {
        cardGen.sortCards('title');
    });


    const templates = [
        { title: "Carte A", description: "Description A", color: "#ffcccc", image: "img1.png" },
        { title: "Carte B", description: "Description B", color: "#ccffcc", image: "img2.png" },
        { title: "Carte C", description: "Description C", color: "#ccccff", image: "img3.png" }
    ];

    const templateSelect = document.getElementById('template-select');
    const addTemplateBtn = document.getElementById('add-template');

    addTemplateBtn.addEventListener('click', () => {
        const index = templateSelect.value;
        const cardData = templates[index];
        const card = cardGen.createCard(cardData);
        cardGen.insertCard(card);
    });
