//silhouette.js

// Importer la fonction depuis un autre fichier
import { setValidateGuessFunction } from './common/guessbar.js';
import { dataLoaded, characterData, targetItem, attemptedNames, setGameMode } from './common/data.js';
import { gameOver, incrementNumTries, verifyTries } from './common/life.js';
import { readCookie } from './common/cookie.js';
setGameMode("silhouette");

//let targetItem = null;

//////////////////

const inputField = document.getElementById("guessInput");
const validateButton = document.getElementById("validateButton");
const feedback = document.getElementById("feedback");
const historyDiv = document.getElementById("history");
const silhouetteImg = document.getElementById("silhouette");

// Assurer la création du tableau dès le début
export function createHistoryTable() {
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

function validateGuess() {
    if (!targetItem) {
        feedback.textContent = "⚠️ The game is still loading. Please wait...";
        feedback.className = "error";
        return;
    }

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

    if (guessName.toLowerCase() === targetItem.name.toLowerCase()) {
        addToHistory(guessedCharacter, true);
        silhouetteImg.children[0].style.filter = ""
        feedback.textContent = "🎉 Congratulation ! You found " + targetItem.name + " !";
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

// Ajouter un essai sous forme de nouvelle ligne dans le tableau existant
function addToHistory(guessedCharacter, result) {
    createHistoryTable(); // Assure que le tableau est bien créé
    const historyBody = document.getElementById("historyBody");

    let imageUrl = "";
    if (guessedCharacter.image && guessedCharacter.image.length > 0) {
        imageUrl = guessedCharacter.image[0].replace(/(\/scale-to-width-down\/\d+|\/revision\/latest\/scale-to-width-down\/\d+|\/revision\/latest\?cb=\d+)/g, "");
    }

    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td class="single-cell-oneth ${compareInfoClass(guessedCharacter.name, targetItem.name)}" >
            <div class="image-container-oneth">
                <img src="${imageUrl}" alt="${guessedCharacter.name}" class="centered-image-oneth">
            </div>
            <div class="name-below-oneth">${guessedCharacter.name}</div>
        </td>
    `;

    historyBody.prepend(newRow); // Ajoute en haut du tableau
}

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


/*
function selectCharacterToFind(){
    let filteredData = filterCharacters();
    if (filteredData.length > 0) {
        targetCharacter = filteredData[Math.floor(Math.random() * filteredData.length)];

        imageProcessing(targetCharacter.image[0].replace(/(\/scale-to-width-down\/\d+|\/revision\/latest\/scale-to-width-down\/\d+|\/revision\/latest\?cb=\d+)/g, "") )
        console.log("Character to find :", targetCharacter.name);
    } else {
        console.warn("No characters available after filtering!");
        //selectCharacterToFind();
    }
}*/


function imageProcessing(imgSrc) {
    const imgElement = document.createElement("img");
    imgElement.src = imgSrc;
    imgElement.alt = "Silhouette du personnage";
    
    // Applique un filtre noir complet
    imgElement.style.filter = "brightness(0)";
    imgElement.style.height = "auto";
    imgElement.style.maxWidth = "1500px";
    imgElement.style.display = "block";
    imgElement.style.margin = "10px auto"; // Centre l'image

    silhouetteImg.innerHTML = ''
    silhouetteImg.appendChild(imgElement);
}

function checkCorrectGroups(groups){

    checkboxes.forEach(checkbox => {
        // Check if the checkbox's value is in the provided list
        checkbox.checked = groups.includes(checkbox.value);
    });
}

//////////// DOMCONTENTLOADED

async function initGame() {
    await dataLoaded; // Attendre que les fichiers JSON soient chargés
    console.log("🚀 Les données sont prêtes, on peut commencer !");
/*
    let length = 0;
    Object.keys(characterDatas).forEach(game => {
        console.log(characterDatas[game].length)
        length += characterDatas[game].length
    });
    console.log("Nombre de personnages chargés :", length);

    checkCorrectGroups(readCookie("filter"));
*/
    setValidateGuessFunction(validateGuess);
}
initGame();

document.addEventListener("DOMContentLoaded", function () {

});
