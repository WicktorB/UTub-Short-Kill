// Popup de la barre d'outils : état + compte à rebours en direct + verrouillage.
(function () {
  "use strict";

  const U = globalThis.USK;
  const enabledEl = document.getElementById("enabled");
  const card = document.getElementById("card");
  const labelEl = document.getElementById("stateLabel");
  const timeEl = document.getElementById("stateTime");

  let unlockedUntil = 0;

  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function fmt(sec) {
    if (sec < 0) sec = 0;
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return h > 0 ? h + ":" + pad(m) + ":" + pad(s) : m + ":" + pad(s);
  }

  function render() {
    const remaining = unlockedUntil - Date.now();
    if (remaining > 0) {
      card.classList.add("unlocked");
      card.classList.remove("locked");
      labelEl.textContent = "Shorts déverrouillés";
      timeEl.textContent = "Temps restant : " + fmt(Math.ceil(remaining / 1000));
    } else {
      card.classList.add("locked");
      card.classList.remove("unlocked");
      labelEl.textContent = "Shorts verrouillés 🔒";
      timeEl.textContent = "";
    }
  }

  async function refresh() {
    const config = await U.getConfig();
    enabledEl.checked = !!config.enabled;
    unlockedUntil = await U.getUnlockedUntil();
    render();
  }

  enabledEl.addEventListener("change", async function () {
    await U.setConfig({ enabled: enabledEl.checked });
  });

  document.getElementById("relock").addEventListener("click", async function () {
    await U.setUnlockedUntil(0);
    unlockedUntil = 0;
    render();
  });

  document.getElementById("openOptions").addEventListener("click", function () {
    if (U.api && U.api.runtime && U.api.runtime.openOptionsPage) {
      U.api.runtime.openOptionsPage();
    }
  });

  setInterval(render, 1000); // compte à rebours en direct
  refresh();
})();
