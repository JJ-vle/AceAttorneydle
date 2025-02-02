let targetCharacter = null;
let characterData = []; // Stocke les personnages
let selectedIndex = -1;
let attemptedNames = new Set(); // Stocke les noms déjà proposés

// Charger les données JSON et initialiser le personnage cible
fetch("resources/data/aceattorneychars.json")
    .then(response => response.json())
    .then(data => {
        characterData = data;
        targetCharacter = data[Math.floor(Math.random() * data.length)];
        //targetCharacter = data.find(character => character.name === "Yanni Yogi");
        console.log("Character to find :", targetCharacter.name);
        
        console.log("Unique debuts:", getUniqueDebuts());
    })
    .catch(error => console.error("JSON loading error :", error));

const inputField = document.getElementById("guessInput");
const suggestionsList = document.getElementById("suggestions");
const validateButton = document.getElementById("validateButton");
const feedback = document.getElementById("feedback");
const historyDiv = document.getElementById("history");

// Assurer la création du tableau dès le début
function createHistoryTable() {
    if (!document.getElementById("historyTable")) {
        historyDiv.innerHTML = `
            <table id="historyTable" class="history-table">
                <thead>
                    <tr>
                        <th>Photo</th>
                        <th>Name</th>
                        <th>Occupation</th>
                        <th>Birth year</th>
                        <th>Eyes color</th>
                        <th>Hair color</th>
                        <th>Debut</th>
                    </tr>
                </thead>
                <tbody id="historyBody"></tbody>
            </table>
        `;
    }
}
createHistoryTable()

// Fonction pour filtrer et afficher les suggestions
inputField.addEventListener("input", function () {
    const query = this.value.toLowerCase();
    suggestionsList.innerHTML = "";
    selectedIndex = -1;

    if (query.length === 0) {
        suggestionsList.style.display = "none";
        validateButton.disabled = true;
        return;
    }

    const matchedCharacters = characterData.filter(c => {
        const englishName = c.name.toLowerCase();
        const frenchNames = (c.french || []).map(f => f.toLowerCase());

        // Retourne vrai si le début du nom anglais ou un nom français correspond à la recherche
        return englishName.startsWith(query) || frenchNames.some(f => f.startsWith(query));
    });

    if (matchedCharacters.length > 0) {
        suggestionsList.style.display = "block";

        matchedCharacters.forEach((character, index) => {
            const listItem = document.createElement("li");
            listItem.textContent = character.name; // N'affiche que le nom anglais
            listItem.dataset.index = index;

            listItem.addEventListener("click", function () {
                selectName(character.name); // Insère uniquement le nom anglais
            });

            suggestionsList.appendChild(listItem);
        });
    } else {
        suggestionsList.style.display = "none";
        validateButton.disabled = true;
    }
});



// Gérer les flèches clavier et validation avec Entrée
inputField.addEventListener("keydown", function (event) {
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
            selectName(items[selectedIndex].textContent);
            // Réinitialiser l'index sélectionné après avoir sélectionné un nom
            selectedIndex = -1; // Réinitialisation de la sélection
            updateSelection(items); // Mise à jour de la sélection (en réinitialisant l'état visuel)
        } else {
            // Si aucun élément n'est sélectionné, on appelle validateGuess
            validateGuess();
        }
    }

    updateSelection(items);
});


// Mise à jour de la sélection visuelle
function updateSelection(items) {
    for (let i = 0; i < items.length; i++) {
        items[i].classList.remove("selected");
    }
    if (selectedIndex >= 0) {
        items[selectedIndex].classList.add("selected");
    }
}

// Sélection d'un nom et fermeture de la liste
function selectName(name) {
    inputField.value = name;
    suggestionsList.style.display = "none";
    validateButton.disabled = false;
}

// Valider la réponse
validateButton.addEventListener("click", validateGuess);

function validateGuess() {
    const guessName = inputField.value.trim();
    if (attemptedNames.has(guessName)) {
        feedback.textContent = "⚠️ This character is already tried !";
        feedback.className = "error";
        return;
    }

    const guessedCharacter = characterData.find(c => c.name.toLowerCase() === guessName.toLowerCase());

    if (!guessedCharacter) {
        feedback.textContent = "⚠️ Unknown character.";
        feedback.className = "error";
        return;
    }

    attemptedNames.add(guessName);

    if (guessName.toLowerCase() === targetCharacter.name.toLowerCase()) {
        addToHistory(guessedCharacter, true);
        feedback.textContent = "🎉 Congratulation ! You found " + targetCharacter.name + " !";
        feedback.className = "success";
    } else {
        addToHistory(guessedCharacter, false);
        feedback.textContent = "❌ wrong awnser, try again !";
        feedback.className = "error";
    }

    inputField.value = "";
    validateButton.disabled = true;
}

// Ajouter un essai sous forme de nouvelle ligne dans le tableau existant
function addToHistory(guessedCharacter, result) {
    createHistoryTable(); // Assure que le tableau est bien créé
    const historyBody = document.getElementById("historyBody");

    //historyItem.innerHTML = result ? "🎉" : "❌";

    /*let imageUrl = guessedCharacter.image && guessedCharacter.image.length > 0 
        ? guessedCharacter.image[0].split(".png")[0] + ".png" 
        : "";*/
    
    let imageUrl = "";
    if (guessedCharacter.image && guessedCharacter.image.length > 0) {
        imageUrl = guessedCharacter.image[0].replace(/(\/scale-to-width-down\/\d+|\/revision\/latest\/scale-to-width-down\/\d+|\/revision\/latest\?cb=\d+)/g, "");
    }

    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td><img src="${imageUrl}" alt="${guessedCharacter.name}" width="100"></td>
        ${compareInfo(guessedCharacter.name, targetCharacter.name)}
        ${compareInfo(guessedCharacter.occupation, targetCharacter.occupation)}
        ${compareInfo(guessedCharacter.birthday, targetCharacter.birthday)}
        ${compareInfo(guessedCharacter.eyes, targetCharacter.eyes)}
        ${compareInfo(guessedCharacter.hair, targetCharacter.hair)}
        ${compareDebut(guessedCharacter.debut, targetCharacter.debut)}
    `;

    historyBody.prepend(newRow); // Ajoute en haut du tableau
}


// Comparer deux valeurs et appliquer la couleur correspondante
function compareInfo(guess, target) {
    // Remplacer les valeurs nulles ou non définies par "Unknown"
    if (!guess || guess === "N/A") {
        guess = "Unknown";
    }
    if (!target || target === "N/A") {
        target = "Unknown";
    }

    // Comparer les valeurs et appliquer la couleur correspondante
    const isCorrect = guess === target;
    return `<td class="${isCorrect ? 'correct' : 'incorrect'}">${guess}</td>`;
}

// Fonction de comparaison des débuts
function compareDebut(guessDebut, targetDebut) {
    if (!guessDebut || guessDebut === "N/A") {
        guessDebut = "Unknown";
    }
    if (!targetDebut || targetDebut === "N/A") {
        targetDebut = "Unknown";
    }

    // Si les débuts sont identiques
    if (guessDebut === targetDebut) {
        return `<td class="correct">${guessDebut}</td>`;
    }

    let colorclass = "incorrect";
    let arrowHint = "";

    // Trouver les groupes et jeux pour chaque début
    const guessInfo = getInfoByDebut(guessDebut);
    const targetInfo = getInfoByDebut(targetDebut);

    if (!guessInfo || !targetInfo) {
        return `<td class=${colorclass}>${guessDebut} error</td>`; // Si un des débuts n'est pas valide
    }

    const guessGroup = guessInfo.group;
    const targetGroup = targetInfo.group;
    const guessGame = guessInfo.game;
    const targetGame = targetInfo.game;

    // Si les deux débuts sont dans le même groupe
    if (guessGroup === targetGroup) {
        const groupGames = turnaboutGames[guessGroup]; // Accède directement aux jeux du groupe

        // Si les deux débuts proviennent du même jeu
        if (guessGame === targetGame) {
            colorclass = "partial"; // Si c'est le même jeu, applique une classe "partielle"
            const guessGameTurnabouts = groupGames[guessGame];
            const targetGameTurnabouts = groupGames[targetGame];

            // Trouver les indices dans les jeux respectifs
            const guessIndex = guessGameTurnabouts.indexOf(guessDebut);
            const targetIndex = targetGameTurnabouts.indexOf(targetDebut);

            // Vérifier si c'est avant ou après dans le même jeu
            if (guessIndex < targetIndex) {
                arrowHint = "⬆️"; // Flèche vers le haut si c'est avant
            } else if (guessIndex > targetIndex) {
                arrowHint = "⬇️"; // Flèche vers le bas si c'est après
            }
        } else {
            // Si les deux débuts sont dans des jeux différents, vérifier l'ordre des jeux
            const allGames = Object.keys(groupGames); // Liste de tous les jeux dans ce groupe
            const guessGameIndex = allGames.indexOf(guessGame);
            const targetGameIndex = allGames.indexOf(targetGame);

            // Vérifier si c'est avant ou après selon l'ordre des jeux
            if (guessGameIndex < targetGameIndex) {
                arrowHint = "⬆️"; // Flèche vers le haut si le jeu deviné est avant
            } else if (guessGameIndex > targetGameIndex) {
                arrowHint = "⬇️"; // Flèche vers le bas si le jeu deviné est après
            }
        }

        return `<td class=${colorclass}>${guessDebut} ${arrowHint}</td>`; // Affiche le résultat avec la flèche
    }

    // Si ce n'est pas le même groupe, alors rouge (incorrect)
    return `<td class=${colorclass}>${guessDebut}</td>`;
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

// Charger le fichier JSON contenant les informations des débuts
let turnaboutGames = {};

fetch("resources/data/turnabouts.json")
    .then(response => response.json())
    .then(data => {
        turnaboutGames = data;
    })
    .catch(error => console.error("Erreur de chargement du fichier turnabout.json :", error));

// Fonction pour récupérer le groupe de chaque personnage
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

// Fonction pour récupérer le jeu d'un début d'affaire
function getInfoByDebut(debut) {
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

