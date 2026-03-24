///// COOKIE & CONSENT SETUP /////

// Import de tes fonctions existantes
import { gameMode, getGroupByCharacter, getGroupByTurnabout, selectedGroups, getCharacterInformations, attemptedNames, resetAttemptedNames } from './data.js';
import { validateGuessFunction } from './guessbar.js';
import { hideFlame, setFlameCount, uncolorFlame } from './streak.js';

// ==========================
// CONSENT MANAGEMENT
// ==========================

// Affiche la banner si l'utilisateur n'a pas encore accepté/refusé
export function initCookieConsent() {
    const consent = localStorage.getItem('cookiesAccepted');

    if (consent === 'true') {
        initGameCookies();
    } else if (consent === 'false') {
        // ne rien faire
    } else {
        showConsentBanner();
    }

    // bouton "changer d'avis"
    const changeBtn = document.getElementById('change-cookie-preferences');
    if (changeBtn) {
        changeBtn.addEventListener('click', () => {
            showConsentBanner(); // réaffiche la bannière
        });
    }
}


export function showConsentBanner() {
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.innerHTML = `
        <p>
            We use cookies to improve your gameplay experience. 
            <button id="accept-cookies">Accept</button>
            <button id="reject-cookies">Reject</button>
        </p>
    `;
    document.getElementById('banner-placeholder').appendChild(banner);

    // styles inline (ou via CSS importé)
    banner.style.position = 'fixed';
    banner.style.bottom = '0';
    banner.style.left = '0';
    banner.style.width = '100%';
    banner.style.backgroundColor = 'rgba(0,0,0,0.85)';
    banner.style.color = 'white';
    banner.style.padding = '15px 20px';
    banner.style.textAlign = 'center';
    banner.style.zIndex = '9999';
    banner.style.display = 'block';

    document.getElementById('accept-cookies').addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        banner.remove();
        console.log('Cookies acceptés');
        initGameCookies();
    });

    document.getElementById('reject-cookies').addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'false');
        banner.remove();
        console.log('Cookies refusés');
    });
}


// ==========================
// GAME COOKIES
// ==========================

export let streaks = {};
export let guessesCookie = null;
export let cookieBaseName = null; // base name set by pages (e.g. 'guessAttempts')

export function setCookieName(newCookieName){
    cookieBaseName = newCookieName;
}

// Build a cookie name that includes game mode and active groups so different
// filter combinations produce separate histories.
function getCookieName() {
    const base = cookieBaseName || 'attempts';
    const mode = gameMode || 'unknownmode';
    const groups = Array.isArray(selectedGroups) && selectedGroups.length > 0
        ? selectedGroups.join('|')
        : 'all';
    return `${base}_${mode}_${encodeURIComponent(groups)}`;
}

export function updateAttemptsCookie() {
    // Ne sauvegarde que si l'utilisateur a accepté
    if(localStorage.getItem('cookiesAccepted') === 'true'){
        const name = getCookieName();
        setCookieAttempt(name, encodeURIComponent(JSON.stringify(attemptedNames)));
    }
}

function initGameCookies() {
    streaks.guessStreak = setupStreakCookie("guessStreak");
    streaks.silhouetteStreak = setupStreakCookie("silhouetteStreak");
    streaks.quoteStreak = setupStreakCookie("quoteStreak");
    streaks.caseStreak = setupStreakCookie("caseStreak");
}

function setupStreakCookie(name){
    const raw = readCookie(name);
    let streak = 0;
    if (raw && raw.length > 0 && !isNaN(parseInt(raw, 10))) {
        streak = parseInt(raw, 10);
    }

    setCookie(name, streak);
    // show stored streak in grey until user wins the current day
    uncolorFlame();
    setFlameCount(streak);
    return streak;
}

// ==========================
// LOAD HISTORY
// ==========================

export async function loadHistory() {
    // Ne charge les cookies que si consenté
    if(localStorage.getItem('cookiesAccepted') !== 'true'){
        hideFlame();
        return;
    } 

    resetAttemptedNames();
    const name = getCookieName();
    let cookieAttempts = readJsonCookie(name);
    let cookieList;

    if (cookieAttempts) cookieList = cookieAttempts;

    if (cookieList && cookieList.length > 0) {
        const filteredList = [];

        for (let attempt of cookieList) {
            if (gameMode == "case") {
                const group = getGroupByTurnabout(attempt);
                if (selectedGroups.includes(group)) filteredList.push(attempt);
            } else {
                const characterInfo = await getCharacterInformations(attempt);
                if (characterInfo) {
                    const group = getGroupByCharacter(characterInfo);
                    if (selectedGroups.includes(group)) filteredList.push(attempt);
                }
            }
        }

        filteredList.forEach(attempt => {
            validateGuessFunction(attempt, true);
        });
    }
}

// Display stored streak for current mode (grey flame) at page load
export function displayStoredStreak(){
    try{
        const name = gameMode + "Streak";
        const raw = readCookie(name);
        let streak = 0;
        if (raw && raw.length > 0 && !isNaN(parseInt(raw,10))) {
            streak = parseInt(raw,10);
        }
        // show greyed flame with current streak (0 if none)
        uncolorFlame();
        setFlameCount(streak);
    } catch (e) {
        console.warn('displayStoredStreak failed', e);
    }
}

// ==========================
// COOKIE HELPERS
// ==========================

export function readCookie(name){
    return document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || '';
}

export function readJsonCookie(name) {
    try {
        const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop();
        if (!cookieValue) return null;
        return JSON.parse(decodeURIComponent(cookieValue));
    } catch (error) {
        console.error(`Erreur lors de la lecture du cookie '${name}':`, error);
        return null;
    }
}

export function setCookie(cookieName, value){
    document.cookie = cookieName + "=" + value;
}

export function setCookieAttempt(cookieName, value) {
    const now = new Date();
    const expiration = new Date();
    expiration.setHours(23, 59, 59, 999);
    document.cookie = `${cookieName}=${value}; expires=${expiration.toUTCString()}; path=/`;
}
