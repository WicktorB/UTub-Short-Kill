// ==UserScript==
// @name         UTub Short Kill
// @namespace    utub-short-kill
// @version      1.0.0
// @description  Masque les YouTube Shorts partout (sauf sur les chaînes) et protège leur accès par 3 questions, avec minuteur. Fonctionne dans Safari iOS via l'app « Userscripts », et sur desktop via Tampermonkey/Violentmonkey.
// @author       victor
// @match        *://*.youtube.com/*
// @match        *://youtube.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // Ne s'exécute que dans la fenêtre principale (pas les iframes intégrées).
  if (window.top !== window.self) return;

  // ============================ RÉGLAGES ============================
  // Modifie ces valeurs directement ici si besoin (dans l'éditeur de l'app).
  var CONFIG = {
    enabled: true, // extension active
    hideShorts: true, // masquer les Shorts dans les feeds / recherche / reco
    gateEnabled: true, // exiger les 3 questions pour accéder à un Short
    showTimer: true, // afficher le minuteur pendant le visionnage
    allowFromChannels: true, // exception : Shorts accessibles depuis une chaîne
    openMode: "short", // "short" = lecteur Shorts | "watch" = lecteur normal
    unlockMinutes: 5, // durée de déblocage après réussite
    minAnswerLength: 15, // longueur minimale d'une réponse libre
    questions: [
      "Pourquoi veux-tu regarder des Shorts maintenant ?",
      "Combien de temps comptes-tu y passer, précisément ?",
      "Qu'est-ce que tu devrais être en train de faire à la place ?"
    ]
  };
  // =================================================================

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
    'ytd-guide-entry-renderer:has(a[href="/shorts"]),',
    'ytd-guide-entry-renderer:has(a[title="Shorts"]),',
    'ytd-mini-guide-entry-renderer:has(a[href="/shorts"]),',
    'ytd-mini-guide-entry-renderer[aria-label="Shorts"],',
    'ytm-pivot-bar-item-renderer:has(a[href="/shorts"]),',
    'ytm-pivot-bar-item-renderer:has([aria-label="Shorts" i]),',
    ".pivot-shorts { display: none !important; }",

    /* Étagères de Shorts : masquées sauf sur une page de chaîne */
    'html:not([data-usk-channel="1"]) ytd-rich-shelf-renderer[is-shorts],',
    'html:not([data-usk-channel="1"]) ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts]),',
    'html:not([data-usk-channel="1"]) ytd-reel-shelf-renderer,',
    'html:not([data-usk-channel="1"]) ytm-reel-shelf-renderer,',
    'html:not([data-usk-channel="1"]) grid-shelf-view-model:has(a[href^="/shorts/"]) { display: none !important; }',

    /* Fenêtre des 3 questions */
    "#usk-gate { --usk-accent:#ef4444; --usk-green:#22c55e; --usk-green-2:#16a34a; position:fixed; inset:0; z-index:2147483647; display:flex; align-items:center; justify-content:center; padding:20px; background:radial-gradient(1200px 600px at 50% -10%, rgba(239,68,68,.14), transparent 60%), rgba(6,6,9,.86); backdrop-filter:blur(10px) saturate(120%); -webkit-backdrop-filter:blur(10px) saturate(120%); font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,system-ui,sans-serif; color:#fafafa; }",
    "#usk-gate * { box-sizing:border-box; }",
    "#usk-gate .usk-card { width:100%; max-width:500px; max-height:92vh; overflow-y:auto; padding:30px 28px; background:linear-gradient(180deg, rgba(30,30,36,.96), rgba(18,18,22,.96)); border:1px solid rgba(255,255,255,.09); border-radius:22px; box-shadow:0 24px 70px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.05); }",
    "#usk-gate .usk-head { display:flex; align-items:center; gap:12px; margin-bottom:8px; }",
    "#usk-gate .usk-logo { flex:none; width:34px; height:34px; color:var(--usk-accent); }",
    "#usk-gate .usk-logo svg { width:100%; height:100%; display:block; }",
    "#usk-gate .usk-title { margin:0; font-size:21px; font-weight:750; letter-spacing:-.01em; line-height:1.25; }",
    "#usk-gate .usk-sub { margin:0 0 22px; font-size:14px; line-height:1.5; color:#a1a1aa; }",
    "#usk-gate .usk-field { display:block; margin-bottom:16px; }",
    "#usk-gate .usk-q { display:block; margin-bottom:8px; font-size:14.5px; font-weight:600; color:#e4e4e7; }",
    "#usk-gate .usk-input { width:100%; resize:vertical; min-height:46px; padding:11px 13px; font-size:15px; font-family:inherit; color:#fafafa; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.12); border-radius:12px; outline:none; }",
    "#usk-gate .usk-input:focus { background:rgba(255,255,255,.06); border-color:var(--usk-accent); box-shadow:0 0 0 3px rgba(239,68,68,.22); }",
    "#usk-gate .usk-actions { display:flex; gap:12px; margin-top:10px; }",
    "#usk-gate .usk-btn { flex:1; padding:13px 16px; font-size:15px; font-weight:650; font-family:inherit; border:1px solid transparent; border-radius:12px; cursor:pointer; }",
    "#usk-gate .usk-leave { flex:1.5; color:#052e14; background:linear-gradient(180deg,#34d399,var(--usk-green)); box-shadow:0 8px 20px rgba(34,197,94,.28); }",
    "#usk-gate .usk-unlock { color:#fca5a5; background:rgba(239,68,68,.08); border-color:rgba(239,68,68,.35); }",
    "#usk-gate .usk-unlock:disabled { opacity:.4; cursor:not-allowed; }",
    "#usk-gate .usk-hint { margin:12px 0 0; min-height:16px; font-size:13px; color:#fca5a5; text-align:center; }",

    /* Minuteur */
    "#usk-timer { position:fixed; top:calc(env(safe-area-inset-top, 0px) + 12px); left:50%; transform:translateX(-50%); z-index:2147483646; pointer-events:none; display:flex; align-items:center; gap:8px; padding:6px 13px 6px 11px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,system-ui,sans-serif; font-size:13px; font-weight:650; font-variant-numeric:tabular-nums; letter-spacing:.02em; color:#fafafa; background:rgba(9,9,12,.55); border:1px solid rgba(255,255,255,.14); border-radius:999px; box-shadow:0 6px 20px rgba(0,0,0,.3); backdrop-filter:blur(10px) saturate(140%); -webkit-backdrop-filter:blur(10px) saturate(140%); opacity:.9; }",
    "#usk-timer .usk-timer-dot { width:8px; height:8px; border-radius:50%; background:#34d399; }",
    "#usk-timer.usk-timer-low { color:#fff; background:rgba(220,38,38,.82); border-color:rgba(255,255,255,.25); opacity:1; }",
    "#usk-timer.usk-timer-low .usk-timer-dot { background:#fff; animation:usk-pulse 1s ease-in-out infinite; }",
    "@keyframes usk-pulse { 0% { box-shadow:0 0 0 0 rgba(255,255,255,.6); } 70% { box-shadow:0 0 0 7px rgba(255,255,255,0); } 100% { box-shadow:0 0 0 0 rgba(255,255,255,0); } }"
  ].join("\n");

  // -------------------------------------------------------- État / stockage

  var currentPath = null;
  var pauseTimer = null;
  var unlockedUntil = 0;
  var wasUnlocked = false;

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
    var style = document.createElement("style");
    style.id = "usk-style";
    style.textContent = CSS;
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
    var h = Math.floor(totalSec / 3600);
    var m = Math.floor((totalSec % 3600) / 60);
    var s = totalSec % 60;
    return h > 0 ? h + ":" + pad(m) + ":" + pad(s) : m + ":" + pad(s);
  }
  function renderTimer(ms) {
    var el = document.getElementById("usk-timer");
    if (!el) {
      el = document.createElement("div");
      el.id = "usk-timer";
      el.setAttribute("aria-hidden", "true");
      el.innerHTML = '<span class="usk-timer-dot"></span><span class="usk-timer-text"></span>';
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
    var wrap = document.createElement("div");
    wrap.id = "usk-gate";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");

    var card = document.createElement("div");
    card.className = "usk-card";

    var head = document.createElement("div");
    head.className = "usk-head";
    var logo = document.createElement("span");
    logo.className = "usk-logo";
    logo.innerHTML = LOGO_SVG;
    var title = document.createElement("h1");
    title.className = "usk-title";
    title.textContent = "Es-tu sûr de vouloir regarder des Shorts ?";
    head.appendChild(logo);
    head.appendChild(title);

    var sub = document.createElement("p");
    sub.className = "usk-sub";
    sub.textContent =
      "Réponds aux 3 questions pour débloquer " + CONFIG.unlockMinutes + " min. Sinon, reviens à l'essentiel.";

    var form = document.createElement("form");
    form.className = "usk-form";

    var fields = [];
    CONFIG.questions.slice(0, 3).forEach(function (q, i) {
      var field = document.createElement("label");
      field.className = "usk-field";
      var qt = document.createElement("span");
      qt.className = "usk-q";
      qt.textContent = i + 1 + ". " + q;
      var ta = document.createElement("textarea");
      ta.className = "usk-input";
      ta.rows = 2;
      ta.setAttribute("autocomplete", "off");
      ta.setAttribute("spellcheck", "false");
      field.appendChild(qt);
      field.appendChild(ta);
      form.appendChild(field);
      fields.push(ta);
    });

    var hint = document.createElement("p");
    hint.className = "usk-hint";

    var actions = document.createElement("div");
    actions.className = "usk-actions";

    var leave = document.createElement("button");
    leave.type = "button";
    leave.className = "usk-btn usk-leave";
    leave.textContent = "Quitter les Shorts";
    leave.addEventListener("click", function () {
      location.replace("/");
    });

    var unlock = document.createElement("button");
    unlock.type = "submit";
    unlock.className = "usk-btn usk-unlock";
    unlock.textContent = "Débloquer";
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
    fields.forEach(function (f) {
      f.addEventListener("input", validate);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) return;
      removeGate();
      if (typeof onSuccess === "function") onSuccess();
    });

    actions.appendChild(leave);
    actions.appendChild(unlock);
    card.appendChild(head);
    card.appendChild(sub);
    form.appendChild(actions);
    form.appendChild(hint);
    card.appendChild(form);
    wrap.appendChild(card);
    (document.body || document.documentElement).appendChild(wrap);
    validate();
    if (fields[0]) fields[0].focus();
  }

  function removeGate() {
    var g = document.getElementById("usk-gate");
    if (g) g.remove();
  }

  // ----------------------------------------------------------------- Setup

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
      }, 150)
    );
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  function init() {
    injectCSS();
    unlockedUntil = getUnlockedUntil();
    if (isShortsPath()) markChecking(true);
    setupNavigationHooks();
    observeMutations();
    setInterval(tickTimer, 1000);
    handleNavigation();
  }

  try {
    init();
  } catch (e) {
    /* ignore */
  }
})();
