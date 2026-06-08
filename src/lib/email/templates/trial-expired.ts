// Email envoyé quand le trial 14j s'est terminé sans conversion (carte
// déclinée ou subscription annulée pendant le trial). Le user a un plan
// "expired" ou "canceled" et son tracking est gelé. Pattern : reprise en
// 1 clic via portal Stripe.
//
// Variante "j+7" : relance 7 jours après l'expiry pour les users qui ne
// sont pas revenus (envoyée par le cron quotidien).

import type { RenderedEmail } from "@/lib/email/templates/weekly-recap";

export type TrialExpiredVariant = "expired" | "j+7";

export interface TrialExpiredData {
  variant: TrialExpiredVariant;
  workspaceName: string;
  reactivateUrl: string;
}

export function renderTrialExpired(data: TrialExpiredData): RenderedEmail {
  const isFollowUp = data.variant === "j+7";

  const subject = isFollowUp
    ? "Ton tracking Mamie GEO est toujours dispo"
    : "Ton essai Mamie GEO est terminé";

  const headline = isFollowUp
    ? "Ton dashboard est toujours là"
    : "Ton essai est terminé";

  const body = isFollowUp
    ? `Il y a une semaine, ton essai Mamie GEO s'est terminé. Tes prompts, brand et concurrents sont toujours configurés — il te suffit de réactiver ton plan pour relancer le tracking.`
    : `Ton essai 14 jours sur Mamie GEO est terminé et ton tracking quotidien est suspendu. Pour le reprendre, réactive ton plan en 1 clic. Tes prompts et concurrents sont conservés.`;

  const ctaLabel = "Réactiver mon plan";

  const text = `Bonjour,

${headline}

${body}

${ctaLabel} : ${data.reactivateUrl}

Si tu préfères supprimer ton compte, tu peux le faire depuis tes paramètres (RGPD article 17). Une question ? hello@mamie-geo.fr

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
          <a href="${escapeAttr(data.reactivateUrl)}" style="display:inline-block;background:#191919;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:500;font-size:14px;">${ctaLabel}</a>
        </p>
        <p style="margin:24px 0 0;padding-top:24px;border-top:1px solid #efefef;font-size:13px;color:#6b6b6b;line-height:1.6;">Si tu préfères supprimer ton compte, tu peux le faire depuis tes paramètres (RGPD article 17). Une question ? <a href="mailto:hello@mamie-geo.fr" style="color:#6b6b6b;">hello@mamie-geo.fr</a></p>
      </td></tr>
    </table>
    <p style="margin:24px;"></p>
  </body>
</html>`;

  return { subject, html, text };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;",
  );
}

function escapeAttr(s: string): string {
  return escapeHtml(s);
}
