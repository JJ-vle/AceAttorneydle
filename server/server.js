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

// Point de terminaison pour vérifier un essai (cela pourrait gérer le processus de validation)
app.post('/api/guess', (req, res) => {
    const { guessName } = req.body;
    const guessedCharacter = characterData.find(c => c.name.toLowerCase() === guessName.toLowerCase());
    
    if (!guessedCharacter) {
        return res.status(400).json({ error: "Unknown character" });
    }

    // Vérifiez si l'utilisateur a deviné correctement (exemple de comparaison)
    const correctGuess = guessedCharacter.name === req.body.targetCharacterName; // à adapter selon la logique du jeu
    return res.json({ correct: correctGuess });
});

// Lancer le serveur sur le port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
