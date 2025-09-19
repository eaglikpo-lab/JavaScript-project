// Maîtriser les structures de contrôle conditionnelles et les boucles.
let words;
let longueur;
let sentences;
let paragraphs;
let countVowels;
let countConsonants;


function analyzeText(text) {
    let mot_array = text.trim().split(/\s+/); 
    longueur = text.length;
    words = mot_array.length;

    const sentences_array = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    sentences = sentences_array.length;

    const paragraphs_array = text.split(/\n\n/).filter(paragraph => paragraph.trim() !== '');
    paragraphs = paragraphs_array.length;

    const vowels = "aeiouyAEIOUY";
    countVowels = Array.from(text).filter(char => vowels.includes(char)).length;

    const consonants = text.match(/[bcdfghjklmnpqrstvwxyz]/gi);
    countConsonants = consonants ? consonants.length : 0;
    

    return {
        length: longueur,
        words,
        sentences,
        paragraphs,
        vowels: countVowels,
        consonants: countConsonants
    };
}

function getTextComplexity(analysis) {
    if (analysis.words < 50) {
        return "Simple";
    } else if (analysis.words <= 150) {
        return "Moyen";
    } else {
        return "Complexe";
    }
}

function getDetailedStats(text) {
    let letterFrequency = {};
    let mot_array = text.trim().split(/\s+/);

    // Fréquence des lettres
    for (let char of text.toLowerCase()) {
        if (/[a-z]/.test(char)) {
            if (!letterFrequency[char]) {
                letterFrequency[char] = 1;
            } else {
                letterFrequency[char]++;
            }
        }
    }

    // Mot le plus long
    let longestWord = "";
    for (let word of mot_array) {
        let cleanWord = word.replace(/[^a-zA-ZÀ-ÿ]/g, ""); // enlève la ponctuation
        if (cleanWord.length > longestWord.length) {
            longestWord = cleanWord;
        }
    }

    // Longueur moyenne des mots
    let totalLength = 0;
    for (let word of mot_array) {
        totalLength += word.replace(/[^a-zA-ZÀ-ÿ]/g, "").length;
    }
    let averageWordLength = mot_array.length > 0 ? totalLength / mot_array.length : 0;


    // Langue
    let language = "fr"; // Valeur par défaut
    for (let word of mot_array) {
        if (word.toLowerCase() === "the" || word.toLowerCase() === "a" || word.toLowerCase() === "and") {
            language = "en";
            break;
        }
    }

    return {
        letterFrequency,
        longestWord,
        averageWordLength,
        language
    };
}

function cleanText(text) {
    return text.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, ' ').trim();
}

const text = "Bonjour ! Comment allez-vous ? J'espère que   tout va bien.";
console.log(analyzeText(text));
console.log(getDetailedStats(text));
console.log("Complexité du texte :", getTextComplexity(analyzeText(text)));
console.log("Texte nettoyé :", cleanText(text));