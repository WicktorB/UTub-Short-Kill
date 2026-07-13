(() => {
  // src/styles/index.css
  var styles_default = `/* ============================================================= */
/* Anti-flash sur /shorts (tant que le verrou n'est pas \xE9valu\xE9)   */
/* ============================================================= */
html[data-usk-checking="1"] ytd-shorts,
html[data-usk-checking="1"] ytd-reel-video-renderer,
html[data-usk-checking="1"] #shorts-player,
html[data-usk-checking="1"] ytm-shorts,
html[data-usk-checking="1"] .reel-video-in-sequence,
html[data-usk-checking="1"] ytd-page-manager video {
  visibility: hidden !important;
}

.usk-hidden {
  display: none !important;
}

/* ============================================================= */
/* Points d'entr\xE9e GLOBAUX vers les Shorts : toujours masqu\xE9s     */
/* ============================================================= */
ytd-guide-entry-renderer:has(a[href^="/shorts"]),
ytd-guide-entry-renderer:has(a[title="Shorts"]),
ytd-mini-guide-entry-renderer:has(a[href^="/shorts"]),
ytd-mini-guide-entry-renderer[aria-label="Shorts"],
ytm-pivot-bar-item-renderer:has(a[href^="/shorts"]),
ytm-pivot-bar-item-renderer:has([aria-label="Shorts" i]),
.pivot-shorts {
  display: none !important;
}

/* ============================================================= */
/* \xC9tag\xE8res / sections / vignettes de Shorts : masqu\xE9es SAUF cha\xEEne */
/* ============================================================= */
html:not([data-usk-channel="1"]) ytd-rich-shelf-renderer[is-shorts],
html:not([data-usk-channel="1"]) ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts]),
html:not([data-usk-channel="1"]) ytd-rich-section-renderer:has(ytm-shorts-lockup-view-model),
html:not([data-usk-channel="1"]) ytd-reel-shelf-renderer,
html:not([data-usk-channel="1"]) ytm-reel-shelf-renderer,
html:not([data-usk-channel="1"]) grid-shelf-view-model:has(a[href^="/shorts/"]),
html:not([data-usk-channel="1"]) ytm-shorts-lockup-view-model,
html:not([data-usk-channel="1"]) ytm-shorts-lockup-view-model-v2,
html:not([data-usk-channel="1"]) ytd-rich-item-renderer:has(a[href^="/shorts/"]) {
  display: none !important;
}

/* ============================================================= */
/* Fen\xEAtres modales : 3 questions + r\xE9glages (classe .usk-ov)     */
/* ============================================================= */
.usk-ov {
  --usk-accent: #ef4444;
  --usk-green: #22c55e;
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: radial-gradient(1200px 600px at 50% -10%, rgba(239, 68, 68, 0.14), transparent 60%),
    rgba(6, 6, 9, 0.86);
  backdrop-filter: blur(10px) saturate(120%);
  -webkit-backdrop-filter: blur(10px) saturate(120%);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, system-ui, sans-serif;
  color: #fafafa;
}
.usk-ov * {
  box-sizing: border-box;
}
.usk-ov .usk-card {
  width: 100%;
  max-width: 500px;
  max-height: 92vh;
  overflow-y: auto;
  padding: 28px 26px;
  background: linear-gradient(180deg, rgba(30, 30, 36, 0.97), rgba(18, 18, 22, 0.97));
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 22px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
.usk-ov .usk-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}
.usk-ov .usk-logo {
  flex: none;
  width: 32px;
  height: 32px;
  color: var(--usk-accent);
}
.usk-ov .usk-logo svg {
  width: 100%;
  height: 100%;
  display: block;
}
.usk-ov .usk-title {
  margin: 0;
  font-size: 20px;
  font-weight: 750;
  letter-spacing: -0.01em;
  line-height: 1.25;
}
.usk-ov .usk-sub {
  margin: 0 0 20px;
  font-size: 14px;
  line-height: 1.5;
  color: #a1a1aa;
}
.usk-ov .usk-field {
  display: block;
  margin-bottom: 16px;
}
.usk-ov .usk-q {
  display: block;
  margin-bottom: 8px;
  font-size: 14.5px;
  font-weight: 600;
  color: #e4e4e7;
}
.usk-ov .usk-input {
  width: 100%;
  resize: vertical;
  min-height: 46px;
  padding: 11px 13px;
  font-size: 15px;
  font-family: inherit;
  color: #fafafa;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  outline: none;
}
.usk-ov .usk-input:focus {
  border-color: var(--usk-accent);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.22);
}
.usk-ov .usk-actions {
  display: flex;
  gap: 12px;
  margin-top: 14px;
}
.usk-ov .usk-btn {
  flex: 1;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 650;
  font-family: inherit;
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
}
.usk-ov .usk-leave {
  color: #052e14;
  background: linear-gradient(180deg, #34d399, var(--usk-green));
  box-shadow: 0 8px 20px rgba(34, 197, 94, 0.28);
}
.usk-ov .usk-unlock {
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.35);
}
.usk-ov .usk-unlock:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.usk-ov .usk-hint {
  margin: 12px 0 0;
  min-height: 16px;
  font-size: 13px;
  color: #fca5a5;
  text-align: center;
}

/* R\xE9glages : lignes label / contr\xF4le */
.usk-ov .usk-set-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  font-size: 14px;
}
.usk-ov .usk-set-row input[type="checkbox"] {
  width: 20px;
  height: 20px;
  flex: none;
  accent-color: var(--usk-accent);
}
.usk-ov .usk-set-row input[type="number"] {
  width: 80px;
  padding: 7px 9px;
  color: #fafafa;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
}
.usk-ov select {
  padding: 7px 9px;
  color: #fafafa;
  background: rgba(40, 40, 46, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  font-family: inherit;
}
.usk-ov .usk-set-qs {
  margin: 14px 0 4px;
}
.usk-ov .usk-set-q {
  width: 100%;
  margin-top: 8px;
  padding: 9px 11px;
  color: #fafafa;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  font-family: inherit;
  font-size: 13.5px;
}

/* ============================================================= */
/* Bouton \u2699\uFE0F                                                     */
/* ============================================================= */
#usk-gear {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 2147483645;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: none;
  align-items: center;
  justify-content: center;
  font-size: 19px;
  cursor: pointer;
  color: #fff;
  background: rgba(9, 9, 12, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  opacity: 0.4;
  transition: opacity 0.15s ease, transform 0.15s ease;
}
#usk-gear:hover {
  opacity: 1;
  transform: scale(1.06);
}
/* Sur mobile, d\xE9gager le bouton de la barre de navigation du bas de YouTube. */
@media (max-width: 900px) {
  #usk-gear {
    bottom: calc(env(safe-area-inset-bottom, 0px) + 76px);
    opacity: 0.85;
  }
}

/* ============================================================= */
/* Toast                                                         */
/* ============================================================= */
#usk-toast {
  position: fixed;
  bottom: 74px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2147483647;
  padding: 10px 16px;
  border-radius: 999px;
  background: rgba(9, 9, 12, 0.92);
  color: #fff;
  font-family: -apple-system, system-ui, sans-serif;
  font-size: 14px;
  border: 1px solid rgba(255, 255, 255, 0.14);
}

/* ============================================================= */
/* Minuteur                                                      */
/* ============================================================= */
#usk-timer {
  position: fixed;
  top: calc(env(safe-area-inset-top, 0px) + 12px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 2147483646;
  pointer-events: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 13px 6px 11px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, system-ui, sans-serif;
  font-size: 13px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  color: #fafafa;
  background: rgba(9, 9, 12, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px) saturate(140%);
  -webkit-backdrop-filter: blur(10px) saturate(140%);
  opacity: 0.9;
}
#usk-timer .usk-timer-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #34d399;
}
#usk-timer.usk-timer-low {
  color: #fff;
  background: rgba(220, 38, 38, 0.82);
  border-color: rgba(255, 255, 255, 0.25);
  opacity: 1;
}
#usk-timer.usk-timer-low .usk-timer-dot {
  background: #fff;
  animation: usk-pulse 1s ease-in-out infinite;
}
@keyframes usk-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.6);
  }
  70% {
    box-shadow: 0 0 0 7px rgba(255, 255, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
}
@media (prefers-reduced-motion: reduce) {
  #usk-gear,
  #usk-timer .usk-timer-dot {
    transition: none !important;
    animation: none !important;
  }
}
`;

  // src/core/config.js
  var DEFAULTS = {
    enabled: true,
    // extension active
    hideShorts: true,
    // masquer les Shorts dans les feeds / recherche / reco
    gateEnabled: true,
    // exiger les 3 questions pour accéder à un Short
    showTimer: true,
    // afficher le minuteur pendant le visionnage
    allowFromChannels: true,
    // exception : Shorts accessibles depuis une chaîne
    showSettingsButton: true,
    // bouton ⚙️ en bas à droite des pages YouTube
    openMode: "short",
    // "short" = lecteur Shorts | "watch" = lecteur normal
    unlockMinutes: 5,
    // durée de déblocage après réussite
    minAnswerLength: 15,
    // longueur minimale d'une réponse libre
    questions: [
      "Pourquoi veux-tu regarder des Shorts maintenant ?",
      "Combien de temps comptes-tu y passer, pr\xE9cis\xE9ment ?",
      "Qu'est-ce que tu devrais \xEAtre en train de faire \xE0 la place ?"
    ]
  };
  function mergeConfig(raw) {
    return Object.assign({}, DEFAULTS, raw || {});
  }

  // src/core/app.js
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
  var LOGO_SVG = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9.2" stroke="currentColor" stroke-width="2"/><path d="M10.2 8.6l5 3.4-5 3.4z" fill="currentColor"/><line x1="5.5" y1="5.5" x2="18.5" y2="18.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  function h(tag, props, kids) {
    const e = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function(k) {
        if (k === "class") e.className = props[k];
        else if (k === "text") e.textContent = props[k];
        else if (k === "html") e.innerHTML = props[k];
        else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), props[k]);
        else e.setAttribute(k, props[k]);
      });
    }
    (kids || []).forEach(function(c) {
      if (c) e.appendChild(c);
    });
    return e;
  }
  function createApp(storage) {
    let config = DEFAULTS;
    let unlockedUntil = 0;
    let currentPath = null;
    let pauseTimer = null;
    let wasUnlocked = false;
    let checkingWatchdog = null;
    let lastRedirect = { id: null, at: 0 };
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
    function cameFromChannel(prevPath) {
      if (isChannelPath(prevPath)) return true;
      if (prevPath == null && document.referrer) {
        try {
          const ref = new URL(document.referrer);
          if (ref.host === location.host && isChannelPath(ref.pathname)) return true;
        } catch (e) {
        }
      }
      return false;
    }
    function injectCSS() {
      if (document.getElementById("usk-style")) return;
      const style = h("style", { id: "usk-style", text: styles_default });
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
    function markChecking(on) {
      if (on) {
        document.documentElement.setAttribute("data-usk-checking", "1");
        clearTimeout(checkingWatchdog);
        checkingWatchdog = setTimeout(function() {
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
      const doPause = function() {
        const vids = document.querySelectorAll("video");
        for (let i = 0; i < vids.length; i++) {
          try {
            vids[i].pause();
          } catch (e) {
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
      showGate(function() {
        setUnlockedUntil(Date.now() + config.unlockMinutes * 6e4);
        onUnlocked(path);
        tickTimer();
      });
    }
    function onUnlocked(path) {
      removeGate();
      if (config.openMode === "watch") {
        const id = shortsIdFromPath(path);
        const recent = lastRedirect.id === id && Date.now() - lastRedirect.at < 5e3;
        if (id && !recent) {
          lastRedirect = { id, at: Date.now() };
          resumeVideos();
          location.replace("/watch?v=" + id);
          return;
        }
      }
      markChecking(false);
      resumeVideos();
    }
    function pad(n) {
      return n < 10 ? "0" + n : "" + n;
    }
    function formatTime(totalSec) {
      if (totalSec < 0) totalSec = 0;
      const hh = Math.floor(totalSec / 3600);
      const mm = Math.floor(totalSec % 3600 / 60);
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
      const totalSec = Math.ceil(ms / 1e3);
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
    function showGate(onSuccess) {
      removeGate();
      const fields = [];
      const hint = h("p", { class: "usk-hint" });
      const unlock = h("button", { type: "submit", class: "usk-btn usk-unlock", text: "D\xE9bloquer" });
      unlock.disabled = true;
      function validate() {
        const min = config.minAnswerLength || 1;
        const ok = fields.every(function(f) {
          return f.value.trim().length >= min;
        });
        unlock.disabled = !ok;
        hint.textContent = ok ? "" : "Chaque r\xE9ponse doit faire au moins " + min + " caract\xE8res.";
        return ok;
      }
      const form = h("form", { class: "usk-form" });
      config.questions.slice(0, 3).forEach(function(q, i) {
        const ta = h("textarea", { class: "usk-input", rows: "2", autocomplete: "off", spellcheck: "false" });
        ta.addEventListener("input", validate);
        fields.push(ta);
        form.appendChild(h("label", { class: "usk-field" }, [h("span", { class: "usk-q", text: i + 1 + ". " + q }), ta]));
      });
      const leave = h("button", {
        type: "button",
        class: "usk-btn usk-leave",
        text: "Quitter les Shorts",
        onclick: function() {
          location.replace("/");
        }
      });
      form.appendChild(h("div", { class: "usk-actions" }, [leave, unlock]));
      form.appendChild(hint);
      form.addEventListener("submit", function(e) {
        e.preventDefault();
        if (!validate()) return;
        removeGate();
        if (typeof onSuccess === "function") onSuccess();
      });
      const card = h("div", { class: "usk-card" }, [
        h("div", { class: "usk-head" }, [
          h("span", { class: "usk-logo", html: LOGO_SVG }),
          h("h1", { class: "usk-title", text: "Es-tu s\xFBr de vouloir regarder des Shorts ?" })
        ]),
        h("p", {
          class: "usk-sub",
          text: "R\xE9ponds aux 3 questions pour d\xE9bloquer " + config.unlockMinutes + " min. Sinon, reviens \xE0 l'essentiel."
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
    function ensureGear() {
      if (document.getElementById("usk-gear")) return;
      document.documentElement.appendChild(
        h("div", {
          id: "usk-gear",
          title: "R\xE9glages UTub Short Kill",
          text: "\u2699\uFE0F",
          onclick: function() {
            try {
              openSettings();
            } catch (e) {
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
      setTimeout(function() {
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
      const qInputs = cfg.questions.slice(0, 3).map(function(qq) {
        const input = h("input", { type: "text", class: "usk-set-q" });
        input.value = qq;
        return input;
      });
      function save() {
        const patch = {};
        ["enabled", "hideShorts", "gateEnabled", "showTimer", "allowFromChannels", "showSettingsButton"].forEach(function(k) {
          patch[k] = refs[k].checked;
        });
        patch.openMode = refs.openMode.value;
        patch.unlockMinutes = parseInt(refs.unlockMinutes.value, 10) || DEFAULTS.unlockMinutes;
        patch.minAnswerLength = parseInt(refs.minAnswerLength.value, 10) || DEFAULTS.minAnswerLength;
        patch.questions = qInputs.map(function(inp, i) {
          return (inp.value || "").trim() || DEFAULTS.questions[i];
        });
        saveConfig(patch);
        closeSettings();
        toast("R\xE9glages enregistr\xE9s \u2713");
      }
      const lockBtn = h("button", {
        type: "button",
        class: "usk-btn usk-unlock",
        text: "Verrouiller maintenant",
        onclick: function() {
          setUnlockedUntil(0);
          if (isShortsPath()) guardShorts(location.pathname, location.pathname);
          tickTimer();
          toast("Verrouill\xE9 \u{1F512}");
        }
      });
      lockBtn.disabled = false;
      const card = h("div", { class: "usk-card" }, [
        h("div", { class: "usk-head" }, [
          h("span", { class: "usk-logo", html: LOGO_SVG }),
          h("h1", { class: "usk-title", text: "R\xE9glages" })
        ]),
        toggleRow("enabled", "Extension active"),
        toggleRow("hideShorts", "Masquer les Shorts"),
        toggleRow("gateEnabled", "Prot\xE9ger l'acc\xE8s (3 questions)"),
        toggleRow("showTimer", "Afficher le minuteur"),
        toggleRow("allowFromChannels", "Autoriser depuis les cha\xEEnes"),
        toggleRow("showSettingsButton", "Afficher le bouton \u2699\uFE0F"),
        h("label", { class: "usk-set-row" }, [h("span", { text: "Ouverture d'un Short" }), openSel]),
        numRow("unlockMinutes", "Dur\xE9e de d\xE9blocage (min)", 1, 240),
        numRow("minAnswerLength", "Longueur min. des r\xE9ponses", 1, 200),
        h("div", { class: "usk-set-qs" }, [h("div", { class: "usk-q", text: "Les 3 questions" })].concat(qInputs)),
        h("div", { class: "usk-actions" }, [
          lockBtn,
          h("button", { type: "button", class: "usk-btn usk-leave", text: "Enregistrer", onclick: save })
        ])
      ]);
      const ov = h("div", { id: "usk-settings", class: "usk-ov", role: "dialog", "aria-modal": "true" }, [card]);
      ov.addEventListener("click", function(e) {
        if (e.target === ov) closeSettings();
      });
      document.documentElement.appendChild(ov);
    }
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
      return function() {
        clearTimeout(t);
        t = setTimeout(fn, ms);
      };
    }
    function setupNavigationHooks() {
      const fire = function() {
        try {
          handleNavigation();
        } catch (e) {
        }
      };
      window.addEventListener("yt-navigate-finish", fire, true);
      window.addEventListener("yt-navigate-start", fire, true);
      window.addEventListener("popstate", fire, true);
      ["pushState", "replaceState"].forEach(function(m) {
        const orig = history[m];
        if (typeof orig !== "function") return;
        history[m] = function() {
          const r = orig.apply(this, arguments);
          fire();
          return r;
        };
      });
      let last = location.pathname + location.search;
      setInterval(function() {
        const cur = location.pathname + location.search;
        if (cur !== last) {
          last = cur;
          fire();
        }
      }, 400);
    }
    function observeMutations() {
      const obs = new MutationObserver(
        debounce(function() {
          try {
            if (config.enabled && config.hideShorts) hideShortItems(document);
            ensureGear();
          } catch (e) {
          }
        }, 150)
      );
      obs.observe(document.documentElement, { childList: true, subtree: true });
    }
    async function init() {
      injectCSS();
      if (isShortsPath()) markChecking(true);
      await reloadState();
      storage.onChange(async function() {
        try {
          await reloadState();
          applyConfigChange();
        } catch (e) {
        }
      });
      setupNavigationHooks();
      observeMutations();
      setInterval(function() {
        try {
          tickTimer();
        } catch (e) {
        }
      }, 1e3);
      try {
        handleNavigation();
      } catch (e) {
      }
      window.__USK_TEST = {
        getConfig: function() {
          return config;
        },
        setConfig: function(c) {
          config = mergeConfig(c);
        },
        loadConfig: async function() {
          return mergeConfig(await storage.loadConfig());
        },
        saveConfig,
        setUnlocked: function(ts) {
          unlockedUntil = ts;
        },
        openSettings,
        closeSettings,
        isChannelPath,
        isShortsPath,
        shortsIdFromPath,
        hideShortItems,
        unhideAll,
        updateChannelFlag,
        formatTime,
        renderTimer,
        removeTimer
      };
    }
    return { init };
  }

  // src/platform/storage-extension.js
  function createExtensionStorage() {
    const api = typeof browser !== "undefined" && browser.storage ? browser : typeof chrome !== "undefined" && chrome.storage ? chrome : null;
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
        }
      },
      onChange(cb) {
        if (api && api.storage.onChanged) {
          api.storage.onChanged.addListener(function(changes, area) {
            if (area === "local" && (changes[CONFIG_KEY] || changes[UNLOCK_KEY])) cb();
          });
        }
      }
    };
  }

  // src/entry/extension.js
  if (window.top === window.self) {
    createApp(createExtensionStorage()).init().catch(function() {
    });
  }
})();
