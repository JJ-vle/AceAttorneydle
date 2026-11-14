// js/version.js
//
// A chaque màj du site : changer VERSION
// Nouveau fichier JS : l'ajouter à FILES []

const VERSION = "1.6";

const FILES = [
    "js/case.js",
    "js/guess.js",
    "js/guess-unlimited.js",
    "js/logo.js",
    "js/quote.js",
    "js/silhouette.js",
    "js/common/cookie.js",
    "js/common/data.js",
    "js/common/filter.js",
    "js/common/guessbar.js",
    "js/common/hint.js",
    "js/common/infoPage.js",
    "js/common/initPage.js",
    "js/common/life.js",
    "js/common/streak.js",
    "js/common/tableguess-helper.js",
];

(() => {
    // Quand "import .. XXXX.js" -> navigateur cherche "XXXX.js" dans cette table -> charge "XXXX.js?v=VERSION" à la place
    const imports = {};
    for (const file of FILES) {
        imports["./" + file] = "./" + file + "?v=" + VERSION;
    }

    // Crée l'équivalent de <script type="importmap">{"imports": { ... }}</script>
    const importMap = document.createElement("script");
    importMap.type = "importmap";
    importMap.textContent = JSON.stringify({ imports });

    // Insère la balise juste après <script src="js/version.js"> dans le <head>
    document.currentScript.after(importMap);
})();
