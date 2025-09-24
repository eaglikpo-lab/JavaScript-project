// Partie 1 : Classe Employee
class Employee {
    constructor(id, firstName, lastName, email, hireDate) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;

        const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        this.email = reEmail.test(email) ? email : "mail invalid";

        this.hireDate = new Date(hireDate);
    }

    getFullName() {
        return this.firstName + " " + this.lastName;
    }

    getYearsOfService() {
        const today = new Date();

        let years = today.getFullYear() - this.hireDate.getFullYear();
        const monthDiff = today.getMonth() - this.hireDate.getMonth();

        (monthDiff < 0 || (monthDiff === 0 && today.getDate() < this.hireDate.getDate())) ?
            years-- : years;
        
        return years;
    }

toString() {
    return `Employee [${this.id}] ${this.getFullName()} - Email: ${this.email}, Hired: ${this.hireDate.toDateString()}`;
}

}

const emp1 = new Employee(1, "Alice", "Martin", "alice.martin@example.com", "2015-06-15");
console.log(emp1.getFullName());        // "Alice Martin"
console.log(emp1.getYearsOfService());  // ex: 10
console.log(emp1.toString());           // Employee [1] Alice Martin - Email: alice.martin@example.com, Hired: Mon Jun 15 2015


// Partie 2 : Classes spécialisées

class Developer extends Employee{
    constructor(id, firstName, lastName, email, hireDate,skills, level, currentProject) {
        super(id, firstName, lastName, email, hireDate,)
        this.skills = skills;
        this.level = level;
        this.projects = currentProject ? [currentProject] : [];
    }

    assignProject(project) {
        if (!this.projects.includes(project)) {
            this.projects.push(project);
        }
    }

    removeProject(project) {
        this.projects = this.projects.filter(p => p !== project);
    }

    getProjects() {
        return this.projects;
    }

}

class Manager extends Employee {
    constructor(id, firstName, lastName, email, hireDate, team, budget) {
        super(id, firstName, lastName, email, hireDate,)
        this.team = [];
        this.budget = budget;
    }

    // Ajouter un développeur (qq methides pour simuler la partie 5)
    addDeveloper(dev) {
        if (dev instanceof Developer) {
            this.team.push(dev);
        } else {
            throw new Error("Seuls des développeurs peuvent être ajoutés à l'équipe");
        }
    }

    // Retirer un développeur
    removeDeveloper(devId) {
        this.team = this.team.filter(d => d.id !== devId);
    }

    // Taille de l'équipe
    getTeamSize() {
        return this.team.length;
    }

    // Lister les compétences de tous les devs
    getAllSkills() {
        return this.team.flatMap(d => d.skills);
    }
}

class Designer extends Employee {
    constructor(id, firstName, lastName, email, hireDate,tools, portfolio) {
        super(id, firstName, lastName, email, hireDate,)
        this.tools = tools;
        const rePortfolioURL = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/[a-z0-9._~:/?#[\]@!$&'()*+,;=-]*)?$/i;
        this.portfolio = rePortfolioURL.test(portfolio)? portfolio: "lien introuvable";
    }
}
console.log("\n---Partie 2---")

const dev = new Developer(
  1, "Alice", "Doe", "alice@mail.com", "2020-05-01",
  ["JavaScript", "React"], "senior", "Migration vers Node.js"
);

const manager = new Manager(
  2, "Bob", "Smith", "bob@mail.com", "2018-03-15",
  [dev], 50000
);

const designer = new Designer(
  3, "Charlie", "Brown", "charlie@mail.com", "2021-07-20",
  ["Figma", "Photoshop"], "https://charlie-portfolio.com"
);

console.log(dev.toString());
console.log(manager.toString());
console.log(designer.toString());


// Partie 3 : Classe Team
class Team {
    constructor(name) {
        this.name = name;
        this.workers = []; // collection d'Employee
    }

    // Ajout
    addEmployee(worker) {
        this.workers.push(worker);
    }

    // Suppression
    removeEmployee(id) {
        this.workers = this.workers.filter(emp => emp.id !== id);
    }

    // Recherche par critère (objet {clé:valeur})
    findEmployee(criteria) {
        return this.workers.find(emp =>
            Object.keys(criteria).every(key => emp[key] === criteria[key])
        );
    }

    // Tous les développeurs qui ont une compétence
    getDevelopersBySkill(skill) {
        return this.workers.filter(emp =>
            emp instanceof Developer && emp.skills.includes(skill)
        );
    }

    // Tous les managers dont le budget est égale à une valeur
    getManagersByBudget(Budget) {
        return this.workers.filter(emp =>
            emp instanceof Manager && emp.budget === Budget
        );
    }

    // Nombre total d'années d’expérience (somme sur tous les employés)
    getTotalYearsExperience() {
        return this.workers.reduce((sum, emp) => sum + emp.getYearsOfService(), 0);
    }

    // Salaire moyen (si on ajoute un champ salary aux employés)
    getAverageSalary() {
        const withSalary = this.workers.filter(emp => emp.salary !== undefined);
        if (withSalary.length === 0) return 0;
        const total = withSalary.reduce((sum, emp) => sum + emp.salary, 0);
        return total / withSalary.length;
    }
}

console.log("\n---Partie 3---")
const team = new Team("Frontend Team");
team.addEmployee(dev);
team.addEmployee(manager);
team.addEmployee(designer);


console.log("\n Employe id = 2" + team.findEmployee({ id: 2 })); // Manager
console.log("\n LES DEV React" + team.getDevelopersBySkill("React")); // [Alice]
console.log("\n Budget de 50000:" + team.getManagersByBudget(50000)); // [Bob]
console.log(team.getTotalYearsExperience()); // somme années
console.log(team.getAverageSalary()); // moyenne des salaires

team.removeEmployee(1)
team.removeEmployee(2)
team.removeEmployee(3)
console.log(team);


// Partie 4 : Classe Project

class Project {
    constructor(name, description, startDate, endDate, status, assignedTeam = null) {
        this.name = name;
        this.description = description;
        this.startDate = new Date(startDate);
        this.endDate = new Date(endDate);
        this.status = status;          // ex: "planned", "in progress", "completed"
        this.assignedTeam = assignedTeam; // instance de Team ou null
    }

    // Méthodes de Gestion
    assignEmployee(worker) {
        if (this.assignedTeam) {
            this.assignedTeam.addEmployee(worker);
        } else {
            console.log("Aucune équipe assignée au projet.");
        }
    }

    unassignEmployee(id) {
        if (this.assignedTeam) {
            this.assignedTeam.removeEmployee(id);
        } else {
            console.log("Aucune équipe assignée au projet.");
        }
    }

    // Méthodes de Reporting
    getProgress() {
        const today = new Date();
        if (today < this.startDate) return 0;
        if (today > this.endDate) return 100;

        const totalDuration = this.endDate - this.startDate;
        const elapsed = today - this.startDate;
        return Math.round((elapsed / totalDuration) * 100);
    }

    getTeamSize() {
        return this.assignedTeam ? this.assignedTeam.workers.length : 0;
    }


    
    //Autres méthodes (partie 5)/
    assignDeveloper(dev) {
        if (dev instanceof Developer) {
            dev.assignProject(this); // ajoute le projet au dev
        }
    }

    unassignDeveloper(dev) {
        if (dev instanceof Developer) {
            dev.removeProject(this);
        }
    }


}

// On reprend l'équipe de la Partie 3
console.log("\n---Partie 4---")
/*const team = new Team();
team.addEmployee(new Developer(1, "Alice", "Doe", "alice@mail.com", "2020-05-01", ["JS"], "senior", "Migration"));
team.addEmployee(new Manager(2, "Bob", "Smith", "bob@mail.com", "2015-03-15", [], 80000));
*/

const project = new Project(
    "Migration Système",
    "Migration du système vers Node.js",
    "2025-01-01",
    "2025-12-31",
    "in progress",
    team
);

console.log("Progression :", project.getProgress(), "%");
console.log("Taille équipe :", project.getTeamSize());

project.assignEmployee(new Designer(3, "Charlie", "Brown", "charlie@mail.com", "2018-07-20", ["Figma"], "https://portfolio.com"));

console.log("Nouvelle taille équipe :", project.getTeamSize());

project.unassignEmployee(1); // Retire Alice
console.log("Équipe après retrait :", project.getTeamSize());



// Partie 5 : Relations et méthodes complexes
console.log("\n---Partie 5---");
const dev1 = new Developer(4, "Aurelle", "Thai", "aurelle@mail.com", "2020-04-01", ["JS"], "senior", "Migration");
const dev2 = new Developer(5, "Eve", "Johnson", "eve@mail.com", "2021-03-15", ["Python", "Django"], "junior", "API");

//const manager = new Manager(3, "Bob", "Smith", "bob@mail.com", "2018-07-20", 100000);

manager.addDeveloper(dev1);
manager.addDeveloper(dev2);

console.log(manager.getTeamSize()); // 2
console.log(manager.getAllSkills()); // ["JS", "Python", "Django"]

manager.removeDeveloper(5);
console.log(manager.getTeamSize()); // 1


const project1 = new Project("Deploiement", "Deploiement mobile", "2024-01-01", "2024-12-31", "in progress");
const project2 = new Project("API", "Développement API", "2024-03-01", "2024-09-30", "planned");

project1.assignDeveloper(dev1);
project1.assignDeveloper(dev2);
project2.assignDeveloper(dev1);

console.log(dev1.getProjects().map(p => p.name)); // ["Migration", "API"]
console.log(dev2.getProjects().map(p => p.name)); // ["Migration"]
