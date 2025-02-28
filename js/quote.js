// quote.js

// Importation des fichiers
import { setValidateGuessFunction } from './common/guessbar.js';
import { dataLoaded, characterData, setSelectCharacterToFindFunction, setSelectedGroups, attemptedNames, getGroupByCharacter, getInfoByDebut, setGameMode, quoteData } from './common/data.js';
import { setHints } from './common/hint.js';
import { gameOver, incrementNumTries, verifyTries } from './common/life.js';
setGameMode("quote");

//////////////////

let targetCharacter = null;
let targetQuote = null;

//////////////////

const inputField = document.getElementById("guessInput");
const validateButton = document.getElementById("validateButton");
const feedback = document.getElementById("feedback");
const historyDiv = document.getElementById("history");

////////////////// HISTORY

// Assurer la création du tableau dès le début
function createHistoryTable() {
    if (!document.getElementById("historyTable")) {
        historyDiv.innerHTML = `
            <table id="historyTable" class="history-table">
                <thead>
                    <tr>
                        <th>Character</th>
                    </tr>
                </thead>
                <tbody id="historyBody"></tbody>
            </table>
        `;
    }
}
createHistoryTable()

// Ajouter un essai sous forme de nouvelle ligne dans le tableau existant
function addToHistory(guessedCharacter, result) {
    createHistoryTable(); // Assure que le tableau est bien créé
    const historyBody = document.getElementById("historyBody");

    //historyItem.innerHTML = result ? "🎉" : "❌";
    
    let imageUrl = "";
    if (guessedCharacter.image && guessedCharacter.image.length > 0) {
        imageUrl = guessedCharacter.image[0].replace(/(\/scale-to-width-down\/\d+|\/revision\/latest\/scale-to-width-down\/\d+|\/revision\/latest\?cb=\d+)/g, "");
    }

    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td class="single-cell-oneth ${compareInfoClass(guessedCharacter.name, targetCharacter.name)}" >
            <div class="image-container-oneth">
                <img src="${imageUrl}" alt="${guessedCharacter.name}" class="centered-image-oneth">
            </div>
            <div class="name-below-oneth">${guessedCharacter.name}</div>
        </td>
    `;

    historyBody.prepend(newRow); // Ajoute en haut du tableau
}

////////////////// FUNCTIONS

function selectCharacterToFind() {
    if (!quoteData || quoteData.length === 0 || !characterData || characterData.length === 0) {
        console.error("Data not loaded yet!");
        return;
    }

    // Appliquer les filtres aux personnages
    let filteredCharacters = filterCharacters();
    if (filteredCharacters.length === 0) {
        console.warn("No characters available after filtering!");
        return;
    }

    function isValidQuote(quote) {
        if (!quote.speaker || !quote.quote || !quote.source || !quote.speaker_url) {
            return false;
        }
        if (quote.bypass) {
            return true;
        }

        const attributes = [quote.speaker, quote.quote, quote.source, quote.speaker_url];
        return attributes.filter(attr => attr && attr !== "N/A" && attr !== "Unknown" && attr !== "Unknow").length >= 3;
    }

    let validQuotes = quoteData.filter(isValidQuote);
    if (validQuotes.length === 0) {
        console.error("No valid quotes found!");
        return;
    }

    let maxAttempts = validQuotes.length; // Évite une boucle infinie

    while (maxAttempts > 0) {
        targetQuote = validQuotes[Math.floor(Math.random() * validQuotes.length)];
        targetCharacter = filteredCharacters.find(char => char.name === targetQuote.speaker);

        if (targetCharacter) break; // On sort si un personnage valide est trouvé

        //console.warn("No character found or not in the right category for:", targetQuote.speaker, "- Retrying...");
        maxAttempts--;
    }

    if (!targetCharacter) {
        console.error("❌ Aucune citation valide n'a un personnage correspondant dans les personnages filtrés !");
        return;
    }

    let hints = {
        game: { title: "Case", tries: 3, icon: document.querySelector("#hint-case .hint-icon"), element: document.querySelector("#hint-case .hint-count"), text: targetQuote.source /*getInfoByDebut(targetCharacter.debut).game*/ },
        occupation: { title: "Occupation", tries: 7, icon: document.querySelector("#hint-occupation .hint-icon"), element: document.querySelector("#hint-occupation .hint-count"), text: targetCharacter.occupation },
        figure: { title: "Figure", tries: 12, icon: document.querySelector("#hint-figure .hint-icon"), element: document.querySelector("#hint-figure .hint-count"), image: targetCharacter.image[0].replace(/(\/scale-to-width-down\/\d+|\/revision\/latest\/scale-to-width-down\/\d+|\/revision\/latest\?cb=\d+)/g, "") }
    };

    setHints(hints);
    displayQuote(targetQuote);
    console.log("✅ Character to find (quote):", targetQuote.speaker);
}

function validateGuess() {
    /*if (!targetCharacter) {
        feedback.textContent = "⚠️ The game is still loading. Please wait...";
        feedback.className = "error";
        return;
    }*/

    const guessName = inputField.value.trim();
    if (attemptedNames.includes(guessName)) {
        feedback.textContent = "⚠️ This character has already been guessed !";
        feedback.className = "error";
        return;
    }

    const guessedCharacter = characterData.find(c => c.name.toLowerCase() === guessName.toLowerCase());

    if (!guessedCharacter) {
        feedback.textContent = "⚠️ Unknown character.";
        feedback.className = "error";
        return;
    }

    attemptedNames.push(guessName);

    if (guessName.toLowerCase() === targetCharacter.name.toLowerCase()) {
        addToHistory(guessedCharacter, true);
        feedback.textContent = "🎉 Congratulation ! You found " + targetCharacter.name + " !";
        feedback.className = "success";

        gameOver(true);
    } else {
        addToHistory(guessedCharacter, false);
        feedback.textContent = "❌ wrong answer, try again !";
        feedback.className = "error";
    }
    incrementNumTries();
    verifyTries();
    inputField.value = "";
    validateButton.disabled = true;
}

function displayQuote(quote){
    document.getElementById("quote").innerText = quote.quote
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

//////////// FILTERS

// Récupère la liste des checkboxes et ajoute un écouteur d'événement
const checkboxes = document.querySelectorAll("#groupFilters input[type='checkbox']");

const updateButton = document.querySelector("#updateFilters");
updateButton.addEventListener("click", selectCharacterToFind);

// Fonction pour filtrer les personnages en fonction des groupes cochés
function filterCharacters() {
    const checkboxes = document.querySelectorAll("#groupFilters input[type='checkbox']"); // Assurez-vous que cette ligne existe
    const newSelectedGroups = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    setSelectedGroups(newSelectedGroups); // Mettre à jour selectedGroups via la fonction setSelectedGroups

    // Filtrer les personnages en fonction du groupe sélectionné
    const filtered = characterData.filter(character => {
        const group = getGroupByCharacter(character);
        return newSelectedGroups.includes(group);
    });

    return filtered;
}

//////////// DOMCONTENTLOADED

async function initGame() {
    await dataLoaded; // Attendre que les fichiers JSON soient chargés
    console.log("🚀 Les données sont prêtes, on peut commencer !");
    console.log("Nombre de citations chargées :", quoteData.length);
    console.log("Nombre de personnages chargés :", characterData.length);

    setValidateGuessFunction(validateGuess);
    setSelectCharacterToFindFunction(selectCharacterToFind);

    selectCharacterToFind(); // Maintenant on peut l'exécuter
}
initGame();

/*
document.addEventListener("DOMContentLoaded", function () {

});*/