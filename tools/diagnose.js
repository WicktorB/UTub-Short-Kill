/*
 * UTub Short Kill — diagnostic des sélecteurs
 * -------------------------------------------
 * À COLLER dans la console du navigateur (F12 → Console) sur une page YouTube,
 * puis Entrée. Le résultat est COPIÉ automatiquement dans le presse-papier :
 * il n'y a plus qu'à le coller dans la conversation.
 *
 * Passe sur plusieurs pages (accueil, /feed/subscriptions, une recherche, une
 * page /watch, une chaîne /@...) et relance-le à chaque fois : il cumule les
 * pages. Colle le dernier résultat copié (il contient toutes les pages visitées).
 *
 * Pour repartir de zéro : localStorage.removeItem('usk_diag')
 */
(function () {
  "use strict";

  function isVisible(el) {
    if (!el) return false;
    var s = getComputedStyle(el);
    return s.display !== "none" && s.visibility !== "hidden" && el.offsetParent !== null;
  }

  // Remonte jusqu'au conteneur "renderer/…" qui enveloppe un lien Short.
  function container(a) {
    var n = a;
    while (n && n.tagName && n.tagName.toLowerCase() !== "body") {
      var t = n.tagName.toLowerCase();
      if (/renderer|view-model|lockup|shelf|item|section/.test(t)) return t;
      n = n.parentElement;
    }
    return "?";
  }

  var links = Array.prototype.slice.call(document.querySelectorAll('a[href^="/shorts/"]'));
  var guide = Array.prototype.slice
    .call(document.querySelectorAll("ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer, ytm-pivot-bar-item-renderer"))
    .filter(function (e) {
      return /shorts/i.test(e.innerHTML);
    });

  var tally = {};
  links.forEach(function (a) {
    var t = container(a);
    tally[t] = (tally[t] || 0) + 1;
  });

  var res = {
    page: location.pathname,
    lang: document.documentElement.lang || "?",
    installed: !!document.getElementById("usk-style"),
    shortsLinks: links.length,
    shortsLinksVisibles: links.filter(isVisible).length,
    entreesGlobales: guide.length,
    entreesGlobalesVisibles: guide.filter(isVisible).length,
    reelShelf: document.querySelectorAll("ytd-reel-shelf-renderer, ytm-reel-shelf-renderer").length,
    richShortsShelf: document.querySelectorAll("ytd-rich-shelf-renderer[is-shorts]").length,
    conteneurs: tally
  };

  // Cumule les pages visitées (remplace l'entrée si on repasse sur la même page).
  var all = [];
  try {
    all = JSON.parse(localStorage.getItem("usk_diag") || "[]");
  } catch (e) {
    all = [];
  }
  all = all.filter(function (x) {
    return x.page !== res.page;
  });
  all.push(res);
  try {
    localStorage.setItem("usk_diag", JSON.stringify(all));
  } catch (e) {
    /* ignore */
  }

  var out = "USK-DIAG " + JSON.stringify(all);

  var copied = false;
  try {
    // `copy` est l'utilitaire de la console des navigateurs.
    copy(out);
    copied = true;
  } catch (e) {
    copied = false;
  }

  console.log("%c=== UTub Short Kill — diagnostic (" + all.length + " page(s)) ===", "font-weight:bold;font-size:14px");
  console.log(out);
  console.log(
    "%c" + (copied ? "✅ Résultat copié dans le presse-papier — colle-le dans la conversation." : "⚠️ Sélectionne la ligne ci-dessus (USK-DIAG …) et copie-la."),
    "color:#22c55e;font-weight:bold"
  );
  return res;
})();
