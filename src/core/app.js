// Cœur commun : masquage des Shorts + garde d'accès (3 questions) + minuteur
// + panneau de réglages. Sans dépendance à une plateforme : le stockage est
// injecté (extension = chrome.storage, userscript = localStorage).
import cssText from "../styles/index.css";
import { DEFAULTS, mergeConfig } from "./config.js";

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

const LOGO_SVG =
  '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
  '<circle cx="12" cy="12" r="9.2" stroke="currentColor" stroke-width="2"/>' +
  '<path d="M10.2 8.6l5 3.4-5 3.4z" fill="currentColor"/>' +
  '<line x1="5.5" y1="5.5" x2="18.5" y2="18.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
  "</svg>";

// Petit helper de création DOM.
function h(tag, props, kids) {
  const e = document.createElement(tag);
  if (props) {
    Object.keys(props).forEach(function (k) {
      if (k === "class") e.className = props[k];
      else if (k === "text") e.textContent = props[k];
      else if (k === "html") e.innerHTML = props[k];
      else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), props[k]);
      else e.setAttribute(k, props[k]);
    });
  }
  (kids || []).forEach(function (c) {
    if (c) e.appendChild(c);
  });
  return e;
}

export function createApp(storage) {
  let config = DEFAULTS;
  let unlockedUntil = 0;
  let currentPath = null;
  let pauseTimer = null;
  let wasUnlocked = false;
  let checkingWatchdog = null;
  let lastRedirect = { id: null, at: 0 };

  // -------------------------------------------------------- Stockage / état

  async function reloadState() {
    config = mergeConfig(await storage.loadConfig());
    unlockedUntil = await storage.loadUnlock();
  }

  async function saveConfig(patch) {
    config = Object.assign({}, config, patch);
    await storage.saveConfig(config);
    applyConfigChange();
  }

  function setUnlockedUntil(ts) {
    unlockedUntil = ts;
    storage.saveUnlock(ts);
  }

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

  // Un Short vient-il d'une chaîne ? En navigation interne, on connaît la page
  // précédente ; en chargement direct, on se fie au référent (utile sur mobile,
  // où l'ouverture d'un Short depuis une chaîne recharge parfois la page).
  function cameFromChannel(prevPath) {
    if (isChannelPath(prevPath)) return true;
    if (prevPath == null && document.referrer) {
      try {
        const ref = new URL(document.referrer);
        if (ref.host === location.host && isChannelPath(ref.pathname)) return true;
      } catch (e) {
        /* ignore */
      }
    }
    return false;
  }

  // ------------------------------------------------------------- Masquage

  function injectCSS() {
    if (document.getElementById("usk-style")) return;
    const style = h("style", { id: "usk-style", text: cssText });
    (document.head || document.documentElement).appendChild(style);
  }

  function closestItem(el) {
    let node = el;
    while (node && node.tagName && node.tagName.toLowerCase() !== "body") {
      if (SHORTS_ITEM_ANCESTORS.indexOf(node.tagName.toLowerCase()) !== -1) return node;
      node = node.parentElement;
    }
    return null;
  }

  function hideShortItems(root) {
    if (!config.enabled || !config.hideShorts) return;
    if (config.allowFromChannels && isChannelPath()) return;
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
    const onChannel = config.allowFromChannels && isChannelPath();
    if (onChannel) document.documentElement.setAttribute("data-usk-channel", "1");
    else document.documentElement.removeAttribute("data-usk-channel");
  }

  // -------------------------------------------------------- Verrou / vidéo

  function markChecking(on) {
    if (on) {
      document.documentElement.setAttribute("data-usk-checking", "1");
      clearTimeout(checkingWatchdog);
      // Filet de sécurité : ne JAMAIS laisser la page bloquée (lecteur masqué)
      // si la fenêtre des questions n'a pas pu s'afficher.
      checkingWatchdog = setTimeout(function () {
        if (!document.getElementById("usk-gate")) {
          document.documentElement.removeAttribute("data-usk-checking");
          resumeVideos();
        }
      }, 2500);
    } else {
      document.documentElement.removeAttribute("data-usk-checking");
      clearTimeout(checkingWatchdog);
    }
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
      removeGate();
    }
    ensureGear();
    updateGear();
    tickTimer();
  }

  function guardShorts(path, prevPath) {
    if (!config.enabled || !config.gateEnabled) {
      markChecking(false);
      return;
    }
    if (config.allowFromChannels && cameFromChannel(prevPath)) {
      markChecking(false);
      return;
    }
    if (unlockedUntil > Date.now()) {
      onUnlocked(path);
      return;
    }
    markChecking(true);
    pauseVideos();
    showGate(function () {
      setUnlockedUntil(Date.now() + config.unlockMinutes * 60000);
      onUnlocked(path);
      tickTimer();
    });
  }

  function onUnlocked(path) {
    removeGate();
    if (config.openMode === "watch") {
      const id = shortsIdFromPath(path);
      // Garde anti-boucle : ne pas re-rediriger le même Short en rafale (si
      // YouTube renvoyait /watch → /shorts, on éviterait un cycle infini).
      const recent = lastRedirect.id === id && Date.now() - lastRedirect.at < 5000;
      if (id && !recent) {
        lastRedirect = { id: id, at: Date.now() };
        resumeVideos();
        location.replace("/watch?v=" + id);
        return;
      }
    }
    markChecking(false);
    resumeVideos();
  }

  // ------------------------------------------------------------- Minuteur

  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }
  function formatTime(totalSec) {
    if (totalSec < 0) totalSec = 0;
    const hh = Math.floor(totalSec / 3600);
    const mm = Math.floor((totalSec % 3600) / 60);
    const ss = totalSec % 60;
    return hh > 0 ? hh + ":" + pad(mm) + ":" + pad(ss) : mm + ":" + pad(ss);
  }
  function renderTimer(ms) {
    let el = document.getElementById("usk-timer");
    if (!el) {
      el = h("div", { id: "usk-timer", "aria-hidden": "true" }, [
        h("span", { class: "usk-timer-dot" }),
        h("span", { class: "usk-timer-text" })
      ]);
      document.documentElement.appendChild(el);
    }
    const totalSec = Math.ceil(ms / 1000);
    el.querySelector(".usk-timer-text").textContent = formatTime(totalSec);
    if (totalSec <= 30) el.classList.add("usk-timer-low");
    else el.classList.remove("usk-timer-low");
  }
  function removeTimer() {
    const el = document.getElementById("usk-timer");
    if (el) el.remove();
  }
  function tickTimer() {
    const onShorts = isShortsPath();
    const remaining = unlockedUntil - Date.now();
    const gateOpen = !!document.getElementById("usk-gate");
    if (config.enabled && config.showTimer && onShorts && remaining > 0 && !gateOpen) {
      renderTimer(remaining);
    } else {
      removeTimer();
    }
    if (onShorts && config.enabled && config.gateEnabled && wasUnlocked && remaining <= 0 && !gateOpen) {
      guardShorts(location.pathname, location.pathname);
    }
    wasUnlocked = remaining > 0;
  }

  // ------------------------------------------------------- Fenêtre 3 questions

  function showGate(onSuccess) {
    removeGate();
    const fields = [];
    const hint = h("p", { class: "usk-hint" });
    const unlock = h("button", { type: "submit", class: "usk-btn usk-unlock", text: "Débloquer" });
    unlock.disabled = true;

    function validate() {
      const min = config.minAnswerLength || 1;
      const ok = fields.every(function (f) {
        return f.value.trim().length >= min;
      });
      unlock.disabled = !ok;
      hint.textContent = ok ? "" : "Chaque réponse doit faire au moins " + min + " caractères.";
      return ok;
    }

    const form = h("form", { class: "usk-form" });
    config.questions.slice(0, 3).forEach(function (q, i) {
      const ta = h("textarea", { class: "usk-input", rows: "2", autocomplete: "off", spellcheck: "false" });
      ta.addEventListener("input", validate);
      fields.push(ta);
      form.appendChild(h("label", { class: "usk-field" }, [h("span", { class: "usk-q", text: i + 1 + ". " + q }), ta]));
    });

    const leave = h("button", {
      type: "button",
      class: "usk-btn usk-leave",
      text: "Quitter les Shorts",
      onclick: function () {
        location.replace("/");
      }
    });
    form.appendChild(h("div", { class: "usk-actions" }, [leave, unlock]));
    form.appendChild(hint);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) return;
      removeGate();
      if (typeof onSuccess === "function") onSuccess();
    });

    const card = h("div", { class: "usk-card" }, [
      h("div", { class: "usk-head" }, [
        h("span", { class: "usk-logo", html: LOGO_SVG }),
        h("h1", { class: "usk-title", text: "Es-tu sûr de vouloir regarder des Shorts ?" })
      ]),
      h("p", {
        class: "usk-sub",
        text: "Réponds aux 3 questions pour débloquer " + config.unlockMinutes + " min. Sinon, reviens à l'essentiel."
      }),
      form
    ]);
    const wrap = h("div", { id: "usk-gate", class: "usk-ov", role: "dialog", "aria-modal": "true" }, [card]);
    document.documentElement.appendChild(wrap);
    validate();
    if (fields[0]) fields[0].focus();
  }

  function removeGate() {
    const g = document.getElementById("usk-gate");
    if (g) g.remove();
  }

  // --------------------------------------------------------- Bouton ⚙️ + réglages

  function ensureGear() {
    if (document.getElementById("usk-gear")) return;
    document.documentElement.appendChild(
      h("div", {
        id: "usk-gear",
        title: "Réglages UTub Short Kill",
        text: "⚙️",
        onclick: function () {
          try {
            openSettings();
          } catch (e) {
            /* ignore */
          }
        }
      })
    );
  }
  function updateGear() {
    const gear = document.getElementById("usk-gear");
    if (!gear) return;
    gear.style.display = config.showSettingsButton && !isShortsPath() ? "flex" : "none";
  }

  function toast(msg) {
    const old = document.getElementById("usk-toast");
    if (old) old.remove();
    const t = h("div", { id: "usk-toast", text: msg });
    document.documentElement.appendChild(t);
    setTimeout(function () {
      if (t && t.parentNode) t.remove();
    }, 1600);
  }

  function closeSettings() {
    const s = document.getElementById("usk-settings");
    if (s) s.remove();
  }

  function openSettings() {
    if (document.getElementById("usk-settings")) return;
    const cfg = config;
    const refs = {};

    function toggleRow(key, label) {
      const input = h("input", { type: "checkbox" });
      input.checked = !!cfg[key];
      refs[key] = input;
      return h("label", { class: "usk-set-row" }, [h("span", { text: label }), input]);
    }
    function numRow(key, label, min, max) {
      const input = h("input", { type: "number", min: String(min), max: String(max) });
      input.value = cfg[key];
      refs[key] = input;
      return h("label", { class: "usk-set-row" }, [h("span", { text: label }), input]);
    }

    const openSel = h("select", {}, [
      h("option", { value: "short", text: "Lecteur Shorts" }),
      h("option", { value: "watch", text: "Lecteur normal (/watch)" })
    ]);
    openSel.value = cfg.openMode;
    refs.openMode = openSel;

    const qInputs = cfg.questions.slice(0, 3).map(function (qq) {
      const input = h("input", { type: "text", class: "usk-set-q" });
      input.value = qq;
      return input;
    });

    function save() {
      const patch = {};
      ["enabled", "hideShorts", "gateEnabled", "showTimer", "allowFromChannels", "showSettingsButton"].forEach(function (k) {
        patch[k] = refs[k].checked;
      });
      patch.openMode = refs.openMode.value;
      patch.unlockMinutes = parseInt(refs.unlockMinutes.value, 10) || DEFAULTS.unlockMinutes;
      patch.minAnswerLength = parseInt(refs.minAnswerLength.value, 10) || DEFAULTS.minAnswerLength;
      patch.questions = qInputs.map(function (inp, i) {
        return (inp.value || "").trim() || DEFAULTS.questions[i];
      });
      saveConfig(patch);
      closeSettings();
      toast("Réglages enregistrés ✓");
    }

    const lockBtn = h("button", {
      type: "button",
      class: "usk-btn usk-unlock",
      text: "Verrouiller maintenant",
      onclick: function () {
        setUnlockedUntil(0);
        if (isShortsPath()) guardShorts(location.pathname, location.pathname);
        tickTimer();
        toast("Verrouillé 🔒");
      }
    });
    lockBtn.disabled = false;

    const card = h("div", { class: "usk-card" }, [
      h("div", { class: "usk-head" }, [
        h("span", { class: "usk-logo", html: LOGO_SVG }),
        h("h1", { class: "usk-title", text: "Réglages" })
      ]),
      toggleRow("enabled", "Extension active"),
      toggleRow("hideShorts", "Masquer les Shorts"),
      toggleRow("gateEnabled", "Protéger l'accès (3 questions)"),
      toggleRow("showTimer", "Afficher le minuteur"),
      toggleRow("allowFromChannels", "Autoriser depuis les chaînes"),
      toggleRow("showSettingsButton", "Afficher le bouton ⚙️"),
      h("label", { class: "usk-set-row" }, [h("span", { text: "Ouverture d'un Short" }), openSel]),
      numRow("unlockMinutes", "Durée de déblocage (min)", 1, 240),
      numRow("minAnswerLength", "Longueur min. des réponses", 1, 200),
      h("div", { class: "usk-set-qs" }, [h("div", { class: "usk-q", text: "Les 3 questions" })].concat(qInputs)),
      h("div", { class: "usk-actions" }, [
        lockBtn,
        h("button", { type: "button", class: "usk-btn usk-leave", text: "Enregistrer", onclick: save })
      ])
    ]);

    const ov = h("div", { id: "usk-settings", class: "usk-ov", role: "dialog", "aria-modal": "true" }, [card]);
    ov.addEventListener("click", function (e) {
      if (e.target === ov) closeSettings();
    });
    document.documentElement.appendChild(ov);
  }

  // ----------------------------------------------------------------- Setup

  function applyConfigChange() {
    if (!config.enabled || !config.hideShorts) unhideAll();
    updateChannelFlag();
    hideShortItems(document);
    ensureGear();
    updateGear();
    tickTimer();
  }

  function debounce(fn, ms) {
    let t = null;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  function setupNavigationHooks() {
    // IMPORTANT : ce callback est appelé DANS history.pushState de YouTube.
    // S'il lève une exception, il casse la navigation de YouTube (boucle de
    // rechargement sur mobile). On l'isole donc systématiquement.
    const fire = function () {
      try {
        handleNavigation();
      } catch (e) {
        /* ne jamais casser la navigation de YouTube */
      }
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
        try {
          if (config.enabled && config.hideShorts) hideShortItems(document);
          ensureGear();
        } catch (e) {
          /* ignore */
        }
      }, 150)
    );
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  async function init() {
    injectCSS();
    if (isShortsPath()) markChecking(true);
    await reloadState();
    storage.onChange(async function () {
      try {
        await reloadState();
        applyConfigChange();
      } catch (e) {
        /* ignore */
      }
    });
    setupNavigationHooks();
    observeMutations();
    setInterval(function () {
      try {
        tickTimer();
      } catch (e) {
        /* ignore */
      }
    }, 1000);
    try {
      handleNavigation();
    } catch (e) {
      /* ignore */
    }

    // Hooks de test (sans effet en usage réel).
    window.__USK_TEST = {
      getConfig: function () {
        return config;
      },
      setConfig: function (c) {
        config = mergeConfig(c);
      },
      loadConfig: async function () {
        return mergeConfig(await storage.loadConfig());
      },
      saveConfig: saveConfig,
      setUnlocked: function (ts) {
        unlockedUntil = ts;
      },
      openSettings: openSettings,
      closeSettings: closeSettings,
      isChannelPath: isChannelPath,
      isShortsPath: isShortsPath,
      shortsIdFromPath: shortsIdFromPath,
      hideShortItems: hideShortItems,
      unhideAll: unhideAll,
      updateChannelFlag: updateChannelFlag,
      formatTime: formatTime,
      renderTimer: renderTimer,
      removeTimer: removeTimer
    };
  }

  return { init };
}
