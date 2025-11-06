class Calculator {
    public current: string;
    public previous: string;
    public op: any;
    public justCalculated: boolean;
    public memValue: number;

    constructor() {
        this.current = "";
        this.previous = "";
        this.op = null;
        this.justCalculated = false;
        this.memValue = 0;
    }

    addNumber(value: string) {
        if (this.justCalculated) {
            this.previous = "";
            this.current = "";
            this.justCalculated = false;
        }
        if (value === "." && this.current.includes(".")) return;

        this.current += value;
        console.log("current apres click/press un chiffre: " + this.current);
    }

    chooseOperation(op: any) {
        if (this.current === "" && this.previous === "") return;
        if (this.previous && this.current) this.calculate();

        this.op = op;
        this.previous = this.current || this.previous;
        console.log("previous apres chooseOperation: " + this.previous);

        this.current = "";
        this.justCalculated = false;
    }

    calculate() {
        const a = parseFloat(this.previous);
        const b = parseFloat(this.current);
        if (isNaN(a) || isNaN(b)) return;

        let result:number = 0;
        switch (this.op) {
            case "add": result = a + b; break;
            case "subtract": result = a - b; break;
            case "multiply": result = a * b; break;
            case "divide": result = b !== 0 ? a / b : NaN; break;
        }

        const expression = `${a} ${this.symbol(this.op)} ${b}`;
        history.add(expression, result);

        this.previous = result.toString();
        console.log('previous dans calculate: ' + this.previous)
        this.current = "";
        this.op = null;
        this.justCalculated = true;
        return result;
    }

    percent() {
        // if (!this.current) return;

        if (this.current !== "") {
            let num = parseFloat(this.current);
            if (this.previous && this.op) {
                num = parseFloat(this.previous) * (num / 100);
            } else {
                num = num / 100;
            }
            this.current = num.toString();
            console.log('current normale dans percent: ' + this.current);
        } else if (this.justCalculated && this.previous) {
            this.previous = (parseFloat(this.previous) / 100).toString();
            console.log("previous de % apres calcul: " + this.previous);
            this.justCalculated = false;
        }
    }

    toggleSign() {

        if (this.current) {
            this.current = (parseFloat(this.current) * -1).toString();
            console.log('current normale dans toggleSign: ' + this.current);
        } else if (this.previous) {
            this.previous = (parseFloat(this.previous) * -1).toString();
            console.log('previous normale dans toggleSign: ' + this.previous);

        }

    }

    clearAll() {
        this.current = "";
        this.previous = "";
        this.op = null;
        this.justCalculated = false;
    }

    clearEntry() {
        this.current = "";
    }

    symbol(op: any) {
        switch (op) {
            case "add": return "+";
            case "subtract": return "−";
            case "multiply": return "×";
            case "divide": return "÷";
        }
        return;
    }


    applyFunction(func:any) {
        if (this.current === "") return;

        let num = parseFloat(this.current);
        let result;

        switch (func) {
            case "sin": result = Math.sin(num); break;
            case "cos": result = Math.cos(num); break;
            case "tan": result = Math.tan(num); break;
            case "log": result = Math.log10(num); break;
            case "sqrt": result = Math.sqrt(num); break;
            default: return;
        }

        this.current = result.toString();
        this.justCalculated = true;
        return result;
    }

    memory(action: string) {
        let num = parseFloat(this.current);

        switch (action) {
            case "m-plus":
                if (this.justCalculated && this.current == "") {
                    this.memValue += parseFloat(this.previous);
                }

                (!isNaN(num)) ? this.memValue += num : this.memValue += 0;
                console.log("ajout memoire: " + this.memValue);
                break;
            case "m-moins":
                if (this.justCalculated && this.current == "") {
                    this.memValue -= parseFloat(this.previous);
                }

                (!isNaN(num)) ? this.memValue -= num : this.memValue -= 0;
                console.log("soustrait memoire: " + this.memValue);
                break;
            case "mc":
                this.memValue = 0;
                break;
            case "mr":
                this.current = this.memValue.toString();
                console.log("total memoire: " + this.current);
                break
        }

    }
}


class Display {
    public displayElement = document.getElementById("display") as HTMLElement;
    public operationElement = document.getElementById("operation") as HTMLElement;

    constructor(displayElement: any, operationElement: any) {
        this.displayElement = displayElement;
        this.operationElement = operationElement;
    }

    updateDisplay(current: string, previous: string, op: any) {
        this.displayElement.textContent = current || previous || "0";

        if (previous && op && current) {
            this.operationElement.textContent = `${previous} ${op} ${current}`;
        } else if (previous && op) {
            this.operationElement.textContent = `${previous} ${op}`;
        } else if (current) {
            this.operationElement.textContent = current;
        } else {
            this.operationElement.textContent = 0 || previous;
        }
    }

    showResult(result: number) {
        this.displayElement.textContent = `${result}`;
        this.operationElement.textContent = "";
    }
}


class History {
    private limit: number;
    public panel: any;
    public items: any;

    constructor(limit = 10, panel:any) {
        this.limit = limit;
        this.items = [];
        this.panel = panel;
    }

    add(expression: string, result: number) {
        this.items.unshift({ expression, result });
        if (this.items.length > this.limit) {
            this.items.pop();
        }
        console.log("Hist: " + this.items);
    }

    getAll() {
        return this.items;
    }

    render() {
        this.panel.innerHTML = "";
        this.items.forEach((item:any) => {
            const div = document.createElement("div");
            div.classList.add("hist-item");
            div.textContent = `${item.expression} = ${item.result}`;

            // Resultat réutilisable
            div.addEventListener("click", () => {
                calc.current = item.result.toString();
                calc.previous = "";
                calc.op = null;
                display.updateDisplay(calc.current, calc.previous, "");
            });
            this.panel.appendChild(div);

            // Créaation du bloc export
            const divExport = document.createElement("div");
            divExport.classList.add("export-hist");
            divExport.textContent = "Export";
            this.panel.appendChild(divExport);

            // click exporter l'historique
            divExport.addEventListener("click", () => {
                history.export();
            });

        });
    }


    export() {
        if (this.items.length === 0) {
            alert("Aucun historique à exporter !");
            return;
        }

        // Construire le texte du fichier
        let content = this.items
            .map((item:any, i:any) => `${i + 1}. ${item.expression} = ${item.result}`)
            .join("\n");

        // Créer un blob texte
        const blob = new Blob([content], { type: "text/plain" });

        // Créer un lien de téléchargement
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "historique_calculatrice.txt";
        a.click();

        // Nettoyer l’URL temporaire
        URL.revokeObjectURL(url);
    }

}

const calc = new Calculator();
const display = new Display(
    document.getElementById("display") as HTMLElement,
    document.getElementById("operation") as HTMLElement,
);


// Clic bouton nombre
document.querySelectorAll(".num").forEach((btn: any) => {
    btn.addEventListener("click", () => {
        calc.addNumber(btn.dataset.num);
        display.updateDisplay(calc.current, calc.previous, calc.symbol(calc.op));
    });
});

// Clic sur une opération
document.querySelectorAll(".btn-op").forEach((btn: any) => {
    btn.addEventListener("click", () => {
        calc.chooseOperation(btn.dataset.op);
        display.updateDisplay(calc.current, calc.previous, calc.symbol(calc.op));
    });
});

// Clic sur égal
document.querySelector("[data-action='equals']")?.addEventListener("click", () => {
    const result = calc.calculate();
    if (result !== undefined) {
        display.showResult(result);
    }
});

// Click sur bouton +/-
document.querySelector("[data-action='sign']")?.addEventListener("click", () => {
    calc.toggleSign();
    display.updateDisplay(calc.current, calc.previous, calc.symbol(calc.op));
});

// Click sur bouton %
document.querySelector("[data-action='percent']")?.addEventListener("click", () => {
    calc.percent();
    display.updateDisplay(calc.current, calc.previous, calc.symbol(calc.op));
});

// Click sur bouton AC
document.querySelector("[data-action='ac']")?.addEventListener("click", () => {
    calc.clearAll();
    display.updateDisplay(calc.current, calc.previous, calc.symbol(calc.op));
});

// Click sur bouton C
document.querySelector("[data-action='c']")?.addEventListener("click", () => {
    calc.clearEntry();
    display.updateDisplay(calc.current, calc.previous, calc.symbol(calc.op));
});

// Click sur history
const histBtn = document.getElementById("hist") as HTMLButtonElement;
const histPanel = document.querySelector(".hist-panel") as HTMLElement;

const history = new History(10, histPanel);

histBtn.addEventListener("click", () => {
    histPanel.classList.toggle("show");
    history.getAll();
    history.render();
});


// --- Raccourcis clavier ---
document.addEventListener("keydown", (e) => {
    const key: string | number = e.key;

    // 1. Nombres et point
    if ((!isNaN(parseInt(key)) || key === ".")) {
        calc.addNumber(key);
        display.updateDisplay(calc.current, calc.previous, calc.symbol(calc.op));
    }

    // 2. Opérateurs
    if (["+", "-", "*", "/"].includes(key)) {
        console.log(key);
        calc.chooseOperation(key);
        display.updateDisplay(calc.current, calc.previous, calc.symbol(calc.op));
    }

    // 3. Entrée (=)
    if (key === "Enter" || key === "=") {
        // e.preventDefault(); // éviter que "Enter" soumette le formulaire
        const result = calc.calculate();
        if (result !== undefined) {
            display.showResult(result);
        }
        // display.updateDisplay(calc.current, calc.previous, calc.symbol(calc.op));
    }

    // 4. Escape (clear)
    if (key === "Escape") {
        calc.clearAll();
        display.updateDisplay(calc.current, calc.previous, calc.symbol(calc.op));
    }

    // 5. Backspace (supprimer dernier chiffre)
    if (key === "Backspace") {
        calc.clearEntry();
        display.updateDisplay(calc.current, calc.previous, calc.symbol(calc.op));
    }
});


// Click sur le mode
const modeBtn = document.getElementById("mode-clair") as HTMLElement;
modeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");

    document.body.classList.contains("light") ?
        modeBtn.textContent = "Sombre" :
        modeBtn.textContent = "Clair";
});

// Click sur les boutons de trigonométries et log
document.querySelectorAll(".btn-sci").forEach((btn:any) => {
    btn.addEventListener("click", () => {
        const func = btn.dataset.func;
        calc.applyFunction(func);
        display.updateDisplay(calc.current, calc.previous, calc.symbol(calc.op));
    });
});

// Click sur les touches memoires
document.querySelectorAll("[data-mem]").forEach((btn:any) => {
    btn.addEventListener("click", () => {
        const mem = btn.dataset.mem;
        calc.memory(mem);
        display.updateDisplay(calc.current, calc.previous, calc.symbol(calc.op));
    });
});
