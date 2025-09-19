
    const titre = document.getElementById("main-title");
    titre.innerText = "Nouveau titre";
    titre.style.color = "blue";
    titre.style.fontSize = "3rem";
    // Ajouter une classe
    titre.classList.add("highlight");   // titre devient surligné

    // Supprimer une classe
   titre.classList.remove("highlight"); // enlève le surlignage

    // Vérifier si un élément a une classe
    console.log(titre.classList.contains("highlight")); // true / false

    


    const paragraphes = document.getElementsByClassName("content");
    const first = paragraphes[0];
    first.innerHTML = "Premier paragraphe modifié. Premier paragraphe modifié. Premier paragraphe modifié.  Premier paragraphe modifié.";
    first.classList.add("large-text", "highlight");

    const items = document.getElementsByTagName("li"); 
    const second = items[1]; // l’index commence à 0
    //console.log(items[1]); // "Deuxième"
    
    const butt_div = document.querySelectorAll("#action-btn, #info-box");
    butt_div[1].innerHTML = "Je remplis le div avec du texte depuis JS.";
    console.log(butt_div[1].innerText);
    
    // Fonction pour générer une couleur aléatoire
    function couleurAleatoire() {
    const r = Math.floor(Math.random() * 256); // rouge 0-255 //nbre entier arrondi par defaut : Math.floor
    const g = Math.floor(Math.random() * 256); // vert 0-255
    const b = Math.floor(Math.random() * 256); // bleu 0-255
    return `rgb(${r}, ${g}, ${b})`;
    }

    
    butt_div[0].addEventListener("click", () => {
    titre.classList.toggle("highlight");
    first.classList.toggle("large-text");
    second.classList.toggle("hidden");
    document.body.style.backgroundColor = couleurAleatoire();
    items[2].classList.toggle("noir");
    titre.classList.toggle("transe");
        
        
    butt_div[0].textContent = items[2].classList.contains("noir")
    ? "Passer au thème clair"
    : "Passer au thème sombre";
});