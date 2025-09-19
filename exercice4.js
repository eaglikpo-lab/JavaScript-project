class NumbersManager {
    constructor(numbers) {
        this.numbers = [];
    }

    add(number) {
        return this.numbers.push(number);  
    }

    remove(number) {
        const index = this.numbers.indexOf(number);
        index > -1 ? this.numbers.splice(index, 1) : null;
    }

    clear() {
        return this.numbers = [];
    }

    getEvens() {
        return this.numbers.filter(num => num % 2 === 0);
    }

    getOdds() {
        return this.numbers.filter(num => num % 2 !== 0);
    }   

    getMultipesOf(n) {
        return this.numbers.filter(num => num % n === 0);
    }
    getSquares() {
        return this.numbers.map(num => num * num);
    }

    getSum() {
        return this.numbers.reduce((acc, num) => acc + num, 0);
    }

    getAverage() {
        const sum = this.getSum();
        return this.numbers.length ? sum / this.numbers.length : 0;
    }

    getMin() {
        return this.numbers.length ? Math.min(...this.numbers) : null;
    }


    getMax() {
        return this.numbers.length ? Math.max(...this.numbers) : null;
    }

    getRange() {
        return this.numbers.length ? this.getMax() - this.getMin() : null;
    }


    contains(number) {
        return this.numbers.includes(number) ? "existe" : "n'existe pas";
    }

    findIndex(number) {
        const index = this.numbers.indexOf(number);
        return index > -1 ? index : "n'existe pas";
    }

    sort(ascending = true) {
        return this.numbers.sort((a, b) => ascending ? a - b : b - a);
    }

    getStats() {
        return {
            count: this.numbers.length,
            sum: this.getSum(),
            average: this.getAverage(),
            min: this.getMin(),
            max: this.getMax(),
            range: this.getRange()
        };
    }

    removeDuplicates() {
        this.numbers = [...new Set(this.numbers)];
    }

    getMedian() {
        const sorted = this.sort();
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    partition(predicate) {
        let trueArray = [];
        let falseArray = [];

        for (let num of this.numbers) {
            if (predicate(num)) {
                trueArray.push(num);
            } else {
                falseArray.push(num);
            }
        }

        return [trueArray, falseArray];
       
    }
}

// Exemple d'utilisation
const manager = new NumbersManager();
manager.add(5);
manager.add(10);
manager.add(15);
console.log("Evens array: ", manager.getEvens()); // [10]
console.log("Impairs array: ",manager.getOdds()); // [5, 15]
console.log("10: ", manager.contains(10)); // "existe"
console.log("15 index: ", manager.findIndex(15)); // 2
manager.sort(false);
console.log("Numbers: ",manager.numbers); // [15, 10, 5]
console.log("Stats: ", manager.getStats()); // {count: 3, sum: 30, average: 10, min: 5, max: 15, range: 10}
console.log("Median: ",manager.getMedian()); // 10
manager.removeDuplicates();
console.log(manager.numbers); // [15, 10, 5]
console.log(manager.partition(num => num > 7)); // [[15, 10], [5]]  


