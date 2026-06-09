import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Wrench } from "lucide-react";
import { auth } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard/queries";
import { getAuditUsage } from "@/lib/audits/counters";
import { quotasFor } from "@/lib/plans/quotas";
import { PageContainer, PageHeader } from "@/components/ui";
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
    <PageContainer width="form">
      <PageHeader
        icon={Wrench}
        title="Lancer un nouvel audit"
        summary={`~10 secondes par audit · ${usage.auditsCount}/${Number.isFinite(usage.maxAudits) ? usage.maxAudits : "∞"} utilisés ce mois`}
      />

      <div className="mt-10">
        <NewAuditForm
          defaultUrl={defaultUrl}
          remainingAudits={
            Number.isFinite(usage.maxAudits) ? usage.maxAudits - usage.auditsCount : null
          }
          canBatchCompetitors={quotas.comparisonCompetitors > 0}
        />
      </div>
    </PageContainer>
  );
}
