/*
 * UTub Short Kill — diagnostic des sélecteurs
 * -------------------------------------------
 * À COLLER dans la console du navigateur (F12 → Console) sur une page YouTube,
 * puis appuie sur Entrée. Copie la sortie et envoie-la : elle indique quels
 * conteneurs de Shorts existent réellement sur TON YouTube (compte connecté,
 * langue, tests A/B), pour ajuster les sélecteurs au plus juste.
 *
 * Lance-le sur plusieurs pages : accueil, /feed/subscriptions, une recherche,
 * une page vidéo (/watch), et une chaîne (/@...).
 */
(function () {
  "use strict";

  function isVisible(el) {
    if (!el) return false;
    var s = getComputedStyle(el);
    return s.display !== "none" && s.visibility !== "hidden" && el.offsetParent !== null;
  }

  function ancestorChain(el, max) {
    var chain = [];
    var n = el;
    while (n && n.tagName && n.tagName.toLowerCase() !== "body" && chain.length < (max || 8)) {
      var tag = n.tagName.toLowerCase();
      if (n.id) tag += "#" + n.id;
      chain.push(tag);
      n = n.parentElement;
    }
    return chain.join(" > ");
  }

  var shortsLinks = Array.prototype.slice.call(document.querySelectorAll('a[href^="/shorts/"]'));
  var guideShorts = Array.prototype.slice
    .call(document.querySelectorAll("ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer, ytm-pivot-bar-item-renderer"))
    .filter(function (e) {
      return /shorts/i.test(e.innerHTML);
    });

  var summary = {
    page: location.pathname,
    href: location.href,
    lang: document.documentElement.lang || "?",
    uskInstalled: !!document.getElementById("usk-style"),
    shortsLinks_total: shortsLinks.length,
    shortsLinks_visibles: shortsLinks.filter(isVisible).length,
    entrees_globales_Shorts: guideShorts.length,
    entrees_globales_visibles: guideShorts.filter(isVisible).length,
    reelShelf: document.querySelectorAll("ytd-reel-shelf-renderer, ytm-reel-shelf-renderer").length,
    richShortsShelf: document.querySelectorAll("ytd-rich-shelf-renderer[is-shorts]").length
  };

  // Tags de conteneurs uniques autour des liens Shorts (les vrais noms à cibler)
  var tally = {};
  shortsLinks.slice(0, 40).forEach(function (a) {
    var n = a;
    while (n && n.tagName && n.tagName.toLowerCase() !== "body") {
      var t = n.tagName.toLowerCase();
      if (/renderer|view-model|lockup|shelf|item|section/.test(t)) {
        tally[t] = (tally[t] || 0) + 1;
        break;
      }
      n = n.parentElement;
    }
  });

  console.log("%c=== UTub Short Kill — diagnostic ===", "font-weight:bold;font-size:14px");
  console.log(JSON.stringify(summary, null, 2));
  console.log("Conteneurs directs des Shorts (à cibler) :");
  console.table(tally);
  console.log("Exemples de chaînes d'ancêtres :");
  shortsLinks.slice(0, 5).forEach(function (a) {
    console.log("  • " + ancestorChain(a));
  });
  console.log("%cCopie tout ce bloc et envoie-le.", "color:#22c55e");

  return summary;
})();
