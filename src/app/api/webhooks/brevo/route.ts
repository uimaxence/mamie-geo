import { NextResponse } from "next/server";
import { captureServerEvent } from "@/lib/posthog-server";

// Webhook Brevo (scaffold — inactif tant que Brevo n'est pas configuré
// dans le dashboard pour POST vers cette URL). À activer en V0+ pour
// capter les "click" sur les emails transactionnels (weekly recap,
// welcome-paid, audit-report) et les corréler aux opens.
//
// Format Brevo : POST JSON avec { event, email, date, messageId, link, ... }
// cf. https://developers.brevo.com/docs/transactional-webhooks
//
// V0 : on capte uniquement "click" sur weekly_recap. Le mapping
// email → userId arrivera plus tard (besoin d'un index user.email).
// Pour le moment on utilise l'email comme distinctId (PostHog mergera
// quand le user authentifié arrivera).

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface BrevoEvent {
  event?: string;
  email?: string;
  link?: string;
  messageId?: string;
  tag?: string;
}

export async function POST(request: Request) {
  let payload: BrevoEvent;
  try {
    payload = (await request.json()) as BrevoEvent;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (payload.event !== "click" || !payload.email) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  await captureServerEvent({
    event: "weekly_recap_email_clicked",
    distinctId: payload.email,
    properties: {
      target_url: payload.link ?? null,
      message_id: payload.messageId ?? null,
      tag: payload.tag ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
