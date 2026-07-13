# UTub Short Kill

[![CI](https://github.com/WicktorB/YouTube-Short-Kill/actions/workflows/ci.yml/badge.svg)](https://github.com/WicktorB/YouTube-Short-Kill/actions/workflows/ci.yml)

Supprime les **YouTube Shorts** de partout — accueil, abonnements, recherche,
recommandations, barre latérale, barre de navigation mobile — **sauf sur la page
d'une chaîne de créateur**. Pour ouvrir un Short, il faut **répondre manuellement à
3 questions** : juste assez de friction pour ne pas s'y perdre.

**Un seul code source** (`src/core/`) génère, via un petit build, **deux formats** :
un **userscript** (le plus simple, ordi + iPhone) et une **extension** Manifest V3.

## Ce que ça fait

| Objectif | Comment |
| --- | --- |
| Ne plus voir les Shorts | Masquage des étagères, items, onglets et boutons « Shorts » |
| Ne pas y accéder facilement | Toute page `/shorts/…` est bloquée par 3 questions |
| Exception : les chaînes | Sur `/@chaine`, `/channel/…`, les Shorts restent visibles/accessibles |
| Gagner du temps | Bouton « Quitter » bien en évidence ; option lecteur normal sans scroll infini |
| Rester conscient du temps | Minuteur discret en haut de l'écran (translucide, non bloquant) + re-verrouillage automatique |

## Installation

> **Recommandé : le userscript.** Même méthode sur ordinateur et iPhone, aucune
> compilation de ta part, et il **se met à jour tout seul**.

Lien du script (à ouvrir / coller) :

```
https://raw.githubusercontent.com/WicktorB/YouTube-Short-Kill/main/dist/utub-short-kill.user.js
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
<summary><b>Alternative — installer l'extension (sans app tierce sur ordi)</b></summary>

L'extension est déjà buildée dans **`dist/extension/`**.

1. [Télécharge le dépôt en ZIP](https://github.com/WicktorB/YouTube-Short-Kill/archive/refs/heads/main.zip) et décompresse-le.
2. **Chrome / Edge / Brave** : `chrome://extensions` → active le **mode développeur** → *Charger l'extension non empaquetée* → sélectionne le dossier **`dist/extension`**.
3. **Firefox** : `about:debugging#/runtime/this-firefox` → *Charger un module temporaire* → `dist/extension/manifest.json`.
4. **Safari macOS / iPhone (Xcode)** : voir **[`safari/README.md`](safari/README.md)**.

Les réglages passent par le même bouton **⚙️** sur les pages YouTube.
</details>

## Réglages (bouton ⚙️)

> Par choix (outil de self-control), les interrupteurs qui **neutralisent** la
> protection — *masquage des Shorts* et *3 questions* — ne sont **pas** dans le
> panneau. Pour tout désactiver, il faut passer par l'app **Userscripts**
> (Tampermonkey sur ordi), un geste volontairement plus difficile.

- **Afficher le minuteur** — pastille discrète (haut-centre, translucide, sans
  blocage des clics/taps) ; passe en rouge et pulse dans les 30 dernières
  secondes, puis re-verrouille automatiquement.
- **Autoriser depuis les chaînes** — laisse les Shorts d'un créateur accessibles.
- **Ouverture d'un Short débloqué** :
  - *Lecteur Shorts* — format vertical habituel une fois débloqué.
  - *Lecteur normal* — redirige `/shorts/ID` → `/watch?v=ID` : même vidéo, **sans
    le scroll infini**.
- **Durée de déblocage** — minutes d'accès accordées après réussite (défaut : 5).
- **Longueur minimale des réponses** — friction ajustable (défaut : 15).
- **Les 3 questions** — entièrement personnalisables.
- **Verrouiller maintenant** — coupe l'accès immédiatement.

## Comment marche le blocage

- Au chargement d'une page `/shorts/…`, le lecteur est masqué et la vidéo mise en
  pause tant que les questions ne sont pas validées (aucun flash).
- Réponses valides → déblocage temporisé stocké localement.
- YouTube étant une application monopage, la navigation interne est suivie
  (History API + événements `yt-navigate-*` + filet de sécurité).
- Un Short ouvert **depuis une chaîne** n'est pas bloqué (exception voulue).

## Architecture

Source unique → build → deux formats. Aucune duplication de logique.

```
src/
  core/config.js        Réglages par défaut
  core/app.js           Toute la logique (masquage, garde, minuteur, panneau ⚙️)
  styles/index.css      Tout le CSS
  platform/             Adaptateurs de stockage (extension = chrome.storage,
                        userscript = localStorage)
  entry/                Points d'entrée (extension.js, userscript.js)
build/build.mjs         esbuild → dist/
dist/                   Sorties GÉNÉRÉES (commitées pour l'install) :
  utub-short-kill.user.js   le userscript
  extension/                l'extension prête à charger
icons/  tools/  tests/  safari/
```

## Développement

```bash
npm install
npm run build                     # régénère dist/ (userscript + extension)
npx playwright install chromium   # 1re fois
npm test                          # syntaxe + manifest + tests extension & userscript
```

- **On n'édite jamais `dist/`** (généré) — on modifie `src/`, puis `npm run build`.
- La CI (`.github/workflows/ci.yml`) rebuild, vérifie que `dist/` est à jour, et rejoue les tests à chaque push / PR.
- Régénérer les icônes : `python3 tools/make_icons.py`.

### Diagnostic des sélecteurs

YouTube change régulièrement son HTML. Pour vérifier ce que le script attrape sur
**ton** YouTube : ouvre la console (F12) sur une page YouTube et colle le contenu de
[`tools/diagnose.js`](tools/diagnose.js). Il liste les vrais conteneurs de Shorts
à cibler — utile pour ajuster `src/styles/index.css` / `src/core/app.js`.

## Limites connues

- Vise **YouTube dans le navigateur** (y compris Safari iOS), **pas l'application
  YouTube native** — une app installée ne peut pas être modifiée.
- Le déblocage repose sur de la friction volontaire, pas sur un verrou
  infranchissable (désactivable depuis les réglages).
