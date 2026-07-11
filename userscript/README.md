# Version « userscript » (iPhone sans Xcode)

`utub-short-kill.user.js` est **toute l'extension condensée en un seul fichier**
(masquage des Shorts, 3 questions, minuteur, exception chaînes). On l'installe
via un gestionnaire de userscripts — **sans Xcode, sans Mac, sans expiration**.

## 📱 iPhone (Safari) — le plus simple

1. **App Store** → installe **« Userscripts »** (gratuit, icône `</>`).
2. **Réglages iPhone → Apps → Safari → Extensions → Userscripts → activer**, puis
   règle l'accès à **youtube.com** sur **« Toujours autoriser »**.
3. Ouvre l'app **Userscripts** une fois et **choisis un dossier** quand elle le
   demande (ex. un dossier dans *Fichiers/iCloud*) — c'est là que vivront les scripts.
4. **Ajoute le script** : ouvre ce lien brut dans Safari, sélectionne tout, copie :

   ```
   https://raw.githubusercontent.com/WicktorB/YouTube-Short-Kill/claude/youtube-shorts-restriction-8xxjz1/userscript/utub-short-kill.user.js
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

Il n'y a pas de page de réglages ici : ouvre le script dans l'éditeur et modifie
le bloc **`CONFIG`** tout en haut (durée de déblocage, longueur des réponses, les
3 questions, `openMode`, etc.). Enregistre → rechargé au prochain chargement de page.

## 🔄 Mettre à jour

Quand le script évolue, recopie la nouvelle version depuis le lien brut
par-dessus l'ancienne (ou réinstalle via Tampermonkey).

## Extension vs userscript — que choisir ?

| | Extension (dossier / Xcode) | Userscript (ce fichier) |
| --- | --- | --- |
| iPhone | Xcode + Mac, re-signer /7 j | **App gratuite, rien à compiler** |
| Desktop | « non empaquetée » ou magasin | Tampermonkey/Violentmonkey |
| Réglages | Page d'options + popup | Bloc `CONFIG` en haut du fichier |
| Idéal pour | Un rendu « app » complet | **La simplicité, surtout sur iPhone** |
