///// COOKIE SETUP /////

export let streaks = {};
streaks.guessStreak = setupStreakCookie("guessStreak");
streaks.silhouetteStreak = setupStreakCookie("silhouetteStreak");
streaks.quoteStreak = setupStreakCookie("quoteStreak");
streaks.caseStreak = setupStreakCookie("caseStreak");

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

////////

export function readCookie(name){
    return document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || '';
}

export function readJsonCookie(name){
    return JSON.parse(decodeURIComponent(document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''));
}

export function setCookie(cookieName, value){
    document.cookie = cookieName + "=" + value;
}