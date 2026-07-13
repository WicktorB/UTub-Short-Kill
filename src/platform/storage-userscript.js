// Adaptateur de stockage pour le userscript : localStorage (origine youtube.com).
export function createUserscriptStorage() {
  const CONFIG_KEY = "usk_config";
  const UNLOCK_KEY = "usk_unlocked_until";
  const listeners = [];

  // Changements venant d'un AUTRE onglet.
  window.addEventListener("storage", function (e) {
    if (e.key === CONFIG_KEY || e.key === UNLOCK_KEY) {
      listeners.forEach(function (cb) {
        cb();
      });
    }
  });

  return {
    async loadConfig() {
      try {
        return JSON.parse(localStorage.getItem(CONFIG_KEY) || "{}") || {};
      } catch (e) {
        return {};
      }
    },
    async saveConfig(obj) {
      try {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(obj));
      } catch (e) {
        /* ignore */
      }
    },
    async loadUnlock() {
      try {
        return parseInt(localStorage.getItem(UNLOCK_KEY) || "0", 10) || 0;
      } catch (e) {
        return 0;
      }
    },
    async saveUnlock(ts) {
      try {
        localStorage.setItem(UNLOCK_KEY, String(ts));
      } catch (e) {
        /* ignore */
      }
    },
    onChange(cb) {
      listeners.push(cb);
    }
  };
}
