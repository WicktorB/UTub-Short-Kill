// Content script principal : masquage des Shorts + garde d'accès (3 questions).
(function () {
  "use strict";

  const U = globalThis.USK;
  if (!U) return;

  // Tags de conteneurs qui enveloppent un item de type Short.
  const SHORTS_ITEM_ANCESTORS = [
    "ytd-rich-item-renderer",
    "ytd-video-renderer",
    "ytd-grid-video-renderer",
    "ytd-compact-video-renderer",
    "ytd-reel-item-renderer",
    "ytd-rich-section-renderer",
    "ytm-shorts-lockup-view-model-v2",
    "ytm-shorts-lockup-view-model",
    "ytm-video-with-context-renderer",
    "ytm-media-item"
  ];

  let CONFIG = U.DEFAULTS;
  let currentPath = null;
  let pauseTimer = null;

  // ---------------------------------------------------------------- Chemins

  function isChannelPath(path) {
    return /^\/(@|channel\/|c\/|user\/)/.test(path != null ? path : location.pathname);
  }

  function isShortsPath(path) {
    return /^\/shorts\//.test(path != null ? path : location.pathname);
  }

  function shortsIdFromPath(path) {
    const m = (path != null ? path : location.pathname).match(/^\/shorts\/([^/?#]+)/);
    return m ? m[1] : null;
  }

  // ------------------------------------------------------------- Masquage

  function closestItem(el) {
    let node = el;
    while (node && node.tagName && node.tagName.toLowerCase() !== "body") {
      if (SHORTS_ITEM_ANCESTORS.indexOf(node.tagName.toLowerCase()) !== -1) return node;
      node = node.parentElement;
    }
    return null;
  }

  function hideShortItems(root) {
    if (!CONFIG.enabled || !CONFIG.hideShorts) return;
    if (CONFIG.allowFromChannels && isChannelPath()) return; // exception chaîne
    const anchors = (root || document).querySelectorAll('a[href^="/shorts/"]');
    for (let i = 0; i < anchors.length; i++) {
      const item = closestItem(anchors[i]);
      if (item) item.classList.add("usk-hidden");
    }
  }

  function unhideAll() {
    const hidden = document.querySelectorAll(".usk-hidden");
    for (let i = 0; i < hidden.length; i++) hidden[i].classList.remove("usk-hidden");
  }

  function updateChannelFlag() {
    const onChannel = CONFIG.allowFromChannels && isChannelPath();
    if (onChannel) document.documentElement.setAttribute("data-usk-channel", "1");
    else document.documentElement.removeAttribute("data-usk-channel");
  }

  // -------------------------------------------------------- Verrou / vidéo

  function markChecking(on) {
    if (on) document.documentElement.setAttribute("data-usk-checking", "1");
    else document.documentElement.removeAttribute("data-usk-checking");
  }

  function pauseVideos() {
    const doPause = function () {
      const vids = document.querySelectorAll("video");
      for (let i = 0; i < vids.length; i++) {
        try {
          vids[i].pause();
        } catch (e) {
          /* ignore */
        }
      }
    };
    doPause();
    clearInterval(pauseTimer);
    pauseTimer = setInterval(doPause, 400);
  }

  function resumeVideos() {
    clearInterval(pauseTimer);
    pauseTimer = null;
  }

  // ----------------------------------------------------------- Navigation

  function handleNavigation() {
    const prev = currentPath;
    currentPath = location.pathname;

    updateChannelFlag();
    hideShortItems(document);

    if (isShortsPath(currentPath)) {
      guardShorts(currentPath, prev);
    } else {
      markChecking(false);
      resumeVideos();
      U.removeGate();
    }
  }

  async function guardShorts(path, prevPath) {
    // Garde désactivée → laisser passer.
    if (!CONFIG.enabled || !CONFIG.gateEnabled) {
      markChecking(false);
      return;
    }

    // Exception : Short ouvert depuis une chaîne de créateur.
    if (CONFIG.allowFromChannels && isChannelPath(prevPath)) {
      markChecking(false);
      return;
    }

    markChecking(true);
    pauseVideos();

    const unlockedUntil = await U.getUnlockedUntil();
    if (unlockedUntil > Date.now()) {
      onUnlocked(path);
      return;
    }

    U.showGate(CONFIG, async function () {
      const until = Date.now() + CONFIG.unlockMinutes * 60000;
      await U.setUnlockedUntil(until);
      onUnlocked(path);
    });
  }

  function onUnlocked(path) {
    U.removeGate();
    if (CONFIG.openMode === "watch") {
      const id = shortsIdFromPath(path);
      if (id) {
        resumeVideos();
        location.replace("/watch?v=" + id);
        return;
      }
    }
    markChecking(false);
    resumeVideos();
  }

  // ------------------------------------------------------- Fenêtre 3 questions

  U.showGate = function (config, onSuccess) {
    U.removeGate();

    const wrap = document.createElement("div");
    wrap.id = "usk-gate";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");

    const card = document.createElement("div");
    card.className = "usk-card";

    const title = document.createElement("h1");
    title.className = "usk-title";
    title.textContent = "Es-tu sûr de vouloir regarder des Shorts ?";

    const sub = document.createElement("p");
    sub.className = "usk-sub";
    sub.textContent =
      "Réponds aux 3 questions pour débloquer " +
      config.unlockMinutes +
      " min. Sinon, reviens à l'essentiel.";

    const form = document.createElement("form");
    form.className = "usk-form";

    const fields = [];
    const questions = (config.questions || []).slice(0, 3);
    questions.forEach(function (q, i) {
      const field = document.createElement("label");
      field.className = "usk-field";

      const qt = document.createElement("span");
      qt.className = "usk-q";
      qt.textContent = i + 1 + ". " + q;

      const ta = document.createElement("textarea");
      ta.className = "usk-input";
      ta.rows = 2;
      ta.setAttribute("autocomplete", "off");
      ta.setAttribute("spellcheck", "false");

      field.appendChild(qt);
      field.appendChild(ta);
      form.appendChild(field);
      fields.push(ta);
    });

    const hint = document.createElement("p");
    hint.className = "usk-hint";

    const actions = document.createElement("div");
    actions.className = "usk-actions";

    const leave = document.createElement("button");
    leave.type = "button";
    leave.className = "usk-btn usk-leave";
    leave.textContent = "Quitter les Shorts";
    leave.addEventListener("click", function () {
      location.replace("/");
    });

    const unlock = document.createElement("button");
    unlock.type = "submit";
    unlock.className = "usk-btn usk-unlock";
    unlock.textContent = "Débloquer";
    unlock.disabled = true;

    function validate() {
      const min = config.minAnswerLength || 1;
      const ok = fields.every(function (f) {
        return f.value.trim().length >= min;
      });
      unlock.disabled = !ok;
      hint.textContent = ok
        ? ""
        : "Chaque réponse doit faire au moins " + min + " caractères.";
      return ok;
    }

    fields.forEach(function (f) {
      f.addEventListener("input", validate);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) return;
      U.removeGate();
      if (typeof onSuccess === "function") onSuccess();
    });

    actions.appendChild(leave);
    actions.appendChild(unlock);
    card.appendChild(title);
    card.appendChild(sub);
    form.appendChild(actions);
    form.appendChild(hint);
    card.appendChild(form);
    wrap.appendChild(card);
    (document.body || document.documentElement).appendChild(wrap);

    validate();
    if (fields[0]) fields[0].focus();
  };

  U.removeGate = function () {
    const g = document.getElementById("usk-gate");
    if (g) g.remove();
  };

  // ----------------------------------------------------------------- Setup

  function debounce(fn, ms) {
    let t = null;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  function setupNavigationHooks() {
    const fire = function () {
      handleNavigation();
    };
    window.addEventListener("yt-navigate-finish", fire, true);
    window.addEventListener("yt-navigate-start", fire, true);
    window.addEventListener("popstate", fire, true);

    ["pushState", "replaceState"].forEach(function (m) {
      const orig = history[m];
      if (typeof orig !== "function") return;
      history[m] = function () {
        const r = orig.apply(this, arguments);
        fire();
        return r;
      };
    });

    // Filet de sécurité : YouTube est une SPA, on surveille aussi l'URL.
    let last = location.pathname + location.search;
    setInterval(function () {
      const cur = location.pathname + location.search;
      if (cur !== last) {
        last = cur;
        fire();
      }
    }, 400);
  }

  function observeMutations() {
    const obs = new MutationObserver(
      debounce(function () {
        if (CONFIG.enabled && CONFIG.hideShorts) hideShortItems(document);
      }, 150)
    );
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  async function init() {
    CONFIG = await U.getConfig();

    if (U.api && U.api.storage && U.api.storage.onChanged) {
      U.api.storage.onChanged.addListener(function (changes, area) {
        if (area !== "local" || !changes[U.STORAGE_KEY]) return;
        CONFIG = Object.assign({}, U.DEFAULTS, changes[U.STORAGE_KEY].newValue || {});
        if (!CONFIG.enabled || !CONFIG.hideShorts) unhideAll();
        updateChannelFlag();
        hideShortItems(document);
      });
    }

    setupNavigationHooks();
    observeMutations();
    handleNavigation();
  }

  // Pré-marquage synchrone pour éviter le flash sur une page /shorts.
  if (isShortsPath()) markChecking(true);

  // Hooks de test (utilisés hors extension ; sans effet en usage réel).
  U.__test = {
    setConfig: function (c) {
      CONFIG = Object.assign({}, U.DEFAULTS, c || {});
    },
    hideShortItems: hideShortItems,
    unhideAll: unhideAll,
    updateChannelFlag: updateChannelFlag,
    isChannelPath: isChannelPath,
    isShortsPath: isShortsPath,
    shortsIdFromPath: shortsIdFromPath
  };

  // Démarrage uniquement dans un vrai contexte d'extension.
  if (U.api && U.api.storage) {
    init().catch(function () {
      /* ignore */
    });
  }
})();
