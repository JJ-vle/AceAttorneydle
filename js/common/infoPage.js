import { gameMode, dataLoaded } from './data.js';

const infoPage = document.querySelector(".info-page");

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
        date: "10-X-2026",
        text: `
        Hello everybody, we thought it would be nice to write a short message, first and foremost to wish you <b>Happy Holidays</b> and also to announce we are adding two long awaited features !
        <br><br>The first being <b>Unlimited Guess mode</b> where after beating the daily guess you'll now be able to play as long as you'd like but with only 5 tries per character. 
        This is a feature we've wanted to add since the beginning, and we've got a lot of feedbacks from all of you to add it, so we hope you'll enjoy it.
        <br>The second is an option to <b>share</b> your guess attempt, similar to how other games like wordle and such do it.
        <br><br>We've also been working on a couple minor changes and bug fixes following issues we've received.
        <br><br>The new features are still a bit experimental so if you encounter any problems while playing be sure to let us know 
        (either by reporting an issue on GitHub or by contacting us via email) even if we don't answer directly we're always reading them.
        <br><br><b>Thanks again for playing our game, and Happy Holidays</b>
        <br>Detailed patch note below
        <br><br><b>Major changes</b>: 
        <br>- Addition of a new 'Guess Unlimited' game mode
        <br>- Addition of a Share button after completing Classic Guess
        <br><br><b>Minor changes</b>:
        <br>- Addition of an icon notifying the release of a new patch note
        <br>- Improvements to the code base for easier edits to the pages
        <br>- Logo change for the Holidays
        <br>- Minor graphical improvements
        <br>- Minor bug fixes (see issues on github)`
    },
    {
        date: "10-12-2026",
        text: `
        <b>Minor changes</b>:
        <br>- Logo change for the month of Halloween`
    },
    {
        date: "06-01-2026",
        text: `
        <b>Major changes</b>:
        <br>- Added hints to the silhouette mode
        <br><br><b>Minor changes</b>:
        <br>- Logo change for pride month`
    },
    {
        date: "05-05-2026",
        text: `
        <b>Minor changes</b>:
        <br>- Fixed a bug where the 'Validate button' wasn't working`
    },
    {
        date: "04-03-2026",
        text: `
        <b>Minor changes</b>:
        <br>- Small CSS update, mainly focused on the endgame window`
    },
    {
        date: "03-19-2026",
        text: `
        <b>Minor changes</b>:
        <br>- Mobile responsiveness improvements`
    },
    {
        date: "02-12-2026",
        text: `
        <b>Major changes</b>:
        <br>- Update to the UI for mobile devices
        <br><br><b>Minor changes</b>:
        <br>- Fixed a bug where menus weren't working on every pages 
        <br>- Gray and Grey are now considered the same color when comparing guesses`
    },
    {
        date: "02-10-2026",
        text: `
        <b>Minor changes</b>:
        <br>- Multiples images fix for some Investigation characters (Artie Frost, Di Jun Wang (Body double), Delicia Scone, Lance Amano, Alf Aldown)`
    },
    {
        date: "10-28-2025",
        text: `
        <b>Minor changes</b>:
        <br>- Addition of new menus for Patch Notes, Settings and Help
        <br>- Addition of an indicator for the Win streak`
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
            <h3>Silhouette Hints</h3>
            <p>
                The silhouette panel now offers 3 visual states:
            </p>
            <ul>
                <li><strong>Default</strong> → Black silhouette, available immediately.</li>
                <li><strong>After 5 guesses</strong> → Grayscale silhouette with blur.</li>
                <li><strong>After 10 guesses</strong> → Full-color silhouette with blur.</li>
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

export function showInfo(contentKey) {
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

    if (contentKey === "patchnotes"){
        localStorage.setItem('lastPatchNoteRead', getLastPatchNote().date)

        const patchnote_btn = document.querySelector(".new-patch");
        if(patchnote_btn){

            patchnote_btn.classList.remove("new-patch")

            const badge = patchnote_btn.querySelector(".badge")
            if(badge){
                badge.style.display = 'none';
            }
        }
    }
}

export function getLastPatchNote(){
    return patchNotes[0];
}