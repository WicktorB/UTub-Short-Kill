# UTub Short Kill

Extension de navigateur qui **supprime les YouTube Shorts** de partout — accueil,
abonnements, recherche, recommandations, barre latérale, barre de navigation
mobile — **sauf sur la page d'une chaîne de créateur**. Pour ouvrir un Short, il
faut **répondre manuellement à 3 questions**, ce qui crée juste assez de friction
pour ne pas s'y perdre.

Un seul code (Manifest V3) fonctionne sur **Chrome, Edge, Brave, Firefox** et
**Safari macOS + iOS**.

## Ce que ça fait

| Objectif | Comment |
| --- | --- |
| Ne plus voir les Shorts | Masquage des étagères, items, onglets et boutons « Shorts » |
| Ne pas y accéder facilement | Toute page `/shorts/…` est bloquée par 3 questions |
| Exception : les chaînes | Sur `/@chaine`, `/channel/…`, les Shorts restent visibles/accessibles |
| Gagner du temps | Bouton « Quitter » bien en évidence ; option lecteur normal sans scroll infini |
| Rester conscient du temps | Minuteur discret en haut de l'écran (translucide, non bloquant) + re-verrouillage automatique à l'expiration |

## Installation

### Chrome / Edge / Brave
1. `chrome://extensions` (ou `edge://extensions`)
2. Activer le **mode développeur**
3. **Charger l'extension non empaquetée** → sélectionner ce dossier

### Firefox (desktop & Android)
1. `about:debugging#/runtime/this-firefox`
2. **Charger un module complémentaire temporaire** → choisir `manifest.json`
   (temporaire = jusqu'au redémarrage ; pour du permanent il faut signer le `.xpi`
   sur [addons.mozilla.org](https://addons.mozilla.org))

### iPhone / Safari — le plus simple (sans Xcode)
Utilise la **version userscript** : installe l'app gratuite **« Userscripts »**,
colle le script, c'est fini. Aucun Mac, aucune compilation, pas d'expiration.
Voir **[`userscript/README.md`](userscript/README.md)**.

### Safari en vraie extension (macOS & iPhone, avec Xcode)
Si tu veux le rendu « app » complet (page d'options + popup), tu peux emballer
l'extension avec Xcode : voir **[`safari/README.md`](safari/README.md)**.

## Réglages

Clic sur l'icône → **Réglages…**, ou via la page d'options de l'extension :

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

Le popup de la barre d'outils affiche l'état (verrouillé / minutes restantes) et
permet de **re-verrouiller immédiatement**.

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
manifest.json            Manifest V3 (content script, options, popup, icônes)
src/common/defaults.js   Réglages par défaut + accès stockage (API unifiée)
src/content/
  preload.css            Masquage synchrone anti-flash sur /shorts
  shorts.css             Masquage des points d'entrée et étagères Shorts
  gate.css               Style de la fenêtre des 3 questions
  main.js                Masquage dynamique + garde d'accès + fenêtre questions
src/options/             Page de réglages
src/popup/               Popup de la barre d'outils
icons/                   Icônes générées (tools/make_icons.py)
safari/                  Notice de portage Safari/iOS
```

## Développement

- Recharger l'extension après modification (bouton *recharger* de la page
  extensions).
- Régénérer les icônes : `python3 tools/make_icons.py`.

## Limites connues

- Vise **YouTube dans le navigateur** (y compris Safari iOS), **pas l'application
  YouTube native** — une app installée ne peut pas être modifiée.
- YouTube change régulièrement son HTML : si un type de Short réapparaît, il suffit
  d'ajuster les sélecteurs dans `src/content/shorts.css` / `main.js`.
- Le déblocage repose sur de la friction volontaire, pas sur un verrou
  infranchissable (désactivable depuis les réglages).
