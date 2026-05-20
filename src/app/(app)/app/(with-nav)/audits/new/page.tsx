import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard/queries";
import { getAuditUsage } from "@/lib/audits/counters";
import { quotasFor } from "@/lib/plans/quotas";
import { NewAuditForm } from "./new-audit-form";

// /app/audits/new, formulaire de lancement d'un audit on-demand.

export const dynamic = "force-dynamic";

export default async function NewAuditPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const data = await getDashboardData(session.user.id);
  if (!data) redirect("/app/onboarding");

  const usage = await getAuditUsage(data.workspace.id, data.workspace.plan);
  const quotas = quotasFor(data.workspace.plan);

  // Pré-remplit l'URL depuis le domaine de la marque.
  const defaultUrl = data.brand.domain.startsWith("http")
    ? data.brand.domain
    : `https://${data.brand.domain}`;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <header>
        <span className="type-eyebrow">Audit technique</span>
        <h1 className="type-h1 mt-2">Lancer un nouvel audit.</h1>
        <p className="type-body mt-2 text-sm text-[color:var(--color-ink-soft)]">
          Choisis l&apos;URL à analyser. L&apos;audit prend ~10 secondes et consomme 1 unité de ton
          quota mensuel (
          <span className="font-medium text-[color:var(--color-ink)]">
            {usage.auditsCount}/{Number.isFinite(usage.maxAudits) ? usage.maxAudits : "∞"}
          </span>{" "}
          utilisés ce mois).
        </p>
      </header>

      <div className="mt-10">
        <NewAuditForm
          defaultUrl={defaultUrl}
          remainingAudits={
            Number.isFinite(usage.maxAudits) ? usage.maxAudits - usage.auditsCount : null
          }
          canBatchCompetitors={quotas.comparisonCompetitors > 0}
        />
      </div>
    </div>
  );
}
