type Op = 'add' | 'subtract' | 'multiply' | 'divide' | null;

function isOp (x: string | undefined): x is Exclude<Op, null> {
  return x === 'add' || x === 'subtract' || x === 'multiply' || x === 'divide';
}

const display = document.getElementById("display") as HTMLInputElement;
const operation = document.getElementById("operation") as HTMLInputElement;

let current = "";
let previous = "";
let op: Op = null;
let num: number;
let justCalculated = false;

document.querySelectorAll<HTMLButtonElement>(".num").forEach((btn: HTMLButtonElement) => {
    btn.addEventListener("click", () => {
        const value = btn.dataset.num;
        if (value === "." && current.includes(".")) return;
        current += value;
        display.textContent = current;
        console.log(current);

        if (current && !op) { previous = ""; }
        console.log(previous);
        
        // affichage en temps réel
        operation.textContent = `${previous} ${symbol(op)}`;

    });
});


// Sélection et gestion des opérations
document.querySelectorAll<HTMLButtonElement>(".btn-op").forEach((btn: HTMLButtonElement) => {
    btn.addEventListener("click", () => {

        console.log("current: " + current);
        console.log("previous: " + previous);
        //if (justCalculated)
        if (current === "" && previous === "") return;
        if (previous && current && op) calculate();
        // console.log(current);

        const maybeOp = btn.dataset.op; // string | undefined
        if (!isOp(maybeOp)) return;     // sécurise
        op = maybeOp;
        console.log(op);

        previous = current || previous;
        console.log("previous" + previous);

        current = "";
        console.log("current" + current);
        operation.textContent = previous + " " + symbol(op);
    });
});


// égal
const equalsBtn = document.querySelector<HTMLButtonElement>('[data-action="equals"]');
// if (!equalsBtn) {
//   throw new Error('Bouton "=" introuvable (data-action="equals").');
// }

equalsBtn?.addEventListener("click", () => {
    console.log("prev dans egal " + previous);
    if (!op || current === "" || previous === "") return;
    operation.textContent = previous + " " + symbol(op) + " "+ current+ " =";  
    calculate();
    console.log("prev dans egal apres calculate" + previous);
    
    // current = "";
    // previous = "";
    op = null;
    console.log("Etat des variables après egal apres current: "+current+" previous: " + previous+ " op: "+op);
});

// fonctionalités clear et clear all
document.querySelector("[data-action='ac']")?.addEventListener("click", () => {
    current = ""; previous = ""; op = null;
    display.textContent = "0"; operation.textContent = "0";
    justCalculated = false;
});

document.querySelector("[data-action='c']")?.addEventListener("click", () => {
    current = "";
    display.textContent = "0";
    if (previous && op) {
        operation.textContent = previous + " " + symbol(op);
    } else {
        operation.textContent = "0";
    } 
});


// Changement de signe
document.querySelector("[data-action='sign']")?.addEventListener("click", () => {
    if (!current) return;

    current = (parseFloat(current) * -1).toString();
    operation.textContent = current;
    display.textContent = current;
    if (previous && op) {
        operation.textContent = previous + " " + symbol(op) + " " + current;
    }
   
});

// Fonction %
document.querySelector("[data-action='percent']")?.addEventListener("click", () => {
    if (!previous) return;
console.log(current);

    num = parseFloat(current);
    if (previous && current === "") {
        console.log(current);
        
        num = parseFloat(previous) / 100;
    } else if (previous) {
        // num = parseFloat(previous) * (num / 100);
        num = num / 100;
    }

    current = num.toString();
    console.log("current: " + current);
    console.log("previous: " + previous);
    display.textContent = current;

    // Mise à jour de l’opération en temps réel
    if (previous && op) {
        operation.textContent = previous + " " + symbol(op) + " " + current;
    } else {
        operation.textContent = current;
    }
});


function symbol(o: Op): string {
    switch (o) {
        case "add": return '+';
        case "subtract": return "−";
        case "multiply": return "×";
        case "divide": return "÷";
        default: return "";
    }
}


// Calcule de base
function calculate() {
    const a = parseFloat(previous);
    const b = parseFloat(current);
    if (isNaN(a) || isNaN(b)) return;

    let result = 0;
    switch (op) {
        case "add": result = a + b; break;
        case "subtract": result = a - b; break;
        case "multiply": result = a * b; break;
        case "divide": result = b !== 0 ? a / b : NaN; break;
    }
    display.textContent = `${result}`;
    // operation.textContent = "";
    previous = result.toString();
    current = "";
    // justCalculated = true; 
}