# Portage Safari (macOS + iPhone)

Safari ne charge pas directement un dossier d'extension : il faut l'**envelopper
dans une petite app** avec Xcode. Le convertisseur d'Apple le fait automatiquement
à partir de ce projet.

Prérequis : **macOS + Xcode** (gratuit sur le Mac App Store) et les *Command Line
Tools* (`xcode-select --install`).

## 1. Convertir l'extension

Depuis la racine du dépôt :

```bash
xcrun safari-web-extension-converter . \
  --project-location safari/build \
  --app-name "UTub Short Kill" \
  --bundle-identifier com.victorbauchet.utubshortkill
```

Cela génère un projet Xcode contenant **deux cibles** : l'app macOS et l'app iOS
(la même extension partagée). Ajoute `--macos-only` ou `--ios-only` si tu ne veux
qu'une plateforme.

> Relance cette commande après chaque modification du code de l'extension, ou
> copie les fichiers modifiés dans le projet généré.

## 2. Activer sur macOS

1. Ouvre le projet dans Xcode, choisis la cible **macOS**, clique **Run** (▶).
2. Safari → Réglages → **Extensions** → coche **UTub Short Kill**.
3. Autorise l'accès à `youtube.com` quand Safari le demande.
4. Menu **Développement** → *Autoriser les extensions non signées* si nécessaire
   (Développement apparaît via Safari → Réglages → Avancé → « Afficher le menu
   Développement »).

## 3. Installer sur l'iPhone

1. Branche l'iPhone au Mac (ou sans fil via *Devices and Simulators*).
2. Dans Xcode, sélectionne la cible **iOS** et ton iPhone comme destination.
3. Onglet **Signing & Capabilities** → *Automatically manage signing* → choisis
   ton **équipe** (un identifiant Apple gratuit suffit ; voir la note ci-dessous).
4. **Run** (▶) : l'app conteneur s'installe sur l'iPhone.
5. Sur l'iPhone : Réglages → **Apps** → **Safari** → **Extensions** → active
   **UTub Short Kill** et **Autoriser** sur `youtube.com`
   (mets « Toujours autoriser » pour éviter les redemandes).
6. Ouvre YouTube **dans Safari** (m.youtube.com) — les Shorts sont masqués.

### Note sur la signature (gratuit vs payant)

- **Identifiant Apple gratuit** : fonctionne, mais l'app expire au bout de **7
  jours** — il faut la relancer depuis Xcode pour la re-signer. La première fois,
  approuve le profil dans Réglages → Général → **VPN et gestion de l'appareil**.
- **Apple Developer Program (99 $/an)** : plus d'expiration hebdomadaire, et
  possibilité de distribuer via **TestFlight** ou l'**App Store**.

## Dépannage

- L'extension n'apparaît pas dans Safari → vérifie qu'elle est activée dans les
  réglages Extensions et que l'app conteneur a bien été lancée au moins une fois.
- Rien n'est masqué → autorise l'accès au site `youtube.com` pour l'extension.
- Sur iPhone, tu utilises l'**app YouTube** et non Safari → l'extension n'agit que
  dans Safari (l'app native ne peut pas être modifiée).
