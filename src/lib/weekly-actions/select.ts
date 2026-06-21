import type { GeoTip } from "@/lib/geo-advice";
import {
  geoTipFor,
  WEEKLY_ACTIONS,
  type ActionContext,
  type ActionEffort,
  type ActionImpact,
  type WeeklyActionDef,
} from "./catalog";

// Sélection / priorisation des actions de la semaine. Pur, testable, sans DB.
// On évalue tout le catalogue contre le contexte, on retire ce que
// l'utilisateur a déjà traité (done/dismissed/snoozed), on déduplique par
// famille pour ne pas montrer deux variantes du même geste, et on garde le
// top `max` par score = poids d'impact × applicabilité.

export interface SelectedAction {
  slug: string;
  title: string;
  expectedOutcome: string;
  why: string;
  effort: ActionEffort;
  impact: ActionImpact;
  cta: { label: string; href: string };
  /** GeoTip relié (slug + titre) pour le lien « En savoir plus ». */
  geoTip: { slug: string; title: string } | null;
  /** Score de priorité (debug / tri). */
  priorityScore: number;
}

const IMPACT_WEIGHT: Record<ActionImpact, number> = { high: 1, medium: 0.6 };

interface Candidate {
  def: WeeklyActionDef;
  expectedOutcome: string;
  why: string;
  priorityScore: number;
}

/**
 * Sélectionne jusqu'à `max` actions pour la marque cette semaine.
 *
 * @param ctx           snapshot des métriques (pur).
 * @param dismissedSlugs slugs déjà traités (done/dismissed/snoozed actif) à exclure.
 * @param max           nombre d'actions à retourner (défaut 2).
 */
export function selectWeeklyActions(
  ctx: ActionContext,
  dismissedSlugs: ReadonlySet<string>,
  max = 2,
): SelectedAction[] {
  const candidates: Candidate[] = [];
  for (const def of WEEKLY_ACTIONS) {
    if (dismissedSlugs.has(def.slug)) continue;
    const trigger = def.evaluate(ctx);
    if (!trigger) continue;
    candidates.push({
      def,
      expectedOutcome: trigger.expectedOutcome,
      why: trigger.why,
      priorityScore: IMPACT_WEIGHT[def.impact] * trigger.applicability,
    });
  }

  candidates.sort((a, b) => b.priorityScore - a.priorityScore);

  // Dédup par famille : on garde le meilleur candidat de chaque famille
  // (déjà trié desc, donc le premier rencontré est le plus prioritaire).
  const seenFamilies = new Set<string>();
  const selected: SelectedAction[] = [];
  for (const c of candidates) {
    if (seenFamilies.has(c.def.family)) continue;
    seenFamilies.add(c.def.family);
    selected.push(toSelectedAction(c));
    if (selected.length >= max) break;
  }
  return selected;
}

function toSelectedAction(c: Candidate): SelectedAction {
  const tip: GeoTip | null = geoTipFor(c.def);
  return {
    slug: c.def.slug,
    title: c.def.title,
    expectedOutcome: c.expectedOutcome,
    why: c.why,
    effort: c.def.effort,
    impact: c.def.impact,
    cta: c.def.cta,
    geoTip: tip ? { slug: tip.slug, title: tip.title } : null,
    priorityScore: c.priorityScore,
  };
}
