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

export interface TopupRow {
  id: string;
  amountUsd: number;
  toppedUpAt: string;
  note: string | null;
}

export interface ProviderCredit {
  meta: ProviderMeta;
  topups: TopupRow[];
  totalToppedUp: number;
  /** Date de la 1ère recharge enregistrée (baseline du calcul de dépense). */
  baselineDate: string | null;
  /** Dépensé (tracking) depuis la baseline. 0 si aucune recharge. */
  spentSinceBaseline: number;
  /** Solde estimé = rechargé − dépensé depuis baseline. null si pas prépayé/pas de recharge. */
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
  const allTopups = await db
    .select()
    .from(llmCreditTopups)
    .orderBy(desc(llmCreditTopups.toppedUpAt));

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const result: ProviderCredit[] = [];
  for (const key of LLM_VALUES) {
    const meta = PROVIDER_META[key];
    const topups = allTopups
      .filter((t) => t.provider === key)
      .map((t) => ({
        id: t.id,
        amountUsd: Number(t.amountUsd),
        toppedUpAt: t.toppedUpAt.toISOString(),
        note: t.note,
      }));

    const totalToppedUp = topups.reduce((s, t) => s + t.amountUsd, 0);
    const baseline = topups.length
      ? topups.reduce((min, t) => (t.toppedUpAt < min ? t.toppedUpAt : min), topups[0]!.toppedUpAt)
      : null;

    const [spentSinceBaseline, spent30d, spentAllTime] = await Promise.all([
      baseline ? sumSpend(key, new Date(baseline)) : Promise.resolve(0),
      sumSpend(key, thirtyDaysAgo),
      sumSpend(key),
    ]);

    const remaining = meta.prepaid && baseline ? totalToppedUp - spentSinceBaseline : null;

    result.push({
      meta,
      topups,
      totalToppedUp,
      baselineDate: baseline,
      spentSinceBaseline,
      remaining,
      spent30d,
      spentAllTime,
    });
  }
  return result;
}
