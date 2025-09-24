const display = document.getElementById("display");
const operation = document.getElementById("operation");

let current = "";
let previous = "";
let op = null;
let justCalculated = false;

// gestion des nombres
document.querySelectorAll(".num").forEach(btn => {
    btn.addEventListener("click", () => {
        const value = btn.dataset.num;
        if (value === "." && current.includes(".")) return;

        current += value;
        display.textContent = current;
        console.log(current);

        // affichage en temps réel
        operation.textContent = previous + " " + symbol(op);

       /* if (justCalculated) {
            current = "";
            previous = "";
            display.textContent = "0";
            operation.textContent = "0";
            justCalculated = false;
        }

        if (value === "." && current.includes(".")) return;

        current += value;
        display.textContent = current;
        console.log(current);
       
        if (previous != "" && op) {
            operation.textContent += current;

        } else {
            operation.textContent = current;
        }*/
       
    });

   
});

// Sélection et gestion des opérations
document.querySelectorAll(".btn-op").forEach(btn => {
    btn.addEventListener("click", () => {
    //if (justCalculated)
        if (current === "" && previous === "") return;
        if (previous && current) calculate();
        op = btn.dataset.op;
        console.log(op);

        previous = current || previous;
        console.log("previous" + previous);
        
        current = "";
        console.log("current"+current);
        operation.textContent = previous + " " + symbol(op);
    });
});

  // égal
document.querySelector("[data-action='equals']").addEventListener("click", () => {
    console.log("prev dans egal " + previous);
    if (!op || current === "" || previous === "") return;
    operation.textContent = previous + " " + symbol(op) + " "+ current+ " =";  
    calculate();
    console.log("prev dans egal apres calculate" + previous);

    //op = null;
    current = ""; previous = ""; op = null;
});

// fonctionalités clear et clear all
document.querySelector("[data-action='ac']").addEventListener("click", () => {
    current = ""; previous = ""; op = null;
    display.textContent = "0"; operation.textContent = "0";
    justCalculated = false;
});

document.querySelector("[data-action='c']").addEventListener("click", () => {
    current = "";
    display.textContent = "0";
    if (previous && op) {
        operation.textContent = previous + " " + symbol(op);
    } else {
        operation.textContent = "0";
    } 

    
});

// Fonction %
document.querySelector("[data-action='percent']").addEventListener("click", () => {
    if (!current) return;

    let num = parseFloat(current);
    if (previous) {
        num = parseFloat(previous) * (num / 100);
        console.log(num);
    } else {
        num = num / 100;
        console.log(num);
    }

    current = num.toString();
    console.log(current)
    display.textContent = current;

    // Mise à jour de l’opération en temps réel
    if (previous && op) {
        operation.textContent = previous + " " + symbol(op) + " " + current;
    } else {
        operation.textContent = current;
    }
});

// Changement de signe
document.querySelector("[data-action='sign']").addEventListener("click", () => {
    if (!current) return;

    current = (parseFloat(current) * -1).toString();
    operation.textContent = current;
    display.textContent = current;
    if (previous && op) {
        operation.textContent = previous + " " + symbol(op) + " " + current;
    }
   
});

// Calcule de base
function calculate() {
    const a = parseFloat(previous);
    const b = parseFloat(current);
    if (isNaN(a) || isNaN(b)) return;

    let result = 0;
    switch(op) {
        case "add": result = a + b; break;
        case "subtract": result = a - b; break;
        case "multiply": result = a * b; break;
        case "divide": result = b !== 0 ? a / b : "Erreur"; break;
    }
    display.textContent = result;
    // operation.textContent = "";
    previous = result.toString();
    current = "";
   // justCalculated = true; 
}

function symbol(op) {
    switch(op){
      case "add": return "+";
      case "subtract": return "−";
      case "multiply": return "×";
      case "divide": return "÷";
    }
}



