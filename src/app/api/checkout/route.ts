import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db/client";
import { workspaces } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getUserContext } from "@/lib/auth/user-context";
import { env } from "@/lib/env";
import { isPurchasablePlan } from "@/lib/stripe/plan-catalog";
import { priceIdForPlan } from "@/lib/stripe/products";
import { getStripe } from "@/lib/stripe/client";

// POST /api/checkout — crée une session Stripe Checkout pour le user
// authentifié et retourne l'URL de redirection.
//
// Body : `{ plan: "solo" | "starter" | "pro" }`
// Réponse : `{ url: string }` ou `{ error: string }`.
//
// Le `customer` Stripe est créé à la volée si absent — l'ID est
// stocké sur `workspaces.stripeCustomerId` pour réutilisation
// (portal + future renew).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const ctx = await getUserContext(session.user.id);
  if (!ctx) {
    return NextResponse.json({ error: "Aucun workspace" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }
  const planRaw = (body as { plan?: unknown })?.plan;
  if (!isPurchasablePlan(planRaw)) {
    return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
  }

  const stripe = getStripe();

  // Récupère ou crée le customer Stripe lié au workspace.
  const wsRows = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, ctx.workspace.id))
    .limit(1);
  const ws = wsRows[0];
  if (!ws) {
    return NextResponse.json({ error: "Workspace introuvable" }, { status: 404 });
  }

  let customerId = ws.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      name: session.user.name ?? undefined,
      metadata: { workspaceId: ws.id, workspaceSlug: ws.slug },
    });
    customerId = customer.id;
    await db
      .update(workspaces)
      .set({ stripeCustomerId: customerId, updatedAt: new Date() })
      .where(eq(workspaces.id, ws.id));
  }

  const successUrl = `${env.NEXT_PUBLIC_APP_URL}/app/settings?checkout=success`;
  const cancelUrl = `${env.NEXT_PUBLIC_APP_URL}/app/settings?checkout=cancel`;

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceIdForPlan(planRaw), quantity: 1 }],
    automatic_tax: { enabled: true },
    customer_update: { name: "auto", address: "auto" },
    billing_address_collection: "required",
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    locale: "fr",
    metadata: { workspaceId: ws.id, plan: planRaw },
  });

  if (!checkout.url) {
    return NextResponse.json({ error: "Échec création session" }, { status: 500 });
  }
  return NextResponse.json({ url: checkout.url });
}
