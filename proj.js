  const display = document.getElementById("display");
  const operation = document.getElementById("operation");

  let current = "";
  let previous = "";
let op = null;
let justCalculated = false;

// gestion des nombres
document.querySelectorAll(".num").forEach(btn => {
    btn.addEventListener("click", () => {
        if (justCalculated) {
            previous = ""
            console.log("previous apres égal" + previous);
            display.textContent = current;
            operation.textContent = current;
            justCalculated = false;
        }
          
        const value = btn.dataset.num;
        if (value === "." && current.includes(".")) return;
            
        current += value;
        console.log("appui de touche " + current);
            
        display.textContent = current;

    });
      
              
});

// gestion des opérations
document.querySelectorAll(".btn-op").forEach(btn => {
    btn.addEventListener("click", () => {
        if (current === "" && previous === "") return;
        if (previous && current) calculate();
        
        if (justCalculated && !current) {
            op = btn.dataset.op;
            console.log("previous suite apres = et op: " + previous);
            operation.textContent = previous + " " + symbol(op);
            justCalculated = false;
        }
        op = btn.dataset.op;
        console.log("click op " + op);

        previous = current || previous;
        console.log("previos calcul normal " + previous);
      current = "";
      operation.textContent = previous + " " + symbol(op);
    });
});

// égal
document.querySelector("[data-action='equals']").addEventListener("click", () => {
    if (!op || current === "" || previous === "") return;
        calculate();
        op = null;
        justCalculated = true;
        // current = ""; previous = ""; op = null;
        //display.textContent = "0"; operation.textContent = "0";
});

// fonctions clear
document.querySelector("[data-action='ac']").addEventListener("click", () => {
    current = ""; previous = ""; op = null;
    display.textContent = "0"; operation.textContent = "0";
});

document.querySelector("[data-action='c']").addEventListener("click", () => {
    current = "";
    display.textContent = "0";
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

  

// helpers
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
    operation.textContent = "";
    previous = result.toString();
    current = "";
}

function symbol(op) {
    switch(op){
        case "add": return "+";
        case "subtract": return "−";
        case "multiply": return "×";
        case "divide": return "÷";
    }
}
