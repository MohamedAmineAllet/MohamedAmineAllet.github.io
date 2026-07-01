// ============================================================
// js/i18n.js
// Handles language detection, switching, and DOM updates.
// Depends on: data/translations.js (TRANSLATIONS global)
// ============================================================

const I18n = (() => {
  const STORAGE_KEY = "portfolio-lang";
  const DEFAULT_LANG = "fr";

  // Detect best initial language
  function detect() {
    return (
      localStorage.getItem(STORAGE_KEY) ||
      (navigator.language?.startsWith("fr") ? "fr" : DEFAULT_LANG)
    );
  }

  // Write all translated strings to the DOM
  function apply(lang) {
    const t = TRANSLATIONS[lang];
    if (!t) return;

    document.documentElement.lang = lang;

    // Plain text nodes
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (t[key] !== undefined) el.textContent = t[key];
    });

    // Nodes that may contain HTML (e.g. <strong>)
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      if (t[key] !== undefined) el.innerHTML = t[key];
    });

    // Update toggle label to show the OTHER available language
    const btn = document.getElementById("lang-toggle");
    if (btn) btn.textContent = lang === "fr" ? "EN" : "FR";

    localStorage.setItem(STORAGE_KEY, lang);
  }

  // Public API
  let current = detect();

  function init() {
    apply(current);

    document.getElementById("lang-toggle")?.addEventListener("click", () => {
      current = current === "fr" ? "en" : "fr";
      apply(current);
    });
  }

  return { init };
})();
