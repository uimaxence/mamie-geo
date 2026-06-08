"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db/client";
import { workspaces } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getUserContext } from "@/lib/auth/user-context";
import { env } from "@/lib/env";
import { captureServerEvent } from "@/lib/posthog-server";
import { getStripe } from "@/lib/stripe/client";
import { isPurchasablePlan, type PurchasablePlan } from "@/lib/stripe/plan-catalog";
import { priceIdForPlan, type BillingCycle } from "@/lib/stripe/products";

// Trial 14j avec carte requise — cf. doc 09 § 2026-06-08 (réintroduction
// du trial qui avait été retiré le 2026-05-14). La carte est posée au
// checkout, le user n'est pas facturé pendant 14j, puis Stripe bascule
// auto en active à trial_end (sauf annulation explicite via portal).
const TRIAL_PERIOD_DAYS = 14;

// Server actions billing, appelées depuis `<BillingSection>` côté client.
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
  | {
      ctx: Awaited<ReturnType<typeof getUserContext>>;
      userId: string;
      userEmail: string;
      userName?: string;
    }
  | { error: string }
> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Non authentifié" };
  const ctx = await getUserContext(session.user.id);
  if (!ctx) return { error: "Aucun workspace" };
  return {
    ctx,
    userId: session.user.id,
    userEmail: session.user.email,
    userName: session.user.name ?? undefined,
  };
}

export async function openCheckout(
  plan: PurchasablePlan,
  cycle: BillingCycle = "monthly",
  options: { trial?: boolean } = {},
): Promise<BillingActionResult> {
  if (!isPurchasablePlan(plan)) return { ok: false, error: "Plan invalide" };
  if (cycle !== "monthly" && cycle !== "annual") return { ok: false, error: "Cycle invalide" };

  const got = await getCtxOrError();
  if ("error" in got) return { ok: false, error: got.error };
  const { ctx, userId, userEmail, userName } = got;
  if (!ctx) return { ok: false, error: "Aucun workspace" };

  // Trial activé par défaut. Si l'user a déjà eu un trial (workspace.plan
  // ∈ expired/canceled/solo/starter/pro/past_due), on ne lui en redonne
  // pas. On force trial uniquement quand le workspace est en `trialing`
  // (state pré-paiement initial).
  const trial = options.trial ?? ctx.workspace.plan === "trialing";

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
    line_items: [{ price: priceIdForPlan(plan, cycle), quantity: 1 }],
    subscription_data: trial
      ? {
          trial_period_days: TRIAL_PERIOD_DAYS,
          // Si la carte échoue à la fin du trial, on pause au lieu d'annuler
          // pour laisser le user mettre à jour sa carte via portail.
          trial_settings: { end_behavior: { missing_payment_method: "pause" } },
        }
      : undefined,
    // `payment_method_collection: "always"` force la collecte de carte
    // même avec trial actif (Stripe peut sinon proposer "Skip"). C'est
    // le pattern « carte requise » du plan.
    payment_method_collection: trial ? "always" : undefined,
    automatic_tax: { enabled: true },
    customer_update: { name: "auto", address: "auto" },
    billing_address_collection: "required",
    success_url: `${env.NEXT_PUBLIC_APP_URL}/app/settings?checkout=success`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/app/settings?checkout=cancel`,
    allow_promotion_codes: true,
    locale: "fr",
    metadata: { workspaceId: ws.id, plan, billing_cycle: cycle, trial: String(trial) },
  });

  if (!checkout.url) return { ok: false, error: "Échec création session" };

  await captureServerEvent({
    event: "checkout_initiated",
    distinctId: userId,
    ctx: { workspaceId: ctx.workspace.id, plan: ctx.workspace.plan, role: ctx.role },
    properties: {
      plan,
      from_plan: ctx.workspace.plan,
      billing_cycle: cycle,
      trial_offered: trial,
    },
  });

  return { ok: true, url: checkout.url };
}

export async function openPortal(): Promise<BillingActionResult> {
  const got = await getCtxOrError();
  if ("error" in got) return { ok: false, error: got.error };
  const { ctx, userId } = got;
  if (!ctx) return { ok: false, error: "Aucun workspace" };

  const wsRows = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, ctx.workspace.id))
    .limit(1);
  const ws = wsRows[0];
  if (!ws?.stripeCustomerId) {
    return { ok: false, error: "Aucun abonnement actif, souscris d'abord à un plan." };
  }

  const portal = await getStripe().billingPortal.sessions.create({
    customer: ws.stripeCustomerId,
    return_url: `${env.NEXT_PUBLIC_APP_URL}/app/settings`,
  });

  await captureServerEvent({
    event: "billing_portal_opened",
    distinctId: userId,
    ctx: { workspaceId: ctx.workspace.id, plan: ctx.workspace.plan, role: ctx.role },
    properties: { current_plan: ctx.workspace.plan },
  });

  return { ok: true, url: portal.url };
}
