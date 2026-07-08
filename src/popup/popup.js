// Popup de la barre d'outils : état rapide + verrouillage immédiat.
(function () {
  "use strict";

  const U = globalThis.USK;
  const enabledEl = document.getElementById("enabled");
  const stateEl = document.getElementById("lockState");

  async function refresh() {
    const config = await U.getConfig();
    enabledEl.checked = !!config.enabled;

    const until = await U.getUnlockedUntil();
    const remaining = until - Date.now();
    if (remaining > 0) {
      const min = Math.ceil(remaining / 60000);
      stateEl.textContent = "Shorts déverrouillés encore ~" + min + " min.";
    } else {
      stateEl.textContent = "Shorts verrouillés 🔒";
    }
  }

  enabledEl.addEventListener("change", async function () {
    await U.setConfig({ enabled: enabledEl.checked });
    refresh();
  });

  document.getElementById("relock").addEventListener("click", async function () {
    await U.setUnlockedUntil(0);
    refresh();
  });

  document.getElementById("openOptions").addEventListener("click", function () {
    if (U.api && U.api.runtime && U.api.runtime.openOptionsPage) {
      U.api.runtime.openOptionsPage();
    }
  });

  refresh();
})();
