import type {Question} from "../main"

// data/informatique.js
export const informatiqueQuestions:Question[] = [ 
  {
    type: "qcm",
    question: "Quel langage s’exécute dans le navigateur ?",
    options: ["Python", "JavaScript", "C++", "PHP"],
    answer: [1]  // JavaScript
  },

  {
    type: "qcm",
    question: "Quel protocole est utilisé pour transférer des pages web ?",
    options: ["HTTP", "FTP", "SMTP", "DNS"],
    answer: [0]  // HTTP
  },

  {
    type: "qcm",
    question: "Quel est le système d’exploitation développé par Apple ?",
    options: ["Linux", "Windows", "macOS", "Android"],
    answer: [2]  // macOS
  },

  {
    type: "vf",
    question: "HTML est un langage de programmation.",
    answer: false
  },

  {
    type: "vf",
    question: "Un octet correspond à 8 bits.",
    answer: true
  },

  {
    type: "vf",
    question: "CSS sert à structurer le contenu d’une page web.",
    answer: false
  }
];
