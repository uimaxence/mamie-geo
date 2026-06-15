import { getLlmCreditOverview } from "@/lib/admin/llm-credits";
import { LlmCreditsClient } from "./llm-credits-client";

// Panneau admin — suivi des crédits / dépenses LLM par provider.
// Guard hérité du layout /app/admin/*. force-dynamic : montant à jour.
export const dynamic = "force-dynamic";

export default async function LlmCreditsPage() {
  const providers = await getLlmCreditOverview();

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[color:var(--color-ink)]">
          Crédits LLM
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[color:var(--color-muted)]">
          Les API LLM n&apos;exposent pas le solde restant. Deux cas&nbsp;:{" "}
          <strong>crédit prépayé</strong> (Claude, GPT, Perplexity) → saisis le solde actuel, estimé
          = solde − dépensé depuis ; <strong>plafond mensuel</strong> (Mistral, Gemini) → saisis ta
          limite, on suit dépensé ce mois / plafond. Calcul sur nos runs (USD).
        </p>
      </div>

      <LlmCreditsClient providers={providers} />

      <p className="max-w-2xl text-xs text-[color:var(--color-muted)]">
        Note&nbsp;: les dépenses affichées couvrent le coût de <em>tracking</em>. Le scoring
        (toujours Anthropic Haiku) n&apos;est pas ventilé par run → la dépense réelle Anthropic est
        légèrement supérieure (~+7&nbsp;%).
      </p>
    </div>
  );
}
