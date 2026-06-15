import { getLlmCreditOverview } from "@/lib/admin/llm-credits";
import { LlmCreditsClient } from "./llm-credits-client";

// Panneau admin — suivi des crédits / dépenses LLM par provider.
// Guard hérité du layout /app/admin/*. force-dynamic : montant à jour.
export const dynamic = "force-dynamic";

export default async function LlmCreditsPage() {
  const providers = await getLlmCreditOverview();

  // Aujourd'hui au format YYYY-MM-DD (UTC) pour pré-remplir l'input date.
  const now = new Date();
  const todayIso = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[color:var(--color-ink)]">
          Crédits LLM
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[color:var(--color-muted)]">
          Les API LLM n&apos;exposent pas le solde restant. Saisis tes recharges&nbsp;: le solde
          estimé = rechargé − dépensé depuis (calculé sur nos runs). Mets à jour à chaque recharge.
        </p>
      </div>

      <LlmCreditsClient providers={providers} today={todayIso} />

      <p className="max-w-2xl text-xs text-[color:var(--color-muted)]">
        Note&nbsp;: les dépenses affichées couvrent le coût de <em>tracking</em>. Le scoring
        (toujours Anthropic Haiku) n&apos;est pas ventilé par run → la dépense réelle Anthropic est
        légèrement supérieure (~+7&nbsp;%). Le solde estimé part de ta 1ʳᵉ recharge enregistrée pour
        chaque provider&nbsp;: pour initialiser, saisis ton solde actuel comme 1ʳᵉ recharge.
      </p>
    </div>
  );
}
