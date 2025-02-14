//data.js

// Stocke les noms déjà proposés
export let attemptedNames = new Set();

// Charger le fichier JSON contenant les informations des débuts
export let turnaboutGames = {};

fetch("resources/data/turnabouts.json")
    .then(response => response.json())
    .then(data => {
        turnaboutGames = data;
    })
    .catch(error => console.error("Erreur de chargement du fichier turnabout.json :", error));

////////////

export let characterData = [];

// Charger les données JSON et initialiser le personnage cible
fetch("resources/data/aceattorneychars.json")
    .then(response => response.json())
    .then(data => {
        characterData = data; // Réaffectation de characterData avec les données chargées

        console.log("✅ Data loaded :", characterData.length, "characters.");

        selectCharacterToFindFunction();
    })
    .catch(error => console.error("JSON loading error :", error));

let selectCharacterToFindFunction = null;

// Fonction pour définir validateGuess depuis l'extérieur
export function setSelectCharacterToFindFunction(func) {
    selectCharacterToFindFunction = func;
}

////////////

export let selectedGroups = [];

export function setSelectedGroups(newSelectedGroups) {
    selectedGroups = newSelectedGroups;
}


