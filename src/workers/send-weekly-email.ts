import { and, count, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  brands,
  citationMetricsDaily,
  events,
  prompts,
  runs,
  user,
  workspaceMembers,
  workspaces,
} from "@/db/schema";
import { env } from "@/lib/env";
import {
  renderWeeklyRecap,
  type WeeklyRecapData,
  type WeeklyRecapStat,
} from "@/lib/email/templates/weekly-recap";
import { sendWeeklyRecapEmail } from "@/lib/email";
import type { SendWeeklyEmailPayload } from "./send-weekly-email-payload";

export {
  parseSendWeeklyEmailPayload,
  isoWeekFromDate,
  type SendWeeklyEmailPayload,
} from "./send-weekly-email-payload";

// Worker send_weekly_email — Phase B+ (cf. doc 09 § 2026-05-12).
//
// Flow :
//   1. Charger workspace + sa brand principale (V0 = 1 brand par workspace).
//   2. Charger métriques agrégées des 7 derniers jours (semaine en cours)
//      et des 7 jours précédents (pour deltas).
//   3. Si 0 run success sur la semaine → log event email_skipped_no_data
//      et return early. Pas d'envoi (l'utilisateur n'a rien de neuf à voir).
//   4. Render le template HTML+text via renderWeeklyRecap().
//   5. Envoyer à TOUS les membres du workspace (V0 = owner uniquement,
//      mais on prépare pour les invitations Pro+).
//   6. Logger l'event email_sent en DB.
//
// Erreurs Brevo : remontées → la queue retry/dead selon attempts.

export interface SendWeeklyEmailOptions {
  /** Override pour tests : remplace sendWeeklyRecapEmail */
  sendEmail?: typeof sendWeeklyRecapEmail;
}

export async function sendWeeklyEmail(
  payload: SendWeeklyEmailPayload,
  options: SendWeeklyEmailOptions = {},
): Promise<void> {
  const { workspaceId, isoWeek } = payload;
  const sendEmailImpl = options.sendEmail ?? sendWeeklyRecapEmail;

  // 1. Workspace
  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.id, workspaceId),
  });
  if (!workspace) throw new Error(`Workspace ${workspaceId} introuvable`);

  // 2. Brand principale (V0 = 1 par workspace)
  const brand = await db.query.brands.findFirst({
    where: eq(brands.workspaceId, workspaceId),
  });
  if (!brand) {
    await logEvent(workspaceId, null, "email_skipped_no_brand", { isoWeek });
    return;
  }

  // 3. Fenêtres temporelles UTC (jour calendaire)
  const today = startOfDayUtc(new Date());
  const sevenDaysAgo = addDays(today, -7);
  const fourteenDaysAgo = addDays(today, -14);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);
  const fourteenDaysAgoStr = fourteenDaysAgo.toISOString().slice(0, 10);

  // 4. Comptage runs success cette semaine (skip si zéro)
  const thisWeekRunsCount = await db
    .select({ n: count() })
    .from(runs)
    .innerJoin(prompts, eq(prompts.id, runs.promptId))
    .where(
      and(
        eq(prompts.brandId, brand.id),
        eq(runs.status, "success"),
        gte(runs.executedAt, sevenDaysAgo),
      ),
    );

  const runsThisWeek = thisWeekRunsCount[0]?.n ?? 0;
  if (runsThisWeek === 0) {
    await logEvent(workspaceId, null, "email_skipped_no_data", { isoWeek, runsThisWeek: 0 });
    return;
  }

  // 5. Score moyen de visibilité (Claude, sur 7j) — toutes brands+llm
  //    confondues. V0 simplifié : on prend la moyenne sur la fenêtre.
  const metricsThisWeek = await db
    .select({
      llm: citationMetricsDaily.llm,
      avgScore: sql<string>`AVG(${citationMetricsDaily.visibilityScore})`.as("avg_score"),
      totalRuns: sql<number>`SUM(${citationMetricsDaily.totalRuns})`.as("total_runs"),
      brandCited: sql<number>`SUM(${citationMetricsDaily.brandCitedCount})`.as("brand_cited"),
    })
    .from(citationMetricsDaily)
    .where(
      and(
        eq(citationMetricsDaily.brandId, brand.id),
        gte(citationMetricsDaily.date, sevenDaysAgoStr),
      ),
    )
    .groupBy(citationMetricsDaily.llm);

  const metricsLastWeek = await db
    .select({
      llm: citationMetricsDaily.llm,
      avgScore: sql<string>`AVG(${citationMetricsDaily.visibilityScore})`.as("avg_score"),
    })
    .from(citationMetricsDaily)
    .where(
      and(
        eq(citationMetricsDaily.brandId, brand.id),
        gte(citationMetricsDaily.date, fourteenDaysAgoStr),
        sql`${citationMetricsDaily.date} < ${sevenDaysAgoStr}`,
      ),
    )
    .groupBy(citationMetricsDaily.llm);

  // Score Claude moyen (V0 : on track Claude uniquement)
  const claudeThis = metricsThisWeek.find((m) => m.llm === "claude");
  const claudeLast = metricsLastWeek.find((m) => m.llm === "claude");
  const scoreThis = claudeThis ? Number(claudeThis.avgScore) : 0;
  const scoreLast = claudeLast ? Number(claudeLast.avgScore) : 0;
  const scoreDelta = computeDeltaPct(scoreThis, scoreLast);

  // Citations marque this/last (Claude seul)
  const brandCitedThis = claudeThis ? Number(claudeThis.brandCited) : 0;
  const totalRunsClaudeThis = claudeThis ? Number(claudeThis.totalRuns) : 0;
  const citationRateThis =
    totalRunsClaudeThis > 0 ? (brandCitedThis / totalRunsClaudeThis) * 100 : 0;

  // 6. Top 3 concurrents cités (Claude, sur 7j) — extrait de competitorsData JSONB
  const topCompetitors = await topCompetitorsLast7Days(brand.id, sevenDaysAgoStr);

  // 7. Members du workspace (= destinataires email)
  const members = await db
    .select({ email: user.email, userId: user.id })
    .from(workspaceMembers)
    .innerJoin(user, eq(user.id, workspaceMembers.userId))
    .where(eq(workspaceMembers.workspaceId, workspaceId));

  if (members.length === 0) {
    await logEvent(workspaceId, null, "email_skipped_no_recipients", { isoWeek });
    return;
  }

  // 8. Render
  const baseUrl = env.NEXT_PUBLIC_APP_URL;
  const stats: WeeklyRecapStat[] = [
    {
      label: "Score de visibilité",
      value: scoreThis > 0 ? scoreThis.toFixed(1) : "—",
      deltaPct: scoreDelta,
      deltaPeriod: "vs semaine dernière",
    },
    {
      label: "Marque citée",
      value: totalRunsClaudeThis > 0 ? `${brandCitedThis}/${totalRunsClaudeThis}` : "—",
      deltaPct: null,
      deltaPeriod: "runs Claude cette semaine",
    },
    {
      label: "Taux citation",
      value: totalRunsClaudeThis > 0 ? `${citationRateThis.toFixed(0)}%` : "—",
      deltaPct: null,
    },
    {
      label: "Runs exécutés",
      value: String(runsThisWeek),
      deltaPct: null,
      deltaPeriod: "semaine en cours",
    },
  ];

  const data: WeeklyRecapData = {
    workspaceName: workspace.name,
    brandName: brand.name,
    brandDomain: brand.domain,
    isoWeek,
    stats,
    topCompetitors,
    dashboardUrl: `${baseUrl}/app/dashboard`,
    settingsUrl: `${baseUrl}/app/settings`,
  };

  const rendered = renderWeeklyRecap(data);

  // 9. Envoi (1 mail par destinataire — pour V0 ça reste 1 owner)
  for (const member of members) {
    const sent = await sendEmailImpl({
      to: member.email,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });
    await logEvent(workspaceId, member.userId, "email_sent", {
      template: "weekly_recap",
      isoWeek,
      messageId: sent.messageId,
      recipient: member.email,
    });
  }
}

async function topCompetitorsLast7Days(
  brandId: string,
  sinceDateStr: string,
): Promise<Array<{ name: string; citationCount: number }>> {
  // Lit competitorsData (jsonb) sur les rows Claude de la semaine, agrège
  // les compteurs par nom de concurrent. SQL pur, ~1ms.
  const rows = await db
    .select({ competitorsData: citationMetricsDaily.competitorsData })
    .from(citationMetricsDaily)
    .where(
      and(
        eq(citationMetricsDaily.brandId, brandId),
        eq(citationMetricsDaily.llm, "claude"),
        gte(citationMetricsDaily.date, sinceDateStr),
      ),
    );

  const byName = new Map<string, number>();
  for (const row of rows) {
    const list = (row.competitorsData ?? []) as Array<{ name: string; citationCount: number }>;
    for (const c of list) {
      if (!c.name || typeof c.citationCount !== "number") continue;
      byName.set(c.name, (byName.get(c.name) ?? 0) + c.citationCount);
    }
  }

  return Array.from(byName.entries())
    .map(([name, citationCount]) => ({ name, citationCount }))
    .sort((a, b) => b.citationCount - a.citationCount)
    .slice(0, 3);
}

async function logEvent(
  workspaceId: string,
  userId: string | null,
  kind: string,
  payload: Record<string, unknown>,
): Promise<void> {
  await db.insert(events).values({
    workspaceId,
    userId: userId ?? null,
    kind,
    payload,
  });
}

function startOfDayUtc(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function computeDeltaPct(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  const pct = ((current - previous) / previous) * 100;
  return Math.round(pct * 10) / 10;
}

// Suppress unused warnings on the imports that drizzle-orm requires
// implicitly for the where clauses (inArray, desc) — kept for future use.
void inArray;
void desc;
