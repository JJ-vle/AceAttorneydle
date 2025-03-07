// life.js
import { removeValidateButtonListener, guessbarDiv } from './guessbar.js';
import { setCookie, streaks } from './cookie.js';
import { gameMode, targetItem } from './data.js';

const defensebar = document.getElementById("defensebar");
const resultDiv = document.getElementById("result");
const finalResultDiv = document.getElementById("finalresult");

//////////// TRIES

export let numTries = 0; // Nombre d'essais

export function incrementNumTries(){
    numTries++;
}
export function resetNumTries(){
    numTries = 0;
}

export function verifyTries(){
    if(hintChecker){
        hintChecker(numTries);
    }
    var defenseLevel = 15 - numTries;

    if(defenseLevel < 0) {
        defenseLevel = 0;
        gameOver(false);
    }

    defensebar.innerHTML = "";
    var img = document.createElement("img");
    img.src = `resources/img/icons/defensebar/defensebar${defenseLevel}.png`;
    img.alt = "Defensebar Image";
    defensebar.appendChild(img);
}

//////////// HINT CHECKER

let hintChecker = null;
export function setHintChecker(newHintChecker){
    hintChecker = newHintChecker;
}

//////////// GAMEOVER

export function gameOver(result){
    guessbarDiv.innerHTML = "";
    removeValidateButtonListener();
    
    let newStreak;
    let message = "";
    let resultClass = "";

    let img;
    let element;
    if( gameMode == "case" ) {
        element = "case";
        img = targetItem.image.replace(/(\/scale-to-width-down\/\d+|\/revision\/latest\/scale-to-width-down\/\d+|\/revision\/latest\?cb=\d+)/g, "");
    } else {
        element = "character";
        img = targetItem.image[0].replace(/(\/scale-to-width-down\/\d+|\/revision\/latest\/scale-to-width-down\/\d+|\/revision\/latest\?cb=\d+)/g, "");
    }

    if (result) {
        console.log("😁 win");
        newStreak = parseInt(streaks[gameMode + "Streak"]) + 1;
        message = `
            🎉 Bravo!<br>
            You found the ${element} of the day.<br>
            <img src="${img}" alt="${element}"><br>
            <strong>${targetItem.name}</strong><br><br>
            🔥 Current Streak: ${newStreak}<br>
            🔢 Number of tries: ${numTries}<br>
            ⏳ Next ${element} at Midnight UTC+2 (Europe)<br>
            🎮 Next mode:
        `;
        resultClass = "win";
    } else {
        console.log("😢 lose");        
        newStreak = 0;
        message = `
            ❌ Lost!<br>
            The ${element} of the day was:<br>
            <img src="${img}" alt="${element}"><br>
            <strong>${targetItem.name}</strong><br><br>
            🔄 Streak reset<br>
            🔢 Number of tries: ${numTries}<br>
            ⏳ Next ${element} at Midnight UTC+2 (Europe)<br>
            🎮 Next mode:
        `;
        resultClass = "lose";
    }

    // Défilement fluide vers la section finale
    finalResultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

    finalResultDiv.style.opacity = 0;
    setTimeout(() => {
        finalResultDiv.style.transition = "opacity 1s";
        finalResultDiv.style.opacity = 1;
    }, 100);

    setCookie(gameMode + "Streak", newStreak);
    displayResult(message, resultClass);
}

function displayResult(message, resultClass) {
    finalResultDiv.innerHTML = "";
    finalResultDiv.className = resultClass;
    
    const messageElement = document.createElement("p");
    messageElement.innerHTML = message;
    finalResultDiv.appendChild(messageElement);
}
