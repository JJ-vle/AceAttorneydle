// life.js
import { removeValidateButtonListener, guessbarDiv } from './guessbar.js';

import { setCookie, streaks } from './cookie.js';
import { gameMode } from './data.js';


const defensebar = document.getElementById("defensebar");

//////////// TRIES

export let numTries = 0; // Nombre d'essais

export function incrementNumTries(){
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
        gameOver(false);
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

export function setHintChecker(newHintChecker){
    hintChecker = newHintChecker;
}

//////////// GAMEOVER
export function gameOver(result){
    guessbarDiv.innerHTML="";
    removeValidateButtonListener();
    
    let newStreak;

    console.log(streaks[gameMode + "Streak"])

    if (result) {
        console.log("😁 win");
        newStreak = parseInt(streaks[gameMode + "Streak"]) + 1;
    } else {
        console.log("😢 lose");        
        newStreak = 0;
    }

    setCookie(gameMode + "Streak", newStreak);

}