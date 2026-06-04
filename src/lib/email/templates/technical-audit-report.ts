import { getRecommendation } from "@/lib/audit/recommendations";
import type { AuditReport, CheckResult } from "@/lib/audit/types";
import type { RenderedEmail } from "./weekly-recap";

// Template email "Rapport audit technique complet", envoyé après que
// l'utilisateur ait soumis son email sur /outils/audit-technique. HTML
// inline pour compat Gmail/Outlook + text fallback. Pure et synchrone,
// testable sans DB ni env.

export function renderTechnicalAuditEmail(report: AuditReport): RenderedEmail {
  const subject = `Audit technique ${shortDomain(report.url)}, score ${report.scoreGlobal}/100`;

  const failedChecks = report.checks
    .filter((c) => c.status === "fail" || c.status === "warn")
    .sort((a, b) => sevWeight(b) - sevWeight(a));

  const passedChecks = report.checks.filter((c) => c.status === "pass");

  const text = renderText(report, failedChecks, passedChecks);
  const html = renderHtml(report, failedChecks, passedChecks);

  return { subject, html, text };
}

function shortDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function sevWeight(c: CheckResult): number {
  const order = { critical: 3, warning: 2, info: 1 } as const;
  return order[c.severity] ?? 0;
}

// ── Text fallback ────────────────────────────────────────────────────

function renderText(report: AuditReport, failed: CheckResult[], passed: CheckResult[]): string {
  const parts: string[] = [];
  parts.push(`Audit technique, ${report.url}`);
  parts.push("");
  parts.push(`Score global : ${report.scoreGlobal}/100`);
  parts.push("");
  for (const sub of report.subScores) {
    parts.push(`  ${subLabel(sub.category)} : ${sub.score}/100`);
  }
  parts.push("");
  parts.push(`${failed.length} points d'amélioration détectés, ${passed.length} bons points.`);
  parts.push("");
  parts.push("─── Points d'amélioration ───");
  parts.push("");
  for (const c of failed) {
    const reco = getRecommendation(c.id);
    parts.push(`[${sevLabel(c.severity)}] ${c.label}`);
    if (c.found) parts.push(`   Trouvé : ${c.found}`);
    if (c.expected) parts.push(`   Attendu : ${c.expected}`);
    parts.push(`   Pourquoi : ${reco.why}`);
    parts.push(`   Effort estimé : ${reco.estimatedEffort}`);
    if (reco.externalDoc) parts.push(`   Doc : ${reco.externalDoc}`);
    parts.push("");
  }
  parts.push("");
  parts.push("─── Tu veux qu'on tracke ta visibilité IA en continu ? ───");
  parts.push("Mamie GEO mesure quotidiennement si ta marque apparaît dans ChatGPT, Claude,");
  parts.push("Perplexity, Gemini et Le Chat, dès 9,99 €/mois.");
  parts.push("https://mamie-geo.fr/pricing");
  parts.push("");
  return parts.join("\n");
}

// ── HTML ─────────────────────────────────────────────────────────────

function renderHtml(report: AuditReport, failed: CheckResult[], passed: CheckResult[]): string {
  const scoreColor =
    report.scoreGlobal >= 75 ? "#15803d" : report.scoreGlobal >= 50 ? "#b45309" : "#b91c1c";
  return `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:24px;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;color:#191919;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e6e6e6;">
      <tr><td style="padding:32px;">
        <p style="margin:0 0 8px;font-size:13px;color:#737373;text-transform:uppercase;letter-spacing:0.05em;">Audit technique</p>
        <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;">${escapeHtml(shortDomain(report.url))}</h1>

        <div style="display:flex;align-items:center;gap:16px;margin:24px 0;padding:20px;background:#fafafa;border-radius:12px;">
          <div style="font-size:48px;font-weight:700;color:${scoreColor};line-height:1;">${report.scoreGlobal}<span style="font-size:24px;color:#737373;">/100</span></div>
          <div style="color:#525252;font-size:14px;">Score global pondéré : SEO 30 % · GEO 35 % · A11Y 15 % · Perf 20 %</div>
        </div>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
          ${report.subScores
            .map(
              (sub) =>
                `<tr><td style="padding:6px 0;font-size:14px;color:#404040;">${escapeHtml(
                  subLabel(sub.category),
                )}</td><td style="padding:6px 0;text-align:right;font-weight:600;font-family:ui-monospace,Menlo,monospace;color:${
                  sub.score >= 75 ? "#15803d" : sub.score >= 50 ? "#b45309" : "#b91c1c"
                };">${sub.score}/100</td></tr>`,
            )
            .join("")}
        </table>

        <h2 style="margin:32px 0 12px;font-size:18px;font-weight:700;">${failed.length} points d'amélioration</h2>
        ${failed.map(renderFailedHtml).join("")}

        ${
          passed.length > 0
            ? `<h2 style="margin:32px 0 12px;font-size:18px;font-weight:700;color:#15803d;">${passed.length} bons points 👏</h2>
        <ul style="margin:0;padding-left:20px;color:#525252;font-size:14px;line-height:1.6;">
          ${passed.map((p) => `<li>${escapeHtml(p.label)}</li>`).join("")}
        </ul>`
            : ""
        }

        <div style="margin:40px 0 0;padding:24px;background:linear-gradient(135deg,#eaf4ff 0%,#dbeafe 100%);border-radius:12px;">
          <h3 style="margin:0 0 8px;font-size:18px;font-weight:700;">Tu veux qu'on tracke ta visibilité IA en continu ?</h3>
          <p style="margin:0 0 16px;font-size:14px;color:#404040;">Mamie GEO mesure quotidiennement si ta marque apparaît dans ChatGPT, Claude, Perplexity, Gemini et Le Chat. À partir de 9,99 €/mois.</p>
          <p style="margin:0;">
            <a href="https://mamie-geo.fr/pricing" style="display:inline-block;background:#191919;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:500;font-size:14px;">Voir les plans →</a>
          </p>
        </div>

        <p style="margin:32px 0 0;padding-top:24px;border-top:1px solid #efefef;font-size:12px;color:#737373;text-align:center;">Audit généré le ${escapeHtml(new Date(report.fetchedAt).toLocaleString("fr-FR"))}.</p>
      </td></tr>
    </table>
  </body>
</html>`;
}

function renderFailedHtml(c: CheckResult): string {
  const reco = getRecommendation(c.id);
  const sevColor =
    c.severity === "critical" ? "#b91c1c" : c.severity === "warning" ? "#b45309" : "#525252";
  return `
    <div style="margin:0 0 16px;padding:16px;border:1px solid #e6e6e6;border-left:3px solid ${sevColor};border-radius:8px;">
      <p style="margin:0 0 4px;font-size:11px;color:${sevColor};text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">${escapeHtml(sevLabel(c.severity))} · ${escapeHtml(c.id)}</p>
      <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#191919;">${escapeHtml(c.label)}</p>
      ${c.found ? `<p style="margin:0 0 4px;font-size:13px;color:#525252;">Trouvé : <code style="background:#f5f5f5;padding:2px 6px;border-radius:4px;">${escapeHtml(c.found)}</code></p>` : ""}
      ${c.expected ? `<p style="margin:0 0 8px;font-size:13px;color:#525252;">Attendu : ${escapeHtml(c.expected)}</p>` : ""}
      <p style="margin:8px 0 8px;font-size:13px;color:#404040;line-height:1.5;">${escapeHtml(reco.why)}</p>
      <p style="margin:0;font-size:12px;color:#737373;">Effort estimé : <strong>${escapeHtml(reco.estimatedEffort)}</strong>${reco.geoImpact === "high" ? ' · <span style="color:#7c3aed;">impact GEO élevé</span>' : ""}${reco.externalDoc ? ` · <a href="${escapeAttr(reco.externalDoc)}" style="color:#329cff;">documentation</a>` : ""}</p>
    </div>`;
}

function sevLabel(s: CheckResult["severity"]): string {
  switch (s) {
    case "critical":
      return "critique";
    case "warning":
      return "à corriger";
    case "info":
      return "info";
  }
}

function subLabel(cat: string): string {
  switch (cat) {
    case "seo":
      return "SEO classique";
    case "geo":
      return "GEO (visibilité IA)";
    case "a11y":
      return "Accessibilité";
    case "perf":
      return "Performance";
    default:
      return cat;
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;",
  );
}

function escapeAttr(s: string): string {
  return escapeHtml(s);
}
