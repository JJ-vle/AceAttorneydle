import { dataLoaded, characterData } from './data.js';

let characterNames = [];
let currentIndex = 0;
let nextSelectionTime = 0;

// Load data from localStorage if available
await dataLoaded;
// Retrieve stored data
const storedNames = localStorage.getItem("characterNames");
const storedIndex = localStorage.getItem("currentIndex");
const storedTime = localStorage.getItem("nextSelectionTime");

if (storedNames && storedIndex !== null && storedTime) {
    // Load existing shuffled array and current index
    characterNames = JSON.parse(storedNames);
    currentIndex = parseInt(storedIndex, 10);
    nextSelectionTime = parseInt(storedTime, 10);
    console.log("Loaded saved state:", characterNames, currentIndex, new Date(nextSelectionTime));
    
} else {
    // If no stored data, initialize and shuffle
    characterNames = characterData.map(character => character.name);
    shuffleArray(characterNames);
    currentIndex = 0;
    nextSelectionTime = Date.now() + 60000; // Set next selection time to 24 hours from now

    saveState(); // Save to localStorage
    console.log("Initialized and saved new state:", characterNames);
}

// Start the character selection cycle
selectCharacter();

// Function to shuffle the array (Fisher-Yates shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

// Function to save the current state to localStorage
function saveState() {
    localStorage.setItem("characterNames", JSON.stringify(characterNames));
    localStorage.setItem("currentIndex", currentIndex.toString());
    localStorage.setItem("nextSelectionTime", nextSelectionTime.toString());
}

// Function to select the next character
function selectCharacter() {
    const now = Date.now();

    if (now >= nextSelectionTime) {
        //console.log("Selected character:", characterNames[currentIndex]);

        currentIndex++;

        // If we reach the end, reshuffle and restart
        if (currentIndex >= characterNames.length) {
            shuffleArray(characterNames);
            console.log("Reshuffled characters:", characterNames);
            currentIndex = 0;
        }

        // Set the next selection time (24 hours from now)
        nextSelectionTime = Date.now() + 60000;

        // Save updated state
        saveState();
    }

    // Schedule next check
    setTimeout(selectCharacter, 1000 * 60); // Check every 1 minute
}

// Function to get time remaining until the next selection
function getTimeRemaining() {
    const timeLeft = nextSelectionTime - Date.now();
    if (timeLeft <= 0) {
        return "Next selection happening now!";
    }

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return `Time remaining: ${hours}h ${minutes}m ${seconds}s`;
}

export function getCurrentCharacter(){
    return characterNames[currentIndex];
}

// Example usage: Log remaining time every minute
setInterval(() => console.log(getTimeRemaining()), 60000);
