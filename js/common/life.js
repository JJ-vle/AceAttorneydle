// life.js
import { removeValidateButtonListener, guessbarDiv } from './guessbar.js';
import { setCookie, streaks } from './cookie.js';
import { gameMode, targetItem } from './data.js';
import { setFlameCount, recolorFlame } from './streak.js';

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
        hintChecker();
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

export function gameOver(result, fromhistory){
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
        newStreak = parseInt(streaks[gameMode + "Streak"])

        if(!fromhistory) {
            newStreak = parseInt(streaks[gameMode + "Streak"]) + 1;
        }
        
        setFlameCount(newStreak+1);
        recolorFlame();

        if(gameMode != "silhouette"){
            hintChecker(true);
        }

        message = `
            🎉 Bravo!<br>
            You found the ${element} of the day.<br>
            <img src="${img}" alt="${element}"><br>
            <strong>${targetItem.name}</strong><br><br>
            🔥 Current Streak: ${newStreak}<br>
            🔢 Number of tries: ${numTries+1}<br>
            ⏳ Time until next ${element} : ${getTimeUntilNext()}<br>
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
            🔢 Number of tries: ${numTries+1}<br>
            ⏳ Time until next ${element} : ${getTimeUntilNext()}<br>
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

function getTimeUntilNext(){
    const now = new Date();

    // Get current time in UTC
    const utcNow = now.getTime() + now.getTimezoneOffset() * 60000;

    // Calculate the next midnight in GMT+1
    const nextMidnight = new Date(utcNow);
    nextMidnight.setUTCHours(22, 0, 0, 0); // Midnight in GMT+1 (23:00 UTC)
    
    if (utcNow >= nextMidnight.getTime()) {
        nextMidnight.setUTCDate(nextMidnight.getUTCDate() - 1);
    }

    let diff = nextMidnight.getTime() - utcNow;

    // Convert to HH:mm:ss
    const hours = Math.floor(diff / 3600000);
    diff %= 3600000;
    const minutes = Math.floor(diff / 60000);
    diff %= 60000;
    const seconds = Math.floor(diff / 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
}