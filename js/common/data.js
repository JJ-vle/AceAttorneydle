//data.js

// Stocke les noms déjà proposés
export let attemptedNames = new Set();
// Charger le fichier JSON contenant les informations des débuts
export let turnaboutGames = {};
// JSON des personnages
export let characterData = [];
// JSON des citations
export let quoteData = [];
// Mode de jeu
export let gameMode;

export function setGameMode(gm) {
    gameMode = gm;
}

//////////// LOAD TURNABOUTS

// Fonction pour charger un fichier JSON et retourner une Promise
function loadJSON(url) {
    return fetch(url).then(response => response.json());
}

// Créer une Promise qui attend le chargement des trois fichiers JSON
export let dataLoaded = Promise.all([
    loadJSON("resources/data/turnabouts.json").then(data => {
        turnaboutGames = data;
        console.log("✅ turnabouts.json chargé");
    }).catch(error => console.error("Erreur de chargement de turnabout.json :", error)),

    loadJSON("resources/data/quotes.json").then(data => {
        quoteData = data;
        console.log("✅ quotes.json chargé");
    }).catch(error => console.error("Erreur de chargement de quotes.json :", error)),

    loadJSON("resources/data/aceattorneychars.json").then(data => {
        characterData = data.filter(isValidCharacter); // Filtrage des personnages valides
        console.log("✅ aceattorneychars.json chargé :", characterData.length, "personnages valides.");
    }).catch(error => console.error("Erreur de chargement de aceattorneychars.json :", error))
])
.then(() => {
    console.log("🎯 Tous les fichiers JSON sont chargés !");
    document.dispatchEvent(new Event("dataLoaded")); // Déclenche un événement global
});

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

// Fonction pour filtrer les personnages
function isValidCharacter(character) {

    if (!character.image || character.exception == "unusable" || character.image === "N/A" || character.image === "Unknown" || character.image === "Unknow") {
        return false;
    }
    if(gameMode == "silhouette" && character.exception == "unusable-silhouette"){
        return false;
    }
    if (character.bypass) {
        return true;
    }

    const attributes = [
        character.name,
        character.status,
        character.gender,
        character.birthday,
        character.eyes,
        character.hair,
        character.debut
    ];

    // Filtrer les valeurs valides (excluant "N/A", "Unknown", "Unknow", null)
    const validAttributes = attributes.filter(attr => attr && attr !== "N/A" && attr !== "Unknown" && attr !== "Unknow");

    // Garder seulement les personnages ayant au moins 4 attributs valides
    return validAttributes.length >= 4;
}

let selectCharacterToFindFunction = null;

// Fonction pour définir validateGuess depuis l'extérieur
export function setSelectCharacterToFindFunction(func) {
    selectCharacterToFindFunction = func;
}

//////////// SELECTED GROUPS

export let selectedGroups = ["Ace Attorney"];

export function setSelectedGroups(newSelectedGroups) {
    selectedGroups = newSelectedGroups;
}
