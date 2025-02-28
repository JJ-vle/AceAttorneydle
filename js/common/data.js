//data.js

// Stocke les noms déjà proposés
export let attemptedNames = new Array();
// Charger le fichier JSON contenant les informations des débuts
export let turnaboutGames = {};

// JSON des personnages (Un tableau pour chaque serie)
export let characterData= [];
export let characterDatas = {};

// JSON des citations
export let quoteData = [];
export let quoteDatas = {};

// JSON des citations
export let casesData = [];
export let casesDatas = {};

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

    loadJSON("resources/data/aceattorneychars.json").then(data => {
        characterData = data.filter(isValidCharacter); // Filtrage des personnages valides
        console.log("✅ aceattorneychars.json chargé :", characterData.length, "personnages valides.");
    }).catch(error => console.error("Erreur de chargement de aceattorneychars.json :", error)),

    loadJSON("resources/data/quotes.json").then(data => {
        quoteData = data;
        console.log("✅ quotes.json chargé");
    }).catch(error => console.error("Erreur de chargement de quotes.json :", error)),

    loadJSON("resources/data/cases.json").then(data => {
        casesData = data;
        console.log("✅ cases.json chargé");
    }).catch(error => console.error("Erreur de chargement de cases.json :", error)),

])
.then(() => {
    console.log("🎯 Tous les fichiers JSON sont chargés !");
    filterJSON();
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
    return getGroupByTurnabout(character.debut);
}

// Fonction pour récupérer le groupe d'un personnage
export function getGroupByTurnabout(turnabout) {
    for (let group in turnaboutGames) {
        for (let game in turnaboutGames[group]) {
            if (turnaboutGames[group][game].includes(turnabout)) {
                return group;
            }
        }
    }
    return null;
}

// Fonction pour récupérer tous les "debut" différents
function getUniqueInfo(key) {
    if (!characterData || characterData.length === 0) {
        console.log("No character data available.");
        return [];
    }

    const set = new Set();

    characterData.forEach(character => {
        if (character[key]) {
            set.add(character[key]);
        }
    });

    return Array.from(set);
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

//////////// SELECTED GROUPS //////////////

export let selectedGroups = ["Main"];

export function setSelectedGroups(newSelectedGroups) {
    selectedGroups = newSelectedGroups;
}


let allGroups = ["Main", "Investigation", "Great"];
export function filterJSON(){
    allGroups.forEach(currentGroup => {

        ////// CHARACTERS //////

        // Filtrer les personnages en fonction du groupe sélectionné
        const filteredChar = characterData.filter(character => {
            const group = getGroupByCharacter(character);
            return currentGroup.includes(group);
        });

        characterDatas[currentGroup] = filteredChar;


        const filteredQuotes = quoteData.filter(quote => {
            const group = getGroupByTurnabout(quote.source);
            return currentGroup.includes(group);
        });
        quoteDatas[currentGroup] = filteredQuotes;


        const filteredCases = casesData.filter(turnabout => {
            const group = getGroupByTurnabout(turnabout.name);
            return currentGroup.includes(group);
        });

        casesDatas[currentGroup] = filteredCases;
        
    });

    /*
    console.log(characterDatas["Main"]);
    console.log(characterDatas["Investigation"]);
    console.log(characterDatas["Great"]);
    */
    console.log(quoteDatas["Main"]);
    console.log(quoteDatas["Investigation"]);
    console.log(quoteDatas["Great"]);
    /*
    console.log(casesDatas["Main"]);
    console.log(casesDatas["Investigation"]);
    console.log(casesDatas["Great"]);
    */
    
}
