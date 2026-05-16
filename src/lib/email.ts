import { createTransport } from "nodemailer";
import { env } from "@/lib/env";

// Envoi d'emails transactionnels via Brevo. Deux backends supportés,
// switch automatique selon les vars d'env présentes :
//
//   1. REST API (recommandé) — BREVO_API_KEY + BREVO_FROM_EMAIL
//      Avantage : pas d'IP whitelist (le plan Free Brevo bloque les
//      SMTP sur IPs non whitelistées, et Vercel n'a pas d'IPs fixes).
//      Doc : https://developers.brevo.com/reference/sendtransacemail
//      Clé : https://app.brevo.com/settings/keys/api (préfixe xkeysib-)
//
//   2. SMTP (legacy) — BREVO_SMTP_HOST/PORT/USER/PASSWORD/FROM
//      Marche si IP whitelistée explicitement. Plus simple à debugger
//      (script `pnpm test:smtp` avec mode verbose).
//
// La sélection est faite à chaque appel via `pickBackend()` plutôt
// qu'au module-load, pour rester tolérant aux placeholders pendant
// la build Next.js.

type Backend = "rest" | "smtp";

function pickBackend(): Backend {
  return env.BREVO_API_KEY ? "rest" : "smtp";
}

// ─────────────────────────────────────────────────────────────────────
// REST API backend
// ─────────────────────────────────────────────────────────────────────

const BREVO_API_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

interface RestSendOptions {
  to: { email: string; name?: string }[];
  subject: string;
  textContent?: string;
  htmlContent?: string;
  replyTo?: { email: string; name?: string };
}

async function sendViaRest(options: RestSendOptions): Promise<{ messageId: string }> {
  if (!env.BREVO_API_KEY || !env.BREVO_FROM_EMAIL) {
    throw new Error("BREVO_API_KEY ou BREVO_FROM_EMAIL manquant pour backend REST");
  }
  const body = {
    sender: { name: env.BREVO_FROM_NAME ?? "Mamie GEO", email: env.BREVO_FROM_EMAIL },
    to: options.to,
    subject: options.subject,
    textContent: options.textContent,
    htmlContent: options.htmlContent,
    replyTo: options.replyTo,
  };
  const response = await fetch(BREVO_API_ENDPOINT, {
    method: "POST",
    headers: {
      "api-key": env.BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const json = (await response.json()) as { code?: string; message?: string };
      if (json.message) detail = `${json.code ?? "error"}: ${json.message}`;
    } catch {
      const text = await response.text();
      if (text) detail = `${detail} — ${text.slice(0, 200)}`;
    }
    throw new Error(`Brevo REST → ${detail}`);
  }
  const json = (await response.json()) as { messageId: string };
  return { messageId: json.messageId };
}

// ─────────────────────────────────────────────────────────────────────
// SMTP backend (legacy)
// ─────────────────────────────────────────────────────────────────────

interface SmtpSendOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

let smtpTransporter: ReturnType<typeof createTransport> | null = null;

function getSmtpTransporter() {
  if (smtpTransporter) return smtpTransporter;
  if (!env.BREVO_SMTP_HOST || !env.BREVO_SMTP_USER || !env.BREVO_SMTP_PASSWORD) {
    throw new Error("Credentials SMTP Brevo manquants");
  }
  smtpTransporter = createTransport({
    host: env.BREVO_SMTP_HOST,
    port: env.BREVO_SMTP_PORT,
    secure: env.BREVO_SMTP_PORT === 465,
    auth: { user: env.BREVO_SMTP_USER, pass: env.BREVO_SMTP_PASSWORD },
  });
  return smtpTransporter;
}

async function sendViaSmtp(options: SmtpSendOptions): Promise<{ messageId: string }> {
  if (!env.BREVO_SMTP_FROM) throw new Error("BREVO_SMTP_FROM manquant");
  const info = await getSmtpTransporter().sendMail({
    from: env.BREVO_SMTP_FROM,
    to: options.to,
    replyTo: options.replyTo,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
  return { messageId: info.messageId };
}

// ─────────────────────────────────────────────────────────────────────
// Helper générique (utilisé par les wrappers thématiques ci-dessous).
// Évite la duplication du switch backend dans chaque sendXxx().
// ─────────────────────────────────────────────────────────────────────

export interface SendTransactionalOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

export async function sendTransactional(
  options: SendTransactionalOptions,
): Promise<{ messageId: string; backend: Backend }> {
  const backend = pickBackend();
  const result =
    backend === "rest"
      ? await sendViaRest({
          to: [{ email: options.to }],
          subject: options.subject,
          textContent: options.text,
          htmlContent: options.html,
          replyTo: options.replyTo ? { email: options.replyTo } : undefined,
        })
      : await sendViaSmtp({
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html,
          replyTo: options.replyTo,
        });
  return { messageId: result.messageId, backend };
}

// ─────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────

export async function sendMagicLinkEmail(params: { to: string; url: string }) {
  const { to, url } = params;
  const backend = pickBackend();
  const subject = "Ton lien de connexion Mamie GEO";
  const text = `Bonjour,

Voici ton lien de connexion (valable 10 minutes) :

${url}

Si tu utilises ton téléphone : le lien s'ouvrira dans ton navigateur, pas dans l'app email. Pas d'inquiétude, ta session sera active partout.

Tu n'as pas demandé ce lien ? Ignore cet email, il ne se passera rien.

— L'équipe Mamie GEO`;
  // HTML inline branded — gradient halo terracotta/blue, logo Mamie,
  // CTA bouton noir, instructions mobile-friendly + fallback support.
  const html = `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:24px;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;color:#191919;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e6e6e6;">
      <tr><td style="padding:32px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
          <span style="display:inline-flex;width:32px;height:32px;border-radius:10px;background:#329cff;color:#fff;align-items:center;justify-content:center;font-size:20px;font-weight:700;">M</span>
          <span style="font-size:17px;font-weight:600;letter-spacing:-0.01em;">Mamie GEO</span>
        </div>

        <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;letter-spacing:-0.01em;">Voici ton lien de connexion</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#404040;">Il est valable <strong>10 minutes</strong>. Clique simplement dessous, on s'occupe du reste.</p>

        <p style="margin:24px 0;">
          <a href="${url}" style="display:inline-block;background:#191919;color:#fff;text-decoration:none;padding:14px 24px;border-radius:10px;font-weight:500;font-size:15px;">Me connecter →</a>
        </p>

        <p style="margin:24px 0 0;font-size:13px;color:#737373;line-height:1.6;">Ou copie-colle cette URL dans ton navigateur :<br /><a href="${url}" style="color:#329cff;word-break:break-all;font-size:12px;">${url}</a></p>

        <div style="margin:32px 0 0;padding:16px;background:linear-gradient(135deg,rgba(197,83,46,0.06) 0%,rgba(50,156,255,0.06) 100%);border-radius:10px;">
          <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#191919;">📱 Sur ton téléphone&nbsp;?</p>
          <p style="margin:0;font-size:13px;line-height:1.55;color:#525252;">Le lien s'ouvrira dans ton navigateur, pas dans l'app email. Pas besoin de revenir manuellement à la page de login — ta session sera active partout.</p>
        </div>

        <p style="margin:32px 0 0;padding-top:20px;border-top:1px solid #efefef;font-size:12px;color:#737373;line-height:1.55;">
          Tu n'as pas demandé ce lien&nbsp;? Ignore cet email, il ne se passera rien.<br />
          Problème ? Écris-nous à <a href="mailto:hello@mamie-geo.fr" style="color:#737373;">hello@mamie-geo.fr</a>.
        </p>
      </td></tr>
    </table>
  </body>
</html>`;

  try {
    const result =
      backend === "rest"
        ? await sendViaRest({ to: [{ email: to }], subject, textContent: text, htmlContent: html })
        : await sendViaSmtp({ to, subject, text, html });
    console.info(
      `[email] magic-link envoyé à ${to} via Brevo ${backend.toUpperCase()} (messageId=${result.messageId})`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      `[email] échec envoi magic-link à ${to} via Brevo ${backend.toUpperCase()} : ${message}`,
    );
    if (error instanceof Error && error.stack) console.error(error.stack);
    throw new Error(`Envoi magic-link échoué : ${message}`);
  }
}

export async function sendWeeklyRecapEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ messageId: string }> {
  const { to, subject, html, text } = params;
  try {
    const result = await sendTransactional({ to, subject, html, text });
    console.info(
      `[email] weekly-recap envoyé à ${to} via Brevo ${result.backend.toUpperCase()} (messageId=${result.messageId})`,
    );
    return { messageId: result.messageId };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[email] échec envoi weekly-recap à ${to} : ${message}`);
    if (error instanceof Error && error.stack) console.error(error.stack);
    throw new Error(`Envoi weekly-recap échoué : ${message}`);
  }
}

export async function sendAuditRequestEmails(params: {
  prospectEmail: string;
  domain: string;
  brandName: string;
  notes?: string;
}) {
  const { prospectEmail, domain, brandName, notes } = params;
  const backend = pickBackend();
  const internalSubject = `[Audit gratuit] ${brandName} (${domain})`;
  const internalText = `Demande d'audit gratuit depuis /outils/test-visibilite-ia

Prospect : ${prospectEmail}
Marque   : ${brandName}
Domaine  : ${domain}
${notes ? `\nNotes du prospect :\n${notes}\n` : ""}
À traiter sous 24h ouvrées. Envoyer le rapport directement à ${prospectEmail}.`;
  const replySubject = "On a bien reçu ta demande d'audit Mamie GEO";
  const replyText = `Salut,

Merci pour ta demande d'audit gratuit de visibilité IA pour ${brandName} (${domain}).

On te prépare un rapport personnalisé qui couvre :
- Ta visibilité sur ChatGPT, Claude, Perplexity, Gemini et Le Chat
- Les 5 prompts critiques sur lesquels mesurer
- Tes 3 concurrents directs et leur score
- Les 3 actions concrètes pour améliorer ton score

Tu recevras le rapport sous 24h ouvrées dans cette boîte.

À très vite,
— Max, Mamie GEO

PS : si tu veux gagner du temps, tu peux aussi créer un compte directement (7 jours d'essai sans carte) : https://mamie-geo.fr/login`;

  try {
    if (backend === "rest") {
      await sendViaRest({
        to: [{ email: "hello@mamie-geo.fr" }],
        replyTo: { email: prospectEmail },
        subject: internalSubject,
        textContent: internalText,
      });
      await sendViaRest({
        to: [{ email: prospectEmail }],
        subject: replySubject,
        textContent: replyText,
      });
    } else {
      await sendViaSmtp({
        to: "hello@mamie-geo.fr",
        replyTo: prospectEmail,
        subject: internalSubject,
        text: internalText,
      });
      await sendViaSmtp({
        to: prospectEmail,
        subject: replySubject,
        text: replyText,
      });
    }
    console.info(
      `[email] audit request envoyé pour ${brandName} (${domain}) → ${prospectEmail} via ${backend.toUpperCase()}`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[email] échec envoi audit request pour ${prospectEmail} : ${message}`);
    if (error instanceof Error && error.stack) console.error(error.stack);
    throw new Error(`Envoi demande d'audit échoué : ${message}`);
  }
}
