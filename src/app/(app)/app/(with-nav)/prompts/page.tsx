import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listPrompts } from "@/lib/prompts/queries";
import { quotasFor } from "@/lib/plans/quotas";
import { PromptsList } from "./prompts-list";

// Page /app/prompts, liste + CRUD des prompts trackés.
// Server component qui charge la liste + délègue à un client wrapper
// pour la partie interactive (filtre, dialogs, actions).

export const dynamic = "force-dynamic";

export default async function PromptsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const data = await listPrompts(session.user.id);
  if (!data) redirect("/app/onboarding");

  const quotas = quotasFor(data.plan);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:px-10">
      <PromptsList
        initialPrompts={data.prompts}
        plan={data.plan}
        planCadence={quotas.cadence}
        maxPrompts={quotas.prompts}
      />
    </div>
  );
}
