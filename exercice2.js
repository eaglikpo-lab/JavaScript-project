function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

//Fonctions fléchées
const multiply = (a, b) =>  a * b;


const divide = (a, b) => {
    return b!=0 ? a / b : "Erreur : division par zéro";   
}

// Fonction avec paramètres par défaut
function power(base, exponent = 2) {
    return base**exponent;
}

//Fonction principale
function calculate(operation, a, b = 0) {
    switch (operation) {
        case 'add':
            return add(a, b);
        case 'subtract':
            return subtract(a, b);
        case 'multiply':
            return multiply(a, b);
        case 'divide':
            return divide(a, b);
        case 'power':
            return power(a, b);
        default:
            return "Opération inconnue";
    }
}

function calculateMany(...numbers) {
    return numbers.reduce((total, current) => total + current, 0);
}


const isValidEmail = email => {
    // Commence par un ou plusieurs caractères sauf espace ou @
    // suivi d'un @
    // suivi d'un ou plusieurs caractères sauf espace ou @
    // suivi d'un point
    // suivi d'un ou plusieurs caractères sauf espace ou @
    const mail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return mail.test(email)? email +": email valide ": email +": email invalide";
};



console.log(calculate('add', 5, 3)); //→ 8
console.log(calculate('power', 3)); //→ 9
console.log(calculateMany(1, 2, 3, 4, 5)); //→ 15*
console.log(isValidEmail("adlea@yahoo.fr"));
console.log(isValidEmail("@dlea@yahoo.fr"));

