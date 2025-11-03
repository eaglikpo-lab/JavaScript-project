export type Priority = "high" | "medium" | "low";
export type Filter = "toutes" | "actives" | "terminees" | "echues";
export type SortCriteria = "creation" | "dueDate" | "priority" | "alphabet";
type DueDate = Date | null;

class Task {
    constructor(
        public id: number,
        public title: string,
        public description: string,
        public priority: Priority,
        public dueDate: DueDate = null,
        public completed: boolean = false
    ) { }
}


class TodoList {
    private counter: number;
    private tasks: Task[];

    constructor(counter: number = 0, tasks: Task[] = []) {
        this.counter = counter;
        this.tasks = tasks;
    }

    /** Ajoute une tâche ; accepte Date ou string pour dueDate */
    addTask(
        title: string,
        description: string,
        priority: Priority,
        dueDate?: Date | string | null

    ): Task {
        const normalizedDue =
            dueDate == null
                ? null
                : dueDate instanceof Date
                    ? dueDate
                    : new Date(dueDate);

        const task: Task = {
            id: this.counter++,
            title,
            description,
            priority,
            dueDate: normalizedDue,
            completed: false,
        };

        this.tasks.push(task);
        return task;
    }

    /** Supprime une tâche par id */
    //   removeTask(id: number): Task[] {
    //     const idx = this.tasks.findIndex(t => t.id === id);
    //     if (idx !== -1) this.tasks.splice(idx, 1);
    //     return this.tasks;
    //   }
    // Variante simple :
    removeTask(id: number): Task[] {
        this.tasks = this.tasks.filter(t => t.id !== id);
        return this.tasks;
    }

    /** Met à jour les champs fournis (sauf id) */
    updateTask(
        id: number,
        updatedTask: Partial<Omit<Task, "id">>
    ): Task | undefined {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return undefined;
        Object.assign(task, updatedTask);
        return task;
    }

    /** Filtrage des tâches */
    filterTasks(filter: Filter): Task[] {
        const now = new Date();
        switch (filter) {
            case "toutes":
                return this.tasks;
            case "actives":
                return this.tasks.filter(t => !t.completed);
            case "terminees":
                return this.tasks.filter(t => t.completed);
            case "echues":
                return this.tasks.filter(
                    t => t.dueDate && t.dueDate.getTime() < now.getTime() && !t.completed
                );
            default:
                return this.tasks;
        }
    }

    /** Tri selon un critère donné */
    sortTasks(criteria: SortCriteria): Task[] {
        const priorityOrder: Record<Priority, number> = { high: 1, medium: 2, low: 3 };

        return [...this.tasks].sort((a, b) => {
            switch (criteria) {
                case "creation":
                    return a.id - b.id; // plus petit id = plus ancien
                case "dueDate":
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return a.dueDate.getTime() - b.dueDate.getTime();
                case "priority":
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                case "alphabet":
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });
    }

    /** (Optionnel) Récupérer la liste interne en lecture */
    getTasks(): Task[] {
        return this.tasks;
    }
}


// =======================
// Classe TodoUI (pour gerer le dom)
// =======================
class TodoUI {
    constructor(
        public todoList: TodoList,
        public container: HTMLElement
    ) { }
    private makeEditable(span: HTMLSpanElement, field: "title" | "description", task: Task) {
        span.addEventListener("dblclick", () => {
            const input = document.createElement("input");
            input.type = "text";
            input.value = span.textContent;
            // input.value = span.textContent ?? "";

            span.replaceWith(input); // remplacement du span par une entrée de texte
            input.focus();

            const save =()=> {
                const newValue = input.value.trim();
                if (newValue) {
                    span.textContent = newValue; // Mise à jour dans le DOM
                    this.todoList.updateTask(task.id, { [field]: newValue }); // mise à jour dans la todolist
                }

                input.replaceWith(span);
            }

            input.addEventListener("blur", save); // si on en dehors du input
            input.addEventListener("keydown", (e) => {
                if (e.key === "Enter") save();
            });

        });
    }


    renderTask(task: Task) {
        const li = document.createElement("li");
        li.className = `${task.priority}`;

        // Vérifier date
        let dateInfo = "";
        const today = new Date();

        console.log(task.dueDate)

        if (task.dueDate) {
            console.log(task.dueDate);
            const due = new Date(task.dueDate);

            if (due < today) {
                dateInfo = `<span class="due overdue">Échéance dépassée (${task.dueDate})</span>`;
            } else if ((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) <= 2) { //millisecondes en jour
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

        const titrespan = li.getElementsByClassName("titre")[0] as HTMLSpanElement | null;
        const descspan = li.getElementsByClassName("desc")[0] as HTMLSpanElement | null;

        if (titrespan) this.makeEditable(titrespan, "title", task);
        if (descspan) this.makeEditable(descspan, "description", task);

        const sup = li.getElementsByClassName("delete-btn")[0] as HTMLElement;
        sup?.addEventListener("click", () => {
            const confirmed = window.confirm(`Voulez-vous vraiment supprimer "${task.title}" ?`);

            if (confirmed) {
                this.todoList.removeTask(task.id); // supprimer de la liste
                li.remove();              // supprimer du DOM
            }
        });

        // Checkbox completed
        const completedCheckbox = li.querySelector(".complete-checkbox") as HTMLInputElement;
        if (completedCheckbox) {
            completedCheckbox.checked = task.completed;
            if (task.completed) li.classList.add("complete");

            completedCheckbox.addEventListener("change", () => {
                task.completed = completedCheckbox.checked;
                if (task.completed) li.classList.add("complete");
                else li.classList.remove("complete");
            });
        }
    }
    renderTasks(tasks: Task[]) {
        this.container.innerHTML = "";     // vide la liste
        tasks.forEach(t => this.renderTask(t)); // affiche chaque tâche
    }
}


// Récupération du formulaire et de la liste
const form = document.getElementById("task-form") as HTMLFormElement | null;
const list = document.getElementById("task-list") as HTMLElement | null;
if (!form || !list) throw new Error("Formulaire ou conteneur introuvable.");

const todo = new TodoList();

const user_inter = new TodoUI(todo, list);


// Écoute de l'événement submit du bouton ajouter


// Récupérer les valeurs du formulaire
const titleInput = document.getElementById("title") as HTMLInputElement | null;
const descInput = document.getElementById("description") as HTMLInputElement | null;
const priInput = document.getElementById("priority") as HTMLSelectElement | null;
const dateInput = document.getElementById("task-date") as HTMLInputElement | null;

function isPriority(x: string): x is Priority {
    return x === "high" || x === "medium" || x === "low";
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!titleInput || !descInput || !priInput || !dateInput) return;
    
    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const priVal = priInput.value;
    if (!isPriority(priVal)) { alert("Priorité invalide"); return; }
    const due = dateInput.value ? new Date(dateInput.value) : null;
    
    // Ajouter la tâche via TodoList
    const task = todo.addTask(title, description, priVal, due);

    // Afficher la tâche dans le DOM
    user_inter.renderTask(task);

    // Réinitialiser le formulaire
    form.reset();
});


// Changement sur filtrer tache
const filterSelect = document.getElementById("task-filter") as HTMLSelectElement;

function filterBy(x: string): x is Filter {
    return x === "toutes" || x === "actives" || x === "terminees" || x === "echues";
}

filterSelect.addEventListener("change", () => {
    const filter = filterSelect.value;        // récupère la valeur sélectionnée

    if (!filterBy(filter)) { alert("Filtre invalide"); return; }

    const filteredTasks = todo.filterTasks(filter); // filtre dans TodoList
    user_inter.renderTasks(filteredTasks);    // réaffiche uniquement les tâches filtrées
});


// Changement sur le tri tache
const trieSelect = document.getElementById("task-sort") as HTMLSelectElement;

function sortBy(x: string): x is SortCriteria {
    return x === 'creation' || x === 'dueDate' || x === 'priority' || x === 'alphabet';    
}
trieSelect.addEventListener("change", () => {
    const criteria = trieSelect.value;        // récupère la valeur sélectionnée
   
    if (!sortBy(criteria)) { alert("Critère invalide"); return; }
    
    const sortTasks = todo.sortTasks(criteria); // filtre dans TodoList
    user_inter.renderTasks(sortTasks);    // réaffiche uniquement les tâches filtrées
});