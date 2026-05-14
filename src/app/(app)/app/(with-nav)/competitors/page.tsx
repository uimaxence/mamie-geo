import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listCompetitors } from "@/lib/competitors/queries";
import { quotasFor } from "@/lib/plans/quotas";
import { CompetitorsList } from "./competitors-list";

// Page /app/competitors — liste + CRUD des concurrents trackés.

export const dynamic = "force-dynamic";

export default async function CompetitorsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const data = await listCompetitors(session.user.id);
  if (!data) redirect("/app/onboarding");

  const quotas = quotasFor(data.plan);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:px-10">
      <CompetitorsList
        initialCompetitors={data.competitors}
        plan={data.plan}
        maxCompetitors={quotas.competitors}
      />
    </div>
  );
}
