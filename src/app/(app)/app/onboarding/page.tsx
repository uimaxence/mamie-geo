import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { workspaceMembers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { OnboardingWizard } from "./onboarding-wizard";

// Page d'onboarding, accessible aux user authentifiés qui n'ont pas
// encore de workspace. Si le user a déjà un workspace, redirect direct
// vers /app/dashboard pour éviter de re-créer.
//
// Param `?next=/app/...` propagé depuis le login (cf. fix friction
// pricing → checkout 2026-05-16). À la fin de l'onboarding (ou skip),
// le wizard redirige sur ce path au lieu du dashboard par défaut.

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function OnboardingPage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  // Si user a déjà un workspace, pas la peine d'onboarder.
  const existing = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, session.user.id))
    .limit(1);

  if (existing[0]) {
    const params = await searchParams;
    redirect(params.next?.startsWith("/") ? params.next : "/app/dashboard");
  }

  const params = await searchParams;
  // Whitelist : path interne uniquement (anti open-redirect).
  const next = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : null;

  return <OnboardingWizard userEmail={session.user.email} nextAfter={next} />;
}
