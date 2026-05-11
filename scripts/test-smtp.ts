#!/usr/bin/env tsx
import { readFile } from "node:fs/promises";
import { createTransport } from "nodemailer";

// Smoke test SMTP en mode DEBUG VERBOSE.
//
// Différence avec l'usage normal de src/lib/email.ts : on construit
// ici un transporter local avec `logger: true, debug: true` qui dump
// tout le dialogue SMTP brut côté console — utile pour comprendre
// exactement pourquoi Brevo refuse une auth (535 fini avec un message
// d'erreur précis qu'on ne voit pas en mode silencieux).
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

  const host = process.env.BREVO_SMTP_HOST;
  const port = Number(process.env.BREVO_SMTP_PORT);
  const user = process.env.BREVO_SMTP_USER;
  const pass = process.env.BREVO_SMTP_PASSWORD;
  const from = process.env.BREVO_SMTP_FROM;

  // ── Dump credentials pour debug (sans révéler la clé en clair) ────
  console.log("\n📋 Credentials chargés depuis .env.local :");
  console.log(`   HOST     : "${host}"`);
  console.log(`   PORT     : ${port}`);
  console.log(
    `   USER     : "${user}" (${user?.length ?? 0} chars)`,
  );
  console.log(
    `   PASSWORD : "${pass?.slice(0, 12)}...${pass?.slice(-5)}" (${pass?.length ?? 0} chars)`,
  );
  // Détecter caractères invisibles (espaces, retours ligne, ZWSP, BOM, etc.)
  if (pass) {
    const invisibles = /[\s​-‏﻿]/g;
    const matches = pass.match(invisibles);
    if (matches && matches.length > 0) {
      console.log(
        `   ⚠️  PASSWORD contient ${matches.length} caractère(s) invisible(s) (espace/RC/ZWSP/BOM) — probable cause du 535`,
      );
    }
    if (!pass.startsWith("xsmtpsib-")) {
      console.log(
        `   ⚠️  PASSWORD ne commence pas par 'xsmtpsib-' (préfixe attendu pour une clé SMTP Brevo)`,
      );
    }
  }
  console.log(`   FROM     : "${from}"\n`);

  if (!host || !port || !user || !pass || !from) {
    console.error("❌ Certaines vars Brevo manquent dans .env.local");
    process.exit(1);
  }

  // ── Transporter avec debug verbeux ─────────────────────────────────
  const transporter = createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    logger: true, // pipe les logs nodemailer vers console
    debug: true, // logue chaque octet du dialogue SMTP
  });

  console.log("─".repeat(70));
  console.log("🔌 Connexion SMTP en cours (dialogue brut ci-dessous) :");
  console.log("─".repeat(70));

  try {
    // verify() teste juste la connexion + auth sans envoyer de mail
    await transporter.verify();
    console.log("\n─".repeat(70));
    console.log("✅ Auth SMTP OK. Envoi du mail de test maintenant…\n");

    const info = await transporter.sendMail({
      from,
      to,
      subject: "Test SMTP Mamie GEO",
      text: "Test envoi via Brevo SMTP. Si tu reçois ça, c'est que la config marche.",
    });

    console.log(`\n✅ Mail envoyé à ${to}`);
    console.log(`   messageId : ${info.messageId}`);
    console.log(`   response  : ${info.response}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ Test échoué : ${message}`);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Erreur fatale :", error);
  process.exit(1);
});
