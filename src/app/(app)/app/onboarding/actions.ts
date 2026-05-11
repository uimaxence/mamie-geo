"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/client";
import { brands, competitors, prompts, workspaceMembers, workspaces } from "@/db/schema";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { createAnthropicPromptGenerator } from "@/lib/llm/prompt-generator";

// Server action : crée workspace + brand + concurrents + prompts en
// une transaction logique (4 INSERTs séquentiels, idempotents par UUID).
// Si l'utilisateur a déjà un workspace, l'action redirect vers le
// dashboard plutôt que de dupliquer.

const onboardingSchema = z.object({
  workspaceName: z.string().min(1, "Nom workspace requis").max(80),
  brandName: z.string().min(1, "Nom de marque requis").max(80),
  domain: z
    .string()
    .min(3, "Domaine requis")
    .max(120)
    .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i, "Format domaine invalide (ex: monsite.fr)"),
  brandAliases: z.array(z.string().min(1).max(80)).max(10),
  competitors: z
    .array(
      z.object({
        name: z.string().min(1).max(80),
        domain: z.string().max(120).optional(),
      }),
    )
    .min(1, "Au moins 1 concurrent")
    .max(10),
  prompts: z
    .array(z.string().min(5, "Prompt trop court").max(500))
    .min(3, "Au moins 3 prompts")
    .max(25),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export interface OnboardingResult {
  ok: true;
  workspaceId: string;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function submitOnboarding(raw: OnboardingInput): Promise<OnboardingResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non authentifié");

  // Si workspace existant → on bloque l'action (le user devait être
  // redirigé bien avant, mais on garde la garde-fou côté serveur).
  const existing = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, session.user.id))
    .limit(1);
  if (existing[0]) {
    redirect("/app/dashboard");
  }

  const parsed = onboardingSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    throw new Error(firstError?.message ?? "Données invalides");
  }
  const data = parsed.data;

  // 1. Create workspace + membership owner
  const workspaceId = randomUUID();
  const baseSlug = slugify(data.workspaceName);
  // Slug doit être unique global — on suffixe avec premières chars de
  // l'UUID pour garantir l'unicité sans coût d'une boucle de probe.
  const slug = `${baseSlug}-${workspaceId.slice(0, 6)}`;

  await db.insert(workspaces).values({
    id: workspaceId,
    name: data.workspaceName,
    slug,
    plan: "trialing",
  });

  await db.insert(workspaceMembers).values({
    workspaceId,
    userId: session.user.id,
    role: "owner",
  });

  // 2. Create brand
  const brandId = randomUUID();
  await db.insert(brands).values({
    id: brandId,
    workspaceId,
    name: data.brandName,
    domain: data.domain,
    aliases: data.brandAliases,
  });

  // 3. Create competitors
  if (data.competitors.length > 0) {
    await db.insert(competitors).values(
      data.competitors.map((c) => ({
        brandId,
        name: c.name,
        domain: c.domain ?? null,
        aliases: [] as string[],
      })),
    );
  }

  // 4. Create prompts (tous actifs, langue FR par défaut)
  await db.insert(prompts).values(
    data.prompts.map((text) => ({
      brandId,
      text: text.trim(),
      language: "fr",
      isActive: true,
    })),
  );

  return { ok: true, workspaceId };
}

// ─────────────────────────────────────────────────────────────────────
// Server action séparée : suggestion de prompts via Claude Haiku 4.5
// Pas de DB write, pas de side effect — juste un appel LLM.
// ─────────────────────────────────────────────────────────────────────

const suggestSchema = z.object({
  brandName: z.string().min(1).max(80),
  domain: z
    .string()
    .min(3)
    .max(120)
    .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i),
  competitors: z.array(z.string().min(1).max(80)).max(10).default([]),
});

export type SuggestPromptsInput = z.infer<typeof suggestSchema>;

export interface SuggestPromptsResult {
  prompts: string[];
  costUsd: number;
}

export async function suggestPrompts(raw: SuggestPromptsInput): Promise<SuggestPromptsResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non authentifié");

  const parsed = suggestSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    throw new Error(firstError?.message ?? "Données invalides");
  }
  const data = parsed.data;

  if (!env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY manquant — suggestion indisponible");
  }

  const generator = createAnthropicPromptGenerator({ apiKey: env.ANTHROPIC_API_KEY });
  const result = await generator.suggest({
    brandName: data.brandName,
    domain: data.domain,
    language: "fr",
    competitors: data.competitors.length > 0 ? data.competitors : undefined,
    count: 5,
  });

  return { prompts: result.prompts, costUsd: result.costUsd };
}
