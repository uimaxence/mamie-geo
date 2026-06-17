import type { MetricBadgeTone } from "@/components/ui/metric-badge";

// Aides à l'interprétation RELATIVE des métriques du dashboard (cf. doc 09
// § 2026-06-17). Principe verrouillé : on ne juge JAMAIS le score de
// visibilité en absolu (l'étude 50 marques montre qu'une même marque score
// 6/100 sur ChatGPT et 53/100 sur Claude le même jour — un seuil absolu est
// trompeur). Les seuls signaux « bon/mauvais » viennent de comparaisons
// relatives : vs concurrents, vs J-7, et entre IA. Fonctions pures, testées.

export interface PartDeVoixReading {
  tone: MetricBadgeTone;
  text: string;
}

/**
 * Lecture relative de la part de voix : es-tu plus ou moins cité que ton
 * meilleur concurrent suivi ? (Pas de seuil de % absolu.)
 */
export function interpretPartDeVoix(input: {
  brandCited: number;
  topCompetitorCited: number;
  topName: string | null;
}): PartDeVoixReading {
  const { brandCited, topCompetitorCited, topName } = input;
  if (!topName || topCompetitorCited === 0) {
    return brandCited > 0
      ? { tone: "success", text: "Tu es cité et aucun concurrent suivi ne l'est encore." }
      : { tone: "neutral", text: "Personne n'est encore cité — ni toi ni tes concurrents suivis." };
  }
  if (brandCited > topCompetitorCited) {
    return { tone: "success", text: "Tu es plus cité que tes concurrents suivis." };
  }
  if (brandCited === topCompetitorCited) {
    return { tone: "neutral", text: `Au coude-à-coude avec ${topName}.` };
  }
  return { tone: "warning", text: `${topName} est plus cité que toi sur tes prompts.` };
}

export interface LlmReadingEntry {
  label: string;
  value: number;
}

/**
 * Lecture inter-IA : ta meilleure et ta plus faible IA (parmi celles avec
 * un score > 0). C'est l'enseignement n°1 de l'étude 50 marques : la
 * visibilité varie énormément d'une IA à l'autre, donc on situe par IA
 * plutôt qu'en absolu. `worst` est null s'il n'y a qu'une IA avec du signal.
 */
export function bestWorstLlm(segments: readonly LlmReadingEntry[]): {
  best: LlmReadingEntry;
  worst: LlmReadingEntry | null;
} | null {
  const scored = segments.filter((s) => s.value > 0);
  if (scored.length === 0) return null;
  const sorted = [...scored].sort((a, b) => b.value - a.value);
  const best = sorted[0]!;
  const worst = sorted.length > 1 ? sorted[sorted.length - 1]! : null;
  return { best, worst };
}
