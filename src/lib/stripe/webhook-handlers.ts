import { and, eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "@/db/client";
import { subscriptionEvents, workspaceMembers, workspaces } from "@/db/schema";
import { logCronEvent } from "@/lib/cron-logger";
import { sendTransactional } from "@/lib/email";
import { renderPaymentFailed } from "@/lib/email/templates/payment-failed";
import { renderTrialExpired } from "@/lib/email/templates/trial-expired";
import { renderWelcomePaid } from "@/lib/email/templates/welcome-paid";
import { env } from "@/lib/env";
import { planToMrr } from "@/lib/plans/mrr";
import { captureServerEvent, groupServer } from "@/lib/posthog-server";
import { scheduleRunsForWorkspace } from "@/lib/scheduler/schedule-runs";
import { planFromPriceId } from "@/lib/stripe/products";

// Webhook handlers Stripe — un par event type pertinent. Tous sont
// idempotents grâce à la contrainte UNIQUE sur `subscription_events.stripeEventId` :
// la route appelante insère un event row d'abord et n'appelle le handler
// que si l'insert a réussi (= event jamais vu). Voir
// `src/app/api/webhooks/stripe/route.ts`.
//
// Référence Stripe sur l'idempotence webhook :
//   https://docs.stripe.com/webhooks#handle-duplicate-events

interface HandlerResult {
  workspaceId: string | null;
  fromPlan: string | null;
  toPlan: string | null;
}

/** Récupère le workspace via stripeCustomerId. Renvoie null si pas trouvé. */
async function findWorkspaceByCustomer(customerId: string) {
  const rows = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.stripeCustomerId, customerId))
    .limit(1);
  return rows[0] ?? null;
}

/** Récupère le userId du owner du workspace pour rattacher les events
 *  PostHog au profil utilisateur (au lieu de l'ID workspace, qui empêche
 *  le merge personne). Fallback admin si pas d'owner. */
async function findWorkspaceOwnerUserId(workspaceId: string): Promise<string | null> {
  const owner = await db
    .select({ userId: workspaceMembers.userId })
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.role, "owner")))
    .limit(1);
  if (owner[0]) return owner[0].userId;
  const admin = await db
    .select({ userId: workspaceMembers.userId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.workspaceId, workspaceId))
    .orderBy(workspaceMembers.createdAt)
    .limit(1);
  return admin[0]?.userId ?? null;
}

/** Envoi best-effort d'un email transactionnel — on log et on continue si fail. */
async function trySendEmail(
  to: string | null | undefined,
  rendered: { subject: string; html: string; text: string },
  kind: string,
): Promise<void> {
  if (!to) return;
  try {
    await sendTransactional({
      to,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
    });
  } catch (error) {
    logCronEvent({
      level: "error",
      event: "stripe_webhook_email_failed",
      kind,
      to,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// ─────────────────────────────────────────────────────────────────────
// checkout.session.completed
// Premier paiement réussi → workspace passe au plan acheté.
// Source de vérité du plan = price_id de la subscription Stripe.
// ─────────────────────────────────────────────────────────────────────

export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<HandlerResult> {
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  if (!customerId) {
    throw new Error("checkout.session.completed sans customer");
  }
  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
  if (!subscriptionId) {
    // Mode payment (one-shot) — on n'a pas (encore) de cas en V0.
    return { workspaceId: null, fromPlan: null, toPlan: null };
  }

  // Lookup la subscription pour récupérer le price actif (source plan).
  const { getStripe } = await import("@/lib/stripe/client");
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id;
  const match = priceId ? planFromPriceId(priceId) : null;
  if (!match) {
    throw new Error(`Price ID inconnu après checkout: ${priceId ?? "(null)"}`);
  }
  const plan = match.plan;

  const ws = await findWorkspaceByCustomer(customerId);
  if (!ws) {
    throw new Error(`Workspace introuvable pour customer ${customerId}`);
  }

  const periodStart = firstItemPeriodStart(subscription);
  const periodEnd = firstItemPeriodEnd(subscription);

  // Détection trial : Stripe pose `trial_end` quand la session a été créée
  // avec `subscription_data.trial_period_days`. Dans ce cas, on garde
  // workspace.plan = "trialing" (les quotas restent à 0/0 jusqu'à conversion
  // ou trial_will_end) et on enregistre trialEndsAt pour piloter le picker
  // urgence + emails J+10/J+13. La carte est déjà collectée par Stripe →
  // au passage trial→active, handleSubscriptionUpdated bumpera plan au
  // bon tier.
  // cf. doc 09 § 2026-06-08 (réintroduction trial 14j avec carte requise).
  const trialEnd = subscription.trial_end;
  const isTrialing = subscription.status === "trialing" && typeof trialEnd === "number";
  const planToSet = isTrialing ? "trialing" : plan;
  const trialEndsAt = isTrialing && trialEnd ? new Date(trialEnd * 1000) : null;

  await db
    .update(workspaces)
    .set({
      plan: planToSet,
      stripeSubscriptionId: subscriptionId,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      trialEndsAt,
      hardCapHitAt: null,
      // Conversion d'un beta-testeur en payant : on lève la date d'expiration
      // beta pour que le cron expire-comp ne le repasse jamais en "expired".
      compExpiresAt: null,
      updatedAt: new Date(),
    })
    .where(eq(workspaces.id, ws.id));

  // Lance immédiatement le premier batch de runs — UX "wow" pour ne pas
  // que l'utilisateur attende le prochain cron (jusqu'à 24h, ou jusqu'à
  // lundi pour Solo). Idempotence via queue idempotency_key. PENDANT LE
  // TRIAL on schedule aussi : la carte est posée, donc on peut consommer
  // le LLM (l'user paiera au trial_end). cf. doc 09 § 2026-05-14 + 2026-06-08.
  let immediateRuns = 0;
  try {
    const result = await scheduleRunsForWorkspace(ws.id);
    immediateRuns = result.jobsEnqueued;
    logCronEvent({
      event: "post_checkout_runs_scheduled",
      workspaceId: ws.id,
      trialing: isTrialing,
      ...result,
    });
  } catch (error) {
    // Ne pas faire échouer le webhook si le scheduler crash — Stripe
    // ferait retry et on dupliquerait l'update plan inutilement.
    logCronEvent({
      level: "error",
      event: "post_checkout_schedule_failed",
      workspaceId: ws.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Email de bienvenue. Pendant le trial : copy différente (cf. template,
  // pour V0 on garde welcome-paid avec le plan acheté — le user voit le
  // plan qu'il a choisi). On enverra l'email "trial-started" en V1 si besoin.
  await trySendEmail(
    session.customer_details?.email ?? null,
    renderWelcomePaid({
      workspaceName: ws.name,
      plan,
      dashboardUrl: `${env.NEXT_PUBLIC_APP_URL}/app/dashboard`,
      immediateRuns,
    }),
    "welcome_paid",
  );

  const ownerUserId = await findWorkspaceOwnerUserId(ws.id);
  if (ownerUserId) {
    await captureServerEvent({
      event: isTrialing ? "trial_started" : "subscription_activated",
      distinctId: ownerUserId,
      ctx: { workspaceId: ws.id, plan: planToSet },
      properties: {
        plan,
        from_plan: ws.plan,
        immediate_runs_enqueued: immediateRuns,
        billing_cycle: match.cycle,
        trial_ends_at: trialEndsAt?.toISOString() ?? null,
      },
    });
  }
  await groupServer({
    groupType: "workspace",
    groupKey: ws.id,
    properties: {
      plan: planToSet,
      // Pendant trial, MRR effectif = 0 (mais on note le plan acheté).
      mrr: isTrialing ? 0 : planToMrr(plan),
      name: ws.name,
      slug: ws.slug,
      trial_ends_at: trialEndsAt?.toISOString() ?? null,
    },
  });

  return { workspaceId: ws.id, fromPlan: ws.plan, toPlan: planToSet };
}

// ─────────────────────────────────────────────────────────────────────
// customer.subscription.updated
// Plan up/downgrade ou changement de période. Sync DB.
// ─────────────────────────────────────────────────────────────────────

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
): Promise<HandlerResult> {
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
  if (!customerId) throw new Error("subscription.updated sans customer");

  const priceId = subscription.items.data[0]?.price.id;
  const match = priceId ? planFromPriceId(priceId) : null;
  if (!match) {
    throw new Error(`Price ID inconnu lors d'un update: ${priceId ?? "(null)"}`);
  }
  const plan = match.plan;

  const ws = await findWorkspaceByCustomer(customerId);
  if (!ws) {
    // Subscription mise à jour pour un customer non lié à un workspace —
    // peut arriver si le workspace a été supprimé. On no-op.
    return { workspaceId: null, fromPlan: null, toPlan: plan };
  }

  // Stripe envoie `cancel_at_period_end` quand le user demande l'annulation
  // depuis le portal — on garde le plan actif jusqu'à `subscription.deleted`.
  // Pendant le trial, status=trialing → on garde plan="trialing" jusqu'à
  // ce que Stripe bascule status=active à trial_end. Transition détectée
  // ici : si ws.plan était "trialing" ET subscription.status="active",
  // on fire l'event "trial_converted_paid".
  const isStillTrialing = subscription.status === "trialing";
  const planToSet = isStillTrialing ? "trialing" : plan;
  const trialJustEnded = ws.plan === "trialing" && subscription.status === "active";
  const trialEndsAt = isStillTrialing && subscription.trial_end
    ? new Date(subscription.trial_end * 1000)
    : null;

  await db
    .update(workspaces)
    .set({
      plan: planToSet,
      stripeSubscriptionId: subscription.id,
      currentPeriodStart: firstItemPeriodStart(subscription),
      currentPeriodEnd: firstItemPeriodEnd(subscription),
      trialEndsAt,
      updatedAt: new Date(),
    })
    .where(eq(workspaces.id, ws.id));

  if (trialJustEnded) {
    const ownerUserId = await findWorkspaceOwnerUserId(ws.id);
    if (ownerUserId) {
      await captureServerEvent({
        event: "trial_converted_paid",
        distinctId: ownerUserId,
        ctx: { workspaceId: ws.id, plan },
        properties: { plan, billing_cycle: match.cycle, mrr: planToMrr(plan) },
      });
    }
    await groupServer({
      groupType: "workspace",
      groupKey: ws.id,
      properties: { plan, mrr: planToMrr(plan), trial_ends_at: null },
    });
  }

  return { workspaceId: ws.id, fromPlan: ws.plan, toPlan: planToSet };
}

// ─────────────────────────────────────────────────────────────────────
// customer.subscription.trial_will_end
// Envoyé par Stripe 3 jours avant la fin du trial. On capture l'event
// pour PostHog (segmentation des users qui vont bientôt expirer) +
// laisse le cron quotidien envoyer le mail (J-3).
// ─────────────────────────────────────────────────────────────────────

export async function handleTrialWillEnd(
  subscription: Stripe.Subscription,
): Promise<HandlerResult> {
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
  if (!customerId) throw new Error("subscription.trial_will_end sans customer");

  const ws = await findWorkspaceByCustomer(customerId);
  if (!ws) return { workspaceId: null, fromPlan: null, toPlan: null };

  const ownerUserId = await findWorkspaceOwnerUserId(ws.id);
  if (ownerUserId) {
    const priceId = subscription.items.data[0]?.price.id;
    const match = priceId ? planFromPriceId(priceId) : null;
    await captureServerEvent({
      event: "trial_will_end_3d",
      distinctId: ownerUserId,
      ctx: { workspaceId: ws.id, plan: ws.plan },
      properties: {
        plan_after_trial: match?.plan ?? null,
        billing_cycle: match?.cycle ?? null,
        trial_ends_at: subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null,
      },
    });
  }

  return { workspaceId: ws.id, fromPlan: ws.plan, toPlan: ws.plan };
}

// ─────────────────────────────────────────────────────────────────────
// customer.subscription.deleted
// Fin de l'abonnement (cancel_at_period_end arrivé à terme ou cancel immédiat).
// ─────────────────────────────────────────────────────────────────────

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
): Promise<HandlerResult> {
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
  if (!customerId) throw new Error("subscription.deleted sans customer");

  const ws = await findWorkspaceByCustomer(customerId);
  if (!ws) return { workspaceId: null, fromPlan: null, toPlan: "expired" };

  // Cas où on annule pendant le trial : le user n'a jamais été facturé,
  // distinction qu'on note dans l'event pour PostHog.
  const wasInTrial = ws.plan === "trialing" && ws.trialEndsAt !== null;

  await db
    .update(workspaces)
    .set({
      plan: wasInTrial ? "canceled" : "expired",
      stripeSubscriptionId: null,
      trialEndsAt: null,
      updatedAt: new Date(),
    })
    .where(eq(workspaces.id, ws.id));

  // Email de trial expiré : trial s'est terminé sans conversion (carte
  // déclinée OU cancel explicite pendant le trial). Pattern reprise en
  // 1 clic via portal. Sent best-effort, n'échoue pas le webhook.
  if (wasInTrial) {
    const recipientEmail = subscription.metadata?.email ?? null;
    await trySendEmail(
      recipientEmail,
      renderTrialExpired({
        variant: "expired",
        workspaceName: ws.name,
        reactivateUrl: `${env.NEXT_PUBLIC_APP_URL}/app/settings#billing`,
      }),
      "trial_expired",
    );
  }

  const ownerUserId = await findWorkspaceOwnerUserId(ws.id);
  if (ownerUserId) {
    await captureServerEvent({
      event: wasInTrial ? "trial_canceled" : "subscription_canceled",
      distinctId: ownerUserId,
      ctx: { workspaceId: ws.id, plan: ws.plan },
      properties: { from_plan: ws.plan, was_in_trial: wasInTrial },
    });
  }
  await groupServer({
    groupType: "workspace",
    groupKey: ws.id,
    properties: { plan: wasInTrial ? "canceled" : "expired", mrr: 0, trial_ends_at: null },
  });

  return {
    workspaceId: ws.id,
    fromPlan: ws.plan,
    toPlan: wasInTrial ? "canceled" : "expired",
  };
}

// ─────────────────────────────────────────────────────────────────────
// invoice.payment_failed
// Carte refusée. On passe le workspace en past_due — le cron
// expire-past-due se chargera de basculer en expired après J+7.
// ─────────────────────────────────────────────────────────────────────

export async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<HandlerResult> {
  const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
  if (!customerId) throw new Error("invoice.payment_failed sans customer");

  const ws = await findWorkspaceByCustomer(customerId);
  if (!ws) return { workspaceId: null, fromPlan: null, toPlan: "past_due" };

  await db
    .update(workspaces)
    .set({ plan: "past_due", updatedAt: new Date() })
    .where(eq(workspaces.id, ws.id));

  await trySendEmail(
    invoice.customer_email ?? null,
    renderPaymentFailed({
      workspaceName: ws.name,
      portalUrl: `${env.NEXT_PUBLIC_APP_URL}/app/settings#billing`,
    }),
    "payment_failed",
  );

  const ownerUserId = await findWorkspaceOwnerUserId(ws.id);
  if (ownerUserId) {
    await captureServerEvent({
      event: "payment_failed",
      distinctId: ownerUserId,
      ctx: { workspaceId: ws.id, plan: ws.plan },
      properties: { from_plan: ws.plan },
    });
  }

  return { workspaceId: ws.id, fromPlan: ws.plan, toPlan: "past_due" };
}

// ─────────────────────────────────────────────────────────────────────
// invoice.paid
// Nouvelle période de facturation OK — réinitialise les hard-cap warnings.
// ─────────────────────────────────────────────────────────────────────

export async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<HandlerResult> {
  const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
  if (!customerId) throw new Error("invoice.paid sans customer");

  const ws = await findWorkspaceByCustomer(customerId);
  if (!ws) return { workspaceId: null, fromPlan: null, toPlan: null };

  // Si le workspace était en past_due, on le restaure au plan de la
  // subscription. Le handler subscription.updated arrivera typiquement
  // aussi en même temps — l'idempotence empêche les doubles updates.
  // `price` peut être un string (price_id) ou un objet Price expandé.
  if (ws.plan === "past_due") {
    const priceField = invoice.lines.data[0]?.pricing?.price_details?.price;
    const priceId = typeof priceField === "string" ? priceField : (priceField?.id ?? null);
    const match = priceId ? planFromPriceId(priceId) : null;
    if (match) {
      const plan = match.plan;
      await db
        .update(workspaces)
        .set({ plan, hardCapHitAt: null, updatedAt: new Date() })
        .where(eq(workspaces.id, ws.id));
      return { workspaceId: ws.id, fromPlan: "past_due", toPlan: plan };
    }
  }

  return { workspaceId: ws.id, fromPlan: ws.plan, toPlan: ws.plan };
}

// ─────────────────────────────────────────────────────────────────────
// Audit log : tout event traité écrit une ligne dans subscription_events.
// L'idempotence est assurée par le UNIQUE constraint sur stripeEventId.
// ─────────────────────────────────────────────────────────────────────

export async function recordSubscriptionEvent(
  stripeEventId: string,
  eventType: string,
  result: HandlerResult,
  metadata: Record<string, unknown> = {},
): Promise<{ inserted: boolean }> {
  if (!result.workspaceId) {
    // Pas de workspace identifié — on log mais on n'insère pas (FK NOT NULL).
    logCronEvent({
      level: "warn",
      event: "stripe_webhook_orphan",
      stripeEventId,
      eventType,
      metadata,
    });
    return { inserted: false };
  }
  try {
    await db.insert(subscriptionEvents).values({
      workspaceId: result.workspaceId,
      eventType,
      fromPlan: result.fromPlan,
      toPlan: result.toPlan,
      stripeEventId,
      metadata,
    });
    return { inserted: true };
  } catch (error) {
    // Conflit sur stripeEventId UNIQUE → event déjà traité, no-op.
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("duplicate key") || message.includes("unique")) {
      return { inserted: false };
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────
// Helpers période de facturation
// Le Stripe SDK 2025-09-30 expose `current_period_*` au niveau de chaque
// `SubscriptionItem` (pas sur la subscription). On lit le premier item.
// ─────────────────────────────────────────────────────────────────────

function firstItemPeriodStart(subscription: Stripe.Subscription): Date | null {
  const ts = subscription.items.data[0]?.current_period_start;
  return typeof ts === "number" ? new Date(ts * 1000) : null;
}

function firstItemPeriodEnd(subscription: Stripe.Subscription): Date | null {
  const ts = subscription.items.data[0]?.current_period_end;
  return typeof ts === "number" ? new Date(ts * 1000) : null;
}
