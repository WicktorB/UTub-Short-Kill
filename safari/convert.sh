#!/usr/bin/env bash
#
# Convertit l'extension en projet Xcode (app macOS + iOS) via l'outil Apple.
# À lancer sur un Mac avec Xcode installé :
#
#     bash safari/convert.sh
#
set -euo pipefail

# Se placer à la racine du dépôt (dossier parent de /safari).
cd "$(dirname "$0")/.."

if ! xcrun --find safari-web-extension-converter >/dev/null 2>&1; then
  echo "❌ Xcode introuvable. Installe Xcode depuis le Mac App Store, puis :"
  echo "     xcode-select --install"
  echo "   et ouvre Xcode une fois pour finir l'installation des composants."
  exit 1
fi

echo "🔨 Conversion en projet Xcode dans safari/build ..."
xcrun safari-web-extension-converter . \
  --project-location safari/build \
  --app-name "UTub Short Kill" \
  --bundle-identifier com.victorbauchet.utubshortkill \
  --force

echo ""
echo "✅ Terminé. Xcode devrait s'ouvrir tout seul."
echo "   Sinon : ouvre le fichier .xcodeproj dans safari/build/."
