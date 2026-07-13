# Version « userscript » (iPhone sans Xcode)

Le userscript (**`dist/utub-short-kill.user.js`**, généré depuis `src/`) est **toute
l'appli condensée en un seul fichier** (masquage des Shorts, 3 questions, minuteur,
exception chaînes). On l'installe via un gestionnaire de userscripts — **sans Xcode,
sans Mac, sans expiration**.

## 📱 iPhone (Safari) — le plus simple

1. **App Store** → installe **« Userscripts »** (gratuit, icône `</>`).
2. **Réglages iPhone → Apps → Safari → Extensions → Userscripts → activer**, puis
   règle l'accès à **youtube.com** sur **« Toujours autoriser »**.
3. Ouvre l'app **Userscripts** une fois et **choisis un dossier** quand elle le
   demande (ex. un dossier dans *Fichiers/iCloud*) — c'est là que vivront les scripts.
4. **Ajoute le script** : ouvre ce lien brut dans Safari, sélectionne tout, copie :

   ```
   https://raw.githubusercontent.com/WicktorB/YouTube-Short-Kill/main/dist/utub-short-kill.user.js
   ```

   Puis dans Userscripts → **+** → nouveau script → **colle** → enregistre.
5. Va sur **youtube.com dans Safari** → les Shorts disparaissent, les 3 questions
   protègent l'accès, le minuteur s'affiche. 🎉

> Astuce : si la manip de dossier t'ennuie, l'app **Tampermonkey** (payante, ~2 €)
> a un flux plus direct — ouvrir le lien `.user.js` propose directement « Installer ».

## 💻 Desktop (bonus)

Le **même fichier** marche avec **Tampermonkey** ou **Violentmonkey**
(Chrome/Firefox/Edge/Safari) : installe l'un d'eux, ouvre le lien brut ci-dessus,
clique **Installer**. Pratique si tu préfères ne pas gérer l'extension « non
empaquetée ».

## ⚙️ Régler les options

Un **bouton ⚙️** discret apparaît en bas à droite des pages YouTube : il ouvre un
**panneau de réglages** (activer/désactiver le masquage, les 3 questions, le
minuteur, l'exception chaînes, durée de déblocage, longueur des réponses, éditer
les questions, et **« Verrouiller maintenant »**). Les réglages sont **stockés
dans le navigateur** — ils **survivent aux mises à jour** du script.

Les valeurs d'usine sont définies dans `src/core/config.js` (le fichier `.user.js`
est **généré** — on ne l'édite pas à la main).

## 🔄 Mettre à jour

Le script déclare `@updateURL`/`@downloadURL` → **Tampermonkey** propose la mise à
jour automatiquement ; dans l'app **Userscripts** (iOS), utilise le bouton de
vérification des mises à jour. Tes réglages (stockés à part) sont conservés.

## Extension vs userscript — que choisir ?

Les deux formats sont **générés depuis le même code** (`src/core/`) : même
comportement, mêmes réglages via le bouton **⚙️**.

| | Extension (`dist/extension/`) | Userscript (`dist/…user.js`) |
| --- | --- | --- |
| iPhone | Xcode + Mac (lourd) | **App « Userscripts », rien à compiler** |
| Desktop | à charger dans le navigateur (aucune app tierce) | Tampermonkey/Violentmonkey |
| Mises à jour | manuelles (re-télécharger) | **automatiques** (`@updateURL`) |
| Idéal pour | éviter toute app tierce sur ordi | **la simplicité, surtout sur iPhone** |
