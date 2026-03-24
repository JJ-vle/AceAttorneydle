//guess.js

// Importation des fichiers
import { setValidateGuessFunction, validateButton } from './common/guessbar.js';
import { dataLoaded, turnaboutGames, characterData, attemptedNames, getInfoByDebut, setGameMode, targetItem, gameMode } from './common/data.js';
import { incrementNumTries, verifyTries, gameOver } from './common/life.js';
import { setCookieName, updateAttemptsCookie, loadHistory, displayStoredStreak } from './common/cookie.js';

///////// FONCTION COOKIES /////////////

//////////////////

setGameMode("guess");
setCookieName("guessAttempts");

const feedback = document.getElementById("feedback");
const historyDiv = document.getElementById("history");
const inputField = document.getElementById("guessInput");

//////////// HISTORY

// Assurer la création du tableau dès le début
function createHistoryTable() {
    if (!document.getElementById("historyTable")) {
        historyDiv.innerHTML = `
            <table id="historyTable" class="history-table">
                <thead>
                    <tr>
                        <th>Character</th>
                        <th>Status</th>
                        <th>Gender</th>
                        <th>Birth year</th>
                        <th>Eyes color</th>
                        <th>Hair color</th>
                        <th>Debut</th>
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
        <td class="photo-name-cell">
            <div class="photo-name-container">
                <img src="${imageUrl}" alt="${guessedCharacter.name}" class="history-photo">
                <span class="name-on-hover">${guessedCharacter.name}</span>
            </div>
        </td>
        ${compareInfo(guessedCharacter.status, targetItem.status)}
        ${compareInfo(guessedCharacter.gender, targetItem.gender)}
        ${compareBirthday(guessedCharacter.birthday, targetItem.birthday)}
        ${compareColors(guessedCharacter.eyes, targetItem.eyes)}
        ${compareColors(guessedCharacter.hair, targetItem.hair)}
        ${compareDebut(guessedCharacter.debut, targetItem.debut)}
    `;

    historyBody.prepend(newRow); // Ajoute en haut du tableau
}

//////////// FUNCTIONS

function validateGuess(guessName=inputField.value.trim(), fromhistory=false) {

    if (!targetItem) {
        feedback.textContent = "⚠️ Target character not found!";
        feedback.className = "error";
        return;
    }

    if (attemptedNames.includes(guessName)) {
        feedback.textContent = "⚠️ This character has already been guessed !";
        feedback.className = "error";
        return;
    }

    const guessedCharacter = characterData.find(c => c.name.toLowerCase() === guessName.toLowerCase());
    //console.log(guessedCharacter);

    if (!guessedCharacter) {
        feedback.textContent = "⚠️ Unknown character.";
        feedback.className = "error";
        return;
    }

    attemptedNames.push(guessName);
    updateAttemptsCookie();

    if (guessName.toLowerCase() === targetItem.name.toLowerCase()) {
        addToHistory(guessedCharacter, true);
        feedback.textContent = "🎉 Congratulation ! You found " + targetItem.name + " !";
        feedback.className = "success";
        
        gameOver(true, fromhistory);

    } else {
        addToHistory(guessedCharacter, false);
        feedback.textContent = "❌ wrong answer, try again !";
        feedback.className = "error";
    }
    incrementNumTries();
    verifyTries();
    inputField.value = "";
    if (validateButton){
        validateButton.disabled = true;
    }
}

//////////// COMPARE FUNCTIONS

// Comparer deux valeurs et appliquer la couleur correspondante
function compareInfo(guess, target) {
    // Remplacer les valeurs nulles ou non définies par "Unknown"
    if (!guess || guess === "N/A") {
        guess = "Unknown";
    }
    if (!target || target === "N/A") {
        target = "Unknown";
    }

    // Comparer les valeurs et appliquer la couleur correspondante
    const isCorrect = guess === target;
    return `<td class="${isCorrect ? 'correct' : 'incorrect'}">${guess}</td>`;
}

// Fonction de comparaison des dates de naissances
function compareBirthday(guessBirthday, targetBirthday) {
    if (!guessBirthday || guessBirthday === "N/A") {
        guessBirthday = "Unknown";
    }
    if (!targetBirthday || targetBirthday === "N/A") {
        targetBirthday = "Unknown";
    }

    // Si les deux dates sont exactement les mêmes
    if (guessBirthday === targetBirthday) {
        return `<td class="correct">${guessBirthday}</td>`;
    }

    let colorClass = "incorrect";
    let arrowHint = "";

    // Convertir les siècles en années approximatives
    function parseYear(yearStr) {
        if (typeof yearStr !== "string") return [];

        // Gestion des siècles
        if (yearStr.includes("19th")) return [1800];
        if (yearStr.includes("20th")) return [1900];
        if (yearStr.includes("21st")) return [2000];
        if (yearStr.includes("17th")) return [1600];
        if (yearStr.includes("7th"))  return [600];

        const rangeMatch = yearStr.match(/(\d{4})\s*-\s*(\d{4})/);
        if (rangeMatch) {
            return [parseInt(rangeMatch[1]), parseInt(rangeMatch[2])];
        }

        const matches = yearStr.match(/\d{4}/g);
        if (matches) {
            return matches.map(y => parseInt(y));
        }

        return [];
    }

    let guessedYears = guessBirthday !== "Unknown" ? parseYear(guessBirthday) : [];
    let targetYears = targetBirthday !== "Unknown" ? parseYear(targetBirthday) : [];

    // Si l'un des deux est "Unknown", pas de comparaison ni de flèche
    if (guessBirthday === "Unknown" || targetBirthday === "Unknown") {
        return `<td class="${colorClass}">${guessBirthday}</td>`;
    }

    // Vérifier si au moins une des années devinées correspond
    if (targetYears.some(year => guessedYears.includes(year))) {
        colorClass = "partial";
    } else {
        // Vérifier si la date devinée est plus grande ou plus petite
        let minGuessed = Math.min(...guessedYears);
        let minTarget = Math.min(...targetYears);

        if (minGuessed < minTarget) {
            arrowHint = "bigger"; // Trop ancien
        } else {
            arrowHint = "lower"; // Trop récent
        }
    }

    return `<td class="${colorClass} ${arrowHint}">${guessBirthday}</td>`;
}
// Fonction de comparaison des débuts
function compareDebut(guessDebut, targetDebut) {
    if (!guessDebut || guessDebut === "N/A") {
        guessDebut = "Unknown";
    }
    if (!targetDebut || targetDebut === "N/A") {
        targetDebut = "Unknown";
    }

    // Si les débuts sont identiques
    if (guessDebut === targetDebut) {
        return `<td class="correct">${guessDebut}</td>`;
    }

    let colorclass = "incorrect";
    let arrowHint = "";

    // Trouver les groupes et jeux pour chaque début
    const guessInfo = getInfoByDebut(guessDebut);
    const targetInfo = getInfoByDebut(targetDebut);

    if (!guessInfo || !targetInfo) {
        return `<td class=${colorclass}>${guessDebut} error</td>`; // Si un des débuts n'est pas valide
    }

    const guessGroup = guessInfo.group;
    const targetGroup = targetInfo.group;
    const guessGame = guessInfo.game;
    const targetGame = targetInfo.game;

    // Si les deux débuts sont dans le même groupe
    if (guessGroup === targetGroup) {
        const groupGames = turnaboutGames[guessGroup]; // Accède directement aux jeux du groupe

        // Si les deux débuts proviennent du même jeu
        if (guessGame === targetGame) {
            colorclass = "partial"; // Si c'est le même jeu, applique une classe "partielle"
            const guessGameTurnabouts = groupGames[guessGame];
            const targetGameTurnabouts = groupGames[targetGame];

            // Trouver les indices dans les jeux respectifs
            const guessIndex = guessGameTurnabouts.indexOf(guessDebut);
            const targetIndex = targetGameTurnabouts.indexOf(targetDebut);

            // Vérifier si c'est avant ou après dans le même jeu
            if (guessIndex < targetIndex) {
                arrowHint = "bigger"; // Flèche vers le haut si c'est avant
            } else if (guessIndex > targetIndex) {
                arrowHint = "lower"; // Flèche vers le bas si c'est après
            }
        } else {
            // Si les deux débuts sont dans des jeux différents, vérifier l'ordre des jeux
            const allGames = Object.keys(groupGames); // Liste de tous les jeux dans ce groupe
            const guessGameIndex = allGames.indexOf(guessGame);
            const targetGameIndex = allGames.indexOf(targetGame);

            // Vérifier si c'est avant ou après selon l'ordre des jeux
            if (guessGameIndex < targetGameIndex) {
                arrowHint = "bigger"; // Flèche vers le haut si le jeu deviné est avant
            } else if (guessGameIndex > targetGameIndex) {
                arrowHint = "lower"; // Flèche vers le bas si le jeu deviné est après
            }
        }

        return `<td class="${colorclass} ${arrowHint}">${guessDebut}</td>`; // Affiche le résultat avec la flèche
    }

    // Si ce n'est pas le même groupe, alors rouge (incorrect)
    return `<td class=${colorclass}>${guessDebut}</td>`;
}
function normalizeColor(word) {
    const colorMap = {
        grey: "gray"
        // ajoute d'autres équivalences si besoin
    };

    return colorMap[word] || word;
}

// Fonction de comparaison des couleurs de cheveux
function compareColors(guessHair, targetHair) {
    if (!guessHair || guessHair === "N/A") {
        guessHair = "Unknown";
    }
    if (!targetHair || targetHair === "N/A") {
        targetHair = "Unknown";
    }

    // Si les deux couleurs sont exactement les mêmes
    if (guessHair === targetHair) {
        return `<td class="correct">${guessHair}</td>`;
    }

    let colorClass = "incorrect";

    // Fonction utilitaire : nettoyer et extraire les mots significatifs
    function extractKeywords(hairDesc) {
        return hairDesc
            .toLowerCase()
            .replace(/[^a-z0-9\s]/gi, "") // retirer ponctuation
            .split(/\s+/) // découper en mots
            .filter(word => ![
                "with", "and", "but", "some", "parts", "fringe", "tip", "streak", "patch",
                "paws", "mane", "sides", "stripe", "side", "central", "presumably", "appears", 
                "otherwise", "wears", "toupée", "balding", "previously", "from", "his", "her", "at", "the", "of"
            ].includes(word)) // filtrer les mots non-significatifs
            .map(normalizeColor); //normalize
    }

    const guessKeywords = extractKeywords(guessHair);
    const targetKeywords = extractKeywords(targetHair);

    // Chercher des mots en commun
    const commonWords = guessKeywords.filter(word => targetKeywords.includes(word));

    if (commonWords.length > 0) {
        colorClass = "partial";
    }

    return `<td class="${colorClass}">${guessHair}</td>`;
}

//////////// DOMCONTENTLOADED

async function initGame() {
    while (!dataLoaded) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    await dataLoaded;
    //console.log("🚀 Les données sont prêtes, on peut commencer !");

    setValidateGuessFunction(validateGuess);
    displayStoredStreak();
    loadHistory();
}

initGame();

document.addEventListener("DOMContentLoaded", function () {

});

