// Page d'options : charge la config, la remplit dans le formulaire, sauvegarde
// à chaque modification.
(function () {
  "use strict";

  const U = globalThis.USK;

  const CHECKBOXES = ["enabled", "hideShorts", "gateEnabled", "showTimer", "allowFromChannels"];
  const NUMBERS = ["unlockMinutes", "minAnswerLength"];

  const statusEl = document.getElementById("status");
  let statusTimer = null;

  function flash(msg) {
    statusEl.textContent = msg;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(function () {
      statusEl.textContent = "";
    }, 1500);
  }

  function fill(config) {
    CHECKBOXES.forEach(function (k) {
      document.getElementById(k).checked = !!config[k];
    });
    NUMBERS.forEach(function (k) {
      document.getElementById(k).value = config[k];
    });
    document.getElementById("openMode").value = config.openMode;
    (config.questions || []).forEach(function (q, i) {
      const el = document.getElementById("q" + i);
      if (el) el.value = q;
    });
  }

  function collect() {
    const patch = {};
    CHECKBOXES.forEach(function (k) {
      patch[k] = document.getElementById(k).checked;
    });
    NUMBERS.forEach(function (k) {
      patch[k] = parseInt(document.getElementById(k).value, 10) || U.DEFAULTS[k];
    });
    patch.openMode = document.getElementById("openMode").value;
    patch.questions = [0, 1, 2].map(function (i) {
      const el = document.getElementById("q" + i);
      return (el.value || "").trim() || U.DEFAULTS.questions[i];
    });
    return patch;
  }

  async function save() {
    await U.setConfig(collect());
    flash("Enregistré ✓");
  }

  function bind() {
    CHECKBOXES.concat(NUMBERS)
      .concat(["openMode", "q0", "q1", "q2"])
      .forEach(function (id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("change", save);
      });

    document.getElementById("reset").addEventListener("click", async function () {
      await U.setConfig(U.DEFAULTS);
      fill(U.DEFAULTS);
      flash("Réinitialisé ✓");
    });
  }

  (async function () {
    fill(await U.getConfig());
    bind();
  })();
})();
