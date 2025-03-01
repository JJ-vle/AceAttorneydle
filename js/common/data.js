// data.js

// Stocke les noms déjà proposés
export let attemptedNames = new Array();
// Charger le fichier JSON contenant les informations des débuts
export let turnaboutGames = {};
// JSON des personnages
export let characterData = [];
// JSON des citations
export let quoteData = [];
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

export let dataLoaded = null; // Initialisation de la promesse des données

// Fonction pour vérifier si gameMode et selectedGroups sont définis et charger les données
async function tryLoadData() {
    // Attente que gameMode et selectedGroups soient définis
    await waitUntil();

    // Si les conditions sont remplies, on charge les données
    if (gameMode && selectedGroups.length > 0 && !dataLoaded) {
        loadData();  // Appel à loadData une seule fois
        dataLoaded = true;
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
        //document.dispatchEvent(new Event("dataLoaded")); // Déclenche un événement global
    });
}

async function loadDataFromAPI() {
    try {
        // Charger les données via fetch depuis le serveur backend sur le port 3000
        const [turnaboutsResponse, charactersResponse, quotesResponse, casesResponse] = await Promise.all([
            fetch('http://127.0.0.1:3000/api/turnabouts').then(res => res.json()),
            fetch('http://127.0.0.1:3000/api/characters').then(res => res.json()),
            fetch('http://127.0.0.1:3000/api/quotes').then(res => res.json()),
            fetch('http://127.0.0.1:3000/api/cases').then(res => res.json())
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

export function selectCharacterToFind() {
    // Fait un appel API pour obtenir le personnage à deviner pour le mode et le filtre spécifiés
    fetch(`http://127.0.0.1:3000/api/item-to-find/${gameMode}/${selectedGroups}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération du personnage !");
            }
            return response.json(); // Parse la réponse JSON
        })
        .then(item => {
            if (item) {
                targetItem = item;

                console.log("Character data reçu:", targetItem)
                // Met à jour les indices et autres informations de personnage

                if (gameMode =="silhouette"){
                    imageProcessing(targetItem.image[0].replace(/(\/scale-to-width-down\/\d+|\/revision\/latest\/scale-to-width-down\/\d+|\/revision\/latest\?cb=\d+)/g, "") )
                }

                // Met à jour les indices avec les nouvelles informations
                setHints(targetItem);

                // Logue le personnage à trouver pour la console
                console.log("Character to find :", targetItem.name);
                document.dispatchEvent(new Event("dataLoaded"));
            }
        })
        .catch(error => {
            console.error("Erreur lors du chargement du personnage :", error);
        });
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
        let debutInfo = target.debut ? getInfoByDebut(target.debut) : null;

        if (gameMode == "guess") {
            hints.game = {
                    title: "Game", tries: 3, 
                    icon: document.querySelector("#hint-game .hint-icon"), 
                    element: document.querySelector("#hint-game .hint-count"), 
                    text: debutInfo ? debutInfo.game : "Unknown"
            };
            
        }
        if (gameMode == "quote") {
            target = await getCharacterInformations(target.speaker); // ✅ Attente de la réponse async

            hints.case = {
                title: "Case", tries: 3, 
                icon: document.querySelector("#hint-case .hint-icon"), 
                element: document.querySelector("#hint-case .hint-count"), 
                text: target.debut ? target.debut : "Unknown"
            };
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
async function getCharacterInformations(name) {
    try {
        const response = await fetch(`/api/character/${name}`);
        if (!response.ok) {
            throw new Error("Erreur lors de la récupération du personnage !");
        }
        return await response.json(); // Retourne directement les données JSON
    } catch (error) {
        console.error("Erreur lors du chargement des informations du personnage :", error);
        return null; // Retourne null en cas d'erreur
    }
}
