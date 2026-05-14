import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserContext } from "@/lib/auth/user-context";
import { db } from "@/db/client";
import { workspaces } from "@/db/schema";
import { eq } from "drizzle-orm";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe/client";

// POST /api/portal — crée une session Stripe Billing Portal pour
// que le user puisse gérer son abonnement (changement de plan,
// annulation, mise à jour CB, factures).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const ctx = await getUserContext(session.user.id);
  if (!ctx) {
    return NextResponse.json({ error: "Aucun workspace" }, { status: 404 });
  }

  const wsRows = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, ctx.workspace.id))
    .limit(1);
  const ws = wsRows[0];
  if (!ws?.stripeCustomerId) {
    return NextResponse.json(
      { error: "Aucun abonnement actif — souscris d'abord à un plan." },
      { status: 400 },
    );
  }

  const portal = await getStripe().billingPortal.sessions.create({
    customer: ws.stripeCustomerId,
    return_url: `${env.NEXT_PUBLIC_APP_URL}/app/settings`,
  });

  return NextResponse.json({ url: portal.url });
}
