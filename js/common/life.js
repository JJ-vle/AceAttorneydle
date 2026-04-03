// life.js
import { removeValidateButtonListener, guessbarDiv } from './guessbar.js';
import { setCookie, streaks } from './cookie.js';
import { gameMode, targetItem } from './data.js';
import { setFlameCount, recolorFlame, uncolorFlame } from './streak.js';

const defensebar = document.getElementById("defensebar");
const resultDiv = document.getElementById("result");
const finalResultDiv = document.getElementById("finalresult");

let countdownInterval = null;

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
        const stored = parseInt(streaks[gameMode + "Streak"]) || 0;
        newStreak = fromhistory ? stored : (stored + 1);

        // show the updated streak and color the flame when the user actually won
        setFlameCount(newStreak);
        recolorFlame();

        if(gameMode != "silhouette"){
            hintChecker(true);
        }

        // Build message data for display
        resultClass = "win";
    } else {
        console.log("😢 lose");
        newStreak = 0;
        resultClass = "lose";
    }

    // Défilement fluide vers la section finale
    finalResultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

    finalResultDiv.style.opacity = 0;
    setTimeout(() => {
        finalResultDiv.style.transition = "opacity 1s";
        finalResultDiv.style.opacity = 1;
    }, 100);

    // update stored streak and reflect UI color/count
    setCookie(gameMode + "Streak", newStreak);
    if (newStreak === 0) {
        setFlameCount(0);
        uncolorFlame();
    }
    displayResult(result, resultClass, img, newStreak, element);
}

function displayResult(resultBool, resultClass, imgSrc, streak, elementName) {
    // clear previous countdown if any
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }

    finalResultDiv.innerHTML = "";
    finalResultDiv.className = resultClass;

    // Card container
    const card = document.createElement('div');
    card.className = 'result-card';

    const avatar = document.createElement('img');
    avatar.className = 'avatar';
    avatar.src = imgSrc;
    avatar.alt = targetItem.name || 'result';
    card.appendChild(avatar);

    // Stats column
    const stats = document.createElement('div');
    stats.className = 'result-stats';
    const title = document.createElement('h2');
    title.textContent = resultBool ? '🎉 Bravo!' : '❌ Lost';
    const nameEl = document.createElement('div');
    nameEl.innerHTML = `<strong>${targetItem.name}</strong>`;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `🔢 Number of tries: ${numTries+1}<br>🔥 Streak: ${streak}`;
    stats.appendChild(title);
    stats.appendChild(nameEl);
    stats.appendChild(meta);
    card.appendChild(stats);

    // Countdown
    const countdownWrap = document.createElement('div');
    countdownWrap.className = 'countdown-wrap';
    // countdown ring with animated digit groups
    const ring = document.createElement('div');
    ring.className = 'countdown';
    ring.id = 'countdownTimer';

    const digits = document.createElement('div');
    digits.className = 'digits';
    digits.id = 'countdownDigits';

    // create three groups: HH MM SS
    ['HH','MM','SS'].forEach((d, idx) => {
        const grp = document.createElement('span');
        grp.className = 'digit-group';
        grp.dataset.part = idx; // 0,1,2
        const txt = document.createElement('span');
        txt.className = 'digit-text';
        txt.textContent = d;
        grp.appendChild(txt);
        digits.appendChild(grp);
        if (idx < 2) {
            const sep = document.createElement('span');
            sep.className = 'digit-sep';
            sep.textContent = ':';
            digits.appendChild(sep);
        }
    });

    ring.appendChild(digits);

    countdownWrap.appendChild(ring);
    card.appendChild(countdownWrap);

    finalResultDiv.appendChild(card);

    // Start live countdown and ring update
    function getSecondsUntilNext() {
        const now = new Date();
        const utcNow = now.getTime() + now.getTimezoneOffset() * 60000;
        const nextMidnight = new Date(utcNow);
        nextMidnight.setUTCHours(22,0,0,0); // midnight in GMT+1
        if (utcNow >= nextMidnight.getTime()) {
            nextMidnight.setUTCDate(nextMidnight.getUTCDate() + 1);
        }
        return Math.max(0, Math.floor((nextMidnight.getTime() - utcNow) / 1000));
    }

    function formatHMS(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
    }

    // previous time string to detect changes
    let prevTime = '';

    function updateCountdown() {
        const secondsLeft = getSecondsUntilNext();
        const ringEl = document.getElementById('countdownTimer');
        const digitsEl = document.getElementById('countdownDigits');
        if (!ringEl || !digitsEl) return;
        const totalDay = 24 * 3600;
        const elapsed = totalDay - secondsLeft;
        const pct = Math.max(0, Math.min(100, Math.round((elapsed / totalDay) * 100)));
        // filled portion uses primary blue, remainder is a semi-transparent white layer
        ringEl.style.background = `conic-gradient(var(--blue-primary) ${pct}%, rgba(255,255,255,0.5) ${pct}% )`;

        const timeStr = formatHMS(secondsLeft);
        if (timeStr !== prevTime) {
            // split parts
            const parts = timeStr.split(':');
            let grpIndex = 0;
            const groupEls = digitsEl.querySelectorAll('.digit-group');
            groupEls.forEach((el) => {
                const newText = parts[grpIndex] || '00';
                const textEl = el.querySelector('.digit-text');
                if (textEl.textContent !== newText) {
                    // animate out, swap, animate in
                    el.classList.add('flip-out');
                    el.addEventListener('animationend', function handler(ev) {
                        if (ev.animationName === 'flipOut') {
                            // swap
                            textEl.textContent = newText;
                            el.classList.remove('flip-out');
                            el.classList.add('flip-in');
                        } else if (ev.animationName === 'flipIn') {
                            el.classList.remove('flip-in');
                            el.removeEventListener('animationend', handler);
                        }
                    });
                }
                grpIndex++;
            });
            prevTime = timeStr;
        }
        // label removed: digits display time, no extra text
    }

    // immediate update then every second
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
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