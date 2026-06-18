import type { LocalMapReport } from "@/lib/local-map/types";

// Aperçu de démonstration de la carte locale — affiché uniquement via
// `?demo` sur /outils/visibilite-locale (jamais en parcours réel, jamais
// lié/indexé). Sert à produire une capture marketing propre et reproductible
// (mix vert/orange/rouge, score réaliste), sans consommer d'appel IA.
// Données illustratives autour d'Angers ; le composant de rendu est le vrai
// (LocalMapResults), donc la capture est pixel-identique au produit.

function query(city: string): string {
  return `Quels sont les meilleurs menuiserie à ${city} ? Donne-moi les noms les plus recommandés.`;
}

export const DEMO_LOCAL_MAP_REPORT: LocalMapReport = {
  brand: "Fenêtres sur Loir",
  sector: "menuiserie",
  mainCity: "Angers",
  llmLabel: "recherche web en direct",
  cities: [
    {
      name: "Angers",
      lat: 47.4784,
      lng: -0.5632,
      status: "top",
      recommended: true,
      score: 1,
      rivals: ["K•LINE", "Tryba"],
      topRival: null,
      queries: [query("Angers")],
    },
    {
      name: "Avrillé",
      lat: 47.5113,
      lng: -0.5895,
      status: "top",
      recommended: true,
      score: 1,
      rivals: ["Tryba"],
      topRival: null,
      queries: [query("Avrillé")],
    },
    {
      name: "Beaucouzé",
      lat: 47.4756,
      lng: -0.6193,
      status: "top",
      recommended: true,
      score: 1,
      rivals: ["Art & Fenêtres"],
      topRival: null,
      queries: [query("Beaucouzé")],
    },
    {
      name: "Trélazé",
      lat: 47.4456,
      lng: -0.4636,
      status: "mentioned",
      recommended: false,
      score: 0.7,
      rivals: ["K•LINE"],
      topRival: "K•LINE",
      queries: [query("Trélazé")],
    },
    {
      name: "Saint-Barthélemy-d'Anjou",
      lat: 47.4706,
      lng: -0.5039,
      status: "mentioned",
      recommended: false,
      score: 0.55,
      rivals: ["Tryba", "K•LINE"],
      topRival: "Tryba",
      queries: [query("Saint-Barthélemy-d'Anjou")],
    },
    {
      name: "Bouchemaine",
      lat: 47.4231,
      lng: -0.6094,
      status: "mentioned",
      recommended: false,
      score: 0.5,
      rivals: ["Komilfo"],
      topRival: "Komilfo",
      queries: [query("Bouchemaine")],
    },
    {
      name: "Les Ponts-de-Cé",
      lat: 47.4256,
      lng: -0.5256,
      status: "absent",
      recommended: false,
      score: 0,
      rivals: ["K•LINE", "Tryba"],
      topRival: "K•LINE",
      queries: [query("Les Ponts-de-Cé")],
    },
  ],
  topCompetitors: [
    { name: "K•LINE", cityCount: 4 },
    { name: "Tryba", cityCount: 4 },
    { name: "Art & Fenêtres", cityCount: 1 },
    { name: "Komilfo", cityCount: 1 },
  ],
  recommendedCount: 3,
  mentionedCount: 3,
  totalCities: 7,
  // (1 + 1 + 1 + 0,7 + 0,55 + 0,5 + 0) / 7 = 0,679 → 68
  score: 68,
  fetchedAt: "2026-06-18T09:00:00.000Z",
};
