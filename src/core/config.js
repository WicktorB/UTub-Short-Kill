// Réglages par défaut (source unique, partagée extension + userscript).
export const DEFAULTS = {
  enabled: true, // extension active
  hideShorts: true, // masquer les Shorts dans les feeds / recherche / reco
  gateEnabled: true, // exiger les 3 questions pour accéder à un Short
  showTimer: true, // afficher le minuteur pendant le visionnage
  allowFromChannels: true, // exception : Shorts accessibles depuis une chaîne
  showSettingsButton: true, // bouton ⚙️ en bas à droite des pages YouTube
  openMode: "short", // "short" = lecteur Shorts | "watch" = lecteur normal
  unlockMinutes: 5, // durée de déblocage après réussite
  minAnswerLength: 15, // longueur minimale d'une réponse libre
  questions: [
    "Pourquoi veux-tu regarder des Shorts maintenant ?",
    "Combien de temps comptes-tu y passer, précisément ?",
    "Qu'est-ce que tu devrais être en train de faire à la place ?"
  ]
};

export function mergeConfig(raw) {
  return Object.assign({}, DEFAULTS, raw || {});
}
