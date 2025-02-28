const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
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

// Structure pour stocker les personnages par mode et filtre
let gameState = {
    guess: {
        Main: null,
        Investigation: null,
        Great: null,
    },
    silhouette: {
        Main: null,
        Investigation: null,
        Great: null,
    },
    quote: {
        Main: null,
        Investigation: null,
        Great: null,
    },
    case: {
        Main: null,
        Investigation: null,
        Great: null,
    },
};

//////////////////////////// GET ITEMS TO FIND

// Fonction utilitaire pour générer un index stable basé sur la date
function generateIndexForDate(dateString, length) {
    const hash = crypto.createHash('sha256').update(dateString).digest('hex');
    const index = parseInt(hash.substring(0, 8), 16); // Prenons un extrait du hash
    return index % length; // Retourne un index valide dans la plage de la liste
}

// Fonction pour récupérer le groupe d'un personnage
function getGroupByCharacter(character) {
    return getGroupByTurnabout(character.debut);
}
// Fonction pour récupérer le groupe d'un personnage ou d'une affaire par le "debut"
function getGroupByTurnabout(turnabout) {
    for (let group in turnaboutGames) {
        for (let game in turnaboutGames[group]) {
            if (turnaboutGames[group][game].includes(turnabout)) {
                return group;
            }
        }
    }
    return null; // Retourne null si aucun groupe n'est trouvé
}

// Fonction pour sélectionner un personnage ou une affaire en fonction du groupe
function getDailyCharacterForMode(mode, group) {
    const date = new Date().toISOString().split('T')[0]; // Date actuelle en format "YYYY-MM-DD"
    const charactersInGroup = characterData.filter(character => getGroupByCharacter(character) === group);
    const index = generateIndexForDate(date, charactersInGroup.length); // Génère un index stable basé sur la date
    return charactersInGroup[index]; // Retourne un personnage du groupe
}
// Fonction pour sélectionner une affaire en fonction du groupe
function getDailyCaseForMode(group) {
    const date = new Date().toISOString().split('T')[0]; // Date actuelle en format "YYYY-MM-DD"
    const casesInGroup = casesData.filter(c => getGroupByTurnabout(c) === group);
    const index = generateIndexForDate(date, casesInGroup.length); // Génère un index stable basé sur la date
    return casesInGroup[index]; // Retourne une affaire du groupe
}

// Fonction pour initialiser le gameState avec des éléments aléatoires pour chaque filtre et mode
function initializeGameState() {
    // Pour chaque mode, affecter un personnage à chaque filtre (Main, Investigation, Great)
    Object.keys(gameState).forEach(mode => {
        Object.keys(gameState[mode]).forEach(filter => {
            if (mode === 'guess' || mode === 'silhouette' || mode === 'quote') {
                // Sélectionner un groupe basé sur le filtre
                const group = filter;
                
                // Choisir un personnage distinct pour chaque mode et groupe
                const selectedCharacter = getDailyCharacterForMode(mode, group);
                
                // Mettre à jour l'état du jeu avec le personnage sélectionné et son groupe
                gameState[mode][filter] = { ...selectedCharacter, group }; 
            }
        });
    });

    // Affectation des affaires de manière similaire, mais pour les modes de jeu concernés
    Object.keys(gameState.case).forEach(filter => {
        const group = filter;
        const selectedCase = getDailyCaseForMode(group);
        gameState.case[filter] = selectedCase;
    });

    console.log("🎯 Initialisation du jeu terminée.");
}

initializeGameState();

// Fonction pour mettre à jour périodiquement les personnages et affaires
function updateGameStatePeriodically() {
    setInterval(() => {
        initializeGameState(); // Réinitialise les personnages et affaires à deviner
        console.log("🎯 Le personnage et l'affaire ont été mis à jour.");
    }, 24 * 60 * 60 * 1000); // 24 heures * 60 minutes * 60 secondes * 1000 pour obtenir 1 jour
}

// Appel de la fonction pour mettre à jour périodiquement les personnages
updateGameStatePeriodically();

// Point de terminaison pour récupérer le personnage ou l'affaire à deviner en fonction du mode et des groupes
app.get('/api/item-to-find/:mode/:filter', (req, res) => {
    const { mode, filter } = req.params;

    const validModes = ['guess', 'silhouette', 'quote', 'case'];
    const validFilters = ['Main', 'Investigation', 'Great'];

    if (!validModes.includes(mode)) {
        return res.status(400).json({ error: "Mode invalide" });
    }

    // Récupération des groupes passés dans l'URL (si plusieurs groupes sont présents)
    const groups = filter.split(','); 

    // Vérifier que tous les groupes sont valides
    const invalidGroups = groups.filter(group => !validFilters.includes(group));
    if (invalidGroups.length > 0) {
        return res.status(400).json({ error: `Groupes invalides: ${invalidGroups.join(', ')}` });
    }

    // Choisir un groupe en fonction de la date
    const date = new Date().toISOString().split('T')[0]; // Date actuelle en format "YYYY-MM-DD"
    const index = generateIndexForDate(date, groups.length); // Utiliser l'index stable basé sur la date
    const selectedGroup = groups[index]; // Choisir le groupe basé sur l'index

    // Récupérer le personnage ou l'affaire à partir du groupe sélectionné
    let currentGame;
    currentGame = gameState[mode][selectedGroup];


    if (!currentGame) {
        return res.status(500).json({ error: "Aucun personnage ou affaire à deviner" });
    }

    res.json(currentGame);
});

// Point de terminaison pour vérifier un essai
app.post('/api/guess', (req, res) => {
    const { guessName, mode, filter } = req.body;

    if (!guessName || !mode || !filter) {
        return res.status(400).json({ error: "Nom, mode et filtre requis" });
    }

    // Vérification de la validité du mode et du filtre
    const validModes = ['guess', 'silhouette', 'quote'];
    const validFilters = ['Main', 'Investigation', 'Great'];

    if (!validModes.includes(mode) || !validFilters.includes(filter)) {
        return res.status(400).json({ error: "Mode ou filtre invalide" });
    }

    const guessedGame = gameState[mode][filter];

    if (!guessedGame || guessedGame.name.toLowerCase() !== guessName.toLowerCase()) {
        return res.json({ correct: false, message: "Mauvaise réponse. Essayez encore!" });
    }

    return res.json({ correct: true, message: "Bonne réponse!" });
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
