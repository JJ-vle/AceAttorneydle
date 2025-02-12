let targetCharacter = null;
let characterData = []; // Stocke les personnages
let selectedIndex = -1;
let attemptedNames = new Set(); // Stocke les noms déjà proposés
let selectedGroups; //Groupes sélectionnés et validés
let numTries=0; // Nombre d'essais
let hints = {};

//////////////////

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
                        <th>Status</th>
                        <th>Gender</th>
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
    const query = this.value.toLowerCase().trim();
    suggestionsList.innerHTML = "";
    selectedIndex = -1;

    if (query.length === 0) {
        suggestionsList.style.display = "none";
        validateButton.disabled = true;
        return;
    }

    // Filtrer les personnages en fonction des groupes cochés
    const filteredCharacters = characterData.filter(c => {
        const group = getGroupByCharacter(c); // Trouver le groupe du personnage
        return selectedGroups.includes(group); // Vérifier si le groupe du personnage est sélectionné
    });

    // Filtrer davantage les personnages selon la saisie dans le champ de recherche
    const matchedCharacters = filteredCharacters.filter(c => {
        if (attemptedNames.has(c.name)) return false; // Exclure les personnages déjà proposés
        
        const englishName = c.name.toLowerCase();
        const englishSurname = englishName.split(" ").pop(); // Récupère le nom de famille
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
            //let imageUrl = character.image?.[0]?.replace(/(\/scale-to-width-down\/\d+|\/revision\/latest\/scale-to-width-down\/\d+|\/revision\/latest\?cb=\d+)/g, "");
            
            listItem.innerHTML = `
                <img src="${imageUrl}" alt="${character.name}" width="30" height="30" class="suggestion-img">
                <span>${character.name}</span>
            `;
            
            listItem.addEventListener("click", function () {
                selectName(character.name);
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
            selectName(items[selectedIndex].textContent.trim());
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
    if (!targetCharacter) {
        feedback.textContent = "⚠️ The game is still loading. Please wait...";
        feedback.className = "error";
        return;
    }

    const guessName = inputField.value.trim();
    if (attemptedNames.has(guessName)) {
        feedback.textContent = "⚠️ This character has already been guessed !";
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
        feedback.textContent = "❌ wrong answer, try again !";
        feedback.className = "error";
    }
    numTries++;
    verifyTries();
    //console.log(numTries);
    inputField.value = "";
    validateButton.disabled = true;
}

// Ajouter un essai sous forme de nouvelle ligne dans le tableau existant
function addToHistory(guessedCharacter, result) {
    createHistoryTable(); // Assure que le tableau est bien créé
    const historyBody = document.getElementById("historyBody");

    //historyItem.innerHTML = result ? "🎉" : "❌";
    
    let imageUrl = "";
    if (guessedCharacter.image && guessedCharacter.image.length > 0) {
        imageUrl = guessedCharacter.image[0].replace(/(\/scale-to-width-down\/\d+|\/revision\/latest\/scale-to-width-down\/\d+|\/revision\/latest\?cb=\d+)/g, "");
    }

    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td class="tableimage"><img src="${imageUrl}" alt="${guessedCharacter.name}" width="100"></td>
        ${compareInfo(guessedCharacter.name, targetCharacter.name)}
        ${compareInfo(guessedCharacter.status, targetCharacter.status)}
        ${compareInfo(guessedCharacter.gender, targetCharacter.gender)}
        ${compareBirthday(guessedCharacter.birthday, targetCharacter.birthday)}
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

// Fonction de comparaison des dates de naissances
function compareBirthday(guessBirthday, targetBirthday) {
    if (!guessBirthday || guessBirthday === "N/A") {
        guessBirthday = "Unknown";
    }
    if (!targetBirthday || targetBirthday === "N/A") {
        targetBirthday = "Unknown";
    }

    // Si les deux dates sont exactement les mêmes
    if (guessBirthday === targetBirthday) {
        return `<td class="correct">${guessBirthday}</td>`;
    }

    let colorClass = "incorrect";
    let arrowHint = "";

    // Convertir les siècles en années approximatives
    function parseYear(yearStr) {
        if (yearStr.includes("19th")) return [1800];
        if (yearStr.includes("20th")) return [1900];
        if (yearStr.includes("21st")) return [2000];
        if (yearStr.includes("7th")) return [600];
        if (yearStr.includes("17th")) return [1600];

        let years = yearStr.split("-").map(y => parseInt(y.trim())); // Toujours un tableau
        return years.length > 1 ? years : [years[0]]; // Si une seule année, on la met dans un tableau
    }

    let guessedYears = guessBirthday !== "Unknown" ? parseYear(guessBirthday) : [];
    let targetYears = targetBirthday !== "Unknown" ? parseYear(targetBirthday) : [];

    // Si l'un des deux est "Unknown", pas de comparaison ni de flèche
    if (guessBirthday === "Unknown" || targetBirthday === "Unknown") {
        return `<td class="${colorClass}">${guessBirthday}</td>`;
    }

    // Vérifier si au moins une des années devinées correspond
    if (targetYears.some(year => guessedYears.includes(year))) {
        colorClass = "partial";
    } else {
        // Vérifier si la date devinée est plus grande ou plus petite
        let minGuessed = Math.min(...guessedYears);
        let minTarget = Math.min(...targetYears);

        if (minGuessed < minTarget) {
            arrowHint = "bigger"; // Trop ancien
        } else {
            arrowHint = "lower"; // Trop récent
        }
    }

    return `<td class="${colorClass} ${arrowHint}">${guessBirthday}</td>`;
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
                arrowHint = "bigger"; // Flèche vers le haut si c'est avant
            } else if (guessIndex > targetIndex) {
                arrowHint = "lower"; // Flèche vers le bas si c'est après
            }
        } else {
            // Si les deux débuts sont dans des jeux différents, vérifier l'ordre des jeux
            const allGames = Object.keys(groupGames); // Liste de tous les jeux dans ce groupe
            const guessGameIndex = allGames.indexOf(guessGame);
            const targetGameIndex = allGames.indexOf(targetGame);

            // Vérifier si c'est avant ou après selon l'ordre des jeux
            if (guessGameIndex < targetGameIndex) {
                arrowHint = "bigger"; // Flèche vers le haut si le jeu deviné est avant
            } else if (guessGameIndex > targetGameIndex) {
                arrowHint = "lower"; // Flèche vers le bas si le jeu deviné est après
            }
        }

        return `<td class="${colorclass} ${arrowHint}">${guessDebut}</td>`; // Affiche le résultat avec la flèche
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

// Récupère la liste des checkboxes et ajoute un écouteur d'événement
const checkboxes = document.querySelectorAll("#groupFilters input[type='checkbox']");
//checkboxes.forEach(checkbox => checkbox.addEventListener("change", filterCharacters));

const updateButton = document.querySelector("#updateFilters");
updateButton.addEventListener("click", selectCharacterToFind);

// Fonction pour filtrer les personnages en fonction des groupes cochés
function filterCharacters() {
    selectedGroups = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    //console.log("📌 Groups :", selectedGroups);
    //console.log("📌 Data :", characterData.length, "characters available.");

    // Filtrer les personnages en fonction du groupe sélectionné
    const filtered = characterData.filter(character => {
        const group = getGroupByCharacter(character);
        return selectedGroups.includes(group);
    });

    //console.log("📌 Filter :", filtered.length, "characters found.");

    return filtered;
}

// Charger les données JSON et initialiser le personnage cible
fetch("resources/data/aceattorneychars.json")
    .then(response => response.json())
    .then(data => {
        characterData = data;

        console.log("✅ Data loaded :", characterData.length, "characters.");

        selectCharacterToFind();
        
        //console.log("Unique debuts:", getUniqueDebuts());
    })
    .catch(error => console.error("JSON loading error :", error));

function selectCharacterToFind(){

    // Fonction pour filtrer les personnages
    function isValidCharacter(character) {

        if (!character.image  || character.exception == "unusable" || character.image === "N/A" || character.image === "Unknown" || character.image === "Unknow") {
            return false;
        }
        if (character.bypass){
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

    // Filtrer les personnages
    characterData = characterData.filter(isValidCharacter);
    //console.log("✅ Validated data :", characterData.length, "characters after filtering.");

    let filteredData = filterCharacters();
    if (filteredData.length > 0) {
        targetCharacter = filteredData[Math.floor(Math.random() * filteredData.length)];
        //targetCharacter = data.find(character => character.name === "Yanni Yogi");

        hints = {
            game: { icon: document.querySelector("#hint-game .hint-icon"), title: "Game", text: getInfoByDebut(targetCharacter.debut).game },
            occupation: { icon: document.querySelector("#hint-occupation .hint-icon"), title: "Occupation", text: targetCharacter.occupation },
            figure: { icon: document.querySelector("#hint-figure .hint-icon"), title: "Figure", image: targetCharacter.image[0].replace(/(\/scale-to-width-down\/\d+|\/revision\/latest\/scale-to-width-down\/\d+|\/revision\/latest\?cb=\d+)/g, "") }
        };

        console.log("Character to find :", targetCharacter.name);
    } else {
        console.warn("No characters available after filtering!");
    }
}

const hintDetails = document.getElementById("hint-details");
const hintHeader = document.getElementById("hint-details-header");
const hintContent = document.getElementById("hint-details-content");

// Fonction pour afficher le cadre avec un titre spécifique
function showHintContainer(title) {
    hintDetails.style.display = "block"; // Affiche le cadre
    hintHeader.textContent = title || "Hint"; // Définit le titre avec la valeur donnée
}

// Fonction pour ajouter un texte
function addHint(title, text) {
    if (!text) return;
    showHintContainer(title);

    const hintElement = document.createElement("p");
    hintElement.textContent = text;
    hintContent.appendChild(hintElement);
}

// Fonction pour ajouter une image
function addHintImage(title, imgSrc) {
    if (!imgSrc) return;
    showHintContainer(title);

    const hintElement = document.createElement("img");
    hintElement.src = imgSrc;
    hintElement.alt = "Figure";
    hintElement.classList.add("hint-image");

    hintContent.appendChild(hintElement);
}

// Fonction pour vider les hints et cacher le cadre si vide
function clearHints() {
    hintContent.innerHTML = "";
    hintDetails.style.display = "none"; // Cache le cadre si plus de contenu
}


// Variable pour suivre le hint actuellement affiché
let currentHint = null;

function unlockHint(hint) {
    hints[hint].icon.classList.add("active");
    hints[hint].icon.classList.remove("disabled");
    hints[hint].icon.style.cursor = "pointer";

    // On enlève tous les anciens écouteurs pour éviter la duplication
    hints[hint].icon.removeEventListener("click", toggleHint);
    hints[hint].icon.addEventListener("click", function () {
        toggleHint(hint);
    });
}

function toggleHint(hint) {
    // Si on clique sur le même hint, on le cache
    if (currentHint === hint) {
        clearHints();
        currentHint = null;
    } else {
        // Sinon, on change le hint affiché
        clearHints();
        if (hints[hint].text) {
            addHint(hints[hint].title, hints[hint].text);
        }
        if (hints[hint].image) {
            addHintImage(hints[hint].title, hints[hint].image);
        }
        currentHint = hint; // Met à jour le hint affiché
    }
}






const hintCounts = {
    game: { tries: 3, element: document.querySelector("#hint-game .hint-count"), icon: document.querySelector("#hint-game .hint-icon") },
    occupation: { tries: 8, element: document.querySelector("#hint-occupation .hint-count"), icon: document.querySelector("#hint-occupation .hint-icon") },
    figure: { tries: 15, element: document.querySelector("#hint-figure .hint-count"), icon: document.querySelector("#hint-figure .hint-icon") }
};



// Fonction pour mettre à jour les "hint-counts"
function updateHintCounts() {
    for (let key in hintCounts) {
        let remainingTries = hintCounts[key].tries - numTries;
        if (remainingTries > 0) {
            hintCounts[key].element.textContent = `in ${remainingTries} tries`;
        } else {
            hintCounts[key].element.textContent = "Unlocked!";
        }
    }
}


function hintChecker() {
    if (numTries === 3) {
        unlockHint("game");
        //document.querySelector("#hint-game img").src = "resources/img/icons/Psyche-Lock-Broken.png"
        hintCounts.game.icon.src = "resources/img/icons/Psyche-Lock-Broken.png";
    }
    if (numTries === 8) {
        unlockHint("occupation");
        //document.querySelector("#hint-game img").src = "resources/img/icons/Psyche-Lock-Broken.png"
        hintCounts.occupation.icon.src = "resources/img/icons/Psyche-Lock-Broken.png";
    }
    if (numTries === 15) {
        unlockHint("figure");
        //document.querySelector("#hint-game img").src = "resources/img/icons/Black_Psyche-Lock-Broken.png"
        hintCounts.figure.icon.src = "resources/img/icons/Black_Psyche-Lock-Broken.png";
    }
    updateHintCounts(); // Met à jour l'affichage des essais restants
}

// Initialisation des textes au début de la partie
updateHintCounts();

function verifyTries(){
    hintChecker();
    var defenseLevel = 15 - numTries;

    // Si le niveau est plus petit que 1, on le fixe à 1 (tu peux ajuster cela selon tes préférences)
    if(defenseLevel < 0) {
        defenseLevel = 0;
        gameOver();
    }

    // Vide la div defensebar
    document.getElementById("defensebar").innerHTML = "";

    // Crée l'image avec le bon niveau de défense
    var img = document.createElement("img");
    img.src = "resources/img/icons/defensebar/defensebar" + defenseLevel + ".png";
    img.alt = "Defensebar Image";

    // Ajoute l'image à la div
    document.getElementById("defensebar").appendChild(img);
}



function gameOver(){
    console.log("GAME OVER");
}