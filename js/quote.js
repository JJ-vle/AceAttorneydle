let targetCharacter = null;
let characterData = []; // Stocke les personnages
let quoteData = [];
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
const guessbarDiv = document.getElementById("guessbar");

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

    // Filtrer davantage les personnages selon la saisie dans le champ de recherche
    const matchedCharacters = characterData.filter(c => {
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
        guessbarDiv.innerHTML="";
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

//============ LOGIQUE DE SELECTION DE LA QUOTE =============//

// Function to load JSON data
function loadJSON(url) {
    return fetch(url).then(response => response.json());
}

// Load both JSON files in parallel
Promise.all([
    loadJSON("resources/data/aceattorneychars.json"),
    loadJSON("resources/data/quotes.json")
])
.then(([charData, qData]) => {
    characterData = charData;
    quoteData = qData;

    console.log("✅ All data loaded:", characterData.length, "characters and", quoteData.length, "quotes.");

    selectCharacterToFind(); // Now we can safely call the function
})
.catch(error => console.error("JSON loading error:", error));

function selectCharacterToFind() {
    // Function to validate quotes
    function isValidQuote(quote) {
        if (!quote.speaker || !quote.quote || !quote.source || !quote.speaker_url) {
            return false;
        }
        if (quote.bypass) {
            return true;
        }

        const attributes = [quote.speaker, quote.quote, quote.source, quote.speaker_url];
        const validAttributes = attributes.filter(attr => attr && attr !== "N/A" && attr !== "Unknown" && attr !== "Unknow");

        return validAttributes.length >= 3;
    }

    // Filter valid quotes
    let validQuotes = quoteData.filter(isValidQuote);
    if (validQuotes.length === 0) {
        console.error("No valid quotes found!");
        return;
    }

    // Select a random quote
    let targetQuote = validQuotes[Math.floor(Math.random() * validQuotes.length)];

    // Find the matching character by speaker_url
    characterData.forEach((char) => {
        if(char.name == targetQuote.speaker){
            targetCharacter = char
        }   
    })

    hints = {
        game: { icon: document.querySelector("#hint-game .hint-icon"), title: "Game", text: targetQuote.source},
        occupation: { icon: document.querySelector("#hint-occupation .hint-icon"), title: "Occupation", text: targetCharacter.occupation },
        figure: { icon: document.querySelector("#hint-figure .hint-icon"), title: "Figure", image: targetCharacter.image[0].replace(/(\/scale-to-width-down\/\d+|\/revision\/latest\/scale-to-width-down\/\d+|\/revision\/latest\?cb=\d+)/g, "") }
    };

    displayQuote(targetQuote)
    console.log("Character to find (quote) :", targetQuote.speaker);
}

function displayQuote(quote){
    document.getElementById("quote").innerText = quote.quote
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