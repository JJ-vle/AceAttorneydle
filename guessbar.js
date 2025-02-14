// guessbar.js
import { turnaboutGames, characterData, selectedGroups, attemptedNames } from './data.js';

let selectedIndex = -1;
let validateGuessFunction = null;

export const inputField = document.getElementById("guessInput");
export const suggestionsList = document.getElementById("suggestions");
export const validateButton = document.getElementById("validateButton");

//////////////////// EVENTLISTENERS

// Ajouter l'écouteur d'événement en utilisant la fonction importée
inputField.addEventListener("input", function () {
    handleInput(this.value, characterData, selectedGroups, attemptedNames, validateButton, selectName);
});
// Gérer les flèches clavier et validation avec Entrée
inputField.addEventListener("keydown", function (event) {
    handleKeyboard(event);
});
// Valider la réponse
validateButton.addEventListener("click", function () {
    if (validateGuessFunction) {
        validateGuessFunction();
    }
});

////////////////// FONCTIONS

// Fonction pour filtrer et afficher les suggestions
export function handleInput(query, characterData, selectedGroups, attemptedNames) {
    query = query.toLowerCase().trim();
    suggestionsList.innerHTML = "";

    if (query.length === 0) {
        suggestionsList.style.display = "none";
        validateButton.disabled = true;
        return;
    }

    // Filtrer les personnages en fonction des groupes cochés
    const filteredCharacters = characterData.filter(c => {
        const group = getGroupByCharacter(c); // Supposons que cette fonction est définie ailleurs
        return selectedGroups.includes(group);
    });

    // Filtrer davantage les personnages selon la saisie dans le champ de recherche
    const matchedCharacters = filteredCharacters.filter(c => {
        if (attemptedNames.has(c.name)) return false;

        const englishName = c.name.toLowerCase();
        const englishSurname = englishName.split(" ").pop();
        const frenchNames = (c.french || []).map(f => f.toLowerCase());
        const frenchSurnames = frenchNames.map(f => f.split(" ").pop());

        return (
            englishName.startsWith(query) ||
            englishSurname.startsWith(query) ||
            frenchNames.some(f => f.startsWith(query)) ||
            frenchSurnames.some(f => f.startsWith(query))
        );
    });

    // Trier les personnages par nom avant de les afficher
    matchedCharacters.sort((a, b) => a.name.localeCompare(b.name));

    if (matchedCharacters.length > 0) {
        suggestionsList.style.display = "block";

        matchedCharacters.forEach((character, index) => {
            const listItem = document.createElement("li");
            listItem.dataset.index = index;

            let mugshotUrl = character.mugshot?.replace(/(\/scale-to-width-down\/\d+|\/revision\/latest\/scale-to-width-down\/\d+|\/revision\/latest\?cb=\d+)/g, "");
            let imageUrl = mugshotUrl || character.image?.[0]?.replace(/(\/scale-to-width-down\/\d+|\/revision\/latest\/scale-to-width-down\/\d+|\/revision\/latest\?cb=\d+)/g, "");

            listItem.innerHTML = `
                <img src="${imageUrl}" alt="${character.name}" width="30" height="30" class="suggestion-img">
                <span>${character.name}</span>
            `;

            listItem.addEventListener("click", function () {
                selectName(character.name); // Appeler la fonction selectName passée en argument
            });

            suggestionsList.appendChild(listItem);
        });
    } else {
        suggestionsList.style.display = "none";
        validateButton.disabled = true;
    }
}

export function handleKeyboard(event){
    const items = suggestionsList.getElementsByTagName("li");

    if (event.key === "ArrowDown") {
        event.preventDefault();
        if (selectedIndex < items.length - 1) {
            selectedIndex++;
        }
    } else if (event.key === "ArrowUp") {
        event.preventDefault();
        if (selectedIndex > 0) {
            selectedIndex--;
        }
    } else if (event.key === "Enter") {
        event.preventDefault();

        if (selectedIndex >= 0) {
            // Si un élément est sélectionné, on le sélectionne et met à jour la sélection
            selectName(items[selectedIndex].textContent.trim());
            // Réinitialiser l'index sélectionné après avoir sélectionné un nom
            selectedIndex = -1; // Réinitialisation de la sélection
            updateSelection(items); // Mise à jour de la sélection (en réinitialisant l'état visuel)
        } else {
            // Si aucun élément n'est sélectionné, on appelle validateGuess
            validateGuessFunction();
        }
    }

    updateSelection(items);
}

// Sélection d'un nom et fermeture de la liste
export function selectName(name) {
    inputField.value = name;
    suggestionsList.style.display = "none";
    validateButton.disabled = false;
}

// Fonction pour récupérer le groupe d'un personnage
function getGroupByCharacter(character) {
    for (let group in turnaboutGames) {
        for (let game in turnaboutGames[group]) {
            if (turnaboutGames[group][game].includes(character.debut)) {
                return group;
            }
        }
    }
    return null;
}

// Mise à jour de la sélection visuelle
function updateSelection(items) {
    for (let i = 0; i < items.length; i++) {
        items[i].classList.remove("selected");
    }
    if (selectedIndex >= 0) {
        items[selectedIndex].classList.add("selected");
    }
}

// Fonction pour définir validateGuess depuis l'extérieur
export function setValidateGuessFunction(func) {
    validateGuessFunction = func;
}