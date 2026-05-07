#!/usr/bin/env tsx
import { readFile } from "node:fs/promises";

// Smoke test SMTP : envoie un magic-link de test avec les credentials
// Brevo de .env.local. Permet d'isoler "le SMTP marche-t-il ?" du
// reste de la chaîne login.
//
// Usage : pnpm test:smtp <destinataire@example.com>

async function loadEnvLocal(): Promise<void> {
  try {
    const raw = await readFile(".env.local", "utf-8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed
        .slice(eqIdx + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      process.env[key] = value;
    }
  } catch {
    /* no .env.local */
  }
}

async function main() {
  await loadEnvLocal();
  const to = process.argv[2];
  if (!to) {
    console.error("Usage : pnpm test:smtp <destinataire@example.com>");
    process.exit(1);
  }

  console.log(
    `📤 Envoi via Brevo SMTP (host=${process.env.BREVO_SMTP_HOST}, port=${process.env.BREVO_SMTP_PORT}, from=${process.env.BREVO_SMTP_FROM})…`,
  );

  const { sendMagicLinkEmail } = await import("@/lib/email");
  await sendMagicLinkEmail({
    to,
    url: "https://mamie-geo.fr/__test_smtp_fake_url__",
  });
  console.log(`✅ Mail envoyé à ${to}`);
}

main().catch((error) => {
  console.error("❌ SMTP test échoué :", error);
  process.exit(1);
});
