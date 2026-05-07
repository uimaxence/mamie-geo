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
