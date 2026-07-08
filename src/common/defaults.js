// Configuration par défaut + helpers partagés.
// Chargé aussi bien dans le content script que dans la page d'options / le popup.
(function () {
  "use strict";

  // Réglages par défaut (surchargés par ce qui est stocké dans le navigateur).
  const DEFAULTS = {
    enabled: true, // extension active
    hideShorts: true, // masquer les Shorts dans les feeds / recherche / reco
    gateEnabled: true, // exiger les 3 questions pour accéder à un Short
    allowFromChannels: true, // exception : Shorts accessibles depuis une chaîne
    openMode: "short", // "short" = lecteur Shorts | "watch" = lecteur vidéo normal
    unlockMinutes: 5, // durée de déblocage après réussite (en minutes)
    minAnswerLength: 15, // longueur minimale d'une réponse libre
    questions: [
      "Pourquoi veux-tu regarder des Shorts maintenant ?",
      "Combien de temps comptes-tu y passer, précisément ?",
      "Qu'est-ce que tu devrais être en train de faire à la place ?"
    ]
  };

  const STORAGE_KEY = "usk_config";
  const UNLOCK_KEY = "usk_unlocked_until";

  // API navigateur unifiée (Firefox/Safari : `browser`, Chrome/Edge : `chrome`).
  const api =
    typeof browser !== "undefined" && browser.storage
      ? browser
      : typeof chrome !== "undefined"
        ? chrome
        : null;

  async function getConfig() {
    try {
      if (!api || !api.storage) return Object.assign({}, DEFAULTS);
      const data = await api.storage.local.get(STORAGE_KEY);
      return Object.assign({}, DEFAULTS, data[STORAGE_KEY] || {});
    } catch (e) {
      return Object.assign({}, DEFAULTS);
    }
  }

  async function setConfig(patch) {
    const current = await getConfig();
    const next = Object.assign({}, current, patch);
    if (api && api.storage) {
      await api.storage.local.set({ [STORAGE_KEY]: next });
    }
    return next;
  }

  async function getUnlockedUntil() {
    try {
      if (!api || !api.storage) return 0;
      const data = await api.storage.local.get(UNLOCK_KEY);
      return data[UNLOCK_KEY] || 0;
    } catch (e) {
      return 0;
    }
  }

  async function setUnlockedUntil(ts) {
    if (api && api.storage) {
      await api.storage.local.set({ [UNLOCK_KEY]: ts });
    }
  }

  globalThis.USK = globalThis.USK || {};
  Object.assign(globalThis.USK, {
    DEFAULTS,
    STORAGE_KEY,
    UNLOCK_KEY,
    api,
    getConfig,
    setConfig,
    getUnlockedUntil,
    setUnlockedUntil
  });
})();
