let targetCharacter = null;
let characterData = []; // Stocke les personnages
let selectedIndex = -1;
let attemptedNames = new Set(); // Stocke les noms déjà proposés
let selectedGroups; //Groupes sélectionnés et validés
let numTries=0; // Nombre d'essais
//////////////////

const inputField = document.getElementById("guessInput");
const suggestionsList = document.getElementById("suggestions");
const validateButton = document.getElementById("validateButton");
const feedback = document.getElementById("feedback");
const historyDiv = document.getElementById("history");
const silhouetteImg = document.getElementById("silhouette");

// Assurer la création du tableau dès le début
function createHistoryTable() {
    if (!document.getElementById("historyTable")) {
        historyDiv.innerHTML = `
            <table id="historyTable" class="history-table">
                <thead>
                    <tr>
                        <th>Character</th>
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
        silhouetteImg.children[0].style.filter = ""
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

    let imageUrl = "";
    if (guessedCharacter.image && guessedCharacter.image.length > 0) {
        imageUrl = guessedCharacter.image[0].replace(/(\/scale-to-width-down\/\d+|\/revision\/latest\/scale-to-width-down\/\d+|\/revision\/latest\?cb=\d+)/g, "");
    }

    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td class="single-cell-oneth ${compareInfoClass(guessedCharacter.name, targetCharacter.name)}" >
            <div class="image-container-oneth">
                <img src="${imageUrl}" alt="${guessedCharacter.name}" class="centered-image-oneth">
            </div>
            <div class="name-below-oneth">${guessedCharacter.name}</div>
        </td>
    `;

    historyBody.prepend(newRow); // Ajoute en haut du tableau
}

// Comparer deux valeurs et appliquer la couleur correspondante
function compareInfoClass(guess, target) {
    // Remplacer les valeurs nulles ou non définies par "Unknown"
    if (!guess || guess === "N/A") {
        guess = "Unknown";
    }
    if (!target || target === "N/A") {
        target = "Unknown";
    }

    // Comparer les valeurs et appliquer la couleur correspondante
    const isCorrect = guess === target;
    return isCorrect ? 'correct' : 'incorrect';
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

        if (!character.image  || character.exception == "unusable" || character.exception == "unusable-silhouette" || character.image === "N/A" || character.image === "Unknown" || character.image === "Unknow") {
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

        imageProcessing(targetCharacter.image[0].replace(/(\/scale-to-width-down\/\d+|\/revision\/latest\/scale-to-width-down\/\d+|\/revision\/latest\?cb=\d+)/g, "") )
        console.log("Character to find :", targetCharacter.name);
    } else {
        console.warn("No characters available after filtering!");
        //selectCharacterToFind();
    }
}

function imageProcessing(imgSrc) {
    const imgElement = document.createElement("img");
    imgElement.src = imgSrc;
    imgElement.alt = "Silhouette du personnage";
    
    // Applique un filtre noir complet
    imgElement.style.filter = "brightness(0)";
    imgElement.style.height = "auto";
    imgElement.style.maxWidth = "1500px";
    imgElement.style.display = "block";
    imgElement.style.margin = "10px auto"; // Centre l'image

    silhouetteImg.innerHTML = ''
    silhouetteImg.appendChild(imgElement);
}

function verifyTries(){
    // Calcul du niveau de défense (10 - numTries / 2)
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