// js/logo.js
const rules = [];

// Default rule: Pride month (June) -> use pride logo
rules.push({
    name: 'pride',
    matches: date => date.getMonth() === 5, // June
    src: 'resources/img/AceAttorneydleLogo_pride.png'
});

// Public API to add rules dynamically
export function registerLogoRule(rule) {
    // rule: { name, matches: (Date) => boolean, src }
    if (!rule || typeof rule.matches !== 'function' || !rule.src) return;
    rules.push(rule);
    // Re-apply immediately in case page is already loaded
    applyLogoForDate(new Date());
}

export function applyLogoForDate(date = new Date()) {
    const logoElems = document.querySelectorAll('#logo');
    if (!logoElems || logoElems.length === 0) return;

    // find first matching rule
    const match = rules.find(r => {
        try { return r.matches(date); } catch (e) { return false; }
    });

    logoElems.forEach(img => {
        // store default src if not already stored
        if (!img.dataset.defaultSrc) {
            img.dataset.defaultSrc = img.getAttribute('src') || '';
        }

        const newSrc = match ? match.src : img.dataset.defaultSrc;
        if (newSrc && newSrc !== img.getAttribute('src')) {
            img.setAttribute('src', newSrc);
        }
    });
}

// Apply on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => applyLogoForDate(new Date()));
} else {
    // already ready
    applyLogoForDate(new Date());
}

// Example usage for future dynamic rules (kept as comments):
// registerLogoRule({ name: 'christmas', matches: date => date.getMonth() === 11, src: 'resources/img/AceAttorneydleLogo_xmas.png' });
