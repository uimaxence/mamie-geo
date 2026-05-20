// Email envoyé quand un audit programmé (cron hebdo) détecte une chute
// de score ≥ 10 pts vs l'audit précédent sur la même URL.
// Sprint 6 PR B (cf. doc 09 § 2026-05-17).

import type { RenderedEmail } from "@/lib/email/templates/weekly-recap";

export interface AuditScoreDropData {
  workspaceName: string;
  brandName: string;
  url: string;
  previousScore: number;
  currentScore: number;
  /** Negative number (e.g. -12 means score dropped by 12 points). */
  delta: number;
  auditsAppUrl: string;
}

export function renderAuditScoreDrop(data: AuditScoreDropData): RenderedEmail {
  const subject = `Alerte, score d'audit en baisse sur ${data.brandName} (${data.delta} pts)`;
  const absDelta = Math.abs(data.delta);

  const text = `Bonjour,

Le score d'audit technique de ${data.brandName} a baissé de ${absDelta} points cette semaine.

URL : ${data.url}
Score précédent : ${data.previousScore}/100
Score actuel : ${data.currentScore}/100

Voir le détail des checks qui ont régressé :
${data.auditsAppUrl}

À bientôt,
Mamie GEO`;

  const html = `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:24px;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;color:#191919;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e6e6e6;">
      <tr><td style="padding:32px;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#C5532E;font-weight:600;">Alerte audit technique</p>
        <h1 style="margin:0 0 20px;font-size:22px;font-weight:600;line-height:1.3;">Le score de <strong>${escapeHtml(data.brandName)}</strong> a baissé de ${absDelta} points</h1>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid #f1f1f1;border-radius:8px;">
          <tr>
            <td style="padding:14px 16px;border-bottom:1px solid #f1f1f1;font-size:13px;color:#6b6b6b;">URL auditée</td>
            <td style="padding:14px 16px;border-bottom:1px solid #f1f1f1;font-size:13px;font-family:ui-monospace,monospace;text-align:right;word-break:break-all;">${escapeHtml(data.url)}</td>
          </tr>
          <tr>
            <td style="padding:14px 16px;border-bottom:1px solid #f1f1f1;font-size:13px;color:#6b6b6b;">Score précédent</td>
            <td style="padding:14px 16px;border-bottom:1px solid #f1f1f1;font-size:18px;font-weight:600;text-align:right;color:#191919;">${data.previousScore}/100</td>
          </tr>
          <tr>
            <td style="padding:14px 16px;font-size:13px;color:#6b6b6b;">Score actuel</td>
            <td style="padding:14px 16px;font-size:18px;font-weight:600;text-align:right;color:#C5532E;">${data.currentScore}/100</td>
          </tr>
        </table>

        <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#444;">L'audit hebdo a détecté des régressions par rapport à la semaine dernière. Les checks qui ont changé sont listés dans ton tableau de bord :</p>

        <p style="margin:0 0 24px;">
          <a href="${escapeAttr(data.auditsAppUrl)}" style="display:inline-block;background:#191919;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:500;font-size:14px;">Voir le rapport →</a>
        </p>

        <p style="margin:24px 0 0;padding-top:24px;border-top:1px solid #efefef;font-size:12px;color:#9b9b9b;line-height:1.6;">Cet email est envoyé une fois par semaine quand un audit programmé détecte une baisse ≥ 10 points. Tu peux le désactiver depuis les réglages de ton workspace.</p>
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
