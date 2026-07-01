// ============================================================
// js/theme.js
// Handles dark / light theme toggle and persistence.
// ============================================================

const Theme = (() => {
  const STORAGE_KEY = "portfolio-theme";
  const DEFAULT    = "dark";
  const ATTR       = "data-theme";

  const ICONS = {
    dark:
      '<path d="M12 3v1.5M12 19.5V21M4.6 4.6l1.1 1.1M18.3 18.3l1.1 1.1M3 12h1.5M19.5 12H21M4.6 19.4l1.1-1.1M18.3 5.7l1.1-1.1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="1.4"/>',
    light:
      '<path d="M20 14.5A8.5 8.5 0 119.5 4a7 7 0 0010.5 10.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
  };

  function apply(theme) {
    document.documentElement.setAttribute(ATTR, theme);
    const icon = document.getElementById("theme-icon");
    if (icon) icon.innerHTML = ICONS[theme];
    localStorage.setItem(STORAGE_KEY, theme);
  }

  let current = localStorage.getItem(STORAGE_KEY) || DEFAULT;

  function init() {
    apply(current);

    document.getElementById("theme-toggle")?.addEventListener("click", () => {
      current = current === "dark" ? "light" : "dark";
      apply(current);
    });
  }

  return { init };
})();
