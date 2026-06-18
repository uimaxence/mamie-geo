// Emails de relance pendant le trial 14j (cf. doc 09 § 2026-06-08).
// 2 variantes :
//   - "j-4"  : J-4 avant la fin (= jour 10 du trial) — bilan + relance douce
//   - "j-1"  : J-1 avant facturation (= jour 13) — dernière chance d'annuler
//
// Envoyés par le cron /api/cron/trial-emails (08:00 UTC daily) qui scanne
// workspaces où plan="trialing" AND trialEndsAt non null, calcule le jour
// et envoie le bon template. Idempotence via une table email_logs (à voir
// Phase 4) : 1 envoi par template par workspace.

import type { RenderedEmail } from "@/lib/email/templates/weekly-recap";

export type TrialReminderVariant = "j-4" | "j-1";

export interface TrialReminderData {
  variant: TrialReminderVariant;
  workspaceName: string;
  plan: string;
  dashboardUrl: string;
  /** URL portail Stripe pour annuler / changer de plan. */
  portalUrl: string;
  /** ISO YYYY-MM-DD du jour où le trial se termine (pour copy explicite). */
  trialEndsOn: string;
}

export function renderTrialReminder(data: TrialReminderData): RenderedEmail {
  const isFinal = data.variant === "j-1";
  const subject = isFinal
    ? "Demain, ton abonnement Mamie GEO démarre"
    : "Plus que 4 jours d'essai sur Mamie GEO";

  const headline = isFinal ? "Demain, ton abonnement démarre" : "Plus que 4 jours pour décider";

  const body = isFinal
    ? `Demain (${formatDate(data.trialEndsOn)}), ton abonnement Mamie GEO ${escapeHtml(data.plan)} démarre automatiquement. Tu peux toujours annuler en 1 clic depuis ton compte (sans frais).`
    : `Il te reste 4 jours sur ton essai gratuit. Tes runs continuent de tourner quotidiennement sur les 5 IA suivies : jette un œil à ton dashboard pour voir ce que tu obtiens. À J+14 (${formatDate(data.trialEndsOn)}), ton abonnement démarre automatiquement.`;

  const ctaLabel = isFinal ? "Voir mes options" : "Voir mon dashboard";
  const ctaUrl = isFinal ? data.portalUrl : data.dashboardUrl;

  const text = `Bonjour,

${headline}

${body}

${ctaLabel} : ${ctaUrl}

Annulation à tout moment depuis ton compte. Garantie remboursement 14 jours si tu paies puis changes d'avis.

À bientôt,
Mamie GEO`;

  const html = `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;color:#191919;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e6e6e6;overflow:hidden;margin-top:24px;">
      <tr><td style="padding:32px;">
        <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;">${headline}</h1>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Pour <strong>${escapeHtml(data.workspaceName)}</strong>.</p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${body}</p>
        <p style="margin:24px 0;">
          <a href="${escapeAttr(ctaUrl)}" style="display:inline-block;background:#191919;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:500;font-size:14px;">${ctaLabel}</a>
        </p>
        <p style="margin:24px 0 0;padding-top:24px;border-top:1px solid #efefef;font-size:13px;color:#6b6b6b;line-height:1.6;">Annulation à tout moment depuis ton compte. Garantie remboursement 14 jours si tu paies puis changes d'avis. Une question ? <a href="mailto:hello@mamie-geo.fr" style="color:#6b6b6b;">hello@mamie-geo.fr</a></p>
      </td></tr>
    </table>
    <p style="margin:24px;"></p>
  </body>
</html>`;

  return { subject, html, text };
}

function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;",
  );
}

function escapeAttr(s: string): string {
  return escapeHtml(s);
}
