// Email envoyé après `checkout.session.completed`, confirme le démarrage
// du tracking. HTML inline pour compat Gmail/Outlook + text fallback.
// Pure et synchrone, testable sans DB ni env (cf. weekly-recap.ts).

import type { RenderedEmail } from "@/lib/email/templates/weekly-recap";

export interface WelcomePaidData {
  workspaceName: string;
  plan: "solo" | "starter" | "pro" | "agency" | "enterprise" | string;
  dashboardUrl: string;
  /**
   * Nombre de runs enqueued immédiatement après le checkout (cf. webhook
   * handler `handleCheckoutCompleted`). Si > 0 le mail dit "résultats
   * dans quelques minutes" ; sinon il pointe la cadence du plan.
   */
  immediateRuns: number;
}

const PLAN_LABEL: Record<string, string> = {
  solo: "Solo",
  starter: "Starter",
  pro: "Pro",
  agency: "Agency",
  enterprise: "Enterprise",
};

const PLAN_CADENCE_LABEL: Record<string, string> = {
  solo: "chaque lundi matin",
  starter: "chaque matin",
  pro: "chaque matin",
  agency: "chaque matin",
  enterprise: "chaque matin",
};

export function renderWelcomePaid(data: WelcomePaidData): RenderedEmail {
  const planLabel = PLAN_LABEL[data.plan] ?? data.plan;
  const cadenceLabel = PLAN_CADENCE_LABEL[data.plan] ?? "selon ta cadence";
  const subject = `Bienvenue dans Mamie GEO ${planLabel}, ton tracking démarre`;
  const hasImmediate = data.immediateRuns > 0;

  const trackingLine = hasImmediate
    ? `Ton **premier run vient d'être lancé** sur les 5 IA suivies (ChatGPT, Claude, Perplexity, Gemini, Le Chat). Les résultats apparaîtront sur ton dashboard d'ici quelques minutes.`
    : `Le tracking sera lancé ${cadenceLabel} sur les 5 IA suivies (ChatGPT, Claude, Perplexity, Gemini, Le Chat).`;
  const trackingLineHtml = hasImmediate
    ? `Ton <strong>premier run vient d'être lancé</strong> sur les 5 IA suivies (ChatGPT, Claude, Perplexity, Gemini, Le Chat). Les résultats apparaîtront sur ton dashboard d'ici quelques minutes.`
    : `Le tracking sera lancé ${cadenceLabel} sur les 5 IA suivies (ChatGPT, Claude, Perplexity, Gemini, Le Chat).`;

  const text = `Bonjour,

Ton abonnement Mamie GEO ${planLabel} pour ${data.workspaceName} est actif.

${trackingLine}

Dashboard : ${data.dashboardUrl}

Cadence : ${cadenceLabel}.

Garantie remboursement 14 jours : si Mamie GEO ne te convient pas, envoie-nous un mot à hello@mamie-geo.fr.

À bientôt,
Mamie GEO`;

  const html = `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;color:#191919;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e6e6e6;overflow:hidden;margin-top:24px;">
      <tr><td style="padding:32px;">
        <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;">Bienvenue dans Mamie GEO ${planLabel}</h1>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Ton abonnement pour <strong>${escapeHtml(data.workspaceName)}</strong> est actif.</p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${trackingLineHtml}</p>
        <p style="margin:24px 0;">
          <a href="${escapeAttr(data.dashboardUrl)}" style="display:inline-block;background:#191919;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:500;font-size:14px;">Voir mon dashboard</a>
        </p>
        <p style="margin:0;font-size:13px;color:#6b6b6b;line-height:1.6;">Cadence : ${cadenceLabel}.</p>
        <p style="margin:24px 0 0;padding-top:24px;border-top:1px solid #efefef;font-size:13px;color:#6b6b6b;line-height:1.6;">Garantie remboursement 14 jours : si Mamie GEO ne te convient pas, écris-nous à <a href="mailto:hello@mamie-geo.fr" style="color:#6b6b6b;">hello@mamie-geo.fr</a>.</p>
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
