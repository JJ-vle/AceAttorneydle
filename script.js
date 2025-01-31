let targetCharacter = null;
let characterData = []; // Stocke les personnages
let selectedIndex = -1;
let attemptedNames = new Set(); // Stocke les noms déjà proposés

// Charger les données JSON et initialiser le personnage cible
fetch("aceattorneychars.json")
    .then(response => response.json())
    .then(data => {
        characterData = data;
        targetCharacter = data[Math.floor(Math.random() * data.length)];
        console.log("Personnage à trouver :", targetCharacter.name);
    })
    .catch(error => console.error("Erreur de chargement du JSON :", error));

const inputField = document.getElementById("guessInput");
const suggestionsList = document.getElementById("suggestions");
const validateButton = document.getElementById("validateButton");
const feedback = document.getElementById("feedback");
const historyDiv = document.getElementById("history");

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

    const filteredNames = characterData
        .map(c => c.name)
        .filter(name => name.toLowerCase().startsWith(query) && !attemptedNames.has(name));

    if (filteredNames.length > 0) {
        suggestionsList.style.display = "block";
        filteredNames.forEach((name, index) => {
            const listItem = document.createElement("li");
            listItem.textContent = name;
            listItem.dataset.index = index;

            listItem.addEventListener("click", function () {
                selectName(name);
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
        feedback.textContent = "⚠️ Ce personnage a déjà été proposé !";
        feedback.className = "error";
        return;
    }

    const guessedCharacter = characterData.find(c => c.name.toLowerCase() === guessName.toLowerCase());

    if (!guessedCharacter) {
        feedback.textContent = "⚠️ Personnage non reconnu.";
        feedback.className = "error";
        return;
    }

    attemptedNames.add(guessName); // Ajouter le nom aux tentatives

    if (guessName.toLowerCase() === targetCharacter.name.toLowerCase()) {
        addToHistory(guessedCharacter, true);
        feedback.textContent = "🎉 Bravo ! Tu as trouvé " + targetCharacter.name + " !";
        feedback.className = "success";
    } else {
        addToHistory(guessedCharacter, false);
        feedback.textContent = "❌ Mauvaise réponse, essaie encore !";
        feedback.className = "error";
    }

    inputField.value = "";
    validateButton.disabled = true;
}

// Ajouter un essai dans l'historique avec comparaison
function addToHistory(guessedCharacter, result) {
    const historyItem = document.createElement("div");
    historyItem.classList.add("history-item");

    historyItem.innerHTML = result ? "🎉" : "❌";
    historyItem.innerHTML += `
        <p><strong>Nom :</strong> ${compareInfo(guessedCharacter.name, targetCharacter.name)}</p>
        <p><strong>Occupation :</strong> ${compareInfo(guessedCharacter.occupation, targetCharacter.occupation)}</p>
        <p><strong>Année de naissance :</strong> ${compareInfo(guessedCharacter.birthday, targetCharacter.birthday)}</p>
        <p><strong>Couleur des yeux :</strong> ${compareInfo(guessedCharacter.eyes, targetCharacter.eyes)}</p>
        <p><strong>Couleur des cheveux :</strong> ${compareInfo(guessedCharacter.hair, targetCharacter.hair)}</p>
        <p><strong>Début dans la série :</strong> ${compareInfo(guessedCharacter.debut, targetCharacter.debut)}</p>
    `;

    // Extraire l'image et couper après .png
    if (guessedCharacter.image && guessedCharacter.image.length > 0) {
        let imageUrl = guessedCharacter.image[0]; // Prendre la première image
        imageUrl = imageUrl.split(".png")[0] + ".png"; // Supprimer tout après .png
        
        historyItem.innerHTML += `<img src="${imageUrl}" alt="${guessedCharacter.name}" width="100">`;
    }

    historyDiv.prepend(historyItem);
}

// Comparer deux valeurs et appliquer la couleur correspondante
function compareInfo(guess, target) {
    return guess === target 
        ? `<span class="correct">${guess}</span>` 
        : `<span class="incorrect">${guess}</span>`;
}
