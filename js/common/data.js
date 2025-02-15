//data.js

// Stocke les noms déjà proposés
export let attemptedNames = new Set();
// Charger le fichier JSON contenant les informations des débuts
export let turnaboutGames = {};

//////////// LOAD TURNABOUTS

fetch("resources/data/turnabouts.json")
    .then(response => response.json())
    .then(data => {
        turnaboutGames = data;
    })
    .catch(error => console.error("Erreur de chargement du fichier turnabout.json :", error));

//////////// GET INFORMATIONS

// Fonction pour récupérer le jeu d'un début d'affaire
export function getInfoByDebut(debut) {
    // Parcours chaque groupe
    for (let group in turnaboutGames) {
        // Parcours chaque jeu dans le groupe
        for (let game in turnaboutGames[group]) {
            if (turnaboutGames[group][game].includes(debut)) {
                return { game: game, group: group }; // Retourne le jeu et son groupe
            }
        }
    }
    return null; // Retourne null si le jeu n'est pas trouvé
}
// Fonction pour récupérer le groupe d'un personnage
export function getGroupByCharacter(character) {
    for (let group in turnaboutGames) {
        for (let game in turnaboutGames[group]) {
            if (turnaboutGames[group][game].includes(character.debut)) {
                return group;
            }
        }
    }
    return null;
}
// Fonction pour récupérer tous les "debut" différents
function getUniqueDebuts() {
    if (!characterData || characterData.length === 0) {
        console.log("No character data available.");
        return [];
    }

    const debutsSet = new Set();

    characterData.forEach(character => {
        if (character.debut) {
            debutsSet.add(character.debut);
        }
    });

    return Array.from(debutsSet);
}

//////////// LOAD CHARACTERS

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

//////////// SELECTED GROUPS

export let selectedGroups = [];

export function setSelectedGroups(newSelectedGroups) {
    selectedGroups = newSelectedGroups;
}
