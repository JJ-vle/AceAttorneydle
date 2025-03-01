const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();

// Configuration pour utiliser CORS
app.use(cors());
app.use(bodyParser.json());

// Charger les fichiers JSON
let turnaboutGames = require('../resources/data/turnabouts.json');
let characterData = require('../resources/data/aceattorneychars.json');
let quoteData = require('../resources/data/quotes.json');
let casesData = require('../resources/data/cases.json');

// Structure pour stocker les files d'attente
let gameQueues = {
    guess: { Main: [], Investigation: [], Great: [] },
    silhouette: { Main: [], Investigation: [], Great: [] },
    quote: { Main: [], Investigation: [], Great: [] },
    case: { Main: [], Investigation: [], Great: [] }
};
let gamePriority = {
    guess: ["Main", "Great", "Investigation"],
    silhouette: ["Investigation", "Main", "Great"],
    quote: ["Great", "Main", "Investigation"],
    case: ["Main", "Investigation", "Great"]
};


function shufflePriorities() {
    Object.keys(gamePriority).forEach(mode => {
        shuffleArray(gamePriority[mode]);
    });
}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function filterByGroup(data, group) {
    return data.filter(item => getGroupByTurnabout(item.debut) === group);
}
function getGroupByTurnabout(turnabout) {
    for (let group in turnaboutGames) {
        for (let game in turnaboutGames[group]) {
            if (turnaboutGames[group][game].includes(turnabout)) {
                return group;
            }
        }
    }
    return null;
}

// Initialisation des files d'attente
function initializeQueues() {
    ['Main', 'Investigation', 'Great'].forEach(group => {
        gameQueues.guess[group] = filterByGroup(characterData, group);
        shuffleArray(gameQueues.guess[group]);
        
        gameQueues.silhouette[group] = filterByGroup(characterData, group);
        shuffleArray(gameQueues.silhouette[group]);
        
        gameQueues.quote[group] = filterByGroup(quoteData, group);
        shuffleArray(gameQueues.quote[group]);
        
        gameQueues.case[group] = filterByGroup(casesData, group);
        shuffleArray(gameQueues.case[group]);
    });
    console.log("✅ Files d'attente initialisées et mélangées.");
    shufflePriorities();
    console.log(gamePriority.guess);
}
initializeQueues();

// Fonction pour retirer le premier élément des files d'attente
function rotateQueues() {
    shufflePriorities();
    Object.keys(gameQueues).forEach(mode => {
        Object.keys(gameQueues[mode]).forEach(group => {
            if (gameQueues[mode][group].length > 0) {
                gameQueues[mode][group].shift();
                console.log(`${mode} - ${group}     ` + gameQueues[mode][group][0].name);
            }
            if (gameQueues[mode][group].length === 0) {
                //console.log(`🔄 Recharge de la liste ${mode} - ${group}`);
                gameQueues[mode][group] = filterByGroup(
                    mode === 'quote' ? quoteData : mode === 'case' ? casesData : characterData,
                    group
                );
                shuffleArray(gameQueues[mode][group]);
            }
        });
    });
    console.log("🔄 Rotation des files d'attente effectuée.");
}

// Supprime le premier élément toutes les 5 minutes
setInterval(rotateQueues, 5 * 60 * 1000);

app.get('/api/item-to-find/:mode/:filter?', (req, res) => {
    const { mode, filter } = req.params;

    if (!gameQueues[mode] || !gamePriority[mode]) {
        return res.status(400).json({ error: "Mode invalide" });
    }

    let selectedItem = null;

    // Liste des groupes à vérifier
    let filtersToCheck = filter ? filter.split(',') : gamePriority[mode];

    // Trier les groupes selon leur priorité dans gamePriority[mode]
    filtersToCheck.sort((a, b) => gamePriority[mode].indexOf(a) - gamePriority[mode].indexOf(b));

    // Vérifier chaque groupe dans l'ordre de priorité
    for (let group of filtersToCheck) {
        if (gameQueues[mode][group] && gameQueues[mode][group].length > 0) {
            selectedItem = gameQueues[mode][group][0];
            break;
        }
    }

    if (!selectedItem) {
        return res.status(500).json({ error: "Aucun élément disponible" });
    }

    res.json(selectedItem);
});

//////////////////////////// GET FULL JSON

// Point de terminaison pour récupérer tous les personnages
app.get('/api/characters', (req, res) => {
    res.json(characterData);
});
// Point de terminaison pour récupérer les citations
app.get('/api/quotes', (req, res) => {
    res.json(quoteData);
});
// Point de terminaison pour récupérer les affaires
app.get('/api/cases', (req, res) => {
    res.json(casesData);
});
// Point de terminaison pour obtenir des informations de jeu (exemple de filtrage par groupe)
app.get('/api/turnabouts', (req, res) => {
    res.json(turnaboutGames);
});

// Lancer le serveur sur le port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
