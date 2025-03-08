// guessbar.js

import { characterData, casesData, selectedGroups, attemptedNames, getGroupByCharacter, getGroupByTurnabout, gameMode } from './data.js';

let selectedIndex = -1;
export let validateGuessFunction = null;
export function setValidateGuessFunction(func) {
    validateGuessFunction = func;
}

export const guessbarDiv = document.getElementById("guessbar");
export const inputField = document.getElementById("guessInput");
export const suggestionsList = document.getElementById("suggestions");
export const validateButton = document.getElementById("validateButton");

//////////////////// EVENTLISTENERS

// Ajouter l'écouteur d'événement en utilisant la fonction importée
inputField.addEventListener("input", function () {
    handleInput(this.value, validateButton, selectName);
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
export function removeValidateButtonListener() {
    if (validateButton) {
        validateButton.removeEventListener("click", validateGuessFunction);
    }
}

////////////////// FONCTIONS

// Fonction pour filtrer et afficher les suggestions
export function handleInput(query) {
    query = query.toLowerCase().trim();
    suggestionsList.innerHTML = "";

    if (query.length === 0) {
        suggestionsList.style.display = "none";
        if (validateButton){
            validateButton.disabled = true;
        }
        return;
    }

    const dataToUse = gameMode === "case" ? casesData : characterData;

    const filteredItems = dataToUse.filter(c => {
        const group = gameMode === "case" ? getGroupByTurnabout(c.name) : getGroupByCharacter(c);
        return selectedGroups.includes(group);
    });
    

    const matchedItems = gameMode === "case" ? searchMatchedCases(filteredItems, query) : searchMatchedCharacters(filteredItems, query);

    matchedItems.sort((a, b) => a.name.localeCompare(b.name));

    if (matchedItems.length > 0) {
        suggestionsList.style.display = "block";

        matchedItems.forEach((character, index) => {
            const listItem = document.createElement("li");
            listItem.dataset.index = index;

            let imageUrl;
            
            if (gameMode === "case") {
                imageUrl = character.image?.replace(/(\/scale-to-width-down\/\d+|\/revision\/latest\/scale-to-width-down\/\d+|\/revision\/latest\?cb=\d+)/g, "");
            } else {
                let mugshotUrl = character.mugshot?.replace(/(\/scale-to-width-down\/\d+|\/revision\/latest\/scale-to-width-down\/\d+|\/revision\/latest\?cb=\d+)/g, "");
                imageUrl = mugshotUrl || character.image?.[0]?.replace(/(\/scale-to-width-down\/\d+|\/revision\/latest\/scale-to-width-down\/\d+|\/revision\/latest\?cb=\d+)/g, "");
            }

            listItem.innerHTML = `
                <img src="${imageUrl}" alt="${character.name}" width="30" height="30" class="suggestion-img">
                <span>${character.name}</span>
            `;

            listItem.addEventListener("click", function () {
                selectName(character.name);
                validateGuessFunction();
            });

            suggestionsList.appendChild(listItem);
        });
    } else {
        suggestionsList.style.display = "none";
        if (validateButton){
            validateButton.disabled = true;
        }
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

        if (selectedIndex < 0) {
            selectedIndex = 0;
        }
        if (items[selectedIndex]) {
            selectName(items[selectedIndex].textContent.trim());
            selectedIndex = -1; // Réinitialisation de la sélection
            updateSelection(items)
            validateGuessFunction();
        }

    }

    updateSelection(items);
}

function searchMatchedCharacters(filteredItems, query) {
    const queryParts = query.toLowerCase().split(" "); // Diviser la requête en plusieurs mots

    return filteredItems.filter(c => {
        if (attemptedNames.includes(c.name)) return false;

        const englishNameParts = c.name.toLowerCase().split(" "); // Diviser le nom anglais en parties
        const frenchNamesParts = (c.french || []).map(f => f.toLowerCase().split(" ")); // Diviser les noms français en parties

        // Vérifier si tous les segments de la requête correspondent à une partie du nom
        return (
            // Vérification sur le nom anglais
            queryParts.every(queryPart => 
                englishNameParts.some(namePart => namePart.startsWith(queryPart))
            ) ||
            // Vérification sur le nom français
            frenchNamesParts.some(frenchNameParts =>
                queryParts.every(queryPart => 
                    frenchNameParts.some(namePart => namePart.startsWith(queryPart))
                )
            )
        );
    });
}

function searchMatchedCases(filteredItems, query) {
    const queryParts = query.toLowerCase().split(" ");

    return filteredItems.filter(c => {
        if (attemptedNames.includes(c.name)) return false;

        const englishNameParts = c.name.toLowerCase().split(" ");
        const frenchNameParts = c.name.toLowerCase().split(" ");

        // Vérifier si tous les segments de la requête correspondent à une partie du nom
        return (
            queryParts.every(queryPart => 
                englishNameParts.some(namePart => namePart.startsWith(queryPart))
            ) ||
            queryParts.every(queryPart => 
                frenchNameParts.some(namePart => namePart.startsWith(queryPart))
            )
        );
    });
}

// Sélection d'un nom et fermeture de la liste
export function selectName(name) {
    inputField.value = name;
    suggestionsList.style.display = "none";
    if (validateButton){
        validateButton.disabled = true;
    }
}

// Mise à jour de la sélection visuelle
function updateSelection(items) {
    for (let i = 0; i < items.length; i++) {
        items[i].classList.remove("selected");
    }
    if (selectedIndex >= 0 && items[selectedIndex]) {
        items[selectedIndex].classList.add("selected");
    }
}
