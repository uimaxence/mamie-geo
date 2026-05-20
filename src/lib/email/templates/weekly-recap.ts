// Template "Récap visibilité hebdo" envoyé chaque lundi matin via le
// worker send_weekly_email. HTML inline (CSS dans <style> + style="..."
// attributes) pour compat clients mail (Gmail, Outlook). Version text
// brute en fallback.
//
// La data du template est extraite par le worker (Drizzle queries) puis
// passée ici, la fonction render() est pure et synchrone, testable
// sans DB ni env.

export interface WeeklyRecapStat {
  /** Libellé affiché ("Score de visibilité", "Marque citée", etc.) */
  label: string;
  /** Valeur principale formatée (string déjà rendue) */
  value: string;
  /** Variation signée en % (positif = vert ↑, négatif = rouge ↓), ou null */
  deltaPct: number | null;
  /** Période de comparaison ("vs semaine dernière") */
  deltaPeriod?: string;
}

export interface WeeklyRecapTopCompetitor {
  name: string;
  citationCount: number;
}

export interface WeeklyRecapData {
  workspaceName: string;
  brandName: string;
  brandDomain: string;
  isoWeek: string;
  /** Stats principales (max 4 pour rester lisible mobile) */
  stats: WeeklyRecapStat[];
  /** Top concurrents cités cette semaine (max 3) */
  topCompetitors: WeeklyRecapTopCompetitor[];
  /** URL absolue vers le dashboard (CTA), typiquement `${NEXT_PUBLIC_APP_URL}/app/dashboard` */
  dashboardUrl: string;
  /** URL absolue vers settings (lien désinscription footer) */
  settingsUrl: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export function renderWeeklyRecap(data: WeeklyRecapData): RenderedEmail {
  const [yearStr, weekStr] = data.isoWeek.split("-W");
  const subject = `Récap visibilité IA, semaine ${weekStr} / ${yearStr}`;

  return {
    subject,
    html: renderHtml(data),
    text: renderText(data),
  };
}

/**
 * Construit l'URL absolue du pattern signature depuis l'origine de
 * `dashboardUrl`. Évite d'ajouter un paramètre dédié à la fonction,
 * tous les appelants passent déjà une URL absolue (cf. weekly-recap.test).
 *
 * Le pattern est tinté en bleu primary directement dans /public/pattern.svg
 * pour que les clients mail qui chargent le SVG voient la bonne couleur.
 * Fallback bg color sur la bande pour les clients qui strippent les SVGs
 * (Outlook desktop notamment).
 */
function deriveOrigin(absoluteUrl: string): string {
  try {
    return new URL(absoluteUrl).origin;
  } catch {
    return "https://mamie-geo.fr";
  }
}

function renderHtml(data: WeeklyRecapData): string {
  const patternUrl = `${deriveOrigin(data.dashboardUrl)}/pattern.svg`;
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(data.brandName)}, récap visibilité IA</title>
<style>
  body { margin: 0; padding: 0; background: #fafafa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #0a0a0a; }
  a { color: #0a0a0a; }
  table { border-collapse: collapse; }
  .container { max-width: 560px; margin: 0 auto; padding: 0 16px 32px; }
  .pattern-band { height: 56px; background-color: #329cff; background-image: url("${escapeHtmlAttr(patternUrl)}"); background-repeat: repeat; background-size: 56px 56px; }
  .header { padding: 28px 0 0; }
  .card { background: #ffffff; border: 1px solid #e5e5e5; border-radius: 16px; padding: 24px; }
  .eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #737373; }
  .h1 { font-size: 22px; font-weight: 700; letter-spacing: -0.015em; color: #0a0a0a; margin: 4px 0 0 0; }
  .meta { font-size: 13px; color: #737373; margin: 4px 0 0 0; }
  .stat-label { font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #737373; }
  .stat-value { font-size: 28px; font-weight: 600; letter-spacing: -0.025em; color: #0a0a0a; margin: 8px 0 0 0; }
  .delta-up { color: #15803d; }
  .delta-down { color: #b91c1c; }
  .delta-neutral { color: #737373; }
  .delta-period { color: #737373; font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; margin-left: 6px; }
  .btn { display: inline-block; background: #0a0a0a; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-size: 14px; font-weight: 500; }
  .footer { font-size: 12px; color: #737373; margin-top: 32px; line-height: 1.55; text-align: center; }
  .footer a { color: #737373; }
</style>
</head>
<body>
<!-- Signature pattern bleu primary (cf. doc 10 § Pattern signature).
     Bande horizontale 56px en haut de l'email ; couleur fallback solide
     pour Outlook desktop qui strippe parfois les SVG bg-image. -->
<div class="pattern-band" role="presentation" aria-hidden="true"></div>
<div class="container">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td class="header">
        <p class="eyebrow">Récap hebdo · semaine ${escapeHtml(data.isoWeek)}</p>
        <h1 class="h1">${escapeHtml(data.brandName)}</h1>
        <p class="meta">${escapeHtml(data.brandDomain)} · ${escapeHtml(data.workspaceName)}</p>
      </td>
    </tr>
  </table>

  <!-- Stats (2 colonnes × 2 rangées) -->
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top: 24px;">
    ${renderStatsRows(data.stats)}
  </table>

  <!-- Top concurrents -->
  ${data.topCompetitors.length > 0 ? renderCompetitorsBlock(data.topCompetitors) : ""}

  <!-- CTA -->
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top: 32px;">
    <tr>
      <td align="center">
        <a href="${escapeHtmlAttr(data.dashboardUrl)}" class="btn">Voir le dashboard complet →</a>
      </td>
    </tr>
  </table>

  <!-- Footer -->
  <p class="footer">
    Tu reçois ce mail car ton workspace <strong>${escapeHtml(data.workspaceName)}</strong> a tracké au moins un prompt cette semaine.<br>
    <a href="${escapeHtmlAttr(data.settingsUrl)}">Réglages &amp; préférences</a>
  </p>
</div>
</body>
</html>`;
}

function renderStatsRows(stats: WeeklyRecapStat[]): string {
  // Stats par groupes de 2 pour le rendu 2 colonnes (compat Outlook).
  const rows: string[] = [];
  for (let i = 0; i < stats.length; i += 2) {
    const left = stats[i];
    const right = stats[i + 1];
    if (!left) continue;
    rows.push(
      `<tr>
        <td width="50%" style="padding: 8px 8px 8px 0;">${renderStatCard(left)}</td>
        <td width="50%" style="padding: 8px 0 8px 8px;">${right ? renderStatCard(right) : ""}</td>
      </tr>`,
    );
  }
  return rows.join("");
}

function renderStatCard(stat: WeeklyRecapStat): string {
  return `<div class="card" style="padding: 16px;">
    <div class="stat-label">${escapeHtml(stat.label)}</div>
    <div class="stat-value">${escapeHtml(stat.value)}</div>
    ${renderDeltaLine(stat)}
  </div>`;
}

function renderDeltaLine(stat: WeeklyRecapStat): string {
  if (stat.deltaPct === null || stat.deltaPct === undefined) {
    return `<div style="font-size: 12px; color: #737373; margin-top: 6px;">—</div>`;
  }
  const direction =
    stat.deltaPct > 0 ? "delta-up" : stat.deltaPct < 0 ? "delta-down" : "delta-neutral";
  const arrow = stat.deltaPct > 0 ? "↑" : stat.deltaPct < 0 ? "↓" : "→";
  const sign = stat.deltaPct > 0 ? "+" : "";
  const formatted = Number.isInteger(stat.deltaPct)
    ? `${sign}${stat.deltaPct}%`
    : `${sign}${stat.deltaPct.toFixed(1)}%`;
  return `<div style="font-size: 12px; margin-top: 6px;">
    <span class="${direction}" style="font-weight: 600;">${arrow} ${formatted}</span>
    ${stat.deltaPeriod ? `<span class="delta-period">${escapeHtml(stat.deltaPeriod)}</span>` : ""}
  </div>`;
}

function renderCompetitorsBlock(competitors: WeeklyRecapTopCompetitor[]): string {
  const rows = competitors
    .map((c, i) => {
      const borderTop = i === 0 ? "" : "border-top: 1px solid #e5e5e5;";
      return `<tr>
        <td style="padding: 10px 0; ${borderTop} font-size: 14px; color: #404040;">
          <strong style="color: #0a0a0a;">#${i + 1}</strong> ${escapeHtml(c.name)}
        </td>
        <td align="right" style="padding: 10px 0; ${borderTop} font-size: 14px; color: #525252; font-variant-numeric: tabular-nums;">
          ${c.citationCount} mention${c.citationCount > 1 ? "s" : ""}
        </td>
      </tr>`;
    })
    .join("");

  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top: 24px;">
    <tr><td>
      <div class="card">
        <p class="stat-label" style="margin-bottom: 12px;">Top concurrents cités cette semaine</p>
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">${rows}</table>
      </div>
    </td></tr>
  </table>`;
}

function renderText(data: WeeklyRecapData): string {
  const lines: string[] = [];
  lines.push(`${data.brandName}, récap visibilité IA (semaine ${data.isoWeek})`);
  lines.push(`${data.brandDomain} · ${data.workspaceName}`);
  lines.push("");
  lines.push("Stats");
  for (const stat of data.stats) {
    const delta = formatDeltaText(stat);
    lines.push(`  ${stat.label}: ${stat.value}${delta}`);
  }
  if (data.topCompetitors.length > 0) {
    lines.push("");
    lines.push("Top concurrents cités");
    data.topCompetitors.forEach((c, i) => {
      lines.push(
        `  #${i + 1} ${c.name} (${c.citationCount} mention${c.citationCount > 1 ? "s" : ""})`,
      );
    });
  }
  lines.push("");
  lines.push(`Voir le dashboard complet → ${data.dashboardUrl}`);
  lines.push("");
  lines.push(
    `Tu reçois ce mail car ton workspace "${data.workspaceName}" a tracké au moins un prompt cette semaine.`,
  );
  lines.push(`Réglages: ${data.settingsUrl}`);
  return lines.join("\n");
}

function formatDeltaText(stat: WeeklyRecapStat): string {
  if (stat.deltaPct === null || stat.deltaPct === undefined) return "";
  const arrow = stat.deltaPct > 0 ? "↑" : stat.deltaPct < 0 ? "↓" : "→";
  const sign = stat.deltaPct > 0 ? "+" : "";
  const formatted = Number.isInteger(stat.deltaPct)
    ? `${sign}${stat.deltaPct}%`
    : `${sign}${stat.deltaPct.toFixed(1)}%`;
  const period = stat.deltaPeriod ? ` ${stat.deltaPeriod}` : "";
  return ` (${arrow} ${formatted}${period})`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeHtmlAttr(s: string): string {
  // Attribute context : on échappe les guillemets + quote
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
