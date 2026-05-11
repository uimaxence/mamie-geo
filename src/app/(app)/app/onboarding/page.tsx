import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { workspaceMembers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { OnboardingWizard } from "./onboarding-wizard";

// Page d'onboarding — accessible aux user authentifiés qui n'ont pas
// encore de workspace. Si le user a déjà un workspace, redirect direct
// vers /app/dashboard pour éviter de re-créer.

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  // Si user a déjà un workspace, pas la peine d'onboarder.
  const existing = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, session.user.id))
    .limit(1);

  if (existing[0]) {
    redirect("/app/dashboard");
  }

  return <OnboardingWizard userEmail={session.user.email} />;
}
