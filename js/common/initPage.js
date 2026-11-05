// initPage.js

//////////////////////////////////////////////////////////////////

import { gameMode } from "./data.js";
import { showInfo } from "./infoPage.js";


const logo_group = document.querySelector(".logo-group");
const game_container = document.getElementById("game-container");
const hint_container = document.getElementById("hint-container");
const group_filters = document.getElementById("groupFilters");
const content = document.querySelector(".content");

//////////////////////////////////////////////////////////////////

if(logo_group){
    logo_group.innerHTML = `
    <div class="flame-container">
        <img src="resources/img/icons/flame.png" alt="Flamme" class="flame-icon">
        <span class="flame-count">-</span>
        </div>


        <a href="index.html" class="logo-link">
        <img src="resources/img/AceAttorneydleLogo.png" alt="AceAttorneydle Logo" id="logo">
        </a>

        <div class="side-right">
        <button class="icon-btn">
            <img src="resources/img/icons/patchnotes.png" alt="Patch Notes">
        </button>
        <button class="icon-btn">
            <img src="resources/img/icons/param.png" alt="Settings">
        </button>
        <button class="icon-btn">
            <img src="resources/img/icons/questionmark.png" alt="Help">
        </button>
    </div>
    `;

    const buttons = document.querySelectorAll(".side-right .icon-btn");

    // Buttons actions
    buttons[0].addEventListener("click", () => showInfo("patchnotes"));
    buttons[1].addEventListener("click", () => showInfo("settings"));
    buttons[2].addEventListener("click", () => showInfo("help"));
}

if(game_container){

    console.log(gameMode)

    let selected_guess = gameMode == "guess" ? "class=\"selected\"" : "";
    let selected_silhouette = gameMode == "silhouette" ? "class=\"selected\"" : "";
    let selected_quote = gameMode == "quote" ? "class=\"selected\"" : "";
    let selected_case = gameMode == "case" ? "class=\"selected\"" : "";
    

    game_container.innerHTML = `
    <div id="gamemodeSelector">
        <a href="guess"><img src="resources/img/icons/guess.png" alt="Guess" ${selected_guess}></a>
        <a href="silhouette"><img src="resources/img/icons/silhouette.png" alt="Silhouette" ${selected_silhouette}></a>
        <a href="quote"><img src="resources/img/icons/quote.png" alt="Quote" ${selected_quote}></a>
        <a href="case"><img src="resources/img/icons/case.png" alt="Case" ${selected_case}></a>
    </div>
    `;
}

if(hint_container){

    let hints = [];

    switch (gameMode) {
        case "guess":
            hints = ["Game", "Occupation", "Figure"];
            break;
        case "quote":
            hints = ["Case", "Occupation", "Figure"];
            break;
        case "case":
            hints = ["Death cause", "Locations", "Victim"];
            break;
        default:
            break;
    }

    hint_container.innerHTML = `
    <div id="hints">
        <div class="hint" id="hint-${hints[0].toLowerCase()}">
            <img src="resources/img/icons/Psyche-Lock.png" class="hint-icon disabled" alt="${hints[0]}">
            <p>${hints[0]}</p>
            <p class="hint-count">in 3 tries</p>
        </div>
        <div class="hint" id="hint-${hints[1].toLowerCase()}">
            <img src="resources/img/icons/Psyche-Lock.png" class="hint-icon disabled" alt="${hints[1]}">
            <p>${hints[1]}</p>
            <p class="hint-count">in 7 tries</p>
        </div>
        <div class="hint" id="hint-${hints[2].toLowerCase()}">
            <img src="resources/img/icons/Black_Psyche-Lock.png" class="hint-icon disabled" alt="${hints[2]}">
            <p>${hints[2]}</p>
            <p class="hint-count">in 12 tries</p>
        </div>
        <div id="hint-details">
            <div id="hint-details-header"></div>

            <div id="hint-details-content"></div>
        </div>
    </div>
    `;
}

if(group_filters){
    group_filters.innerHTML = `
    <h2>Select the series you want to play with (you can select multiple at once)</h2>
    <label><input type="checkbox" value="Main" checked> Ace Attorney Main Serie</label>
    <label><input type="checkbox" value="Investigation"> Investigation</label>
    <label><input type="checkbox" value="Great"> The Great Ace Attorney</label>
    `
}

if(content){
    content.innerHTML = `
    <p>
        Ace Attorneydle is a fan-made project and is not affiliated with, endorsed by, or associated with Capcom.
    </p>
    <p class="legal-links">
        <a href="privacy.html">Privacy Policy</a> | 
        <a href="terms.html">Terms of Service</a> | 
        <a href="contact.html">Contact</a> | 
        <button id="change-cookie-preferences">Cookie Preferences</button>
    </p>
    `
}