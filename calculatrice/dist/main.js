var _a, _b, _c, _d;
function isOp(x) {
    return x === 'add' || x === 'subtract' || x === 'multiply' || x === 'divide';
}
const display = document.getElementById("display");
const operation = document.getElementById("operation");
let current = "";
let previous = "";
let op = null;
let num;
let justCalculated = false;
document.querySelectorAll(".num").forEach((btn) => {
    btn.addEventListener("click", () => {
        const value = btn.dataset.num;
        if (value === "." && current.includes("."))
            return;
        current += value;
        display.textContent = current;
        console.log(current);
        if (current && !op) {
            previous = "";
        }
        console.log(previous);
        // affichage en temps réel
        operation.textContent = `${previous} ${symbol(op)}`;
    });
});
// Sélection et gestion des opérations
document.querySelectorAll(".btn-op").forEach((btn) => {
    btn.addEventListener("click", () => {
        console.log("current: " + current);
        console.log("previous: " + previous);
        //if (justCalculated)
        if (current === "" && previous === "")
            return;
        if (previous && current && op)
            calculate();
        // console.log(current);
        const maybeOp = btn.dataset.op; // string | undefined
        if (!isOp(maybeOp))
            return; // sécurise
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
const equalsBtn = document.querySelector('[data-action="equals"]');
// if (!equalsBtn) {
//   throw new Error('Bouton "=" introuvable (data-action="equals").');
// }
equalsBtn === null || equalsBtn === void 0 ? void 0 : equalsBtn.addEventListener("click", () => {
    console.log("prev dans egal " + previous);
    if (!op || current === "" || previous === "")
        return;
    operation.textContent = previous + " " + symbol(op) + " " + current + " =";
    calculate();
    console.log("prev dans egal apres calculate" + previous);
    // current = "";
    // previous = "";
    op = null;
    console.log("Etat des variables après egal apres current: " + current + " previous: " + previous + " op: " + op);
});
// fonctionalités clear et clear all
(_a = document.querySelector("[data-action='ac']")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
    current = "";
    previous = "";
    op = null;
    display.textContent = "0";
    operation.textContent = "0";
    justCalculated = false;
});
(_b = document.querySelector("[data-action='c']")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
    current = "";
    display.textContent = "0";
    if (previous && op) {
        operation.textContent = previous + " " + symbol(op);
    }
    else {
        operation.textContent = "0";
    }
});
// Changement de signe
(_c = document.querySelector("[data-action='sign']")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
    if (!current)
        return;
    current = (parseFloat(current) * -1).toString();
    operation.textContent = current;
    display.textContent = current;
    if (previous && op) {
        operation.textContent = previous + " " + symbol(op) + " " + current;
    }
});
// Fonction %
(_d = document.querySelector("[data-action='percent']")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", () => {
    if (!previous)
        return;
    console.log(current);
    num = parseFloat(current);
    if (previous && current === "") {
        console.log(current);
        num = parseFloat(previous) / 100;
    }
    else if (previous) {
        // num = parseFloat(previous) * (num / 100);
        num = num / 100;
    }
    // } else if (previous && current==="") {
    //     console.log(current);
    //     num = parseFloat(previous) / 100;
    // }
    current = num.toString();
    console.log("current: " + current);
    console.log("previous: " + previous);
    display.textContent = current;
    // Mise à jour de l’opération en temps réel
    if (previous && op) {
        operation.textContent = previous + " " + symbol(op) + " " + current;
    }
    else {
        operation.textContent = current;
    }
});
// document.querySelector("[data-action='percent']")?.addEventListener("click", () => {
//     if (current) {        
//         num = parseFloat(current);
//         if (previous) {
//             console.log("previous: "+previous);
//             // num = parseFloat(previous) * (num / 100);
//             // console.log(num);
//             num = num / 100;
//         } else {
//             num = num / 100;
//         }
//     } else {
//         if (previous) {
//         num = parseFloat(previous);
//         num = num / 100;
//         console.log(num);
//         }
//     }
//     previous = num.toString();
//     current = "";
//     console.log(current)
//     display.textContent = previous;
//     // Mise à jour de l’opération en temps réel
//     if (previous && op) {
//         operation.textContent = previous + " " + symbol(op) + " " + current;
//     } else {
//        // display.textContent = 
//         operation.textContent = current;
//     }
//     console.log("Etat des variables après % current: "+current+" previous: " + previous+ " op: "+op);
// });
function symbol(o) {
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
    if (isNaN(a) || isNaN(b))
        return;
    let result = 0;
    switch (op) {
        case "add":
            result = a + b;
            break;
        case "subtract":
            result = a - b;
            break;
        case "multiply":
            result = a * b;
            break;
        case "divide":
            result = b !== 0 ? a / b : NaN;
            break;
    }
    display.textContent = `${result}`;
    // operation.textContent = "";
    previous = result.toString();
    current = "";
    // justCalculated = true; 
}
export {};
//# sourceMappingURL=main.js.map