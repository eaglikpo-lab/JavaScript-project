// =======================
// Classe Task
// =======================
class Task {
    constructor(id, title,description, priority = medium ,dueDate=null, completed = false) {
        this.id = id;           // identifiant unique
        this.title = title;     
        this.description = description; // description de la tâche
        this.priority = priority; // niveau de priorité
        this.completed = completed; // état (faite ou pas)
        this.dueDate = dueDate; // nouvelle propriété
        //this.dueDate = dueDate ? new Date(dueDate) : null;

    }

    toggle() {
        // inverser completed
    }

    toJSON() {
        // retourner un objet simple pour sauvegarde
    }
}


// =======================
// Classe Storage
// =======================
class Storage {
    static save(key, data) {
        // sauvegarde dans localStorage
    }

    static load(key) {
        // charger depuis localStorage
    }

    static remove(key) {
        // supprimer une clé
    }
}


// =======================
// Classe TodoList
// =======================
class TodoList {
    constructor() {
        this.counter = 0;
        this.tasks = []; // tableau de Task
    }

    addTask(title, description, priority, dueDate) {
        console.log(dueDate, typeof dueDate);
        const task = new Task(this.counter++, title, description, priority, dueDate);
            console.log(task.dueDate, typeof task.dueDate)
        
        this.tasks.push(task);
        console.log("Tache ajoute");
        return task;
    }

    removeTask(id) {
        // supprimer une tâche par id
        this.tasks.forEach(task => {
            if (id ===task.id) this.tasks.splice(task.id, 1)
        })
       // this.tasks = this.tasks.filter(t => t.id !== id);
        console.log(this.tasks)
        return this.tasks;
    }

    updateTask(id, updatedTask) { // modifier une tâche
        
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        const newtask = Object.assign(task, updatedTask); // Met à jour les champs donnés dans newData
        console.log(newtask);
        
    }
    
    // Filtrage
    filterTasks(filter) {
        const today = new Date();

        switch (filter) {
            case "toutes":
                console.log("toutes les taches: ", this.tasks);
                return this.tasks;

            case "actives":
                console.log("taches actives: ", this.tasks.filter(t => !t.completed));
                return this.tasks.filter(t => !t.completed);

            case "terminees":
                console.log("taches terminées: ", this.tasks.filter(t => t.completed));
                return this.tasks.filter(t => t.completed);

            case "echues":
                return this.tasks.filter(t => 
                    t.dueDate && new Date(t.dueDate) < today && !t.completed
                );

            default:
                return this.tasks;
        }
    }


    // Trie sur les tâches selon un critère
    sortTasks(criteria) {
        const priorityOrder = { "high": 1, "medium": 2, "low": 3 };

        return [...this.tasks].sort((a, b) => {
            switch(criteria) {
                case "creation":
                    return a.id - b.id; // plus petit id = plus ancien
                case "dueDate":
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                case "priority":
                    console.log(a.priority, priorityOrder[a.priority]);
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                case "alphabet":
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });
    }

    
}


// =======================
// Classe TodoUI (pour gerer le dom)
// =======================
class TodoUI {
    constructor(todoList, containerId) {
        this.todoList = todoList;
        this.container = list;
    }

    renderTask(task) {
        const li = document.createElement("li");
        li.className = `${task.priority}`; 
         
        // Vérifier date
        let dateInfo = "";

            console.log(task.dueDate)

        if (task.dueDate) {
            console.log(task.dueDate);
            const today = new Date();
            const due = new Date(task.dueDate);

            if (due < today) {
                dateInfo = `<span class="due overdue">Échéance dépassée (${task.dueDate})</span>`;
            } else if ((due - today) / (1000 * 60 * 60 * 24) <= 2) { //millisecondes en jour
                dateInfo = `<span class="due warning">Échéance proche (${task.dueDate})</span>`;
            } else {
                dateInfo = `<span class="due ok">Échéance : ${task.dueDate}</span>`;
            }
        }

        li.innerHTML = `
            <input type="checkbox" class="complete-checkbox">
            <span class= "titre"> <strong>${task.title}</strong> </span> - 
            <span class= "desc"> ${task.description}</span>
            <span class= "priorite">${task.priority}</span>
            ${dateInfo}
            <button class="delete-btn">Supprimer</button>
        `;
        this.container.appendChild(li);

       

        function makeEditable(span, field) {
            span.addEventListener("dblclick", () => {
                const input = document.createElement("input");
                input.type = "text";
                input.value = span.textContent;

                span.replaceWith(input); // remplacement du span par une entrée de texte
                input.focus();

                input.addEventListener("blur", save); // si on en dehors du input
                input.addEventListener("keydown", (e) => { 
                    if (e.key === "Enter") save();
                });

                function save() {
                    const newValue = input.value.trim();
                    if (newValue !== "") {
                        span.textContent = newValue; // Mise à jour dans le DOM
                        todo.updateTask(task.id, { [field]: newValue }); // mise à jour dans la todolist
                    }

                    input.replaceWith(span);  
                }

            });

            
        }

        const titrespan = li.getElementsByClassName("titre")[0];
        const descspan = li.getElementsByClassName("desc")[0];

        makeEditable(titrespan, "titre");
        makeEditable(descspan, "desc");

        const sup = li.getElementsByClassName("delete-btn")[0];
        sup.addEventListener("click", () => {
            const confirmed = window.confirm(`Voulez-vous vraiment supprimer "${task.title}" ?`);

            if (confirmed) {
                todo.removeTask(task.id); // supprimer de la liste
                li.remove();              // supprimer du DOM
            }
        });

        /*const completedCheckbox = li.querySelector(".complete-checkbox");
        

        completedCheckbox.addEventListener("change", () => {
            task.completed = completedCheckbox.checked;

            if (task.completed) {
                li.classList.add("complete");
            } else {
                li.classList.remove("complete");
            }
            
        });*/

        // Checkbox completed
        const completedCheckbox = li.querySelector(".complete-checkbox");
        completedCheckbox.checked = task.completed;
        if (task.completed) li.classList.add("complete");

        completedCheckbox.addEventListener("change", () => {
            task.completed = completedCheckbox.checked;
            if (task.completed) li.classList.add("complete");
            else li.classList.remove("complete");
        });
    }


    renderTasks(tasks) {
        this.container.innerHTML = "";     // vide la liste
        tasks.forEach(task => this.renderTask(task)); // affiche chaque tâche
    }
}


const todo = new TodoList();

// Récupération du formulaire et de la liste
const form = document.getElementById("task-form");
const list = document.getElementById("task-list");

const user_inter = new TodoUI(todo,list);


// Écoute de l'événement submit du bouton ajouter
form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Récupérer les valeurs du formulaire
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const priority = document.getElementById("priority").value;
    const echeance = document.getElementById("task-date").value; 
    console.log(echeance);

    // Ajouter la tâche via TodoList
    const task = todo.addTask(title, description, priority,echeance);

    // Afficher la tâche dans le DOM
    user_inter.renderTask(task);

    // Réinitialiser le formulaire
    form.reset();
});


// Changement sur filtrer tache
const filterSelect = document.getElementById("task-filter");

filterSelect.addEventListener("change", () => {
    const filter = filterSelect.value;        // récupère la valeur sélectionnée
    const filteredTasks = todo.filterTasks(filter); // filtre dans TodoList
    user_inter.renderTasks(filteredTasks);    // réaffiche uniquement les tâches filtrées
});


// Changement sur le tri tache
const trieSelect = document.getElementById("task-sort");

trieSelect.addEventListener("change", () => {
    const criteria = trieSelect.value;        // récupère la valeur sélectionnée
    const sortTasks = todo.sortTasks(criteria); // filtre dans TodoList
    user_inter.renderTasks(sortTasks);    // réaffiche uniquement les tâches filtrées
});



