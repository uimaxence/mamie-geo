"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db/client";
import { workspaces } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getUserContext } from "@/lib/auth/user-context";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe/client";
import { isPurchasablePlan, type PurchasablePlan } from "@/lib/stripe/plan-catalog";
import { priceIdForPlan } from "@/lib/stripe/products";

// Server actions billing — appelées depuis `<BillingSection>` côté client.
// Centralisent la création des sessions Stripe pour éviter de dupliquer
// la logique customer/checkout/portal dans les API routes ET dans des
// onClick handlers. Les API routes restent dispo pour les clients hors-app
// (futur curl, retry manuel).

export interface BillingActionOk {
  ok: true;
  url: string;
}
export interface BillingActionError {
  ok: false;
  error: string;
}
export type BillingActionResult = BillingActionOk | BillingActionError;

async function getCtxOrError(): Promise<
  | { ctx: Awaited<ReturnType<typeof getUserContext>>; userEmail: string; userName?: string }
  | { error: string }
> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Non authentifié" };
  const ctx = await getUserContext(session.user.id);
  if (!ctx) return { error: "Aucun workspace" };
  return { ctx, userEmail: session.user.email, userName: session.user.name ?? undefined };
}

export async function openCheckout(plan: PurchasablePlan): Promise<BillingActionResult> {
  if (!isPurchasablePlan(plan)) return { ok: false, error: "Plan invalide" };

  const got = await getCtxOrError();
  if ("error" in got) return { ok: false, error: got.error };
  const { ctx, userEmail, userName } = got;
  if (!ctx) return { ok: false, error: "Aucun workspace" };

  const stripe = getStripe();
  const wsRows = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, ctx.workspace.id))
    .limit(1);
  const ws = wsRows[0];
  if (!ws) return { ok: false, error: "Workspace introuvable" };

  let customerId = ws.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userEmail,
      name: userName,
      metadata: { workspaceId: ws.id, workspaceSlug: ws.slug },
    });
    customerId = customer.id;
    await db
      .update(workspaces)
      .set({ stripeCustomerId: customerId, updatedAt: new Date() })
      .where(eq(workspaces.id, ws.id));
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceIdForPlan(plan), quantity: 1 }],
    automatic_tax: { enabled: true },
    customer_update: { name: "auto", address: "auto" },
    billing_address_collection: "required",
    success_url: `${env.NEXT_PUBLIC_APP_URL}/app/settings?checkout=success`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/app/settings?checkout=cancel`,
    allow_promotion_codes: true,
    locale: "fr",
    metadata: { workspaceId: ws.id, plan },
  });

  if (!checkout.url) return { ok: false, error: "Échec création session" };
  return { ok: true, url: checkout.url };
}

export async function openPortal(): Promise<BillingActionResult> {
  const got = await getCtxOrError();
  if ("error" in got) return { ok: false, error: got.error };
  const { ctx } = got;
  if (!ctx) return { ok: false, error: "Aucun workspace" };

  const wsRows = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, ctx.workspace.id))
    .limit(1);
  const ws = wsRows[0];
  if (!ws?.stripeCustomerId) {
    return { ok: false, error: "Aucun abonnement actif — souscris d'abord à un plan." };
  }

  const portal = await getStripe().billingPortal.sessions.create({
    customer: ws.stripeCustomerId,
    return_url: `${env.NEXT_PUBLIC_APP_URL}/app/settings`,
  });
  return { ok: true, url: portal.url };
}
