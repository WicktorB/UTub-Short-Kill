# UTub Short Kill

[![CI](https://github.com/WicktorB/YouTube-Short-Kill/actions/workflows/ci.yml/badge.svg)](https://github.com/WicktorB/YouTube-Short-Kill/actions/workflows/ci.yml)

Supprime les **YouTube Shorts** de partout — accueil, abonnements, recherche,
recommandations, barre latérale, barre de navigation mobile — **sauf sur la page
d'une chaîne de créateur**. Pour ouvrir un Short, il faut **répondre manuellement à
3 questions** : juste assez de friction pour ne pas s'y perdre.

Deux formats, même effet : un **userscript** en un seul fichier (la voie la plus
simple, identique sur ordinateur et iPhone) et une **extension** Manifest V3
(Chrome, Edge, Brave, Firefox, Safari macOS/iOS).

## Ce que ça fait

| Objectif | Comment |
| --- | --- |
| Ne plus voir les Shorts | Masquage des étagères, items, onglets et boutons « Shorts » |
| Ne pas y accéder facilement | Toute page `/shorts/…` est bloquée par 3 questions |
| Exception : les chaînes | Sur `/@chaine`, `/channel/…`, les Shorts restent visibles/accessibles |
| Gagner du temps | Bouton « Quitter » bien en évidence ; option lecteur normal sans scroll infini |
| Rester conscient du temps | Minuteur discret en haut de l'écran (translucide, non bloquant) + re-verrouillage automatique à l'expiration |

## Installation

> **Recommandé : le userscript.** Même méthode sur ordinateur et iPhone, aucune
> compilation, et il **se met à jour tout seul**.

Lien du script (à ouvrir / coller) :

```
https://raw.githubusercontent.com/WicktorB/YouTube-Short-Kill/main/userscript/utub-short-kill.user.js
```

### Ordinateur — Chrome, Edge, Brave, Firefox, Safari
1. Installe **Tampermonkey** (gratuit) depuis le magasin d'extensions de ton navigateur.
2. Ouvre le lien du script ci-dessus → Tampermonkey affiche une page **« Installer »** → clique **Installer**.
3. Va sur `youtube.com` et recharge la page.

### iPhone — Safari
Installe l'app gratuite **« Userscripts »**, active-la dans *Réglages → Safari →
Extensions*, puis colle le script. Guide pas-à-pas :
**[`userscript/README.md`](userscript/README.md)**.

> **Réglages (dans les deux cas)** : un bouton **⚙️** apparaît en bas à droite des
> pages YouTube et ouvre le panneau d'options (persistant, il survit aux mises à jour).

<details>
<summary><b>Alternative — installer la « vraie » extension</b> (rendu app : page d'options + popup)</summary>

- **Chrome / Edge / Brave** : `chrome://extensions` → activer le **mode développeur** → *Charger l'extension non empaquetée* → sélectionner ce dossier.
- **Firefox** : `about:debugging#/runtime/this-firefox` → *Charger un module complémentaire temporaire* → `manifest.json` (temporaire jusqu'au redémarrage).
- **Safari macOS / iPhone (avec Xcode)** : voir **[`safari/README.md`](safari/README.md)**.
</details>

## Réglages

- **Userscript** : bouton **⚙️** en bas à droite des pages YouTube.
- **Extension** : clic sur l'icône de la barre d'outils → **Réglages…** (page d'options) + popup.

Options disponibles (dans les deux cas) :

- **Extension active** — coupe tout d'un coup.
- **Masquer les Shorts** — masquage dans les feeds/recherche/reco.
- **Protéger l'accès par 3 questions** — active la fenêtre de questions.
- **Afficher le minuteur** — pastille discrète (haut-centre, translucide, sans
  blocage des clics/taps) du temps restant ; passe en rouge et pulse dans les 30
  dernières secondes, puis re-verrouille automatiquement.
- **Autoriser depuis les chaînes** — laisse les Shorts d'un créateur accessibles.
- **Ouverture d'un Short débloqué** :
  - *Lecteur Shorts* — format vertical habituel une fois débloqué.
  - *Lecteur normal* — redirige `/shorts/ID` → `/watch?v=ID` : même vidéo, **sans
    le scroll infini** (le vrai piège à temps).
- **Durée de déblocage** — minutes d'accès accordées après réussite (défaut : 5).
- **Longueur minimale des réponses** — friction ajustable (défaut : 15 caractères).
- **Les 3 questions** — entièrement personnalisables.

Le popup de l'extension (et le panneau ⚙️ du userscript) permettent aussi de
**re-verrouiller immédiatement**.

## Comment marche le blocage

- Au chargement d'une page `/shorts/…`, le lecteur est masqué et la vidéo mise en
  pause tant que les questions ne sont pas validées (aucun flash).
- Réponses valides → déblocage temporisé stocké localement ; pendant ce laps de
  temps, les Shorts s'ouvrent sans re-demander.
- YouTube étant une application monopage, la navigation interne est suivie
  (History API + événements `yt-navigate-*` + filet de sécurité).
- Un Short ouvert **depuis une chaîne** n'est pas bloqué (exception voulue).

## Structure

```
userscript/              Version 1-fichier (userscript) — install la plus simple
manifest.json            Extension Manifest V3 (content script, options, popup, icônes)
src/common/defaults.js   Réglages par défaut + accès stockage (API unifiée)
src/content/
  preload.css            Masquage synchrone anti-flash sur /shorts
  shorts.css             Masquage des points d'entrée et étagères Shorts
  gate.css               Style de la fenêtre des 3 questions + minuteur
  main.js                Masquage dynamique + garde d'accès + fenêtre questions
src/options/             Page de réglages (extension)
src/popup/               Popup de la barre d'outils (extension)
icons/                   Icônes générées (tools/make_icons.py)
safari/                  Notice de portage Safari/iOS (Xcode)
tests/                   Tests Playwright + contrôle de syntaxe
tools/diagnose.js        Diagnostic des sélecteurs sur le vrai YouTube
```

## Développement

- Recharger l'extension après modification (bouton *recharger* de la page extensions).
- Régénérer les icônes : `python3 tools/make_icons.py`.

### Tests

Suite de tests jouée dans un vrai Chromium (Playwright) + contrôle de syntaxe :

```bash
npm install
npx playwright install chromium   # 1re fois
npm test                          # contrôle statique + tests extension + userscript
```

La CI GitHub Actions (`.github/workflows/ci.yml`) rejoue tout à chaque push / PR.

### Diagnostic des sélecteurs

YouTube change régulièrement son HTML. Pour vérifier ce que le script attrape sur
**ton** YouTube (compte connecté, langue, tests A/B) : ouvre la console du
navigateur (F12) sur une page YouTube et colle le contenu de
[`tools/diagnose.js`](tools/diagnose.js). Il liste les vrais conteneurs de Shorts
à cibler — utile pour ajuster `src/content/shorts.css` / `main.js` /
`userscript/…` si un type de Short réapparaît.

## Limites connues

- Vise **YouTube dans le navigateur** (y compris Safari iOS), **pas l'application
  YouTube native** — une app installée ne peut pas être modifiée.
- YouTube change régulièrement son HTML : si un type de Short réapparaît, il suffit
  d'ajuster les sélecteurs (voir *Diagnostic* ci-dessus).
- Le déblocage repose sur de la friction volontaire, pas sur un verrou
  infranchissable (désactivable depuis les réglages).
