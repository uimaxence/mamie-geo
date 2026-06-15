"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getUserContext } from "@/lib/auth/user-context";
import { sendFeedbackEmail } from "@/lib/email";
import { captureServerEvent } from "@/lib/posthog-server";

// Feedback in-app : un utilisateur authentifié envoie un retour (bug / idée
// / autre) depuis le widget de la sidebar. On notifie hello@ par email
// (replyTo = user, pour répondre direct) + on émet un event PostHog pour
// le suivi quantitatif. Aucun LLM, aucune écriture DB (volume faible, pas
// besoin de table dédiée en V0).

const CATEGORIES = ["bug", "idée", "autre"] as const;

const schema = z.object({
  category: z.enum(CATEGORIES),
  message: z.string().trim().min(3, "Message trop court").max(4000),
  pageUrl: z.string().max(500).optional(),
});

export type SubmitFeedbackInput = z.infer<typeof schema>;

export type SubmitFeedbackResult =
  | { ok: true }
  | { ok: false; error: "unauthorized" }
  | { ok: false; error: "validation"; message: string };

export async function submitFeedback(input: SubmitFeedbackInput): Promise<SubmitFeedbackResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { ok: false, error: "unauthorized" };

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "validation",
      message: parsed.error.issues[0]?.message ?? "Invalide",
    };
  }
  const { category, message, pageUrl } = parsed.data;

  const ctx = await getUserContext(session.user.id);
  const userEmail = session.user.email ?? "inconnu";

  await sendFeedbackEmail({
    userEmail,
    category,
    message,
    workspaceName: ctx?.workspace.name,
    plan: ctx?.workspace.plan,
    pageUrl,
  });

  await captureServerEvent({
    event: "user_feedback_submitted",
    distinctId: session.user.id,
    properties: { category, message_length: message.length, page_url: pageUrl },
    ctx: ctx
      ? { workspaceId: ctx.workspace.id, plan: ctx.workspace.plan, role: ctx.role }
      : undefined,
  });

  return { ok: true };
}
