import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listPrompts, listPromptsWithMetrics } from "@/lib/prompts/queries";
import { quotasFor } from "@/lib/plans/quotas";
import { PageContainer } from "@/components/ui";
import { PromptsList } from "./prompts-list";

// Page /app/prompts, liste + CRUD des prompts trackés.
// Server component qui charge la liste + délègue à un client wrapper
// pour la partie interactive (filtre, dialogs, actions).

export const dynamic = "force-dynamic";

export default async function PromptsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [data, metricsData] = await Promise.all([
    listPrompts(session.user.id),
    listPromptsWithMetrics(session.user.id),
  ]);
  if (!data || !metricsData) redirect("/app/onboarding");

  const quotas = quotasFor(data.plan);

  return (
    <PageContainer>
      <PromptsList
        initialPrompts={data.prompts}
        metrics={metricsData.prompts}
        windowDays={metricsData.windowDays}
        plan={data.plan}
        planCadence={quotas.cadence}
        maxPrompts={quotas.prompts}
      />
    </PageContainer>
  );
}
