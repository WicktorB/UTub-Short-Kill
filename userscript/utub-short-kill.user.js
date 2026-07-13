// ==UserScript==
// @name         UTub Short Kill
// @namespace    utub-short-kill
// @version      1.1.0
// @description  Masque les YouTube Shorts partout (sauf sur les chaînes) et protège leur accès par 3 questions, avec minuteur et panneau de réglages. Safari iOS (app « Userscripts ») + desktop (Tampermonkey/Violentmonkey).
// @author       victor
// @match        *://*.youtube.com/*
// @match        *://youtube.com/*
// @run-at       document-start
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/WicktorB/YouTube-Short-Kill/main/userscript/utub-short-kill.user.js
// @updateURL    https://raw.githubusercontent.com/WicktorB/YouTube-Short-Kill/main/userscript/utub-short-kill.user.js
// ==/UserScript==

(function () {
  "use strict";

  // Ne s'exécute que dans la fenêtre principale (pas les iframes intégrées).
  if (window.top !== window.self) return;

  // ===================== RÉGLAGES PAR DÉFAUT =======================
  // Modifiables en direct via le bouton ⚙️ (stockés dans le navigateur),
  // ou ici pour changer les valeurs d'usine.
  var DEFAULTS = {
    enabled: true,
    hideShorts: true,
    gateEnabled: true,
    showTimer: true,
    allowFromChannels: true,
    showSettingsButton: true,
    openMode: "short", // "short" | "watch"
    unlockMinutes: 5,
    minAnswerLength: 15,
    questions: [
      "Pourquoi veux-tu regarder des Shorts maintenant ?",
      "Combien de temps comptes-tu y passer, précisément ?",
      "Qu'est-ce que tu devrais être en train de faire à la place ?"
    ]
  };
  // =================================================================

  var CONFIG_KEY = "usk_config";
  var UNLOCK_KEY = "usk_unlocked_until";

  var SHORTS_ITEM_ANCESTORS = [
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

  var LOGO_SVG =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="9.2" stroke="currentColor" stroke-width="2"/>' +
    '<path d="M10.2 8.6l5 3.4-5 3.4z" fill="currentColor"/>' +
    '<line x1="5.5" y1="5.5" x2="18.5" y2="18.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
    "</svg>";

  var CSS = [
    /* Anti-flash sur /shorts */
    'html[data-usk-checking="1"] ytd-shorts,',
    'html[data-usk-checking="1"] ytd-reel-video-renderer,',
    'html[data-usk-checking="1"] #shorts-player,',
    'html[data-usk-checking="1"] ytm-shorts,',
    'html[data-usk-checking="1"] .reel-video-in-sequence,',
    'html[data-usk-checking="1"] ytd-page-manager video { visibility: hidden !important; }',

    ".usk-hidden { display: none !important; }",

    /* Points d'entrée globaux : toujours masqués */
    'ytd-guide-entry-renderer:has(a[href^="/shorts"]),',
    'ytd-guide-entry-renderer:has(a[title="Shorts"]),',
    'ytd-mini-guide-entry-renderer:has(a[href^="/shorts"]),',
    'ytd-mini-guide-entry-renderer[aria-label="Shorts"],',
    'ytm-pivot-bar-item-renderer:has(a[href^="/shorts"]),',
    'ytm-pivot-bar-item-renderer:has([aria-label="Shorts" i]),',
    ".pivot-shorts { display: none !important; }",

    /* Étagères / sections / vignettes de Shorts : masquées sauf sur une chaîne */
    'html:not([data-usk-channel="1"]) ytd-rich-shelf-renderer[is-shorts],',
    'html:not([data-usk-channel="1"]) ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts]),',
    'html:not([data-usk-channel="1"]) ytd-rich-section-renderer:has(ytm-shorts-lockup-view-model),',
    'html:not([data-usk-channel="1"]) ytd-reel-shelf-renderer,',
    'html:not([data-usk-channel="1"]) ytm-reel-shelf-renderer,',
    'html:not([data-usk-channel="1"]) grid-shelf-view-model:has(a[href^="/shorts/"]),',
    'html:not([data-usk-channel="1"]) ytm-shorts-lockup-view-model,',
    'html:not([data-usk-channel="1"]) ytm-shorts-lockup-view-model-v2,',
    'html:not([data-usk-channel="1"]) ytd-rich-item-renderer:has(a[href^="/shorts/"]) { display: none !important; }',

    /* ---- Fenêtres modales (questions + réglages) : classe .usk-ov ---- */
    ".usk-ov { --usk-accent:#ef4444; --usk-green:#22c55e; position:fixed; inset:0; z-index:2147483647; display:flex; align-items:center; justify-content:center; padding:20px; background:radial-gradient(1200px 600px at 50% -10%, rgba(239,68,68,.14), transparent 60%), rgba(6,6,9,.86); backdrop-filter:blur(10px) saturate(120%); -webkit-backdrop-filter:blur(10px) saturate(120%); font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,system-ui,sans-serif; color:#fafafa; }",
    ".usk-ov * { box-sizing:border-box; }",
    ".usk-ov .usk-card { width:100%; max-width:500px; max-height:92vh; overflow-y:auto; padding:28px 26px; background:linear-gradient(180deg, rgba(30,30,36,.97), rgba(18,18,22,.97)); border:1px solid rgba(255,255,255,.09); border-radius:22px; box-shadow:0 24px 70px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.05); }",
    ".usk-ov .usk-head { display:flex; align-items:center; gap:12px; margin-bottom:14px; }",
    ".usk-ov .usk-logo { flex:none; width:32px; height:32px; color:var(--usk-accent); }",
    ".usk-ov .usk-logo svg { width:100%; height:100%; display:block; }",
    ".usk-ov .usk-title { margin:0; font-size:20px; font-weight:750; letter-spacing:-.01em; line-height:1.25; }",
    ".usk-ov .usk-sub { margin:0 0 20px; font-size:14px; line-height:1.5; color:#a1a1aa; }",
    ".usk-ov .usk-field { display:block; margin-bottom:16px; }",
    ".usk-ov .usk-q { display:block; margin-bottom:8px; font-size:14.5px; font-weight:600; color:#e4e4e7; }",
    ".usk-ov .usk-input { width:100%; resize:vertical; min-height:46px; padding:11px 13px; font-size:15px; font-family:inherit; color:#fafafa; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.12); border-radius:12px; outline:none; }",
    ".usk-ov .usk-input:focus { border-color:var(--usk-accent); box-shadow:0 0 0 3px rgba(239,68,68,.22); }",
    ".usk-ov .usk-actions { display:flex; gap:12px; margin-top:14px; }",
    ".usk-ov .usk-btn { flex:1; padding:12px 16px; font-size:15px; font-weight:650; font-family:inherit; border:1px solid transparent; border-radius:12px; cursor:pointer; }",
    ".usk-ov .usk-leave { color:#052e14; background:linear-gradient(180deg,#34d399,var(--usk-green)); box-shadow:0 8px 20px rgba(34,197,94,.28); }",
    ".usk-ov .usk-unlock { color:#fca5a5; background:rgba(239,68,68,.08); border-color:rgba(239,68,68,.35); }",
    ".usk-ov .usk-unlock:disabled { opacity:.4; cursor:not-allowed; }",
    ".usk-ov .usk-hint { margin:12px 0 0; min-height:16px; font-size:13px; color:#fca5a5; text-align:center; }",
    ".usk-ov .usk-gate-actions { flex:1.5; }",

    /* Réglages : lignes label/contrôle */
    ".usk-ov .usk-set-row { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,.07); font-size:14px; }",
    ".usk-ov .usk-set-row input[type=checkbox]{ width:20px; height:20px; flex:none; accent-color:var(--usk-accent); }",
    ".usk-ov .usk-set-row input[type=number]{ width:80px; padding:7px 9px; color:#fafafa; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.14); border-radius:8px; }",
    ".usk-ov select { padding:7px 9px; color:#fafafa; background:rgba(40,40,46,.95); border:1px solid rgba(255,255,255,.14); border-radius:8px; font-family:inherit; }",
    ".usk-ov .usk-set-qs { margin:14px 0 4px; }",
    ".usk-ov .usk-set-q { width:100%; margin-top:8px; padding:9px 11px; color:#fafafa; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.12); border-radius:10px; font-family:inherit; font-size:13.5px; }",

    /* Bouton ⚙️ */
    "#usk-gear { position:fixed; right:16px; bottom:16px; z-index:2147483645; width:42px; height:42px; border-radius:50%; display:none; align-items:center; justify-content:center; font-size:19px; cursor:pointer; color:#fff; background:rgba(9,9,12,.55); border:1px solid rgba(255,255,255,.14); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); opacity:.4; transition:opacity .15s ease, transform .15s ease; }",
    "#usk-gear:hover { opacity:1; transform:scale(1.06); }",

    /* Toast */
    "#usk-toast { position:fixed; bottom:74px; left:50%; transform:translateX(-50%); z-index:2147483647; padding:10px 16px; border-radius:999px; background:rgba(9,9,12,.92); color:#fff; font-family:-apple-system,system-ui,sans-serif; font-size:14px; border:1px solid rgba(255,255,255,.14); }",

    /* Minuteur */
    "#usk-timer { position:fixed; top:calc(env(safe-area-inset-top, 0px) + 12px); left:50%; transform:translateX(-50%); z-index:2147483646; pointer-events:none; display:flex; align-items:center; gap:8px; padding:6px 13px 6px 11px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,system-ui,sans-serif; font-size:13px; font-weight:650; font-variant-numeric:tabular-nums; letter-spacing:.02em; color:#fafafa; background:rgba(9,9,12,.55); border:1px solid rgba(255,255,255,.14); border-radius:999px; box-shadow:0 6px 20px rgba(0,0,0,.3); backdrop-filter:blur(10px) saturate(140%); -webkit-backdrop-filter:blur(10px) saturate(140%); opacity:.9; }",
    "#usk-timer .usk-timer-dot { width:8px; height:8px; border-radius:50%; background:#34d399; }",
    "#usk-timer.usk-timer-low { color:#fff; background:rgba(220,38,38,.82); border-color:rgba(255,255,255,.25); opacity:1; }",
    "#usk-timer.usk-timer-low .usk-timer-dot { background:#fff; animation:usk-pulse 1s ease-in-out infinite; }",
    "@keyframes usk-pulse { 0% { box-shadow:0 0 0 0 rgba(255,255,255,.6); } 70% { box-shadow:0 0 0 7px rgba(255,255,255,0); } 100% { box-shadow:0 0 0 0 rgba(255,255,255,0); } }"
  ].join("\n");

  // ----------------------------------------------------- petit helper DOM

  function h(tag, props, kids) {
    var e = document.createElement(tag);
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

  // -------------------------------------------------------- État / stockage

  var CONFIG = null;
  var currentPath = null;
  var pauseTimer = null;
  var unlockedUntil = 0;
  var wasUnlocked = false;

  function loadConfig() {
    var stored = {};
    try {
      stored = JSON.parse(localStorage.getItem(CONFIG_KEY) || "{}") || {};
    } catch (e) {
      stored = {};
    }
    return Object.assign({}, DEFAULTS, stored);
  }

  function saveConfig(patch) {
    var next = Object.assign({}, loadConfig(), patch);
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(next));
    } catch (e) {
      /* ignore */
    }
    CONFIG = next;
    applyConfigChange();
  }

  function getUnlockedUntil() {
    try {
      return parseInt(localStorage.getItem(UNLOCK_KEY) || "0", 10) || 0;
    } catch (e) {
      return 0;
    }
  }
  function setUnlockedUntil(ts) {
    unlockedUntil = ts;
    try {
      localStorage.setItem(UNLOCK_KEY, String(ts));
    } catch (e) {
      /* ignore */
    }
  }

  // ---------------------------------------------------------------- Chemins

  function isChannelPath(path) {
    return /^\/(@|channel\/|c\/|user\/)/.test(path != null ? path : location.pathname);
  }
  function isShortsPath(path) {
    return /^\/shorts\//.test(path != null ? path : location.pathname);
  }
  function shortsIdFromPath(path) {
    var m = (path != null ? path : location.pathname).match(/^\/shorts\/([^/?#]+)/);
    return m ? m[1] : null;
  }

  // ------------------------------------------------------------- Masquage

  function injectCSS() {
    if (document.getElementById("usk-style")) return;
    var style = h("style", { id: "usk-style", text: CSS });
    (document.head || document.documentElement).appendChild(style);
  }

  function closestItem(el) {
    var node = el;
    while (node && node.tagName && node.tagName.toLowerCase() !== "body") {
      if (SHORTS_ITEM_ANCESTORS.indexOf(node.tagName.toLowerCase()) !== -1) return node;
      node = node.parentElement;
    }
    return null;
  }

  function hideShortItems(root) {
    if (!CONFIG.enabled || !CONFIG.hideShorts) return;
    if (CONFIG.allowFromChannels && isChannelPath()) return;
    var anchors = (root || document).querySelectorAll('a[href^="/shorts/"]');
    for (var i = 0; i < anchors.length; i++) {
      var item = closestItem(anchors[i]);
      if (item) item.classList.add("usk-hidden");
    }
  }

  function unhideAll() {
    var hidden = document.querySelectorAll(".usk-hidden");
    for (var i = 0; i < hidden.length; i++) hidden[i].classList.remove("usk-hidden");
  }

  function updateChannelFlag() {
    var onChannel = CONFIG.allowFromChannels && isChannelPath();
    if (onChannel) document.documentElement.setAttribute("data-usk-channel", "1");
    else document.documentElement.removeAttribute("data-usk-channel");
  }

  // -------------------------------------------------------- Verrou / vidéo

  function markChecking(on) {
    if (on) document.documentElement.setAttribute("data-usk-checking", "1");
    else document.documentElement.removeAttribute("data-usk-checking");
  }

  function pauseVideos() {
    var doPause = function () {
      var vids = document.querySelectorAll("video");
      for (var i = 0; i < vids.length; i++) {
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
    var prev = currentPath;
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
    if (!CONFIG.enabled || !CONFIG.gateEnabled) {
      markChecking(false);
      return;
    }
    if (CONFIG.allowFromChannels && isChannelPath(prevPath)) {
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
      setUnlockedUntil(Date.now() + CONFIG.unlockMinutes * 60000);
      onUnlocked(path);
      tickTimer();
    });
  }

  function onUnlocked(path) {
    removeGate();
    if (CONFIG.openMode === "watch") {
      var id = shortsIdFromPath(path);
      if (id) {
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
    var hh = Math.floor(totalSec / 3600);
    var mm = Math.floor((totalSec % 3600) / 60);
    var ss = totalSec % 60;
    return hh > 0 ? hh + ":" + pad(mm) + ":" + pad(ss) : mm + ":" + pad(ss);
  }
  function renderTimer(ms) {
    var el = document.getElementById("usk-timer");
    if (!el) {
      el = h("div", { id: "usk-timer", "aria-hidden": "true" }, [
        h("span", { class: "usk-timer-dot" }),
        h("span", { class: "usk-timer-text" })
      ]);
      (document.body || document.documentElement).appendChild(el);
    }
    var totalSec = Math.ceil(ms / 1000);
    el.querySelector(".usk-timer-text").textContent = formatTime(totalSec);
    if (totalSec <= 30) el.classList.add("usk-timer-low");
    else el.classList.remove("usk-timer-low");
  }
  function removeTimer() {
    var el = document.getElementById("usk-timer");
    if (el) el.remove();
  }
  function tickTimer() {
    var onShorts = isShortsPath();
    var remaining = unlockedUntil - Date.now();
    var gateOpen = !!document.getElementById("usk-gate");
    if (CONFIG.enabled && CONFIG.showTimer && onShorts && remaining > 0 && !gateOpen) {
      renderTimer(remaining);
    } else {
      removeTimer();
    }
    if (onShorts && CONFIG.enabled && CONFIG.gateEnabled && wasUnlocked && remaining <= 0 && !gateOpen) {
      guardShorts(location.pathname, location.pathname);
    }
    wasUnlocked = remaining > 0;
  }

  // ------------------------------------------------------- Fenêtre 3 questions

  function showGate(onSuccess) {
    removeGate();
    var fields = [];
    var hint = h("p", { class: "usk-hint" });
    var unlock = h("button", { type: "submit", class: "usk-btn usk-unlock", text: "Débloquer" });
    unlock.disabled = true;

    function validate() {
      var min = CONFIG.minAnswerLength || 1;
      var ok = fields.every(function (f) {
        return f.value.trim().length >= min;
      });
      unlock.disabled = !ok;
      hint.textContent = ok ? "" : "Chaque réponse doit faire au moins " + min + " caractères.";
      return ok;
    }

    var form = h("form", { class: "usk-form" });
    CONFIG.questions.slice(0, 3).forEach(function (q, i) {
      var ta = h("textarea", { class: "usk-input", rows: "2", autocomplete: "off", spellcheck: "false" });
      ta.addEventListener("input", validate);
      fields.push(ta);
      form.appendChild(h("label", { class: "usk-field" }, [h("span", { class: "usk-q", text: i + 1 + ". " + q }), ta]));
    });

    var leave = h("button", {
      type: "button",
      class: "usk-btn usk-leave usk-gate-actions",
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

    var card = h("div", { class: "usk-card" }, [
      h("div", { class: "usk-head" }, [
        h("span", { class: "usk-logo", html: LOGO_SVG }),
        h("h1", { class: "usk-title", text: "Es-tu sûr de vouloir regarder des Shorts ?" })
      ]),
      h("p", {
        class: "usk-sub",
        text: "Réponds aux 3 questions pour débloquer " + CONFIG.unlockMinutes + " min. Sinon, reviens à l'essentiel."
      }),
      form
    ]);

    var wrap = h("div", { id: "usk-gate", class: "usk-ov", role: "dialog", "aria-modal": "true" }, [card]);
    (document.body || document.documentElement).appendChild(wrap);
    validate();
    if (fields[0]) fields[0].focus();
  }

  function removeGate() {
    var g = document.getElementById("usk-gate");
    if (g) g.remove();
  }

  // --------------------------------------------------------- Bouton ⚙️ + réglages

  function ensureGear() {
    if (document.getElementById("usk-gear")) return;
    if (!document.body) return;
    var gear = h("div", {
      id: "usk-gear",
      title: "Réglages UTub Short Kill",
      text: "⚙️",
      onclick: openSettings
    });
    document.body.appendChild(gear);
  }

  function updateGear() {
    var gear = document.getElementById("usk-gear");
    if (!gear) return;
    var show = CONFIG.showSettingsButton && !isShortsPath();
    gear.style.display = show ? "flex" : "none";
  }

  function toast(msg) {
    var old = document.getElementById("usk-toast");
    if (old) old.remove();
    var t = h("div", { id: "usk-toast", text: msg });
    (document.body || document.documentElement).appendChild(t);
    setTimeout(function () {
      if (t && t.parentNode) t.remove();
    }, 1600);
  }

  function closeSettings() {
    var s = document.getElementById("usk-settings");
    if (s) s.remove();
  }

  function openSettings() {
    if (document.getElementById("usk-settings")) return;
    var cfg = CONFIG;
    var refs = {};

    function toggleRow(key, label) {
      var input = h("input", { type: "checkbox" });
      input.checked = !!cfg[key];
      refs[key] = input;
      return h("label", { class: "usk-set-row" }, [h("span", { text: label }), input]);
    }
    function numRow(key, label, min, max) {
      var input = h("input", { type: "number", min: String(min), max: String(max) });
      input.value = cfg[key];
      refs[key] = input;
      return h("label", { class: "usk-set-row" }, [h("span", { text: label }), input]);
    }

    var openSel = h("select", {}, [
      h("option", { value: "short", text: "Lecteur Shorts" }),
      h("option", { value: "watch", text: "Lecteur normal (/watch)" })
    ]);
    openSel.value = cfg.openMode;
    refs.openMode = openSel;

    var qInputs = cfg.questions.slice(0, 3).map(function (qq) {
      var input = h("input", { type: "text", class: "usk-set-q" });
      input.value = qq;
      return input;
    });

    function save() {
      var patch = {};
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

    var lockBtn = h("button", {
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

    var card = h("div", { class: "usk-card" }, [
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

    var ov = h("div", { id: "usk-settings", class: "usk-ov", role: "dialog", "aria-modal": "true" }, [card]);
    ov.addEventListener("click", function (e) {
      if (e.target === ov) closeSettings();
    });
    (document.body || document.documentElement).appendChild(ov);
  }

  // ----------------------------------------------------------------- Setup

  function applyConfigChange() {
    if (!CONFIG.enabled || !CONFIG.hideShorts) unhideAll();
    updateChannelFlag();
    hideShortItems(document);
    ensureGear();
    updateGear();
    tickTimer();
  }

  function debounce(fn, ms) {
    var t = null;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  function setupNavigationHooks() {
    var fire = function () {
      handleNavigation();
    };
    window.addEventListener("yt-navigate-finish", fire, true);
    window.addEventListener("yt-navigate-start", fire, true);
    window.addEventListener("popstate", fire, true);
    ["pushState", "replaceState"].forEach(function (m) {
      var orig = history[m];
      if (typeof orig !== "function") return;
      history[m] = function () {
        var r = orig.apply(this, arguments);
        fire();
        return r;
      };
    });
    var last = location.pathname + location.search;
    setInterval(function () {
      var cur = location.pathname + location.search;
      if (cur !== last) {
        last = cur;
        fire();
      }
    }, 400);
  }

  function observeMutations() {
    var obs = new MutationObserver(
      debounce(function () {
        if (CONFIG.enabled && CONFIG.hideShorts) hideShortItems(document);
        ensureGear();
      }, 150)
    );
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  function init() {
    injectCSS();
    CONFIG = loadConfig();
    unlockedUntil = getUnlockedUntil();
    if (isShortsPath()) markChecking(true);
    setupNavigationHooks();
    observeMutations();
    setInterval(tickTimer, 1000);
    handleNavigation();
  }

  // Hooks de test (sans effet en usage réel).
  window.__USK_TEST = {
    loadConfig: loadConfig,
    saveConfig: saveConfig,
    openSettings: openSettings,
    closeSettings: closeSettings,
    formatTime: formatTime,
    getConfig: function () {
      return CONFIG;
    }
  };

  try {
    init();
  } catch (e) {
    /* ignore */
  }
})();
