//streak.js
let container = document.querySelector(".flame-container");
let count = document.querySelector(".flame-count");

// Rend la flamme grise (désactivée)
export function uncolorFlame() {
    const flame = container.querySelector("img");
    if (flame) {
        flame.style.filter = "grayscale(100%) brightness(0.7)";
    }
}

// Remet la couleur normale (active)
export function recolorFlame() {
    const flame = container.querySelector("img");
    if (flame) {
        flame.style.filter = "none";
    }
}

// Met à jour le compteur de flammes
export function setFlameCount(newCount) {
    if (count) {
        count.textContent = newCount;
    }
}

// Cache entièrement la flamme + compteur
export function hideFlame() {
    if (container) {
        container.style.display = "none";
    }
}

// (Optionnel) — pour la réafficher
export function showFlame() {
    if (container) {
        container.style.display = "inline-block";
    }
}


