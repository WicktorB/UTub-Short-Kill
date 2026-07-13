// Adaptateur de stockage pour l'extension : chrome/browser.storage.local.
export function createExtensionStorage() {
  const api =
    typeof browser !== "undefined" && browser.storage
      ? browser
      : typeof chrome !== "undefined" && chrome.storage
        ? chrome
        : null;
  const CONFIG_KEY = "usk_config";
  const UNLOCK_KEY = "usk_unlocked_until";

  return {
    async loadConfig() {
      if (!api) return {};
      try {
        const d = await api.storage.local.get(CONFIG_KEY);
        return d[CONFIG_KEY] || {};
      } catch (e) {
        return {};
      }
    },
    async saveConfig(obj) {
      if (!api) return;
      try {
        await api.storage.local.set({ [CONFIG_KEY]: obj });
      } catch (e) {
        /* ignore */
      }
    },
    async loadUnlock() {
      if (!api) return 0;
      try {
        const d = await api.storage.local.get(UNLOCK_KEY);
        return d[UNLOCK_KEY] || 0;
      } catch (e) {
        return 0;
      }
    },
    async saveUnlock(ts) {
      if (!api) return;
      try {
        await api.storage.local.set({ [UNLOCK_KEY]: ts });
      } catch (e) {
        /* ignore */
      }
    },
    onChange(cb) {
      if (api && api.storage.onChanged) {
        api.storage.onChanged.addListener(function (changes, area) {
          if (area === "local" && (changes[CONFIG_KEY] || changes[UNLOCK_KEY])) cb();
        });
      }
    }
  };
}
