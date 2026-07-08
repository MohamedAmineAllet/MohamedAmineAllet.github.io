// ============================================================
// js/typewriter.js
// Cycles through titles by typing + deleting them gradually.
// Syncs with i18n — switches language without interrupting flow.
// ============================================================

const Typewriter = (() => {

  const TITLES = {
    fr: [
      "Étudiant en Génie Logiciel",
      "Développeur Web",
      "Développeur en IA & Apprentissage Automatique",
    ],
    en: [
      "Software Engineering Student",
      "Web Developer",
      "AI & Machine Learning Developer",
    ],
  };

  const TYPE_SPEED    = 52;   // ms per character typed
  const DELETE_SPEED  = 26;   // ms per character deleted
  const PAUSE_FULL    = 2000; // ms pause after full title is shown
  const PAUSE_EMPTY   = 380;  // ms pause before typing next title

  let el;
  let lang         = "fr";
  let titleIndex   = 0;
  let charIndex    = 0;
  let isDeleting   = false;
  let timer        = null;

  // ── Core tick ─────────────────────────────────────────────
  function tick() {
    const titles = TITLES[lang] || TITLES.fr;
    const target  = titles[titleIndex % titles.length];

    if (!isDeleting) {
      // Type one character
      charIndex++;
      el.textContent = target.slice(0, charIndex);

      if (charIndex >= target.length) {
        // Finished typing → pause then start deleting
        timer = setTimeout(() => { isDeleting = true; tick(); }, PAUSE_FULL);
        return;
      }
      timer = setTimeout(tick, TYPE_SPEED);

    } else {
      // Delete one character
      charIndex--;
      el.textContent = target.slice(0, charIndex);

      if (charIndex <= 0) {
        // Finished deleting → move to next title
        isDeleting  = false;
        titleIndex  = (titleIndex + 1) % titles.length;
        timer = setTimeout(tick, PAUSE_EMPTY);
        return;
      }
      timer = setTimeout(tick, DELETE_SPEED);
    }
  }

  // ── Language switch ────────────────────────────────────────
  // Called by i18n when user toggles language.
  // Resets to start of the current position in new language.
  function switchLang(newLang) {
    if (newLang === lang) return;
    lang = newLang;
    clearTimeout(timer);
    // Keep same titleIndex position but restart typing from 0
    isDeleting  = false;
    charIndex   = 0;
    if (el) el.textContent = "";
    timer = setTimeout(tick, PAUSE_EMPTY);
  }

  // ── Init ──────────────────────────────────────────────────
  function init() {
    el = document.getElementById("typewriter-text");
    if (!el) return;

    lang = document.documentElement.lang || "fr";

    // Hook into the lang toggle button
    document.getElementById("lang-toggle")?.addEventListener("click", () => {
      // i18n updates document.documentElement.lang first,
      // so we read it after a microtask
      setTimeout(() => switchLang(document.documentElement.lang), 20);
    });

    // Initial delay so it starts after the page has settled
    timer = setTimeout(tick, 900);
  }

  return { init };
})();
