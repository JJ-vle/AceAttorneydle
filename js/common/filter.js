//filter.js
import { selectCharacterToFind, setSelectedGroups, getGroupByCharacter, getGroupByTurnabout } from './data.js';
import { resetNumTries, verifyTries } from './life.js';
import { setCookie, readCookie, loadHistory } from './cookie.js';


const checkboxes = document.querySelectorAll("#groupFilters input[type='checkbox']");
const historyDiv = document.getElementById("history");

/*const updateButton = document.querySelector("#updateFilters");
updateButton.addEventListener("click", selectCharacterToFind);*/

checkboxes.forEach(checkbox => {
    checkbox.addEventListener("change", () => {
        updateSelectedGroups();
        selectCharacterToFind(true);
        resetGame();
        saveFiltersToCookie();
    });
});

function updateSelectedGroups() {
    const newSelectedGroups = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    setSelectedGroups(newSelectedGroups);
}

// Fonction pour filtrer les personnages en fonction des groupes cochés
export function filterCharacters(characterData) {
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

export function filterCases(casesData) {
    const newSelectedGroups = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    setSelectedGroups(newSelectedGroups); // Mettre à jour selectedGroups via la fonction setSelectedGroups

    // Filtrer les personnages en fonction du groupe sélectionné
    const filtered = casesData.filter(turnabout => {
        const group = getGroupByTurnabout(turnabout.name);
        return newSelectedGroups.includes(group);
    });

    return filtered;
}

/////////////

function resetGame() {
    clearHistoryTable();
    resetNumTries();
    verifyTries();
    loadHistory();
}

function clearHistoryTable() {
    const historyBody = document.getElementById("historyBody");
    if (historyBody) {
        historyBody.innerHTML = "";
    }
}

///////

// Fonction pour sauvegarder les filtres dans un cookie
function saveFiltersToCookie() {
    const selectedGroups = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    setCookie("filter", encodeURIComponent(JSON.stringify(selectedGroups)));
}

// Met à jour les checkboxes en fonction du cookie
function loadFiltersFromCookie() {
    let savedFilters = readCookie("filter");

    try {
        if (!savedFilters || savedFilters === "undefined") {
            throw new Error("Cookie invalide");
        }

        savedFilters = JSON.parse(decodeURIComponent(savedFilters));
        
        if (!Array.isArray(savedFilters)) {
            throw new Error("Format incorrect");
        }
    } catch (error) {
        console.warn(`⚠️ Problème avec le cookie 'filter', réinitialisation...`, error);
        savedFilters = ["Main"];
        setCookie("filter", encodeURIComponent(JSON.stringify(savedFilters)));
    }

    // Met à jour les checkboxes
    checkboxes.forEach(checkbox => {
        checkbox.checked = savedFilters.includes(checkbox.value);
    });

    updateSelectedGroups();
}

///////// 

loadFiltersFromCookie();
