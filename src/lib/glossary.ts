// Définitions courtes (1-2 phrases) des termes métier surfacés
// dans l'app et le marketing. Source de vérité : doc 02 § Glossaire
// vocabulaire (et termes funnel V0+). Toute modif du vocabulaire
// officiel doit recopier la nouvelle formulation ici ET dans le doc.
//
// Utilisé par <GlossaryInfo> (icône info + tooltip) et par le prop
// `tooltip` de <Stat>. Garder les phrases sous ~140 caractères pour
// rester lisible dans une bulle Radix.

export type GlossaryTerm =
  | "visibility-score"
  | "part-de-voix"
  | "sentiment"
  | "apparition"
  | "frequence"
  | "citation"
  | "marque-citee"
  | "top-concurrent"
  | "source"
  | "runs"
  | "batch";

export const GLOSSARY: Record<GlossaryTerm, string> = {
  "visibility-score":
    "Note 0–100 par LLM et par jour, combinant la position de ta marque dans la réponse et le sentiment de la mention.",
  "part-de-voix":
    "Part de tes citations vs celles de tes concurrents sur la fenêtre choisie. Mesure ton poids relatif dans les réponses IA.",
  sentiment:
    "Comment ta marque est citée : positif (recommandée), neutre (mentionnée), négatif (critiquée) ou absent.",
  apparition:
    "Pourcentage de réponses où ta marque apparaît dans les sources retrouvées par le LLM, avant filtrage final.",
  frequence:
    "Nombre moyen de fois où ta marque est mentionnée dans une même réponse où elle apparaît.",
  citation:
    "Pourcentage des apparitions qui deviennent une citation explicite dans la réponse finale.",
  "marque-citee":
    "Nombre de runs du jour où ta marque est mentionnée, tous LLMs confondus.",
  "top-concurrent":
    "Concurrent le plus cité aujourd'hui, tous LLMs confondus. Utile pour repérer qui domine ton segment dans les réponses IA.",
  source:
    "Page web qu'une IA est allée consulter pour répondre sur ton marché. Y être présent (ou être ce site) augmente tes chances d'être cité.",
  runs: "Une exécution = un prompt envoyé à un LLM, avec sa réponse, sa détection de marque et son scoring.",
  batch:
    "Groupement d'un même prompt exécuté sur les 5 LLMs le même jour. Une ligne = un batch, dépliable pour le détail par LLM.",
};
