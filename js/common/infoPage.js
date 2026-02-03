import { gameMode, dataLoaded } from './data.js';

const infoPage = document.querySelector(".info-page");
const buttons = document.querySelectorAll(".side-right .icon-btn");

export let frenchNamesEnabled = false;
export let colorblindModeEnabled = false;

function loadSettings() {
    frenchNamesEnabled = localStorage.getItem("frenchNamesEnabled") === "true";
    colorblindModeEnabled = localStorage.getItem("colorblindModeEnabled") === "true";
}
loadSettings();
updateColorblindMode(colorblindModeEnabled);

await dataLoaded;

// Patch notes data
const patchNotes = [
    {
        date: "02-XX-2026",
        text: "Menus now work on every pages. Gray and grey ar now displayed as the same color."
    },
    {
        date: "10-28-2025",
        text: "Added new menus: Patch Notes, Settings and Help. Streak is now displayed."
    }
];

function getHelpContent() {
    return helpContents[gameMode] ?? `
        <h2>Help</h2>
        <p>Unknown game mode.</p>
    `;
}

const helpContents = {
    guess: `
        <h2>Help</h2>

        <div class="patch-card">
            <h3>Daily Reset</h3>
            <p>
                The game resets every day at <strong> Midnight Central European Summer Time (CEST, UTC+2)</strong>.
            </p>
        </div>

        <div class="patch-card">
            <h3>How to Play (Classic Mode)</h3>
            <p>
                Enter the name of a character. The property boxes will show how your guess
                compares to the target character using different colors:
            </p>
            <ul>
                <li><strong>Green</strong> → The information is correct. Your guess and the target share this property.</li>
                <li><strong>Yellow</strong> → The information is partially correct. This often happens with colors (e.g., "brown" vs. "light brown").</li>
                <li><strong>Red</strong> → The information is wrong. Your guess does not match the target character on this property.</li>
                <li><strong>⬆️ / ⬇️</strong> → These arrows are used with <em>Birth year</em> and <em>Debut</em>. They indicate whether the target character was born or debuted <em>before</em> or <em>after</em> your guess.</li>
            </ul>
        </div>

        <div class="patch-card">
            <h3>Character Properties</h3>
            <p>Each character has several properties to help you narrow down your guess:</p>
            <ul>
                <li><strong>Status</strong> → Alive, Deceased, Arrested, Incarcerated (and more for you to discover).</li>
                <li><strong>Gender</strong> → Male, Female, None.</li>
                <li><strong>Birth year</strong> → The year of birth. ⚠️ Some characters don't have a known birth date, in which case arrows (⬆️/⬇️) won't appear.</li>
                <li><strong>Eye color / Hair color</strong> → Straightforward: the character's appearance details.</li>
                <li><strong>Debut</strong> → The first <em>Turnabout</em> (case) in which the character appears. If your guess is from the same game but not the exact case, the box will turn <strong>yellow</strong> (partial match).</li>
            </ul>
        </div>

        <div class="patch-card">
            <h3>Hints</h3>
            <p>As you make guesses, you unlock hints at specific milestones:</p>
            <ul>
                <li><strong>After 3 guesses</strong> → The <em>Game</em> where the character first appeared.</li>
                <li><strong>After 7 guesses</strong> → The character's <em>Occupation</em>.</li>
                <li><strong>After 12 guesses</strong> → The character's <em>Silhouette</em>.</li>
            </ul>
        </div>

        <div class="patch-card">
            <h3>Life Bar</h3>
            <p>
                You have <strong>15 attempts</strong> to find the correct character.  
                If you fail, you lose the game and your current win streak will be reset.
            </p>
        </div>
    `,
    silhouette: `
        <h2>Help</h2>

        <div class="patch-card">
            <h3>Daily Reset</h3>
            <p>
                The game resets every day at <strong> Midnight Central European Summer Time (CEST, UTC+2)</strong>.
            </p>
        </div>

        <div class="patch-card">
            <h3>How to Play (Silhouette Mode)</h3>
            <p>
                A silhouette is displayed in a box above the guess bar.
                Enter the name of a character you think could be the answer, then press <strong>Enter</strong>.
                Your guess will appear below the guess bar and be marked with a color:
            </p>
            <ul>
                <li><strong>Green</strong> → Your guess is the correct character.</li>
                <li><strong>Red</strong> → Your guess is not the correct character.</li>
            </ul>
        </div>
        
        <div class="patch-card">
            <h3>Life Bar</h3>
            <p>
                You have <strong>15 attempts</strong> to find the correct character.  
                If you fail, you lose the game and your current win streak will be reset.
            </p>
        </div>
    `,
    quote: `
        <h2>Help</h2>

        <div class="patch-card">
            <h3>Daily Reset</h3>
            <p>
                The game resets every day at <strong> Midnight Central European Summer Time (CEST, UTC+2)</strong>.
            </p>
        </div>
        
        <div class="patch-card">
            <h3>How to Play (Quote Mode)</h3>
            <p>
                A quote is displayed in a box above the guessbar.
                Enter the name of a character that could have said that quote, press  <strong>Enter</strong>.
                Your guess will appear below the guess bar and be marked with a color:
            </p>
            <ul>
                <li><strong>Green</strong> → Your guess is the character to find.</li>
                <li><strong>Red</strong> → Your guess isn't the character to find.</li>
            </ul>
        </div>

        
        <div class="patch-card">
            <h3>Hints</h3>
            <p>As you make guesses, you unlock hints at specific milestones:</p>
            <ul>
                <li><strong>After 3 guesses</strong> → The <em>Case</em> where the character said that (not when the character appeard !)</li>
                <li><strong>After 7 guesses</strong> → The character's <em>Occupation</em>.</li>
                <li><strong>After 12 guesses</strong> → The character's <em>Silhouette</em>.</li>
            </ul>
        </div>
        
        <div class="patch-card">
            <h3>Life Bar</h3>
            <p>
                You have <strong>15 attempts</strong> to find the correct character.  
                If you fail, you lose the game and your current win streak will be reset.
            </p>
        </div>
    `,
    case: `
        <h2>Help</h2>

        <div class="patch-card">
            <h3>Daily Reset</h3>
            <p>
                The game resets every day at <strong> Midnight Central European Summer Time (CEST, UTC+2)</strong>.
            </p>
        </div>

        <div class="patch-card">
            <h3>How to Play (Case Mode)</h3>
            <p>
                A panel of evidence is displayed in a box above the guess bar.
                At the start, only one piece of evidence is shown.
                Additional evidence is revealed after each incorrect guess.
            </p>
            <p>
                The maximum number of evidence pieces is <strong>15</strong> (the same as the life limit).
                If a Turnabout contains more than 15 pieces of evidence, only 15 will be randomly selected.
                If it contains fewer than 15, all available evidence will be shown.
            </p>
            <p>
                Enter the name of a Turnabout (case) you think could be the answer, then press <strong>Enter</strong>.
                Your guess will appear below the guess bar and be marked with a color:
            </p>
            <ul>
                <li><strong>Green</strong> → Your guess is the correct case.</li>
                <li><strong>Red</strong> → Your guess is not the correct case.</li>
            </ul>
        </div>
    
        <div class="patch-card">
            <h3>Life Bar</h3>
            <p>
                You have <strong>15 attempts</strong> to find the correct character.  
                If you fail, you lose the game and your current win streak will be reset.
            </p>
        </div>
    `
};

// Content sections
const contents = {
    patchnotes: `
        <h2>Patch Notes</h2>
        ${patchNotes.map(note => `
            <div class="patch-card">
                <h3>${note.date}</h3>
                <p>${note.text}</p>
            </div>
        `).join("")}
    `,
    settings: `
        <h2>Settings</h2>
        <div class="setting-item">
            <label class="switch">
                <input type="checkbox" id="french-names-toggle">
                <span class="slider"></span>
            </label>
            <span>Enable search with French names</span>
        </div>
        <div class="setting-item">
            <label class="switch">
                <input type="checkbox" id="colorblind-mode-toggle">
                <span class="slider"></span>
            </label>
            <span>Enable colorblind mode</span>
        </div>
        <div class="setting-item">
            <a href="https://github.com/JJ-vle/AceAttorneydle/issues" target="_blank">
                Report an issue on GitHub
            </a>
        </div>
    `,
    help: getHelpContent
};

// Restaure les valeurs sauvegardées dans les paramètres
function restoreSettingsState() {
    const frenchToggle = document.querySelector("#french-names-toggle");
    const colorToggle = document.querySelector("#colorblind-mode-toggle");

    if (frenchToggle) {
        frenchToggle.checked = frenchNamesEnabled;
        frenchToggle.addEventListener("change", () => {
            frenchNamesEnabled = frenchToggle.checked; 
            localStorage.setItem("frenchNamesEnabled", frenchNamesEnabled);
        });
    }

    if (colorToggle) {
        colorToggle.checked = colorblindModeEnabled;
        updateColorblindMode(colorblindModeEnabled); // <-- applique dès le chargement

        colorToggle.addEventListener("change", () => {
            colorblindModeEnabled = colorToggle.checked;
            localStorage.setItem("colorblindModeEnabled", colorblindModeEnabled);
            updateColorblindMode(colorblindModeEnabled);
        });
    }

}

function updateColorblindMode(enabled) {
    const body = document.body;
    if (enabled) {
        body.classList.add("colorblind-mode");
    } else {
        body.classList.remove("colorblind-mode");
    }
}

function showInfo(contentKey) {
    const content =
        typeof contents[contentKey] === "function"
            ? contents[contentKey]()   // appelé AU MOMENT du clic
            : contents[contentKey];

    infoPage.innerHTML = `
        <div class="info-content">
            ${content}
            <button class="close-info">Close</button>
        </div>
    `;
    infoPage.classList.add("active");

    document.querySelector(".close-info").addEventListener("click", () => {
        infoPage.classList.remove("active");
        infoPage.innerHTML = "";
    });

    infoPage.addEventListener("click", (e) => {
        if (e.target === infoPage) {
            infoPage.classList.remove("active");
            infoPage.innerHTML = "";
        }
    }, { once: true });

    if (contentKey === "settings") restoreSettingsState();
}

// Buttons actions
buttons[0].addEventListener("click", () => showInfo("patchnotes"));
buttons[1].addEventListener("click", () => showInfo("settings"));
buttons[2].addEventListener("click", () => showInfo("help"));

