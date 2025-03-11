// data.js
//import { collapseAllHints, hintChecker } from './hint.js';
//import { setCookie } from './cookie.js';

// Stocke les noms déjà proposés
export let attemptedNames = new Array();
export function resetAttemptedNames(){
    attemptedNames = new Array();
}
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
// Personnage à trouver
export let targetItem = null;
// JSON des indices
export let hints = {};

// Mode de jeu
export let gameMode;
export function setGameMode(gm) {
    gameMode = gm;
    tryLoadData();
}
// Filtres par jeu
export let selectedGroups = [];
export function setSelectedGroups(newSelectedGroups) {
    selectedGroups = newSelectedGroups;
    tryLoadData();
}

let tryDataLoaded = null;
export let dataLoaded = null; // Initialisation de la promesse des données
export let ItemFound = null; // Initialisation de la promesse des données

// Fonction pour vérifier si gameMode et selectedGroups sont définis et charger les données
async function tryLoadData() {
    // Attente que gameMode et selectedGroups soient définis
    await waitUntil();

    // Si les conditions sont remplies, on charge les données
    if (gameMode && selectedGroups.length > 0 && !tryDataLoaded) {
        loadData();  // Appel à loadData une seule fois
        tryDataLoaded = true;
    }
}
// Fonction pour vérifier que le gameMode et selectedGroups sont définis
async function waitUntil() {
    while (!(gameMode && selectedGroups.length > 0)) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

//////////// LOAD TURNABOUTS

async function loadData() {
    // Si les données sont déjà chargées, on arrête ici
    if (dataLoaded) {
        return;
    }

    await waitUntil();  // Attends que gameMode et selectedGroups soient définis
    dataLoaded = Promise.all([
        loadDataFromAPI(),
        selectCharacterToFind()
    ])
    .then(() => {
        console.log("🎯 Tous les fichiers JSON sont chargés !");
        document.dispatchEvent(new Event("dataLoaded")); // Déclenche un événement global

    });
}

async function loadDataFromAPI() {
    try {
        // Charger les données via fetch depuis le serveur backend sur le port 3000
        const [turnaboutsResponse, charactersResponse, quotesResponse, casesResponse] = await Promise.all([
            fetch('https://ace-attorneydle-api.vercel.app/api/turnabouts').then(res => res.json()),
            fetch('https://ace-attorneydle-api.vercel.app/api/characters').then(res => res.json()),
            fetch('https://ace-attorneydle-api.vercel.app/api/quotes').then(res => res.json()),
            fetch('https://ace-attorneydle-api.vercel.app/api/cases').then(res => res.json())
        ]);

        // Assigner les données aux variables globales
        turnaboutGames = turnaboutsResponse;
        characterData = charactersResponse;
        quoteData = quotesResponse;
        casesData = casesResponse;

        console.log("✅ Toutes les données chargées depuis l'API");

    } catch (error) {
        console.error("Erreur lors du chargement des données depuis l'API :", error);
    }
}

export async function selectCharacterToFind(reload=false) {
    try {
        const response = await fetch(`https://ace-attorneydle-api.vercel.app/api/item-to-find/${gameMode}/${selectedGroups}`);
        
        if (!response.ok) {
            throw new Error("Erreur lors de la récupération du personnage !");
        }

        const item = await response.json();
        if (item) {
            targetItem = item;
            console.log("✅ Personnage récupéré :", targetItem);

            if (gameMode =="silhouette"){
                imageProcessing(targetItem.image[0].replace(/(\/scale-to-width-down\/\d+|\/revision\/latest\/scale-to-width-down\/\d+|\/revision\/latest\?cb=\d+)/g, "") )
            } else if (gameMode =="quote") {
                document.getElementById("quote").innerText = targetItem.quote;
            } else if (gameMode == "case") {
                displayEvidence();
                revealNextEvidence();
            }

            setHints(targetItem);
            //collapseAllHints();
            //hintChecker();
            if (reload) {
                window.location.reload();
            }            
        }
    } catch (error) {
        console.error("Erreur lors du chargement du personnage :", error);
    }
}

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

const silhouetteImg = document.getElementById("silhouette");
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

async function setHints(target) {
    if (gameMode == "case") {
        hints = {
            cause: {
                title: "Death cause", tries: 3,
                icon: document.querySelector("#hint-cause .hint-icon"),
                element: document.querySelector("#hint-cause .hint-count"), 
                text: target.cause || "Unknown"
            },
            locations: {
                title: "Locations", tries: 7,
                icon: document.querySelector("#hint-locations .hint-icon"),
                element: document.querySelector("#hint-locations .hint-count"),
                text: target.locations || "Unknown"
            },
            victim: {
                title: "Victim", tries: 12,
                icon: document.querySelector("#hint-victim .hint-icon"),
                element: document.querySelector("#hint-victim .hint-count"),
                text: target.victim || "Unknown"
            }
            /*image: {
                title: "Image", tries: 12,
                icon: document.querySelector("#hint-image .hint-icon"),
                element: document.querySelector("#hint-image .hint-count"),
                image: targetCase.image.replace(/(\/scale-to-width-down\/\d+|\/revision\/latest\/scale-to-width-down\/\d+|\/revision\/latest\?cb=\d+)/g, ""),
                clear: true
            }*/
        };
    } else {
        let debutInfo = getInfoByDebut(target.debut);
        //console.log("DEBUT -->", target.debut);
        
        if (!debutInfo) {
            //console.warn("⚠️ Aucune information trouvée pour le début :", target.debut);
            debutInfo = { game: "Unknown", group: "Unknown" };
        }
        
        //console.log("DEBUT -->", target.debut, "|", debutInfo.game);
        
        if (gameMode == "guess") {
            hints.game = {
                    title: "Game", tries: 3, 
                    icon: document.querySelector("#hint-game .hint-icon"), 
                    element: document.querySelector("#hint-game .hint-count"), 
                    //text: debutInfo ? debutInfo.game : "Unknown"
                    text: debutInfo.game
            };
            
        }
        if (gameMode == "quote") {
            hints.case = {
                title: "Case", tries: 3, 
                icon: document.querySelector("#hint-case .hint-icon"), 
                element: document.querySelector("#hint-case .hint-count"), 
                text: target.source ? target.source : "Unknown"
            };
            target = await getCharacterInformations(target.speaker); // ✅ Attente de la réponse async
            targetItem = target;
        }

        // ✅ Ajout des autres hints correctement
        Object.assign(hints, {
            occupation: {
                title: "Occupation", tries: 7, 
                icon: document.querySelector("#hint-occupation .hint-icon"), 
                element: document.querySelector("#hint-occupation .hint-count"), 
                text: target.occupation || "Unknown"
            },
            figure: {
                title: "Figure", tries: 12, 
                icon: document.querySelector("#hint-figure .hint-icon"), 
                element: document.querySelector("#hint-figure .hint-count"), 
                image: target.image && target.image.length > 0 
                    ? target.image[0].replace(/(\/scale-to-width-down\/\d+|\/revision\/latest\/scale-to-width-down\/\d+|\/revision\/latest\?cb=\d+)/g, "") 
                    : "default.jpg"
            }
        });
    }

    console.log("🟢 Hints générés :", hints);
    return hints;
}

export async function getCharacterInformations(name) {
    try {
        const response = await fetch(`https://ace-attorneydle-api.vercel.app/api/character/${encodeURIComponent(name)}`);
        if (!response.ok) {
            throw new Error("Erreur lors de la récupération du personnage !");
        }
        return await response.json(); // Retourne directement les données JSON
    } catch (error) {
        console.error("Erreur lors du chargement des informations du personnage :", error);
        return null; // Retourne null en cas d'erreur
    }
}

////////////////// EVIDENCE DISPLAY

const evidenceContainer = document.getElementById("evidence-container");

let currentEvidenceIndex = 0;
let maxEvidence = 15; // Nombre maximum d'éléments affichables

function createEvidenceDiv(evidence) {
    if (document.querySelectorAll(".evidence-item").length >= maxEvidence) return;

    const div = document.createElement("div");
    div.classList.add("evidence-item");

    // Création des coins avec des spans
    const topLeft = document.createElement("span");
    topLeft.classList.add("corner", "corner-top-left");

    const topRight = document.createElement("span");
    topRight.classList.add("corner", "corner-top-right");

    const bottomLeft = document.createElement("span");
    bottomLeft.classList.add("corner", "corner-bottom-left");

    const bottomRight = document.createElement("span");
    bottomRight.classList.add("corner", "corner-bottom-right");

    // Création de l'image cachée par défaut
    const img = document.createElement("img");
    img.src = "/resources/img/icons/hiddenEvidence.png"; // Image cachée par défaut
    img.dataset.revealSrc = evidence.image.replace(/(\/scale-to-width-down\/\d+|\/revision\/latest\/scale-to-width-down\/\d+|\/revision\/latest\?cb=\d+)/g, "");
    img.classList.add("evidence-image");

    // Création du titre (nom de la preuve)
    const title = document.createElement("p");
    title.textContent = evidence.name;
    // Ne pas masquer le titre via style.display, le CSS s'en chargera

    // Ajout des éléments au div principal
    div.appendChild(topLeft);
    div.appendChild(topRight);
    div.appendChild(bottomLeft);
    div.appendChild(bottomRight);
    div.appendChild(img);
    div.appendChild(title);

    // Ajout au conteneur principal
    evidenceContainer.appendChild(div);
}

function displayEvidence() {
    if (targetItem.evidence.length < maxEvidence) {
        maxEvidence = targetItem.evidence.length;
    }
    const caseEvidence = targetItem.evidence.slice(0, maxEvidence); // Limite aux 15 premiers éléments
    caseEvidence.forEach(createEvidenceDiv);
}

function revealNextEvidence() {
    const evidenceItems = document.querySelectorAll(".evidence-item");
    if (currentEvidenceIndex < Math.min(evidenceItems.length, maxEvidence)) {
        const div = evidenceItems[currentEvidenceIndex]; 
        const img = div.querySelector(".evidence-image");
        const name = div.querySelector("p");
        
        img.src = img.dataset.revealSrc; // Affiche la vraie image
        div.classList.add("revealed"); // Marque l'évidence comme révélée
        name.style.display = "block"; // Permet au hover de fonctionner

        currentEvidenceIndex++;
    }
}

function revealAllEvidence() {
    const evidenceItems = document.querySelectorAll(".evidence-item");

    for (let i = currentEvidenceIndex; i < Math.min(evidenceItems.length, maxEvidence); i++) {
        const div = evidenceItems[i];
        const img = div.querySelector(".evidence-image");
        const name = div.querySelector("p");

        img.src = img.dataset.revealSrc;
        div.classList.add("revealed"); // Marque l'évidence comme révélée
        name.style.display = "block"; // Permet au hover de fonctionner
    }

    currentEvidenceIndex = maxEvidence;
}
