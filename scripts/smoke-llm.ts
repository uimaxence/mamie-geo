#!/usr/bin/env tsx
import { readFile } from "node:fs/promises";

// Smoke test live d'un provider LLM contre sa vraie API. À lancer
// manuellement après avoir ajouté la clé API correspondante dans
// .env.local, et avant de merger un PR provider.
//
// Usage :
//   pnpm tsx scripts/smoke-llm.ts <provider> ["<prompt optionnel>"]
//   pnpm tsx scripts/smoke-llm.ts lechat
//   pnpm tsx scripts/smoke-llm.ts chatgpt "Quels CRM PME français en 2026 ?"
//
// Providers supportés : claude, lechat, chatgpt, perplexity, gemini.
// Si pas de prompt fourni, utilise un prompt de référence FR.

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

const DEFAULT_PROMPT = "Quels sont les meilleurs outils SEO francophones en 2026 ?";

const PROVIDERS = ["claude", "lechat", "chatgpt", "perplexity", "gemini"] as const;
type Provider = (typeof PROVIDERS)[number];

function isProvider(v: string): v is Provider {
  return (PROVIDERS as readonly string[]).includes(v);
}

async function main() {
  await loadEnvLocal();

  const [, , providerArg, ...promptParts] = process.argv;
  if (!providerArg) {
    console.error("Usage: pnpm tsx scripts/smoke-llm.ts <provider> [prompt]");
    console.error(`Providers: ${PROVIDERS.join(", ")}`);
    process.exit(1);
  }
  if (!isProvider(providerArg)) {
    console.error(`Provider invalide: ${providerArg}. Attendu: ${PROVIDERS.join(", ")}`);
    process.exit(1);
  }

  const prompt = promptParts.length > 0 ? promptParts.join(" ") : DEFAULT_PROMPT;

  // Import dynamique pour que loadEnvLocal soit appliqué avant que `env`
  // soit validé par Zod (sinon les clés seraient lues vides).
  const { getLLMClient } = await import("../src/lib/llm");
  const client = getLLMClient(providerArg);

  console.log(`\n── Smoke test ${providerArg.toUpperCase()} ──`);
  console.log(`Prompt: ${prompt}`);
  console.log(`Modèle attendu: ${client.llm}`);

  const startedAt = Date.now();
  const response = await client.execute({ prompt, language: "fr" });
  const totalMs = Date.now() - startedAt;

  console.log(`\n── Réponse ──`);
  console.log(response.text.slice(0, 600));
  if (response.text.length > 600) console.log(`  … (+${response.text.length - 600} chars)`);

  console.log(`\n── Sources (${response.sources.length}) ──`);
  for (const src of response.sources.slice(0, 5)) {
    console.log(`  • ${src.title}`);
    console.log(`    ${src.url}${src.pageAge ? ` · ${src.pageAge}` : ""}`);
  }
  if (response.sources.length > 5) {
    console.log(`  … (+${response.sources.length - 5} sources)`);
  }

  console.log(`\n── Métriques ──`);
  console.log(`  Modèle:        ${response.model}`);
  console.log(`  Input tokens:  ${response.usage.inputTokens}`);
  console.log(`  Output tokens: ${response.usage.outputTokens}`);
  console.log(`  Web searches:  ${response.usage.webSearchRequests}`);
  console.log(`  Coût USD:      $${response.costUsd.toFixed(4)}`);
  console.log(`  Durée API:     ${response.durationMs}ms`);
  console.log(`  Durée totale:  ${totalMs}ms`);
}

main().catch((e) => {
  console.error("\n✗ Erreur:");
  console.error(e);
  process.exit(1);
});
