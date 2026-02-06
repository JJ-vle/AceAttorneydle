/**
 * Vérifie si un élément a un défilement horizontal
 * et ajoute l'attribut data-scrollable="true"
 */
function checkScrollable() {
    const historyBodies = document.querySelectorAll('.historyBody');

    if (!historyBodies || historyBodies.length === 0) return;

    historyBodies.forEach(body => {
        if (!(body instanceof HTMLElement)) return;

        const hasHorizontalScroll = body.scrollWidth > body.clientWidth;

        if (hasHorizontalScroll) {
            body.setAttribute('data-scrollable', 'true');
        } else {
            body.removeAttribute('data-scrollable');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Lancer une première fois quand le DOM est prêt
    checkScrollable();

    // Recalcul au resize
    window.addEventListener('resize', checkScrollable);

    // Observer uniquement si #history existe
    const historyContainer = document.querySelector('#history');
    if (!historyContainer) return;

    const observer = new MutationObserver(() => {
        // Laisser le temps au layout de se recalculer
        requestAnimationFrame(checkScrollable);
    });

    observer.observe(historyContainer, {
        childList: true,
        subtree: true
    });
});

// Exporter la fonction pour usage externe
export { checkScrollable };



// SCRIPT POUR DEFENSEBAR

window.addEventListener('scroll', function() {
    const defensebar = document.getElementById('defensebar');
    
    // Si on a scrollé plus de 100px, on réduit l'écart
    if (window.scrollY > 100) {
        defensebar.classList.add('scrolled');
    } else {
        defensebar.classList.remove('scrolled');
    }
});


