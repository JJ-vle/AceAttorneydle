/*
import { dataLoaded, characterData } from './data.js';

let characterNames = [];
let currentIndex = [];
let nextSelectionTimes = [];

// Load data from localStorage if available
await dataLoaded;


const GROUPS = ["Main", "Investigation", "Great"];
GROUPS.forEach(group => {

    // Retrieve stored data
    const storedNames = localStorage.getItem(`${group}_characterNames`);
    const storedIndex = localStorage.getItem(`${group}_currentIndex`);
    const storedTime = localStorage.getItem(`${group}_nextSelectionTime`);

    if (storedNames && storedIndex !== null && storedTime) {
        // Load existing shuffled array and current index
        characterNames[group] = JSON.parse(storedNames);
        currentIndex[group] = parseInt(storedIndex, 10);
        nextSelectionTimes[group] = parseInt(storedTime, 10);
        console.log("Loaded saved state:", characterNames[group], currentIndex[group], new Date(nextSelectionTimes[group]));  
    } else {
        // If no stored data, initialize and shuffle
        characterNames[group] = characterDatas[group].map(character => character.name);
        shuffleArray(characterNames[group]);
        currentIndex[group] = 0;
        nextSelectionTimes[group] = Date.now() + 60000; // Set next selection time to 1 minute from now
    
        saveState(group); // Save to localStorage
        console.log("Initialized and saved new state:", characterNames[group]);
    }

    // Start the character selection cycle
    selectCharacter(group);

})

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

// Function to save the current state to localStorage
function saveState(game) {
    localStorage.setItem(`${game}_characterNames`, JSON.stringify(characterNames[game]));
    localStorage.setItem(`${game}_currentIndex`, currentIndex[game].toString());
    localStorage.setItem(`${game}_nextSelectionTime`, nextSelectionTimes[game].toString());
}

// Function to select the next character for a given game
function selectCharacter(game) {
    const now = Date.now();

    if (now >= nextSelectionTime) {
        console.log("Selected character:", characterNames[currentIndex]);

        currentIndex[game]++;

        // If we reach the end, reshuffle and restart
        if (currentIndex[game] >= characterNames[game].length) {
            shuffleArray(characterLists[game]);
            console.log(`Reshuffled characters for ${game}:`, characterNames[game]);
            currentIndex[game] = 0;
        }

        nextSelectionTimes[game] = Date.now() + 60000; // 24 hours

        // Save updated state
        saveState(game);
        location.reload();
    }

    // Schedule next check
    setTimeout(() => selectCharacter(game), 1000 * 60); // Check every 1 minute
}

// Function to get time remaining until the next selection
function getTimeRemaining(game) {
    const timeLeft = nextSelectionTimes[game] - Date.now();
    if (timeLeft <= 0) {
        return "Next selection happening now!";
    }

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return `Time remaining: ${hours}h ${minutes}m ${seconds}s`;
}

export function getCurrentCharacter(game){
    return characterNames[game][currentIndex[game]];
}

// Example usage: Log remaining time every minute
setInterval(() => console.log(getTimeRemaining()), 60000);*/
