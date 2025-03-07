// case.js

// Importation des fichiers
import { setValidateGuessFunction } from './common/guessbar.js';
import { dataLoaded, casesData, targetItem, attemptedNames, setGameMode } from './common/data.js';
import { gameOver, incrementNumTries, verifyTries } from './common/life.js';
import { readCookie } from './common/cookie.js';
setGameMode("case");

//////////////////

let targetCase = null;

//////////////////

const inputField = document.getElementById("guessInput");
const validateButton = document.getElementById("validateButton");
const feedback = document.getElementById("feedback");
const historyDiv = document.getElementById("history");
const evidenceContainer = document.getElementById("evidence-container");

////////////////// HISTORY

// Assurer la création du tableau dès le début
function createHistoryTable() {
    if (!document.getElementById("historyTable")) {
        historyDiv.innerHTML = `
            <table id="historyTable" class="history-table">
                <thead>
                    <tr>
                        <th>Case</th>
                    </tr>
                </thead>
                <tbody id="historyBody"></tbody>
            </table>
        `;
    }
}
createHistoryTable()

// Ajouter un essai sous forme de nouvelle ligne dans le tableau existant
function addToHistory(guessedCase, result) {
    createHistoryTable(); // Assure que le tableau est bien créé
    const historyBody = document.getElementById("historyBody");

    //historyItem.innerHTML = result ? "🎉" : "❌";
    
    let imageUrl = "";
    if (guessedCase.image && guessedCase.image.length > 0) {
        imageUrl = guessedCase.image.replace(/(\/scale-to-width-down\/\d+|\/revision\/latest\/scale-to-width-down\/\d+|\/revision\/latest\?cb=\d+)/g, "");
    }

    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td class="single-cell-oneth ${compareInfoClass(guessedCase.name, targetItem.name)}" >
            <div class="image-container-oneth-evidence">
                <img src="${imageUrl}" alt="${guessedCase.name}" class="centered-image-oneth">
            </div>
            <div class="name-below-oneth">${guessedCase.name}</div>
        </td>
    `;

    historyBody.prepend(newRow); // Ajoute en haut du tableau
}

////////////////// FUNCTIONS
/*
function selectCaseToFind() {
    // Appliquer les filtres aux personnages
    let filteredCases = filterCases();

    if (!casesData || casesData.length === 0 || !characterData || characterData.length === 0) {
        console.error("Data not loaded yet!");
        return;
    }

    if (filteredCases.length === 0) {
        console.warn("No characters available after filtering!");
        return;
    }

    function isValidCase(turnabout) {
        if (!turnabout.name || !turnabout.evidence) {
            return false;
        }
        if (turnabout.bypass) {
            return true;
        }

        const attributes = [turnabout.name, turnabout.image, turnabout.evidence, turnabout.victim, turnabout.cause];
        return attributes.filter(attr => attr && attr !== "N/A" && attr !== "Unknown" && attr !== "Unknow").length >= 3;
    }

    let validCases = filteredCases.filter(isValidCase);
    if (validCases.length === 0) {
        console.error("No valid quotes found!");
        return;
    }

    targetCase = validCases[Math.floor(Math.random() * validCases.length)];


    if (!targetCase) {
        console.error("❌ Aucune citation valide n'a un personnage correspondant dans les personnages filtrés !");
        return;
    }

    let hints = {
        cause: { title: "Death cause", tries: 3, icon: document.querySelector("#hint-cause .hint-icon"), element: document.querySelector("#hint-cause .hint-count"),  text: targetCase.cause },
        locations: { title: "Locations", tries: 7, icon: document.querySelector("#hint-locations .hint-icon"), element: document.querySelector("#hint-locations .hint-count"), text: targetCase.locations },
        victim: { title: "Victim", tries: 12, icon: document.querySelector("#hint-victim .hint-icon"), element: document.querySelector("#hint-victim .hint-count"), text: targetCase.victim },
        //image: { title: "Image", tries: 12, icon: document.querySelector("#hint-image .hint-icon"), element: document.querySelector("#hint-image .hint-count"), image: targetCase.image.replace(/(\/scale-to-width-down\/\d+|\/revision\/latest\/scale-to-width-down\/\d+|\/revision\/latest\?cb=\d+)/g, ""), clear: true }
        //image: { title: "Image", tries: 12, icon: document.querySelector("#hint-image .hint-icon"), element: document.querySelector("#hint-image .hint-count"), text: targetCase.name }
    };

    setHints(hints);
    displayEvidence();
    console.log("✅ Character to find (quote):", targetCase.name);
}*/

function validateGuess() {
    if (!targetItem) {
        feedback.textContent = "⚠️ The game is still loading. Please wait...";
        feedback.className = "error";
        return;
    }

    const guessCase = inputField.value.trim();
    if (attemptedNames.includes(guessCase)) {
        feedback.textContent = "⚠️ This character has already been guessed !";
        feedback.className = "error";
        return;
    }

    const guessedCase = casesData.find(c => c.name.toLowerCase() === guessCase.toLowerCase());

    if (!guessedCase) {
        feedback.textContent = "⚠️ Unknown character.";
        feedback.className = "error";
        return;
    }

    attemptedNames.push(guessCase);

    if (guessCase.toLowerCase() === targetItem.name.toLowerCase()) {
        addToHistory(guessedCase, true);
        feedback.textContent = "🎉 Congratulation ! You found " + targetItem.name + " !";
        feedback.className = "success";
        
        revealAllEvidence();
        gameOver(true);
    } else {
        addToHistory(guessedCase, false);
        feedback.textContent = "❌ wrong answer, try again !";
        feedback.className = "error";
    }
    incrementNumTries();
    verifyTries();
    revealNextEvidence()
    inputField.value = "";
    validateButton.disabled = true;
}

////////////////// EVIDENCE DISPLAY

let currentEvidenceIndex = 0;
let maxEvidence = 15; // Nombre maximum d'éléments affichables

function createEvidenceDiv(evidence) {
    if (document.querySelectorAll(".evidence-item").length >= maxEvidence) return;

    const div = document.createElement("div");
    div.classList.add("evidence-item");

    // Création des coins avec des spans
    const topLeft = document.createElement("span");
    topLeft.classList.add("corner", "corner-top-left");

    const topRight = document.createElement("span");
    topRight.classList.add("corner", "corner-top-right");

    const bottomLeft = document.createElement("span");
    bottomLeft.classList.add("corner", "corner-bottom-left");

    const bottomRight = document.createElement("span");
    bottomRight.classList.add("corner", "corner-bottom-right");

    // Création de l'image cachée par défaut
    const img = document.createElement("img");
    img.src = "/resources/img/icons/hiddenEvidence.png"; // Image cachée par défaut
    img.dataset.revealSrc = evidence.image.replace(/(\/scale-to-width-down\/\d+|\/revision\/latest\/scale-to-width-down\/\d+|\/revision\/latest\?cb=\d+)/g, "");
    img.classList.add("evidence-image");

    // Création du titre (nom de la preuve)
    const title = document.createElement("p");
    title.textContent = evidence.name;
    // Ne pas masquer le titre via style.display, le CSS s'en chargera

    // Ajout des éléments au div principal
    div.appendChild(topLeft);
    div.appendChild(topRight);
    div.appendChild(bottomLeft);
    div.appendChild(bottomRight);
    div.appendChild(img);
    div.appendChild(title);

    // Ajout au conteneur principal
    evidenceContainer.appendChild(div);
}

function displayEvidence() {
    if (targetItem.evidence.length < maxEvidence) {
        maxEvidence = targetItem.evidence.length;
    }
    const caseEvidence = targetItem.evidence.slice(0, maxEvidence); // Limite aux 15 premiers éléments
    caseEvidence.forEach(createEvidenceDiv);
}

function revealNextEvidence() {
    const evidenceItems = document.querySelectorAll(".evidence-item");
    if (currentEvidenceIndex < Math.min(evidenceItems.length, maxEvidence)) {
        const div = evidenceItems[currentEvidenceIndex]; 
        const img = div.querySelector(".evidence-image");
        const name = div.querySelector("p");
        
        img.src = img.dataset.revealSrc; // Affiche la vraie image
        div.classList.add("revealed"); // Marque l'évidence comme révélée
        name.style.display = "block"; // Permet au hover de fonctionner

        currentEvidenceIndex++;
    }
}

function revealAllEvidence() {
    const evidenceItems = document.querySelectorAll(".evidence-item");

    for (let i = currentEvidenceIndex; i < Math.min(evidenceItems.length, maxEvidence); i++) {
        const div = evidenceItems[i];
        const img = div.querySelector(".evidence-image");
        const name = div.querySelector("p");

        img.src = img.dataset.revealSrc;
        div.classList.add("revealed"); // Marque l'évidence comme révélée
        name.style.display = "block"; // Permet au hover de fonctionner
    }

    currentEvidenceIndex = maxEvidence;
}

////////////////// COMPARE FUNCTION

// Comparer deux valeurs et appliquer la couleur correspondante
function compareInfoClass(guess, target) {
    // Remplacer les valeurs nulles ou non définies par "Unknown"
    if (!guess || guess === "N/A") {
        guess = "Unknown";
    }
    if (!target || target === "N/A") {
        target = "Unknown";
    }

    // Comparer les valeurs et appliquer la couleur correspondante
    const isCorrect = guess === target;
    return isCorrect ? 'correct' : 'incorrect';
}

//////////// DOMCONTENTLOADED

async function initGame() {
    await dataLoaded; // Attendre que les fichiers JSON soient chargés
    console.log("🚀 Les données sont prêtes, on peut commencer !");
    
    /*let length = 0;
    Object.keys(casesDatas).forEach(game => {
        console.log(casesDatas[game].length)
        length += casesDatas[game].length
    });
    console.log("Nombre de turnabouts chargés :", length);

    checkCorrectGroups(readCookie("filter"));*/

    setValidateGuessFunction(validateGuess);
    //setSelectCharacterToFindFunction(selectCaseToFind);

    //selectCaseToFind(); // Maintenant on peut l'exécuter
    //displayEvidence(); // Charge les preuves masquées
    //revealNextEvidence() 
}
initGame();

/*
document.addEventListener("DOMContentLoaded", function () {

});*/