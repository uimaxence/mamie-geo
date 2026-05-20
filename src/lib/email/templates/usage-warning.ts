// Emails de garde-fou usage LLM, 3 niveaux :
//   60 %   info bienveillante "tu approches de ta limite"
//   100 %  warning "tu as atteint ta limite théorique"
//   200 %  hard-cap (block) "on a coupé, contacte-nous"
//
// Pure et synchrone, testable sans DB. cf. doc 03 § Hard-cap LLM.

import type { RenderedEmail } from "./weekly-recap";

export type UsageLevel = "warn-60" | "warn-100" | "hardcap";

export interface UsageWarningData {
  workspaceName: string;
  plan: string;
  runsCount: number;
  theoreticalMonthly: number;
  hardCap: number;
  /** URL settings#billing pour upgrade ou portal. */
  settingsUrl: string;
  /** Email de contact support pour cas hard-cap (escalation). */
  contactEmail: string;
}

export function renderUsageWarning(level: UsageLevel, data: UsageWarningData): RenderedEmail {
  switch (level) {
    case "warn-60":
      return renderWarn60(data);
    case "warn-100":
      return renderWarn100(data);
    case "hardcap":
      return renderHardcap(data);
  }
}

// ─── 60 % ────────────────────────────────────────────────────────────

function renderWarn60(d: UsageWarningData): RenderedEmail {
  const subject = `Mamie GEO ${d.workspaceName}, tu as atteint 60 % de ta limite mensuelle`;
  const text = `Bonjour,

Ton workspace ${d.workspaceName} (plan ${d.plan}) a effectué ${d.runsCount} runs sur les ${d.theoreticalMonthly} théoriques mensuels, soit ~60 %.

Pas d'inquiétude, tu es encore largement dans les clous. Mais si tu prévois d'ajouter beaucoup de prompts ou de concurrents, jette un œil aux plans supérieurs avant de saturer :

${d.settingsUrl}

À bientôt,
Mamie GEO`;

  const html = baseHtml({
    accent: "#329cff",
    title: "Tu as atteint 60 % de ta limite",
    intro: `Ton workspace <strong>${escapeHtml(d.workspaceName)}</strong> (plan ${escapeHtml(d.plan)}) a effectué <strong>${d.runsCount}</strong> runs sur les <strong>${d.theoreticalMonthly}</strong> théoriques mensuels, soit ~60 %.`,
    body: `Pas d'inquiétude, tu es encore largement dans les clous. Mais si tu prévois d'ajouter beaucoup de prompts ou de concurrents, jette un œil aux plans supérieurs avant de saturer.`,
    ctaUrl: d.settingsUrl,
    ctaLabel: "Gérer mon plan",
  });

  return { subject, html, text };
}

// ─── 100 % ───────────────────────────────────────────────────────────

function renderWarn100(d: UsageWarningData): RenderedEmail {
  const subject = `Mamie GEO ${d.workspaceName}, tu as atteint ta limite théorique mensuelle`;
  const text = `Bonjour,

Ton workspace ${d.workspaceName} (plan ${d.plan}) a effectué ${d.runsCount} runs sur les ${d.theoreticalMonthly} théoriques mensuels, soit 100 %.

On continue à exécuter tes runs (jusqu'à 200 % du théorique, soit ${d.hardCap}). Au-delà, on coupe automatiquement pour éviter une surconsommation involontaire (bot, fuite token, etc.).

Pour étendre ta limite, passe à un plan supérieur :
${d.settingsUrl}

À bientôt,
Mamie GEO`;

  const html = baseHtml({
    accent: "#b45309",
    title: "Tu as atteint ta limite théorique mensuelle",
    intro: `Ton workspace <strong>${escapeHtml(d.workspaceName)}</strong> (plan ${escapeHtml(d.plan)}) a effectué <strong>${d.runsCount}</strong> runs sur les <strong>${d.theoreticalMonthly}</strong> théoriques mensuels, soit 100 %.`,
    body: `On continue à exécuter tes runs (jusqu'à 200 % du théorique, soit ${d.hardCap}). Au-delà, on coupe automatiquement pour éviter une surconsommation involontaire (bot, fuite token, etc.). Pour étendre ta limite, passe à un plan supérieur.`,
    ctaUrl: d.settingsUrl,
    ctaLabel: "Passer à un plan supérieur",
  });

  return { subject, html, text };
}

// ─── Hard-cap ────────────────────────────────────────────────────────

function renderHardcap(d: UsageWarningData): RenderedEmail {
  const subject = `Mamie GEO ${d.workspaceName}, usage anormal détecté, runs suspendus`;
  const text = `Bonjour,

Ton workspace ${d.workspaceName} (plan ${d.plan}) a effectué ${d.runsCount} runs, soit plus de 200 % de ta limite théorique mensuelle (${d.hardCap}).

On a suspendu l'exécution des nouveaux runs pour éviter une facture LLM imprévue. C'est une mesure de sécurité, pas une sanction.

Causes possibles :
- Un bot qui interroge ton API
- Une fuite de credentials
- Un script automatique qui spamme ton workspace
- Une utilisation légitime intense (auquel cas → upgrade en plan supérieur)

Pour reprendre les runs, contacte-nous à ${d.contactEmail} ou passe à un plan supérieur :
${d.settingsUrl}

À bientôt,
Mamie GEO`;

  const html = baseHtml({
    accent: "#b91c1c",
    title: "Usage anormal détecté, runs suspendus",
    intro: `Ton workspace <strong>${escapeHtml(d.workspaceName)}</strong> (plan ${escapeHtml(d.plan)}) a effectué <strong>${d.runsCount}</strong> runs, soit plus de 200 % de ta limite théorique (${d.hardCap}).`,
    body: `On a suspendu l'exécution des nouveaux runs pour éviter une facture LLM imprévue. C'est une mesure de sécurité, pas une sanction.<br /><br /><strong>Causes possibles</strong> : bot qui interroge ton API, fuite de credentials, script automatique qui spamme, ou utilisation légitime intense (auquel cas → upgrade en plan supérieur).<br /><br />Pour reprendre les runs, contacte-nous à <a href="mailto:${escapeAttr(d.contactEmail)}">${escapeHtml(d.contactEmail)}</a> ou passe à un plan supérieur.`,
    ctaUrl: d.settingsUrl,
    ctaLabel: "Gérer mon plan",
  });

  return { subject, html, text };
}

// ─── Shared layout ──────────────────────────────────────────────────

interface BaseHtmlArgs {
  accent: string;
  title: string;
  intro: string;
  body: string;
  ctaUrl: string;
  ctaLabel: string;
}

function baseHtml(a: BaseHtmlArgs): string {
  return `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:24px;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;color:#191919;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e6e6e6;">
      <tr><td style="padding:32px;">
        <div style="height:4px;width:48px;background:${a.accent};border-radius:2px;margin-bottom:20px;"></div>
        <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;">${a.title}</h1>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${a.intro}</p>
        <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#404040;">${a.body}</p>
        <p style="margin:24px 0;">
          <a href="${escapeAttr(a.ctaUrl)}" style="display:inline-block;background:#191919;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:500;font-size:14px;">${escapeHtml(a.ctaLabel)}</a>
        </p>
      </td></tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;",
  );
}

function escapeAttr(s: string): string {
  return escapeHtml(s);
}
