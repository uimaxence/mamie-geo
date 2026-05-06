#!/usr/bin/env tsx
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import Anthropic from "@anthropic-ai/sdk";

// node --env-file n'override pas les vars existantes du shell. En dev, le
// shell de Claude Code injecte un ANTHROPIC_API_KEY vide qui masque la
// vraie valeur du .env.local. On parse donc le fichier manuellement et on
// force l'override.
async function loadEnvLocal(): Promise<void> {
  try {
    const raw = await readFile(".env.local", "utf-8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed
        .slice(eq + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      process.env[key] = value;
    }
  } catch {
    // Pas de .env.local → on s'appuie uniquement sur l'env shell
  }
}

// Enregistre une vraie réponse Anthropic web_search dans une cassette JSON
// utilisable en test. À lancer manuellement quand on veut un nouveau prompt
// de référence ou rafraîchir une cassette devenue obsolète.
//
// Usage :
//   pnpm tsx scripts/record-llm-cassette.ts <name> "<prompt>"
//   ex: pnpm tsx scripts/record-llm-cassette.ts visibility-fr "Quels sont les meilleurs outils SEO francophones en 2026 ?"
//
// Sortie : tests/fixtures/llm/claude/<name>.json
//
// Nécessite ANTHROPIC_API_KEY dans l'env (lu via .env.local en local).

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 2048;
const MAX_WEB_SEARCHES = 5;

async function main() {
  await loadEnvLocal();
  const [, , name, ...promptParts] = process.argv;
  if (!name || promptParts.length === 0) {
    console.error('Usage: tsx scripts/record-llm-cassette.ts <name> "<prompt>"');
    process.exit(1);
  }
  const prompt = promptParts.join(" ");

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY manquant — exporter ou utiliser --env-file=.env.local");
    process.exit(1);
  }

  const sdk = new Anthropic({ apiKey });
  console.log(`📞 Appel Anthropic ${MODEL} avec prompt :`, prompt);

  const startedAt = Date.now();
  const message = await sdk.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system:
      "Réponds en français de manière naturelle et factuelle. Utilise web_search pour appuyer ta réponse sur des sources actuelles et cite-les explicitement.",
    messages: [{ role: "user", content: prompt }],
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: MAX_WEB_SEARCHES,
      },
    ],
  });
  const durationMs = Date.now() - startedAt;

  const outputPath = resolve(`tests/fixtures/llm/claude/${name}.json`);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(message, null, 2) + "\n", "utf-8");

  const searches = message.usage.server_tool_use?.web_search_requests ?? 0;
  console.log(`✅ Cassette enregistrée : ${outputPath}`);
  console.log(
    `   ${message.usage.input_tokens} in / ${message.usage.output_tokens} out / ${searches} web_search`,
  );
  console.log(`   ${durationMs}ms`);
  console.log(`   stop_reason: ${message.stop_reason}`);
}

main().catch((error) => {
  console.error("❌ Échec de l'enregistrement :", error);
  process.exit(1);
});
