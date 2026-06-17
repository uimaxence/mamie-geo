import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "@/db/client";
import { stripeProcessedEvents } from "@/db/schema";
import { logCronEvent } from "@/lib/cron-logger";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe/client";
import {
  handleCheckoutCompleted,
  handleInvoicePaid,
  handlePaymentFailed,
  handleSubscriptionDeleted,
  handleSubscriptionUpdated,
  handleTrialWillEnd,
  recordSubscriptionEvent,
} from "@/lib/stripe/webhook-handlers";

// POST /api/webhooks/stripe, endpoint de réception des webhooks Stripe.
// Vérifie la signature, dispatch vers le bon handler, écrit l'audit dans
// `subscription_events`.
//
// Stripe garantit at-least-once delivery → un même event peut arriver
// plusieurs fois (retry, replay manuel). IDEMPOTENCE (corrigée 2026-06-17) :
// on « claim » l'event AVANT d'exécuter le handler via un insert atomique
// dans `stripe_processed_events` (PK = eventId). Si l'event a déjà été vu,
// on skip → pas de double email ni de double event PostHog (l'ancien code
// exécutait le handler PUIS enregistrait, donc les effets de bord étaient
// rejoués à chaque redelivery). Si le handler échoue, on relâche le claim
// pour que le retry Stripe le retraite.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HANDLED_EVENTS = new Set<string>([
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.trial_will_end",
  "invoice.paid",
  "invoice.payment_failed",
]);

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET manquant" }, { status: 500 });
  }

  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = await getStripe().webhooks.constructEventAsync(
      raw,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logCronEvent({ level: "error", event: "stripe_webhook_bad_signature", error: message });
    return NextResponse.json({ error: `Signature invalide: ${message}` }, { status: 400 });
  }

  if (!HANDLED_EVENTS.has(event.type)) {
    // Stripe envoie beaucoup d'events qu'on n'utilise pas (charge.*, etc.).
    // On accuse réception 200 sans traitement, Stripe ne re-retry pas.
    return NextResponse.json({ received: true, handled: false });
  }

  // Claim atomique de l'event AVANT toute action. `onConflictDoNothing`
  // renvoie [] si l'event a déjà été traité (PK dupliquée) → on skip les
  // effets de bord. Atomique → robuste même sur 2 livraisons simultanées.
  const claimed = await db
    .insert(stripeProcessedEvents)
    .values({ eventId: event.id, eventType: event.type })
    .onConflictDoNothing()
    .returning({ eventId: stripeProcessedEvents.eventId });
  if (claimed.length === 0) {
    logCronEvent({
      event: "stripe_webhook_duplicate_skipped",
      type: event.type,
      stripeEventId: event.id,
    });
    return NextResponse.json({ received: true, handled: false, duplicate: true });
  }

  try {
    let result;
    switch (event.type) {
      case "checkout.session.completed":
        result = await handleCheckoutCompleted(event.data.object);
        break;
      case "customer.subscription.updated":
        result = await handleSubscriptionUpdated(event.data.object);
        break;
      case "customer.subscription.deleted":
        result = await handleSubscriptionDeleted(event.data.object);
        break;
      case "customer.subscription.trial_will_end":
        result = await handleTrialWillEnd(event.data.object);
        break;
      case "invoice.payment_failed":
        result = await handlePaymentFailed(event.data.object);
        break;
      case "invoice.paid":
        result = await handleInvoicePaid(event.data.object);
        break;
      default:
        return NextResponse.json({ received: true, handled: false });
    }

    const recorded = await recordSubscriptionEvent(event.id, event.type, result, {
      livemode: event.livemode,
    });
    logCronEvent({
      event: "stripe_webhook_handled",
      type: event.type,
      stripeEventId: event.id,
      workspaceId: result.workspaceId,
      fromPlan: result.fromPlan,
      toPlan: result.toPlan,
      audited: recorded.inserted,
    });
    return NextResponse.json({ received: true, handled: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // Le handler a échoué : on relâche le claim pour que le retry Stripe
    // (500 ci-dessous) puisse retraiter l'event proprement.
    await db
      .delete(stripeProcessedEvents)
      .where(eq(stripeProcessedEvents.eventId, event.id))
      .catch(() => {});
    logCronEvent({
      level: "error",
      event: "stripe_webhook_handler_error",
      type: event.type,
      stripeEventId: event.id,
      error: message,
    });
    // 500 → Stripe va retry. Si l'event est mal formé et qu'on ne peut
    // pas réussir, on devra explicitement le replay.
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
