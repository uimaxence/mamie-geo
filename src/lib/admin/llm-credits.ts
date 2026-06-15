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

export interface ProviderMeta {
  /** Clé LLM_VALUES (= runs.llm). */
  key: LLMValue;
  label: string;
  /** Compte prépayé (solde qui s'épuise) vs pay-as-you-go facturé a posteriori. */
  prepaid: boolean;
  billingUrl: string;
}

export const PROVIDER_META: Record<LLMValue, ProviderMeta> = {
  claude: {
    key: "claude",
    label: "Anthropic (Claude)",
    prepaid: true,
    billingUrl: "https://console.anthropic.com/settings/billing",
  },
  chatgpt: {
    key: "chatgpt",
    label: "OpenAI (ChatGPT)",
    prepaid: true,
    billingUrl: "https://platform.openai.com/settings/organization/billing/overview",
  },
  lechat: {
    key: "lechat",
    label: "Mistral (Le Chat)",
    prepaid: true,
    billingUrl: "https://console.mistral.ai/billing",
  },
  perplexity: {
    key: "perplexity",
    label: "Perplexity",
    prepaid: true,
    billingUrl: "https://www.perplexity.ai/settings/api",
  },
  gemini: {
    key: "gemini",
    label: "Google (Gemini)",
    prepaid: false, // facturation GCP à l'usage : pas de solde prépayé
    billingUrl: "https://console.cloud.google.com/billing",
  },
};

/** Une saisie de solde : « le compte avait X $ à la date D ». */
export interface BalanceSnapshot {
  id: string;
  amountUsd: number;
  atIso: string;
  note: string | null;
}

export interface ProviderCredit {
  meta: ProviderMeta;
  /** Historique des soldes saisis (le plus récent en premier). */
  snapshots: BalanceSnapshot[];
  /** Dernier solde saisi à la main. null si jamais renseigné. */
  lastBalanceUsd: number | null;
  /** Date du dernier solde saisi. */
  lastBalanceAt: string | null;
  /** Dépensé (tracking) depuis le dernier solde saisi. */
  spentSinceLast: number;
  /** Solde estimé = dernier solde saisi − dépensé depuis. null si pas prépayé/pas de saisie. */
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
  // Chaque ligne = un solde saisi à une date. Le plus récent fait foi.
  const allSnapshots = await db
    .select()
    .from(llmCreditTopups)
    .orderBy(desc(llmCreditTopups.toppedUpAt));

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

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
    const lastBalanceUsd = last ? Number(last.amountUsd) : null;
    const lastBalanceAt = last ? last.toppedUpAt.toISOString() : null;

    const [spentSinceLast, spent30d, spentAllTime] = await Promise.all([
      last ? sumSpend(key, last.toppedUpAt) : Promise.resolve(0),
      sumSpend(key, thirtyDaysAgo),
      sumSpend(key),
    ]);

    const remaining =
      meta.prepaid && lastBalanceUsd !== null ? lastBalanceUsd - spentSinceLast : null;

    result.push({
      meta,
      snapshots,
      lastBalanceUsd,
      lastBalanceAt,
      spentSinceLast,
      remaining,
      spent30d,
      spentAllTime,
    });
  }
  return result;
}
