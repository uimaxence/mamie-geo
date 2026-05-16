"use server";

import { headers } from "next/headers";
import { logCronEvent } from "@/lib/cron-logger";
import { sendTransactional } from "@/lib/email";
import { renderTechnicalAuditEmail } from "@/lib/email/templates/technical-audit-report";
import { auditEmailSchema, auditUrlSchema } from "@/lib/audit/schemas";
import { runAudit } from "@/lib/audit/run";
import { checkRateLimit, getReport, storeReport } from "@/lib/audit/cache";
import type { AuditResult } from "@/lib/audit/types";

// Server actions /outils/audit-technique :
//   - runAuditAction(url) → AuditResult complet (téléchargé en state
//     client pour l'affichage teaser + token mis en cache serveur)
//   - sendFullReportEmail(token, email) → email Brevo avec rapport
//     complet + capture lead

async function getIp(): Promise<string> {
  const hdrs = await headers();
  return hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? hdrs.get("x-real-ip") ?? "unknown";
}

export async function runAuditAction(rawUrl: string): Promise<AuditResult> {
  const parsed = auditUrlSchema.safeParse(rawUrl);
  if (!parsed.success) {
    return {
      ok: false,
      code: "invalid_url",
      message: parsed.error.issues[0]?.message ?? "URL invalide",
    };
  }
  const url = parsed.data;

  const ip = await getIp();
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    logCronEvent({ level: "warn", event: "audit_rate_limited", ip });
    return {
      ok: false,
      code: "rate_limited",
      message: "Trop d'audits récemment. Réessaye dans une heure.",
    };
  }

  const startedAt = Date.now();
  const result = await runAudit(url);
  const durationMs = Date.now() - startedAt;

  if (result.ok) {
    storeReport(result.report.token, result.report);
    logCronEvent({
      event: "audit_completed",
      url,
      durationMs,
      scoreGlobal: result.report.scoreGlobal,
      psiUnavailable: result.report.psiUnavailable,
    });
  } else {
    logCronEvent({
      level: "warn",
      event: "audit_failed",
      url,
      code: result.code,
      durationMs,
    });
  }

  return result;
}

export interface SendReportResult {
  ok: boolean;
  error?: string;
}

export async function sendFullReportEmail(
  rawToken: string,
  rawEmail: string,
): Promise<SendReportResult> {
  const parsed = auditEmailSchema.safeParse({ token: rawToken, email: rawEmail });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Email invalide" };
  }

  const report = getReport(parsed.data.token);
  if (!report) {
    return {
      ok: false,
      error:
        "Le rapport a expiré (cache de 1h). Relance l'audit puis renseigne ton email tout de suite.",
    };
  }

  const rendered = renderTechnicalAuditEmail(report);
  try {
    await sendTransactional({
      to: parsed.data.email,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
    });
    logCronEvent({
      event: "audit_report_sent",
      to: parsed.data.email,
      url: report.url,
      scoreGlobal: report.scoreGlobal,
    });
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logCronEvent({
      level: "error",
      event: "audit_report_email_failed",
      to: parsed.data.email,
      error: message,
    });
    return { ok: false, error: "Erreur d'envoi email — réessaye dans quelques minutes." };
  }
}
