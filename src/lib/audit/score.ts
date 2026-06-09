// Échelle de couleur d'un score d'audit 0-100, partagée par les vues app
// (détail, liste, comparaison) et les primitifs UI <ScoreRing>/<ScoreBar>.
// Couleurs vives (pas les tokens status, plus ternes) car appliquées sur
// de gros chiffres / anneaux où la saturation porte la lecture immédiate.
//
// Seuils app : ≥80 vert, ≥60 ambre, <60 rouge. (Le lead magnet marketing
// utilise un seuil plus indulgent 75/50, volontairement distinct.)

export function scoreColor(score: number): string {
  if (score >= 80) return "#16a34a";
  if (score >= 60) return "#d97706";
  return "#dc2626";
}
