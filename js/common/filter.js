//filter.js
import { selectCharacterToFind, setSelectedGroups, getGroupByCharacter, getGroupByTurnabout } from './data.js';
import { resetNumTries, verifyTries } from './life.js';


const checkboxes = document.querySelectorAll("#groupFilters input[type='checkbox']");
const historyDiv = document.getElementById("history");

/*const updateButton = document.querySelector("#updateFilters");
updateButton.addEventListener("click", selectCharacterToFind);*/

checkboxes.forEach(checkbox => {
    checkbox.addEventListener("change", () => {
        updateSelectedGroups();
        selectCharacterToFind();
        resetGame();
    });
});

updateSelectedGroups();
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
    // logique :
    // reset history
    // reset lifebar et hintcount
    clearHistoryTable();
    resetNumTries();
    verifyTries();
}

function clearHistoryTable() {
    const historyBody = document.getElementById("historyBody");
    if (historyBody) {
        historyBody.innerHTML = "";
    }
}
