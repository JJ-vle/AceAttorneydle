// life.js

const defensebar = document.getElementById("defensebar");

//////////// TRIES

export let numTries = 0; // Nombre d'essais

export function incrementNumTries () {
    numTries++;
}

export function verifyTries(){
    if(hintChecker){
        hintChecker(numTries);
    }
    var defenseLevel = 15 - numTries;

    // Si le niveau est plus petit que 1, on le fixe à 1 (tu peux ajuster cela selon tes préférences)
    if(defenseLevel < 0) {
        defenseLevel = 0;
        gameOver();
    }

    // Vide la div defensebar
    defensebar.innerHTML = "";

    // Crée l'image avec le bon niveau de défense
    var img = document.createElement("img");
    img.src = "resources/img/icons/defensebar/defensebar" + defenseLevel + ".png";
    img.alt = "Defensebar Image";

    // Ajoute l'image à la div
    defensebar.appendChild(img);
}

//////////// HINT CHECKER

let hintChecker = null;

export function setHintChecker(newHintChecker) {
    hintChecker = newHintChecker;
}

//////////// GAMEOVER

function gameOver(){
    console.log("GAME OVER");
}
