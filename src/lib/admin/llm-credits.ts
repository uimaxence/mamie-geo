import { and, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { LLM_VALUES, llmCreditTopups, runs } from "@/db/schema";
import type { LLMValue } from "@/lib/llm/types";

// Suivi des crédits LLM (admin). Les API providers n'exposent pas le solde
// prépayé restant → on enregistre les recharges à la main et on calcule
// « dépensé depuis » à partir de runs.cost_usd. cf. doc 09 § 2026-06-15.
//
// IMPORTANT : runs.cost_usd ne couvre QUE le coût de tracking. Le scoring
// (toujours Anthropic Haiku) est noyé dans usage_counters.llmCostUsd et
// n'est pas ventilé par run → la dépense réelle Anthropic est légèrement
// supérieure à ce qui est affiché ici (~+7 %). Disclosure dans l'UI.

// Deux modèles de facturation :
//   - "prepaid"        : crédit prépayé qui s'épuise (on recharge). Solde
//                        estimé = dernier solde saisi − dépensé depuis.
//   - "monthly_limit"  : plafond de dépense mensuel qui se réinitialise. On
//                        suit dépensé ce mois vs limite.
export type ProviderKind = "prepaid" | "monthly_limit";

export interface ProviderMeta {
  /** Clé LLM_VALUES (= runs.llm). */
  key: LLMValue;
  label: string;
  kind: ProviderKind;
  /** Devise affichée pour le montant saisi (notre tracking de dépense reste en USD). */
  currency: "$" | "€";
  billingUrl: string;
}

export const PROVIDER_META: Record<LLMValue, ProviderMeta> = {
  claude: {
    key: "claude",
    label: "Anthropic (Claude)",
    kind: "prepaid",
    currency: "$",
    billingUrl: "https://console.anthropic.com/settings/billing",
  },
  chatgpt: {
    key: "chatgpt",
    label: "OpenAI (ChatGPT)",
    kind: "prepaid",
    currency: "$",
    billingUrl: "https://platform.openai.com/settings/organization/billing/overview",
  },
  perplexity: {
    key: "perplexity",
    label: "Perplexity",
    kind: "prepaid",
    currency: "$",
    billingUrl: "https://www.perplexity.ai/settings/api",
  },
  lechat: {
    key: "lechat",
    label: "Mistral (Le Chat)",
    kind: "monthly_limit",
    currency: "€",
    billingUrl: "https://console.mistral.ai/billing",
  },
  gemini: {
    key: "gemini",
    label: "Google (Gemini)",
    kind: "monthly_limit",
    currency: "€",
    billingUrl: "https://console.cloud.google.com/billing",
  },
};

/** Une saisie : solde prépayé OU plafond mensuel, constaté à une date. */
export interface BalanceSnapshot {
  id: string;
  amountUsd: number;
  atIso: string;
  note: string | null;
}

export interface ProviderCredit {
  meta: ProviderMeta;
  /** Historique des montants saisis (le plus récent en premier). */
  snapshots: BalanceSnapshot[];
  /** Dernier montant saisi : solde (prepaid) ou plafond mensuel (monthly_limit). null si jamais saisi. */
  configuredAmount: number | null;
  /** Date de la dernière saisie. */
  configuredAt: string | null;
  /** Dépensé (tracking) depuis la dernière saisie — pertinent en mode prepaid. */
  spentSinceLast: number;
  /** Dépensé (tracking) sur le mois calendaire en cours — pertinent en mode monthly_limit. */
  spentThisMonth: number;
  /** Restant estimé : prepaid = solde − dépensé depuis ; monthly_limit = plafond − dépensé ce mois. null si non saisi. */
  remaining: number | null;
  spent30d: number;
  spentAllTime: number;
}

// Timestamp d'imputation d'un run = quand il a réellement consommé du LLM.
const runTs = sql`coalesce(${runs.executedAt}, ${runs.createdAt})`;

function sumSpend(provider: string, since?: Date): Promise<number> {
  const conds = [eq(runs.llm, provider), isNotNull(runs.costUsd)];
  if (since) conds.push(gte(runTs, since));
  return db
    .select({ total: sql<string>`coalesce(sum(${runs.costUsd}), '0')` })
    .from(runs)
    .where(and(...conds))
    .then((r) => Number(r[0]?.total ?? 0));
}

/** Charge l'état des crédits LLM par provider pour le panneau admin. */
export async function getLlmCreditOverview(): Promise<ProviderCredit[]> {
  // Chaque ligne = un montant saisi à une date. Le plus récent fait foi.
  const allSnapshots = await db
    .select()
    .from(llmCreditTopups)
    .orderBy(desc(llmCreditTopups.toppedUpAt));

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const result: ProviderCredit[] = [];
  for (const key of LLM_VALUES) {
    const meta = PROVIDER_META[key];
    // allSnapshots est déjà trié par date décroissante → snaps[0] = le plus récent.
    const snaps = allSnapshots.filter((t) => t.provider === key);
    const snapshots = snaps.map((t) => ({
      id: t.id,
      amountUsd: Number(t.amountUsd),
      atIso: t.toppedUpAt.toISOString(),
      note: t.note,
    }));

    const last = snaps[0] ?? null;
    const configuredAmount = last ? Number(last.amountUsd) : null;
    const configuredAt = last ? last.toppedUpAt.toISOString() : null;

    const [spentSinceLast, spentThisMonth, spent30d, spentAllTime] = await Promise.all([
      last ? sumSpend(key, last.toppedUpAt) : Promise.resolve(0),
      sumSpend(key, startOfMonth),
      sumSpend(key, thirtyDaysAgo),
      sumSpend(key),
    ]);

    const remaining =
      configuredAmount === null
        ? null
        : meta.kind === "prepaid"
          ? configuredAmount - spentSinceLast
          : configuredAmount - spentThisMonth;

    result.push({
      meta,
      snapshots,
      configuredAmount,
      configuredAt,
      spentSinceLast,
      spentThisMonth,
      remaining,
      spent30d,
      spentAllTime,
    });
  }
  return result;
}
