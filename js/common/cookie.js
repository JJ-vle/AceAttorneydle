///// COOKIE SETUP /////
import { gameMode, getGroupByCharacter, getGroupByTurnabout, selectedGroups, getCharacterInformations, attemptedNames, resetAttemptedNames } from './data.js';
import { validateGuessFunction } from './guessbar.js';

export let streaks = {};
streaks.guessStreak = setupStreakCookie("guessStreak");
streaks.silhouetteStreak = setupStreakCookie("silhouetteStreak");
streaks.quoteStreak = setupStreakCookie("quoteStreak");
streaks.caseStreak = setupStreakCookie("caseStreak");

////////

export let guessesCookie = null;
export let cookieName;
export function setCookieName(newCookieName){
    cookieName = newCookieName;
}

export function updateAttemptsCookie() {
    setCookie(cookieName, encodeURIComponent(JSON.stringify(attemptedNames)));
}

//console.log(streaks);

function setupStreakCookie(name){
    let streak;

    if(readCookie(name).length === 0){
        streak = 0;
    }
    else {
        streak = readCookie(name);
        console.log("🔥 Current streak for " + name.replace("Streak","") + " : " + streak);
    }
    
    setCookie(name, streak);
    return streak;
}

export async function loadHistory() {
    resetAttemptedNames();
    let cookieAttempts = readJsonCookie(cookieName);
    //console.log("Cookie Attempts:", cookieAttempts);

    let cookieList;

    if (cookieAttempts) {
        cookieList = cookieAttempts;
    }

    //console.log("Cookie List after update:", cookieList);
    //console.log("Selected Groups:", selectedGroups);

    if (cookieList && cookieList.length > 0) {
        const filteredList = [];

        for (let attempt of cookieList) {

            if (gameMode == "case") {

                const group = getGroupByTurnabout(attempt);

                if (selectedGroups.includes(group)) {
                    filteredList.push(attempt);
                }
                
            } else {

                const characterInfo = await getCharacterInformations(attempt);

                if (characterInfo) {
                    const group = getGroupByCharacter(characterInfo);
                    //console.log(`Attempt: ${attempt}, Group: ${characterInfo.group}, Selected Groups: ${selectedGroups}`);
    
                    if (selectedGroups.includes(group)) {
                        filteredList.push(attempt);
                    }
                }
            }

        }

        //console.log("Filtered List:", filteredList);

        // Traiter la liste filtrée
        filteredList.forEach(attempt => {
            validateGuessFunction(attempt);
        });
    }
}

////////

export function readCookie(name){
    return document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || '';
}

export function readJsonCookie(name) {
    try {
        const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop();

        if (!cookieValue) {
            //console.warn(`⚠️ Le cookie '${name}' est vide ou non défini.`);
            return null;
        }

        return JSON.parse(decodeURIComponent(cookieValue));

    } catch (error) {
        console.error(`❌ Erreur lors de la lecture du cookie '${name}':`, error);
        return null;
    }
}

export function setCookie(cookieName, value){
    document.cookie = cookieName + "=" + value;
}
