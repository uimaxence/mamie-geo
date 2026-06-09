import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { brands, prompts, user as userTable, workspaces } from "@/db/schema";
import { getUserContext } from "@/lib/auth/user-context";
import { planToMrr } from "@/lib/plans/mrr";
import { PlanPickerModalTrigger } from "@/components/app/plan-picker-modal-trigger";
import { PostHogUserIdentify } from "@/components/app/posthog-user-identify";
import { CalSupportEmbed } from "@/components/app/cal-support-embed";
import { Suspense } from "react";
import { Toaster, TooltipProvider } from "@/components/ui";

// Layout du route group (app). Vérifie l'auth, toute route /app/*
// est protégée. Pas de session → redirect /login. Le chrome (sidebar)
// est rendu dans (with-nav)/layout.tsx pour permettre à /app/onboarding
// d'être full-screen sans nav (pattern route group Next 15).
//
// Monte les providers globaux nécessaires aux primitifs UI :
//   - <TooltipProvider> pour Radix Tooltip
//   - <Toaster> pour sonner
//
// Charge le contexte workspace pour enrichir l'identify PostHog
// (plan, role, workspace_id, brand_count) et set le groupe workspace
// (DAU/cohorts par plan via Groups Analytics).

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const ctx = await getUserContext(session.user.id);

  let identifyProps: React.ComponentProps<typeof PostHogUserIdentify> | null = null;
  let trialEndsAt: string | null = null;
  if (ctx) {
    const brandRows = await db
      .select({ id: brands.id })
      .from(brands)
      .where(eq(brands.workspaceId, ctx.workspace.id));
    const brandIds = brandRows.map((b) => b.id);
    const [promptCount, wsRows, userRows] = await Promise.all([
      brandIds.length > 0
        ? db.$count(prompts, inArray(prompts.brandId, brandIds))
        : Promise.resolve(0),
      db
        .select({ createdAt: workspaces.createdAt, trialEndsAt: workspaces.trialEndsAt })
        .from(workspaces)
        .where(eq(workspaces.id, ctx.workspace.id))
        .limit(1),
      db
        .select({ createdAt: userTable.createdAt })
        .from(userTable)
        .where(eq(userTable.id, session.user.id))
        .limit(1),
    ]);
    trialEndsAt = wsRows[0]?.trialEndsAt?.toISOString() ?? null;
    identifyProps = {
      userId: session.user.id,
      email: session.user.email,
      plan: ctx.workspace.plan,
      role: ctx.role,
      workspaceId: ctx.workspace.id,
      workspaceName: ctx.workspace.name,
      workspaceSlug: ctx.workspace.slug,
      workspaceCreatedAt: wsRows[0]?.createdAt?.toISOString() ?? "",
      brandCount: brandRows.length,
      promptCount,
      mrr: planToMrr(ctx.workspace.plan),
      signupAt: userRows[0]?.createdAt?.toISOString() ?? "",
    };
  }

  return (
    <TooltipProvider delayDuration={250} skipDelayDuration={100}>
      {identifyProps && <PostHogUserIdentify {...identifyProps} />}
      {ctx && (
        <Suspense fallback={null}>
          <PlanPickerModalTrigger plan={ctx.workspace.plan} trialEndsAt={trialEndsAt} />
        </Suspense>
      )}
      <div className="min-h-screen bg-white">{children}</div>
      <Toaster />
      <CalSupportEmbed />
    </TooltipProvider>
  );
}
