// Email envoyé après `invoice.payment_failed` — alerte le user que sa
// carte a été refusée et qu'il a J+7 pour régulariser avant expired.

import type { RenderedEmail } from "@/lib/email/templates/weekly-recap";

export interface PaymentFailedData {
  workspaceName: string;
  portalUrl: string;
}

export function renderPaymentFailed(data: PaymentFailedData): RenderedEmail {
  const subject = "Paiement Mamie GEO refusé — action requise";

  const text = `Bonjour,

Le prélèvement pour ton abonnement Mamie GEO sur ${data.workspaceName} a été refusé.

Mets à jour ta carte sous 7 jours pour éviter la suspension du tracking :
${data.portalUrl}

Si tu penses qu'il s'agit d'une erreur, écris-nous à hello@mamie-geo.fr.

À bientôt,
Mamie GEO`;

  const html = `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:24px;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;color:#191919;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e6e6e6;">
      <tr><td style="padding:32px;">
        <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;">Paiement refusé</h1>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Le prélèvement pour ton abonnement sur <strong>${escapeHtml(data.workspaceName)}</strong> a été refusé. Mets à jour ta carte sous 7 jours pour éviter la suspension du tracking.</p>
        <p style="margin:24px 0;">
          <a href="${escapeAttr(data.portalUrl)}" style="display:inline-block;background:#C5532E;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:500;font-size:14px;">Mettre à jour ma carte</a>
        </p>
        <p style="margin:24px 0 0;padding-top:24px;border-top:1px solid #efefef;font-size:13px;color:#6b6b6b;line-height:1.6;">Si tu penses qu'il s'agit d'une erreur, écris-nous à <a href="mailto:hello@mamie-geo.fr" style="color:#6b6b6b;">hello@mamie-geo.fr</a>.</p>
      </td></tr>
    </table>
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
