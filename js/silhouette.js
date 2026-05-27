//silhouette.js

// Importer la fonction depuis un autre fichier
import { setValidateGuessFunction } from './common/guessbar.js';
import { dataLoaded, characterData, targetItem, attemptedNames, setGameMode } from './common/data.js';
import { gameOver, incrementNumTries, verifyTries, numTries } from './common/life.js';
import { setCookieName, updateAttemptsCookie, loadHistory, displayStoredStreak } from './common/cookie.js';

//////////////////

setGameMode("silhouette");
setCookieName("silhouetteAttempts");

//////////////////

const inputField = document.getElementById("guessInput");
const validateButton = document.getElementById("validateButton");
const feedback = document.getElementById("feedback");
const historyDiv = document.getElementById("history");
const silhouetteImg = document.getElementById("silhouette");
const silhouetteControls = document.getElementById("silhouette-controls");

const silhouetteStates = {
    default: "brightness(0)",
    "grayscale-blur": "pixelated-grayscale",
    "color-blur": "pixelated-color",
    original: "original"
};

let currentSilhouetteState = "default";
let currentSilhouetteSource = "";

function getSilhouetteImage() {
    return document.querySelector("#silhouette img");
}

function clearPixelatedPreview() {
    const existingCanvas = document.querySelector("#silhouette canvas");
    if (existingCanvas) {
        existingCanvas.remove();
    }

    const silhouetteImage = getSilhouetteImage();
    if (silhouetteImage) {
        silhouetteImage.style.display = "block";
    }
}

function getCleanSilhouetteSource() {
    const silhouetteImage = getSilhouetteImage();
    if (!silhouetteImage) {
        return "";
    }

    return silhouetteImage.getAttribute("src") || "";
}

function renderPixelatedSilhouette(mode) {
    const silhouetteImage = getSilhouetteImage();
    if (!silhouetteImage) {
        return false;
    }

    const source = silhouetteImage.getAttribute("src");
    if (!source) {
        return false;
    }

    // Restore previous sample sizes for stronger pixelation
    const sampleSize = mode === "grayscale-blur" ? 12 : 16;
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
        try {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            const sampleCanvas = document.createElement("canvas");
            const sampleContext = sampleCanvas.getContext("2d");
            const sourceWidth = image.naturalWidth || image.width;
            const sourceHeight = image.naturalHeight || image.height;

            if (!sourceWidth || !sourceHeight) {
                return;
            }

            const scaledWidth = sampleSize;
            const scaledHeight = Math.max(1, Math.round((sourceHeight / sourceWidth) * scaledWidth));

            sampleCanvas.width = scaledWidth;
            sampleCanvas.height = scaledHeight;
            sampleContext.imageSmoothingEnabled = false;
            sampleContext.drawImage(image, 0, 0, scaledWidth, scaledHeight);

            if (mode === "grayscale-blur") {
                const pixels = sampleContext.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height);
                const data = pixels.data;

                for (let i = 0; i < data.length; i += 4) {
                    const gray = Math.round(data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11);
                    // Restore original darkening factor for clearer pixel blocks
                    const darkGray = Math.max(0, Math.round(gray * 0.45));
                    data[i] = darkGray;
                    data[i + 1] = darkGray;
                    data[i + 2] = darkGray;
                }

                sampleContext.putImageData(pixels, 0, 0);
            }

            canvas.width = sourceWidth;
            canvas.height = sourceHeight;
            context.imageSmoothingEnabled = false;
            context.drawImage(sampleCanvas, 0, 0, sourceWidth, sourceHeight);

            canvas.className = "pixelated-silhouette";
            canvas.style.maxWidth = "100%";
            canvas.style.width = "100%";
            canvas.style.height = "auto";
            canvas.style.display = "block";
            canvas.style.margin = "10px auto";
            canvas.style.imageRendering = "pixelated";
            // No additional blur on the pixelated canvas to preserve pixelation
            canvas.style.filter = "";

            clearPixelatedPreview();
            silhouetteImage.style.display = "none";
            silhouetteImage.parentNode.insertBefore(canvas, silhouetteImage);
        } catch (error) {
            console.warn("Pixelation failed, keeping original silhouette.", error);
        }
    };

    image.onerror = () => {
        console.warn("Could not load silhouette image for pixelation.");
    };

    image.src = source;
    return true;
}

function applySilhouetteState(state) {
    const silhouetteImage = getSilhouetteImage();
    if (!silhouetteImage || !silhouetteStates[state]) {
        return;
    }

    currentSilhouetteState = state;

    if (state === "default") {
        clearPixelatedPreview();
        silhouetteImage.style.filter = silhouetteStates[state];
        silhouetteImage.style.display = "block";
    } else if (state === "original") {
        clearPixelatedPreview();
        silhouetteImage.style.filter = "none";
        silhouetteImage.style.display = "block";
    } else if (state === "grayscale-blur") {
        // Non-pixelated grayscale + strong blur
        clearPixelatedPreview();
        silhouetteImage.style.filter = "grayscale(100%) brightness(0.4) blur(40px)";
        silhouetteImage.style.display = "block";
    } else if (state === "color-blur") {
        // Non-pixelated color + strong blur
        clearPixelatedPreview();
        silhouetteImage.style.filter = "blur(40px)";
        silhouetteImage.style.display = "block";
    } else {
        const applied = renderPixelatedSilhouette(state);
        if (!applied) {
            silhouetteImage.style.filter = "brightness(0)";
        }
    }

    if (silhouetteControls) {
        silhouetteControls.querySelectorAll(".silhouette-control").forEach(button => {
            button.classList.toggle("active", button.dataset.mode === state);
        });
    }
}

function updateSilhouetteControls() {
    if (!silhouetteControls) {
        return;
    }

    const grayscaleButton = silhouetteControls.querySelector('[data-mode="grayscale-blur"]');
    
    const colorButton = silhouetteControls.querySelector('[data-mode="color-blur"]');
    const originalButton = silhouetteControls.querySelector('[data-mode="original"]');
    const defaultButton = silhouetteControls.querySelector('[data-mode="default"]');
    const grayscaleMeta = grayscaleButton?.querySelector("[data-tries-left]");
    const colorMeta = colorButton?.querySelector("[data-tries-left]");
    const originalMeta = originalButton?.querySelector("[data-tries-left]");
    const grayscaleIcon = grayscaleButton?.querySelector("img");
    const colorIcon = colorButton?.querySelector("img");
    const originalIcon = originalButton?.querySelector("img");
    const defaultIcon = defaultButton?.querySelector("img");
    const grayscaleRemaining = Math.max(0, 5 - numTries);
    const colorRemaining = Math.max(0, 10 - numTries);
    const originalRemaining = Math.max(0, 14 - numTries);

    if (defaultIcon) {
        defaultIcon.src = "resources/img/icons/Psyche-Lock-Broken.png";
    }

    if (grayscaleButton) {
        const unlocked = numTries >= 5;
        grayscaleButton.disabled = !unlocked;
        grayscaleButton.classList.toggle("locked", !unlocked);
        if (grayscaleIcon) {
            grayscaleIcon.src = unlocked
                ? "resources/img/icons/Psyche-Lock-Broken.png"
                : "resources/img/icons/Psyche-Lock.png";
        }
        if (grayscaleMeta) {
            grayscaleMeta.textContent = unlocked ? "Unlocked" : `${grayscaleRemaining} tries left`;
        }
    }

    // black-blur control removed; grayscale and color now use non-pixelated blur

    if (colorButton) {
        const unlocked = numTries >= 10;
        colorButton.disabled = !unlocked;
        colorButton.classList.toggle("locked", !unlocked);
        if (colorIcon) {
            colorIcon.src = unlocked
                ? "resources/img/icons/Psyche-Lock-Broken.png"
                : "resources/img/icons/Psyche-Lock.png";
        }
        if (colorMeta) {
            colorMeta.textContent = unlocked ? "Unlocked" : `${colorRemaining} tries left`;
        }
    }

    if (originalButton) {
        const unlocked = numTries >= 14;
        originalButton.disabled = !unlocked;
        originalButton.classList.toggle("locked", !unlocked);
        if (originalIcon) {
            originalIcon.src = unlocked
                ? "resources/img/icons/Black_Psyche-Lock-Broken.png"
                : "resources/img/icons/Black_Psyche-Lock.png";
        }
        if (originalMeta) {
            originalMeta.textContent = unlocked ? "Unlocked" : `${originalRemaining} tries left`;
        }
    }
}

// Assurer la création du tableau dès le début
export function createHistoryTable() {
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

if (silhouetteControls) {
    silhouetteControls.addEventListener("click", event => {
        const button = event.target.closest(".silhouette-control");
        if (!button || button.disabled) {
            return;
        }

        applySilhouetteState(button.dataset.mode);
    });
}

updateSilhouetteControls();

function validateGuess(guessName=inputField.value.trim(), fromhistory=false) {

    if (!targetItem) {
        feedback.textContent = "⚠️ Target character not found!";
        feedback.className = "error";
        return;
    }

    if (attemptedNames.includes(guessName)) {
        feedback.textContent = "⚠️ This character has already been guessed !";
        feedback.className = "error";
        return;
    }

    const guessedCharacter = characterData.find(c => c.name.toLowerCase() === guessName.toLowerCase());
    //console.log(guessedCharacter);
    //console.log(guessName);

    if (!guessedCharacter) {
        console.log("HIHOUUUUUU 7");
        feedback.textContent = "⚠️ Unknown character.";
        feedback.className = "error";
        return;
    }

    attemptedNames.push(guessName);
    updateAttemptsCookie();

    if (guessName.toLowerCase() === targetItem.name.toLowerCase()) {
        addToHistory(guessedCharacter, true);


        const silhouetteImage = document.querySelector("#silhouette img");
        if (silhouetteImage) {
            silhouetteImage.style.filter = "none";
        }

        //silhouetteImg.children[0].style.filter = ""
        feedback.textContent = "🎉 Congratulation ! You found " + targetItem.name + " !";
        feedback.className = "success";
        
        gameOver(true, fromhistory);
    } else {
        addToHistory(guessedCharacter, false);
        feedback.textContent = "❌ wrong answer, try again !";
        feedback.className = "error";
    }

    incrementNumTries();
    verifyTries();
    updateSilhouetteControls();
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
        <td class="single-cell-oneth ${compareInfoClass(guessedCharacter.name, targetItem.name)}" >
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

function imageProcessing(imgSrc) {
    currentSilhouetteSource = imgSrc;
    const imgElement = document.createElement("img");
    imgElement.src = imgSrc;
    imgElement.alt = "Silhouette du personnage";
    
    // Applique un filtre noir complet
    imgElement.style.filter = "brightness(0)";
    imgElement.style.height = "auto";
    imgElement.style.maxWidth = "100%";
    imgElement.style.display = "block";
    imgElement.style.margin = "10px auto"; // Centre l'image

    silhouetteImg.innerHTML = ''
    silhouetteImg.appendChild(imgElement);

    currentSilhouetteState = "default";
    updateSilhouetteControls();
    applySilhouetteState("default");
}
function checkCorrectGroups(groups){
    checkboxes.forEach(checkbox => {
        // Check if the checkbox's value is in the provided list
        checkbox.checked = groups.includes(checkbox.value);
    });
}

//////////// DOMCONTENTLOADED

async function initGame() {
    while (!dataLoaded) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    await dataLoaded;
    //console.log("🚀 Les données sont prêtes, on peut commencer !");

    setValidateGuessFunction(validateGuess);
    displayStoredStreak();
    loadHistory();
    updateSilhouetteControls();
    applySilhouetteState(currentSilhouetteState);

}

initGame();
