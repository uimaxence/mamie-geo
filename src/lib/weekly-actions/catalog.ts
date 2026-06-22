import { GEO_TIPS, type GeoTip } from "@/lib/geo-advice";

// Catalogue des « Actions de la semaine » du dashboard. Moteur déterministe,
// ZÉRO appel LLM : chaque action sait s'auto-évaluer à partir des métriques
// déjà calculées de la marque (cf. ActionContext), et produit un résultat
// attendu formulé en RELATIF (vs concurrent, vs J-7, entre IA). Jamais de
// seuil absolu sur le score 0-100 : c'est la règle verrouillée doc 09
// § 2026-06-17 (une même marque score 6/100 sur ChatGPT et 53/100 sur Claude
// le même jour : un seuil absolu serait trompeur).
//
// Convention alignée sur geo-advice.ts (slug/impact) et audit/recommendations.ts
// (effort). Le texte n'est PAS persisté : il est régénéré à chaque rendu, donc
// on peut l'améliorer sans migration. Seules les décisions utilisateur
// (done/dismissed/snoozed) vivent en base (cf. weekly_action_states).

export type ActionEffort = "5min" | "15min" | "1h" | "1day";
export type ActionImpact = "high" | "medium";

/**
 * Famille d'action : on ne montre qu'UNE action par famille la même semaine
 * pour éviter deux variantes du même geste (ex : « récupère ta place » ET
 * « gagne une place » qui pointent toutes deux vers le rang).
 */
export type ActionFamily = "prompts" | "competitors" | "rank" | "llm" | "sources" | "audit";

/**
 * Snapshot des métriques de la marque nécessaire pour évaluer les actions.
 * Objet PUR (aucun accès DB) : construit par la query dashboard depuis des
 * données déjà chargées, et par le worker email depuis le brandId. Garder
 * cette frontière pure rend tout le catalogue testable sans mock.
 */
export interface ActionContext {
  /** Prompts actifs configurés. */
  promptsCount: number;
  /** Concurrents suivis manuellement. */
  competitorsCount: number;
  /** Runs success agrégés du jour (dénominateur des comptages). */
  totalRuns: number;
  /** Réponses du jour où la marque est citée. */
  brandCitedCount: number;
  /** Concurrent le plus cité du jour, tous-LLMs. */
  topCompetitor: { name: string; citationCount: number } | null;
  /** Funnel sources agrégé du jour (compteurs bruts). */
  sources: { retrievedCount: number; retrievalsTotal: number; citationsCount: number };
  /** Meilleure / plus faible IA (bestWorstLlm), null si aucun signal. */
  bestLlm: { label: string; value: number } | null;
  worstLlm: { label: string; value: number } | null;
  /** Rang relatif vs concurrents (getRankSummary), null si pas de classement. */
  rank: {
    rank: number | null;
    outOf: number;
    previousRank: number | null;
    reliable: boolean;
    /** Nom de l'entité juste au-dessus (rang - 1), pour viser une place. */
    aheadName: string | null;
    /** Écart de citations avec l'entité juste au-dessus. */
    gapToAhead: number | null;
  } | null;
  /** Audit technique : jamais lancé ? combien de blocages critiques ? */
  audit: { everRun: boolean; criticalIssues: number } | null;
}

export interface ActionTrigger {
  /** 0..1, urgence DATA-driven du signal (distincte de `impact`). */
  applicability: number;
  /** Résultat attendu, RELATIF et nominatif. La promesse de l'action. */
  expectedOutcome: string;
  /** Pourquoi maintenant, en une phrase appuyée sur les données réelles. */
  why: string;
}

export interface WeeklyActionDef {
  /** Slug stable : clé d'idempotence + clé du statut persisté. */
  slug: string;
  title: string;
  impact: ActionImpact;
  effort: ActionEffort;
  family: ActionFamily;
  cta: { label: string; href: string };
  /** Levier geo-advice relié (slug d'un GEO_TIP) pour le « En savoir plus ». */
  geoTipSlug?: string;
  /**
   * `true` si une fois marquée « fait » l'action ne doit plus jamais
   * réapparaître (geste one-shot : créer son premier prompt, lancer son
   * premier audit). Sinon le « fait » ne vaut que pour la semaine courante.
   */
  permanentOnDone?: boolean;
  /** Évalue le signal pour cette marque. `null` = action non applicable. */
  evaluate: (ctx: ActionContext) => ActionTrigger | null;
}

const clamp01 = (n: number): number => Math.max(0, Math.min(1, n));

function plural(n: number, singular: string, plural_: string): string {
  return n > 1 ? plural_ : singular;
}

export const WEEKLY_ACTIONS: WeeklyActionDef[] = [
  {
    slug: "add-first-prompts",
    title: "Crée ton premier prompt",
    impact: "high",
    effort: "5min",
    family: "prompts",
    permanentOnDone: true,
    cta: { label: "Ajouter un prompt", href: "/app/prompts" },
    evaluate: (ctx) =>
      ctx.promptsCount === 0
        ? {
            applicability: 1,
            expectedOutcome:
              "Lancer ton suivi : sans prompt, aucune IA n'est interrogée sur ta marque.",
            why: "Aucun prompt actif. Tes premières données arrivent dès le prochain run.",
          }
        : null,
  },
  {
    slug: "add-more-prompts",
    title: "Élargis ta surface de mesure",
    impact: "medium",
    effort: "15min",
    family: "prompts",
    geoTipSlug: "intention-recherche",
    cta: { label: "Ajouter des prompts", href: "/app/prompts" },
    evaluate: (ctx) =>
      ctx.promptsCount > 0 && ctx.promptsCount < 3
        ? {
            applicability: clamp01((3 - ctx.promptsCount) / 3),
            expectedOutcome: `Passer de ${ctx.promptsCount} à 5 prompts ou plus pour des comparaisons fiables face à tes concurrents.`,
            why: `Avec seulement ${ctx.promptsCount} prompt${plural(ctx.promptsCount, "", "s")}, ta visibilité repose sur trop peu de requêtes pour être représentative.`,
          }
        : null,
  },
  {
    slug: "track-competitors",
    title: "Suis ton concurrent principal",
    impact: "high",
    effort: "5min",
    family: "competitors",
    geoTipSlug: "branding",
    cta: { label: "Ajouter un concurrent", href: "/app/citations" },
    evaluate: (ctx) =>
      ctx.competitorsCount === 0 && ctx.topCompetitor
        ? {
            applicability: 0.9,
            expectedOutcome: `Suivre ${ctx.topCompetitor.name} pour mesurer ton écart semaine après semaine.`,
            why: `${ctx.topCompetitor.name} ressort déjà sur tes prompts mais n'est pas suivi : tu ne mesures pas l'écart.`,
          }
        : null,
  },
  {
    slug: "overtake-top-competitor",
    title: "Repasse devant ton concurrent",
    impact: "high",
    effort: "1h",
    family: "competitors",
    geoTipSlug: "comparatifs",
    cta: { label: "Voir les leviers", href: "/app/conseils" },
    evaluate: (ctx) => {
      if (!ctx.topCompetitor || ctx.totalRuns === 0) return null;
      const gap = ctx.topCompetitor.citationCount - ctx.brandCitedCount;
      if (gap <= 0) return null;
      return {
        applicability: 0.4 + 0.6 * clamp01(gap / Math.max(ctx.topCompetitor.citationCount, 1)),
        expectedOutcome: `Repasser devant ${ctx.topCompetitor.name} : il est cité ${gap} fois de plus que toi sur tes prompts.`,
        why: `${ctx.topCompetitor.name} te devance de ${gap} citation${plural(gap, "", "s")} cette semaine.`,
      };
    },
  },
  {
    slug: "defend-rank-loss",
    title: "Récupère ta place",
    impact: "high",
    effort: "1h",
    family: "rank",
    geoTipSlug: "branding",
    cta: { label: "Voir le classement", href: "/app/citations?tab=ranking" },
    evaluate: (ctx) => {
      const r = ctx.rank;
      if (!r || r.rank === null || r.previousRank === null) return null;
      const drop = r.rank - r.previousRank;
      if (drop <= 0) return null;
      return {
        applicability: 0.5 + 0.5 * clamp01(drop / 3),
        expectedOutcome: `Récupérer ta place : tu es passé n°${r.previousRank} à n°${r.rank} cette semaine.`,
        why: `Ton rang a reculé de ${drop} place${plural(drop, "", "s")} en 7 jours, un concurrent t'a doublé.`,
      };
    },
  },
  {
    slug: "climb-one-rank",
    title: "Gagne une place",
    impact: "medium",
    effort: "1day",
    family: "rank",
    geoTipSlug: "eeat",
    cta: { label: "Voir les leviers", href: "/app/conseils" },
    evaluate: (ctx) => {
      const r = ctx.rank;
      if (!r || r.rank === null || r.rank <= 1 || !r.reliable) return null;
      const target = r.rank - 1;
      const outcome =
        r.aheadName && r.gapToAhead !== null
          ? `Passer n°${r.rank} à n°${target} : ${r.gapToAhead} citation${plural(r.gapToAhead, "", "s")} d'écart avec ${r.aheadName}.`
          : `Passer n°${r.rank} à n°${target} en réduisant l'écart avec la marque juste devant.`;
      return {
        applicability: 0.4,
        expectedOutcome: outcome,
        why: `Tu es n°${r.rank} sur ${r.outOf} : la place au-dessus est à portée.`,
      };
    },
  },
  {
    slug: "boost-worst-llm",
    title: "Comble ton angle mort IA",
    impact: "high",
    effort: "1h",
    family: "llm",
    geoTipSlug: "influence-google",
    cta: { label: "Voir les leviers", href: "/app/conseils" },
    evaluate: (ctx) => {
      if (!ctx.bestLlm || !ctx.worstLlm) return null;
      if (ctx.worstLlm.value >= ctx.bestLlm.value * 0.5) return null;
      const ratio = ctx.worstLlm.value / Math.max(ctx.bestLlm.value, 1);
      return {
        applicability: clamp01(0.5 + 0.5 * (1 - ratio)),
        expectedOutcome: `Remonter ${ctx.worstLlm.label} : cette IA te cite bien moins que ${ctx.bestLlm.label}, ton angle mort actuel.`,
        why: `${ctx.bestLlm.label} te score ${ctx.bestLlm.value} mais ${ctx.worstLlm.label} seulement ${ctx.worstLlm.value} : un déséquilibre à corriger.`,
      };
    },
  },
  {
    slug: "convert-appearances",
    title: "Transforme tes apparitions en citations",
    impact: "high",
    effort: "1day",
    family: "sources",
    geoTipSlug: "structure-contenu",
    cta: { label: "Lancer un audit", href: "/app/audits" },
    evaluate: (ctx) => {
      const { retrievedCount, retrievalsTotal, citationsCount } = ctx.sources;
      if (retrievedCount === 0 || retrievalsTotal === 0) return null;
      const citationRate = citationsCount / retrievalsTotal;
      if (citationRate >= 0.3) return null;
      return {
        applicability: clamp01(0.5 + 0.5 * (1 - citationRate / 0.3)),
        expectedOutcome: `Te faire citer plus souvent : les IA te trouvent (${retrievedCount} fois) mais te recommandent rarement.`,
        why: `Seulement ${Math.round(citationRate * 100)} % de tes apparitions deviennent des citations explicites.`,
      };
    },
  },
  {
    slug: "run-first-audit",
    title: "Lance ton premier audit technique",
    impact: "medium",
    effort: "15min",
    family: "audit",
    permanentOnDone: true,
    geoTipSlug: "influence-google",
    cta: { label: "Lancer un audit", href: "/app/audits/new" },
    evaluate: (ctx) =>
      ctx.audit && !ctx.audit.everRun
        ? {
            applicability: 0.7,
            expectedOutcome:
              "Poser le socle SEO/GEO que les IA exploitent avant de te citer (30+ checks).",
            why: "Aucun audit technique lancé : tu ne sais pas encore quels signaux te bloquent.",
          }
        : null,
  },
  {
    slug: "fix-critical-audit",
    title: "Corrige tes blocages critiques",
    impact: "high",
    effort: "1h",
    family: "audit",
    geoTipSlug: "structure-contenu",
    cta: { label: "Voir l'audit", href: "/app/audits" },
    evaluate: (ctx) => {
      if (!ctx.audit || !ctx.audit.everRun || ctx.audit.criticalIssues === 0) return null;
      const n = ctx.audit.criticalIssues;
      return {
        applicability: clamp01(0.5 + n * 0.1),
        expectedOutcome: `Corriger ${n} blocage${plural(n, "", "s")} critique${plural(n, "", "s")} repéré${plural(n, "", "s")} sur ton site : ils plombent ta citabilité.`,
        why: `Ton dernier audit remonte ${n} blocage${plural(n, "", "s")} critique${plural(n, "", "s")} non résolu${plural(n, "", "s")}.`,
      };
    },
  },
];

/** Résout le GeoTip lié à une action (pour le lien « En savoir plus »). */
export function geoTipFor(def: WeeklyActionDef): GeoTip | null {
  if (!def.geoTipSlug) return null;
  return GEO_TIPS.find((t) => t.slug === def.geoTipSlug) ?? null;
}
