let color_table = ["red", "green", "blue", "yellow", "black", "cyan"];

const palette = document.getElementById('palette');
const selectedColor = document.getElementById('selected-color');
const colorInfo = document.getElementById('color-info');
const form = document.getElementById('formulaire');
const input = document.getElementById('custom-color');
const historique = document.getElementsByClassName('historique')[0];

selectedColor.addEventListener('colorChanged', function (e) {
    const newColor = e.detail.color;
    historique.textContent += `${newColor}  `;
});


// --- Ajouts : suppression (clic droit), favoris (double-clic) et raccourcis clavier ---

// Si tu utilises la fonction createColorBox, remplace la partie listeners par ceci (à l'intérieur de createColorBox)
function createColorBox(color) {
    const newDiv = document.createElement('div');

    newDiv.className = 'color-box';
    newDiv.style.backgroundColor = color;
    newDiv.style.width = '50px';
    newDiv.style.height = '50px';
    newDiv.style.display = 'inline-block';
    newDiv.style.margin = '5px';
    newDiv.style.cursor = 'pointer';
    palette.appendChild(newDiv); // Add the new div to the palette

    newDiv.className = 'color-box';
    newDiv.setAttribute('data-color', color);
    newDiv.setAttribute('data-fav', 'false'); // flag favoris
    newDiv.style.backgroundColor = color;
    // style (taille/marge) etc...
    palette.appendChild(newDiv);

    // CLICK : sélection normale (conserver ta logique existante)
    newDiv.addEventListener('click', function () {
        const select = newDiv.getAttribute('data-color');
        selectedColor.textContent = `Couleur sélectionnée: ${select}`;
        selectedColor.style.backgroundColor = select;

        // dispatch événement custom (si tu l'utilises)
        const changeEvent = new CustomEvent('colorChanged', { detail: { color: select } });
        selectedColor.dispatchEvent(changeEvent);
    });

    // MOUSEOVER / MOUSEOUT (comme avant)
    newDiv.addEventListener('mouseover', function () {
        colorInfo.textContent = `Couleur survolée: ${newDiv.getAttribute('data-color')}`;
    });
    newDiv.addEventListener('mouseout', function () {
        colorInfo.textContent = '';
    });

    // CONTEXTMENU (clic droit) -> supprimer la pastille
    newDiv.addEventListener('contextmenu', function (e) {
        e.preventDefault(); // empêche menu natif
        // confirmation optionnelle
        const name = newDiv.getAttribute('data-color');
        const ok = confirm(`Supprimer la couleur ${name} ?`);
        if (!ok) return;

        // si la pastille était sélectionnée, nettoyer l'affichage
        const current = selectedColor.style.backgroundColor;
        if (current && (current === name || current === rgbStringFrom(name))) {
            selectedColor.style.backgroundColor = '';
            selectedColor.textContent = '';
        }

        newDiv.remove();
        colorInfo.textContent = `Couleur ${name} supprimée.`;
    });

    // DBLCLICK -> favoris (toggle)
    newDiv.addEventListener('dblclick', function () {
        const isFav = newDiv.getAttribute('data-fav') === 'true';
        newDiv.setAttribute('data-fav', (!isFav).toString());
        newDiv.classList.toggle('favorite', !isFav);

        // feedback visuel / message
        colorInfo.textContent = (!isFav) ? 'Ajouté aux favoris' : 'Retiré des favoris';
    });
}

// --- Listener global pour choix via touches 1..9 ---
document.addEventListener('keydown', function (e) {
    // ignore si focus dans un input (pour ne pas gêner la saisie)
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;

    if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key, 10) - 1;
        const boxes = document.querySelectorAll('.color-box');
        if (idx < boxes.length) {
            const box = boxes[idx];
            // simuler la sélection (déclenche le click handler attaché)
            box.click();
            // optionnel : mettre un petit focus visuel
            box.focus?.();
        }
    }
});

// --- Helper (optionnel) : conversion nom couleur en rgb si besoin (pour comparer backgroundColor) ---
// Simple fonction utilitaire si tu compares les valeurs (ex: 'red' vs 'rgb(255, 0, 0)').
// Tu peux la laisser vide si tu n'en as pas besoin.
function rgbStringFrom(colorString) {
    // crée un élément temporaire pour résoudre la couleur en rgb
    const temp = document.createElement('div');
    temp.style.color = colorString;
    document.body.appendChild(temp);
    const computed = getComputedStyle(temp).color; // "rgb(r, g, b)"
    temp.remove();
    return computed;
}




color_table.forEach(color => {
    // Create a new div element
    createColorBox(color);

   
});

// Regex pour hex
const hexadec = /^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/;

// Keydown sur l'input pour aperçu live
input.addEventListener('keydown', function() {
    setTimeout(function() {
        const value = input.value.trim();
        if (hexadec.test(value)) {
            selectedColor.style.backgroundColor = value;
            selectedColor.textContent = `Aperçue couleur personnalisée: ${value}`;
            colorInfo.textContent = 'Couleur valide';
        } else {
            colorInfo.textContent = 'Couleur invalide';
        }
    }, 0);
});

// Submit du formulaire pour ajouter la couleur
form.addEventListener('submit', function(event) {
    event.preventDefault();
    const value = input.value.trim();
    if (hexadec.test(value)) {
        createColorBox(value); // ajoute la nouvelle pastille
        input.value = ''; // vide l'input après ajout
        colorInfo.textContent = `Couleur ${value} ajoutée à la palette`;
    } else {
        colorInfo.textContent = 'Impossible d’ajouter: couleur invalide';
    }
});

