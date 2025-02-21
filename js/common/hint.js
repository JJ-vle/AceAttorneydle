// hint.js

import { numTries, setHintChecker } from './life.js';

let hints = {};

export function setHints(newHints) {
    hints = newHints;
}

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

    const hintElement = document.createElement("p");
    hintElement.textContent = text;
    hintContent.appendChild(hintElement);
    
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

// Variable pour suivre le hint actuellement affiché
let currentHint = null;

function unlockHint(hint) {
    hints[hint].icon.classList.add("active");
    hints[hint].icon.classList.remove("disabled");
    hints[hint].icon.style.cursor = "pointer";

    // On enlève tous les anciens écouteurs pour éviter la duplication
    hints[hint].icon.removeEventListener("click", toggleHint);
    hints[hint].icon.addEventListener("click", toggleHint.bind(null, hint));
    
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

//////////// HINTS COUNTS

function hintChecker() {
    let lockedKeys = Object.values(hints).filter(hint => hint.tries - numTries > 0).length;

    for (let key in hints) {
        let remainingTries = hints[key].tries - numTries;
        
        if (remainingTries > 0) {
            hints[key].element.textContent = `in ${remainingTries} tries`;
        } else if (remainingTries == 0){
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

document.addEventListener("DOMContentLoaded", function () {
    setHintChecker(hintChecker);
    // Initialisation des textes au début de la partie
    hintChecker();
});
