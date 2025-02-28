//filter.js

import { selectCharacterToFind, setSelectedGroups, getGroupByCharacter, getGroupByTurnabout } from './data.js';


// Récupère la liste des checkboxes et ajoute un écouteur d'événement
const checkboxes = document.querySelectorAll("#groupFilters input[type='checkbox']");

const updateButton = document.querySelector("#updateFilters");
updateButton.addEventListener("click", selectCharacterToFind);

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