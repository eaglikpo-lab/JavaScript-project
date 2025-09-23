// Partie 1 : Classe Person 
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age>=0 ? age : 0;
    }
    
    introduce() {
        console.log(`Hello, my name is ${this.name} and I am ${this.age} years old.`);
    }

    isAdult() {
        console.log(this.age >= 18 ? "You are an adult." : "You are not an adult.");
        return this.age >= 18;
    }

    toString() { // représentation lisible
        return `Person{name='${this.name}', age=${this.age}}`;
    } 

    // Getter et Setter pour age avec validation
    get age() {
        return this._age;
    }

    set age(value) {
        this._age = (Number.isInteger(value) && value >= 0) ? value : 0;
    }
}

//Partie 2 : Classe Rectangle
class Rectangle {
    constructor(width, height) {
        this.width = width >= 0 ? width : 0;
        this.height = height >= 0 ? height : 0;
    }
    area() {
        return this.width * this.height;
    }

    perimeter() {
        return 2 * (this.width + this.height);
    }

    isSquare() {
        return this.width === this.height;
    }

    scale(factor) {
        if (factor > 0) {
            this.width *= factor;
            this.height *= factor;
        }
    }

    get width() {
        return this._width;
    }

    set width(value) {
        this._width = (Number.isInteger(value) && value >= 0) ? value : 0;
    }

    get height() {
        return this._height;
    }

    set height(value) {
        this._height = (Number.isInteger(value) && value >= 0) ? value : 0;
    }

    static createSquare(side) {
        return new Rectangle(side, side);
    }
}

//Partie 3 : Classe Student
class Student {
    #grades; // tableau privé pour stocker les notes

    constructor(name) {
        this.name = name;
        this.#grades = [];
    }

    addGrade(grade) {
        if (Number.isInteger(grade) && grade >= 0 && grade <= 20) {
            this.#grades.push(grade);
        } else {
            console.log("Grade must be an integer between 0 and 20.");
        }
    }

    removeGrade(grade) {
        const index = this.#grades.indexOf(grade);
        if (index !== -1) {
            this.#grades.splice(index, 1);
        } else {
            console.log("Grade not found.");
        }
    }

    clearGrades() {
        this.#grades = [];
    }

    average() {
        if (this.#grades.length === 0) return 0;
        const sum = this.#grades.reduce((acc, val) => acc + val, 0);
        return sum / this.#grades.length;
    }

    getGrades() {
        return [...this.#grades]; // retourne une copie du tableau des notes
    }

    getGradeCount() {
        return this.#grades.length;
    }

    getHonor() {
        const avg = this.average();
        if (avg >= 16) return "High Honor";
        if (avg >= 14) return "Honor";
        if (avg >= 12) return "Passable";
        return "No Honor";
    }

    
    clone() {
        const copy = new Student(this.name);      // nouvelle instance
        this.getGrades().forEach(g => copy.addGrade(g)); // copie des notes
        return copy;
    }

    // Sérialisation JSON
    toJSON() {
        return {
            name: this.name,
            grades: this.getGrades()
        };
    }
}



// Partie 4 : Tests et utilisation

// Tests pour la classe Person
const person1 = new Person("Alice", 30);
person1.introduce();
person1.isAdult();
console.log(person1.toString());    
const person2 = new Person("Bob", -5); // age invalide
person2.introduce();
person2.isAdult();
console.log(person2.toString());
person2.age = 25; // utilisation du setter
person2.introduce();            
person2.isAdult();
console.log(person2.toString());
person2.age = -10; // tentative de définir un âge invalide
console.log(person2.toString());  


// Tests pour la classe Rectangle
console.log("\n--- Rectangle Tests ---");
const rect1 = new Rectangle(10, 5);
console.log(`Area: ${rect1.area()}`);   
console.log(`Perimeter: ${rect1.perimeter()}`);
console.log(`Is Square: ${rect1.isSquare()}`);
rect1.scale(2); 
console.log(`Scaled Area: ${rect1.area()}`);        
console.log(`Scaled Perimeter: ${rect1.perimeter()}`);
console.log(`Is Square after scaling: ${rect1.isSquare()}`);
const square = Rectangle.createSquare(4);
console.log(`Square Area: ${square.area()}`);
console.log(`Square Perimeter: ${square.perimeter()}`);
console.log(`Is Square: ${square.isSquare()}`);
const rect2 = new Rectangle(-3, 5); // dimensions invalides
console.log(`Rectangle with invalid dimensions - Width: ${rect2.width}, Height: ${rect2.height}`);  
rect2.width = 7; // utilisation du setter
rect2.height = -2; // tentative de définir une hauteur invalide
console.log(`Updated Rectangle - Width: ${rect2.width}, Height: ${rect2.height}`);  
console.log(`Area: ${rect2.area()}`);   
console.log(`Perimeter: ${rect2.perimeter()}`); 
console.log(`Is Square: ${rect2.isSquare()}`); 
rect2.scale(-1); // tentative de mise à l'échelle avec un facteur invalide
console.log(`After invalid scaling attempt - Width: ${rect2.width}, Height: ${rect2.height}`);
console.log(`Area: ${rect2.area()}`);   
console.log(`Perimeter: ${rect2.perimeter()}`); 
console.log(`Is Square: ${rect2.isSquare()}`);

// Tests pour la classe Student
console.log("\n--- Student Tests ---");
const student = new Student("Charlie"); 
student.addGrade(15);
student.addGrade(18);
student.addGrade(12);       
console.log(`Grades: ${student.getGrades()}`);  
console.log(`Average: ${student.average()}`);
console.log(`Grade Count: ${student.getGradeCount()}`);
console.log(`Honor: ${student.getHonor()}`);
student.removeGrade(18);    
console.log(`Grades after removal: ${student.getGrades()}`);  
console.log(`Average after removal: ${student.average()}`);
console.log(`Grade Count after removal: ${student.getGradeCount()}`);
console.log(`Honor after removal: ${student.getHonor()}`);
student.clearGrades();
console.log(`Grades after clearing: ${student.getGrades()}`);
console.log(`Average after clearing: ${student.average()}`);
console.log(`Grade Count after clearing: ${student.getGradeCount()}`);
student.addGrade(25); // note invalide
student.addGrade(-3); // note invalide

student.addGrade(14); // note valide
console.log(`Grades after adding valid and invalid grades: ${student.getGrades()}`);
console.log(`Average: ${student.average()}`);
console.log(`Grade Count: ${student.getGradeCount()}`);
console.log(`Honor: ${student.getHonor()}`);

// test du clonage
console.log("---Test du clonage---")
const s1 = new Student("Alice");
s1.addGrade(18);
s1.addGrade(15);

const s2 = s1.clone();

console.log(s2 instanceof Student); // true ✅
console.log(s2.getGrades());        // [18, 15]
s2.addGrade(20);
console.log(s1.getGrades());        // [18, 15] => s1 reste intact


console.log("---Test sérialisation JSON---")
console.log(JSON.stringify(s1)); 