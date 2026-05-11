import { createTransport } from "nodemailer";
import { env } from "@/lib/env";

// Transport SMTP Brevo — un seul transport partagé pour magic-link et
// emails transactionnels (welcome, alertes quota, etc.).
// cf. geo-project/09-decisions-journal.md (session 2 — réponse 5)
const transporter = createTransport({
  host: env.BREVO_SMTP_HOST,
  port: env.BREVO_SMTP_PORT,
  secure: env.BREVO_SMTP_PORT === 465,
  auth: {
    user: env.BREVO_SMTP_USER,
    pass: env.BREVO_SMTP_PASSWORD,
  },
});

// Envoie 2 emails pour une demande d'audit gratuit depuis le lead
// magnet /outils/test-visibilite-ia : un email interne à
// hello@mamie-geo.fr avec le contexte, et un auto-reply au prospect
// confirmant la réception. cf. PR 10c.
export async function sendAuditRequestEmails(params: {
  prospectEmail: string;
  domain: string;
  brandName: string;
  notes?: string;
}) {
  const { prospectEmail, domain, brandName, notes } = params;
  try {
    // 1. Email interne (à hello@mamie-geo.fr)
    await transporter.sendMail({
      from: env.BREVO_SMTP_FROM,
      to: "hello@mamie-geo.fr",
      replyTo: prospectEmail,
      subject: `[Audit gratuit] ${brandName} (${domain})`,
      text: `Demande d'audit gratuit depuis /outils/test-visibilite-ia

Prospect : ${prospectEmail}
Marque   : ${brandName}
Domaine  : ${domain}
${notes ? `\nNotes du prospect :\n${notes}\n` : ""}
À traiter sous 24h ouvrées. Envoyer le rapport directement à ${prospectEmail}.`,
    });

    // 2. Auto-reply au prospect
    await transporter.sendMail({
      from: env.BREVO_SMTP_FROM,
      to: prospectEmail,
      subject: "On a bien reçu ta demande d'audit Mamie GEO",
      text: `Salut,

Merci pour ta demande d'audit gratuit de visibilité IA pour ${brandName} (${domain}).

On te prépare un rapport personnalisé qui couvre :
- Ta visibilité sur ChatGPT, Claude, Perplexity, Gemini et Le Chat
- Les 5 prompts critiques sur lesquels mesurer
- Tes 3 concurrents directs et leur score
- Les 3 actions concrètes pour améliorer ton score

Tu recevras le rapport sous 24h ouvrées dans cette boîte.

À très vite,
— Max, Mamie GEO

PS : si tu veux gagner du temps, tu peux aussi créer un compte directement (14 jours d'essai sans carte) : https://mamie-geo.fr/login`,
    });

    console.info(`[email] audit request envoyé pour ${brandName} (${domain}) → ${prospectEmail}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[email] échec envoi audit request pour ${prospectEmail} : ${message}`);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    throw new Error(`Envoi demande d'audit échoué : ${message}`);
  }
}

export async function sendMagicLinkEmail(params: { to: string; url: string }) {
  const { to, url } = params;
  try {
    const info = await transporter.sendMail({
      from: env.BREVO_SMTP_FROM,
      to,
      subject: "Ton lien de connexion Mamie GEO",
      text: `Salut,\n\nVoici ton lien de connexion (valable 10 minutes) :\n\n${url}\n\nSi tu n'as pas demandé ce lien, ignore cet email.\n\n— Mamie GEO`,
      html: `
      <p>Salut,</p>
      <p>Voici ton lien de connexion (valable 10 minutes) :</p>
      <p><a href="${url}">${url}</a></p>
      <p style="color:#8c8579;font-size:12px;">Si tu n'as pas demandé ce lien, ignore cet email.</p>
      <p>— Mamie GEO</p>
    `,
    });
    console.info(
      `[email] magic-link envoyé à ${to} via Brevo (messageId=${info.messageId}, response=${info.response})`,
    );
  } catch (error) {
    // Logger explicitement avant de re-throw — sinon Better Auth swallow
    // l'erreur et le client reste bloqué sur "sending". L'erreur typique
    // Brevo : "554 5.7.1 Unable to send email — sender not allowed" si le
    // BREVO_SMTP_FROM n'est pas un sender validé (DKIM + clic confirmation).
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[email] échec envoi magic-link à ${to} via Brevo : ${message}`);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    throw new Error(`Envoi magic-link échoué : ${message}`);
  }
}
