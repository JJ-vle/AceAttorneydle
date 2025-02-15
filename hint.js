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
function addHintImage(title, imgSrc) {
    if (!imgSrc) return;
    showHintContainer(title);

    const hintElement = document.createElement("img");
    hintElement.src = imgSrc;
    hintElement.alt = "Figure";
    hintElement.classList.add("hint-image");

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
    hints[hint].icon.addEventListener("click", function () {
        toggleHint(hint);
    });
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
            addHintImage(hints[hint].title, hints[hint].image);
        }
        currentHint = hint; // Met à jour le hint affiché
    }
}

//////////// HINTS COUNTS

const hintCounts = {
    game: { tries: 3, element: document.querySelector("#hint-game .hint-count"), icon: document.querySelector("#hint-game .hint-icon") },
    occupation: { tries: 8, element: document.querySelector("#hint-occupation .hint-count"), icon: document.querySelector("#hint-occupation .hint-icon") },
    figure: { tries: 15, element: document.querySelector("#hint-figure .hint-count"), icon: document.querySelector("#hint-figure .hint-icon") }
};

// Fonction pour mettre à jour les "hint-counts"
function updateHintCounts() {
    for (let key in hintCounts) {
        let remainingTries = hintCounts[key].tries - numTries;
        if (remainingTries > 0) {
            hintCounts[key].element.textContent = `in ${remainingTries} tries`;
        } else {
            hintCounts[key].element.textContent = "Unlocked!";
        }
    }
}

function hintChecker(numTries) {
    if (numTries === hintCounts["game"].tries) {
        unlockHint("game");
        //document.querySelector("#hint-game img").src = "resources/img/icons/Psyche-Lock-Broken.png"
        hintCounts.game.icon.src = "resources/img/icons/Psyche-Lock-Broken.png";
    }
    if (numTries === hintCounts["occupation"].tries) {
        unlockHint("occupation");
        //document.querySelector("#hint-game img").src = "resources/img/icons/Psyche-Lock-Broken.png"
        hintCounts.occupation.icon.src = "resources/img/icons/Psyche-Lock-Broken.png";
    }
    if (numTries === hintCounts["figure"].tries) {
        unlockHint("figure");
        //document.querySelector("#hint-game img").src = "resources/img/icons/Black_Psyche-Lock-Broken.png"
        hintCounts.figure.icon.src = "resources/img/icons/Black_Psyche-Lock-Broken.png";
    }
    updateHintCounts(); // Met à jour l'affichage des essais restants
}

// Initialisation des textes au début de la partie
updateHintCounts();

//////////// DOMCONTENTLOADED

document.addEventListener("DOMContentLoaded", function () {
    setHintChecker(hintChecker);
});
