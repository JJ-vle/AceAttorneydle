// hint.js
import { dataLoaded, hints } from './data.js';
import { numTries, setHintChecker } from './life.js';

const hintDetails = document.getElementById("hint-details");
const hintHeader = document.getElementById("hint-details-header");
const hintContent = document.getElementById("hint-details-content");

/////////// SHOW HINTS

// Fonction pour afficher le cadre avec un titre spécifique
function showHintContainer(title) {
    hintDetails.style.display = "block"; // Affiche le cadre
    hintHeader.textContent = title || "Hint"; // Définit le titre avec la valeur donnée
}

// Fonction pour ajouter un texte
function addHint(title, text) {
    if (!text) return;
    showHintContainer(title);
    
    if (Array.isArray(text) || text instanceof Set) {
        const hintList = document.createElement("ul");
        text.forEach(item => {
            const listItem = document.createElement("li");
            listItem.textContent = item;
            hintList.appendChild(listItem);
        });
        hintContent.appendChild(hintList);
    } else {
        const hintElement = document.createElement("p");
        hintElement.textContent = text;
        hintContent.appendChild(hintElement);
    }
}

// Fonction pour ajouter une image
function addHintImage(title, imgSrc, clear) {
    if (!imgSrc){
        console.log("pipciaaca");
        return;
    }
    showHintContainer(title);

    const hintElement = document.createElement("img");
    hintElement.src = imgSrc;
    hintElement.alt = "Figure";
    if (clear){
        hintElement.classList.add("hint-image-clear");

    }else {
        hintElement.classList.add("hint-image");

    }

    hintContent.appendChild(hintElement);
}

// Fonction pour vider les hints et cacher le cadre si vide
function clearHints() {
    hintContent.innerHTML = "";
    hintDetails.style.display = "none"; // Cache le cadre si plus de contenu
}
export function collapseAllHints() {
    clearHints(); // Vide le contenu des indices affichés
    currentHint = null; // Réinitialise la variable de suivi
}


// Variable pour suivre le hint actuellement affiché
let currentHint = null;
// Map pour stocker les listeners attachés
const hintListeners = {};

function unlockHint(hint) {
    hints[hint].icon.classList.add("active");
    hints[hint].icon.classList.remove("disabled");
    hints[hint].icon.style.cursor = "pointer";

    // Si on n’a pas encore créé de listener pour ce hint, on le crée et on le garde
    if (!hintListeners[hint]) {
        hintListeners[hint] = toggleHint.bind(null, hint);
    }

    // On enlève l’ancien listener (si présent) et on remet le même (référence stable)
    hints[hint].icon.removeEventListener("click", hintListeners[hint]);
    hints[hint].icon.addEventListener("click", hintListeners[hint]);
}



function toggleHint(hint) {
    // Si on clique sur le même hint, on le cache
    if (currentHint === hint) {
        clearHints();
        currentHint = null;
    } else {
        // Sinon, on change le hint affiché
        clearHints();
        if (hints[hint].text) {
            addHint(hints[hint].title, hints[hint].text);
        }
        if (hints[hint].image) {
            addHintImage(hints[hint].title, hints[hint].image, hints[hint].clear);
        }
        currentHint = hint; // Met à jour le hint affiché
    }
}

export function unlockAllHints() {
    let keys = Object.keys(hints);
    let lastKey = keys[keys.length - 1];

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const hint = hints[key];

        // Déverrouille
        if (hint.element) {
            hint.element.textContent = "Unlocked!";
        }

        unlockHint(key);

        // Change l'icône
        hint.icon.src = (i === keys.length - 1)
            ? "resources/img/icons/Black_Psyche-Lock-Broken.png"
            : "resources/img/icons/Psyche-Lock-Broken.png";
    }

    //currentHint = null; // Réinitialise
}


//////////// HINTS COUNTS

export function hintChecker(unlockAll = false) {
    if (unlockAll) {
        unlockAllHints();
        return;
    }

    let lockedKeys = Object.values(hints).filter(hint => hint.tries - numTries > 0).length;

    for (let key in hints) {
        let remainingTries = hints[key].tries - numTries;
        
        if (remainingTries > 0) {
            if (hints[key].element) {
                hints[key].element.textContent = `in ${remainingTries} tries`;
            } else {
                console.error(`Element not found for key: ${key}`);
            }
        } else if (remainingTries === 0){
            hints[key].element.textContent = "Unlocked!";
            unlockHint(key);
        }

        if (numTries === hints[key].tries) {
            hints[key].icon.src = (lockedKeys === 0) 
                ? "resources/img/icons/Black_Psyche-Lock-Broken.png" 
                : "resources/img/icons/Psyche-Lock-Broken.png";
        }
    }
}


//////////// DOMCONTENTLOADED

document.addEventListener("DOMContentLoaded", async function () {
    await dataLoaded;  // Assure-toi que les données sont bien chargées
    setHintChecker(hintChecker);
    hintChecker();  // Maintenant, les hints seront bien disponibles
});

