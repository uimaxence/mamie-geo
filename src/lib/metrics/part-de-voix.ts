import type { ParsedBrandsPayload } from "@/lib/citation/types";

// Part de voix — KPI officiel du glossaire (doc 02 § Glossaire).
// Définition : % des citations qui vont à la marque vs ses concurrents
// sur une fenêtre donnée. Formule :
//   percentage = brand / (brand + Σ competitor) × 100
//
// Sur le dashboard on l'utilise sur le jour courant. La fenêtre 7j/30j
// peut être ajoutée plus tard côté caller — la fonction est agnostique
// de la fenêtre (elle prend juste un set de runs scorés).
//
// Pourquoi pas réutiliser le brandCitedCount + visibilityScore :
// - brandCitedCount = ratio cité (combien de fois ma marque apparaît)
// - visibilityScore = position pondérée par sentiment (qualité de la cit.)
// - partDeVoix = part relative aux concurrents (qui domine la conversation)
// Les 3 mesurent des choses différentes, complémentaires.

export interface RunWithScoring {
  parsedBrands: ParsedBrandsPayload | null;
}

export interface PartDeVoixResult {
  /** Total des fois où la marque est citée (brandMentioned=true) */
  brandCitations: number;
  /** Total des citations des concurrents (somme tous concurrents, tous runs) */
  competitorCitations: number;
  /** Part en %, 1 décimale, 0 si dénominateur = 0 */
  percentage: number;
}

/**
 * Calcule la part de voix de la marque vs ses concurrents sur un ensemble
 * de runs (typiquement les runs success du jour courant sur tous les LLMs
 * configurés).
 *
 * Les runs avec `scoring.skipped` ou `parsedBrands=null` sont ignorés
 * (rien à compter). Si aucune citation n'est trouvée (ni brand ni
 * concurrents), retourne `percentage=0` plutôt que de diviser par zéro.
 */
export function computePartDeVoix(runs: readonly RunWithScoring[]): PartDeVoixResult {
  let brandCitations = 0;
  let competitorCitations = 0;

  for (const run of runs) {
    const scoring = run.parsedBrands?.scoring;
    if (!scoring || "skipped" in scoring) continue;

    if (scoring.brandMentioned) brandCitations += 1;
    competitorCitations += scoring.competitorsMentioned.length;
  }

  const total = brandCitations + competitorCitations;
  const percentage = total === 0 ? 0 : Math.round((brandCitations / total) * 1000) / 10;

  return { brandCitations, competitorCitations, percentage };
}
