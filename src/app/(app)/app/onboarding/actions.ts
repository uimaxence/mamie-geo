"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/client";
import { brands, competitors, prompts, runs, workspaceMembers, workspaces } from "@/db/schema";
import { auth } from "@/lib/auth";
import { logCronEvent } from "@/lib/cron-logger";
import { captureServerEvent } from "@/lib/posthog-server";
import { env } from "@/lib/env";
import {
  createAnthropicPromptGenerator,
  createMistralPromptGenerator,
  type PromptGenerator,
} from "@/lib/llm/prompt-generator";
import { enqueue } from "@/lib/queue";
import { detectSiteProfile, type SiteProfile } from "@/lib/site-profile";
import { normalizeDomainInput, pathFromDomainInput } from "@/lib/utils";

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
  // Profil détecté au scraping (étape 3), optionnel : persisté sur la brand
  // pour la « régénération depuis profil » ultérieure et l'affichage.
  sector: z.string().min(2).max(120).optional(),
  proposition: z.string().min(2).max(400).optional(),
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

// Essai gratuit par défaut : 14 jours sur le plan Solo, sans carte
// (2026-06-16, cf. doc 09). Le compte est utilisable dès l'onboarding ;
// `trialEndsAt` borne l'essai et pilote relances + expiration.
const TRIAL_DAYS = 14;

function trialEndsAtFromNow(): Date {
  return new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
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
  // Slug doit être unique global, on suffixe avec premières chars de
  // l'UUID pour garantir l'unicité sans coût d'une boucle de probe.
  const slug = `${baseSlug}-${workspaceId.slice(0, 6)}`;

  await db.insert(workspaces).values({
    id: workspaceId,
    name: data.workspaceName,
    slug,
    plan: "trialing",
    trialEndsAt: trialEndsAtFromNow(),
  });

  await db.insert(workspaceMembers).values({
    workspaceId,
    userId: session.user.id,
    role: "owner",
  });

  // 2. Create brand. `description` = profil métier détecté au scraping
  //    (proposition + secteur), réutilisé plus tard pour régénérer des
  //    prompts depuis le profil sans re-scraper.
  const brandId = randomUUID();
  const brandDescription =
    [data.proposition?.trim(), data.sector?.trim() && `Secteur : ${data.sector.trim()}`]
      .filter(Boolean)
      .join(" — ") || null;
  await db.insert(brands).values({
    id: brandId,
    workspaceId,
    name: data.brandName,
    domain: data.domain,
    aliases: data.brandAliases,
    description: brandDescription,
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

  // 4. Create prompts (tous actifs, langue FR par défaut), on récupère
  //    les IDs pour pouvoir enqueue un one-shot run sur le premier.
  const createdPrompts = await db
    .insert(prompts)
    .values(
      data.prompts.map((text) => ({
        brandId,
        text: text.trim(),
        language: "fr",
        isActive: true,
      })),
    )
    .returning({ id: prompts.id });

  // 5. One-shot run gratuit post-onboarding, premier wow moment immédiat.
  //    Coût : ~$0,04 par signup (1 prompt × Claude Haiku). Cf. doc 09
  //    § 2026-05-16. Depuis 2026-06-16 les workspaces `trialing` sont
  //    schedulables (essai Solo) : le scheduler weekly prend ensuite le
  //    relais. Ce one-shot reste utile pour ne pas attendre le lundi.
  const firstPrompt = createdPrompts[0];
  if (firstPrompt) {
    const runId = randomUUID();
    const enqueued = await enqueue({
      kind: "execute_prompt",
      payload: { promptId: firstPrompt.id, llm: "claude", runId },
    });
    if (enqueued) {
      await db.insert(runs).values({
        id: runId,
        promptId: firstPrompt.id,
        llm: "claude",
        status: "pending",
        scheduledAt: new Date(),
      });
      logCronEvent({
        event: "onboarding_oneshot_enqueued",
        workspaceId,
        promptId: firstPrompt.id,
        runId,
      });
    }
  }

  // Mesure du funnel : workspace effectivement créé en base (source de
  // vérité serveur, distincte de `onboarding_completed` tiré côté client).
  await captureServerEvent({
    event: "workspace_created",
    distinctId: session.user.id,
    ctx: { workspaceId, plan: "trialing" },
    properties: {
      source: "full",
      prompts_count: data.prompts.length,
      competitors_count: data.competitors.length,
    },
  });

  return { ok: true, workspaceId };
}

// ─────────────────────────────────────────────────────────────────────
// Quick setup, workspace + brand minimal, pas de competitors/prompts.
// Utilisé par le bouton "Configurer plus tard" du wizard pour les user
// qui veulent aller directement à /app/settings#billing (ex: payer).
// Pas de one-shot run (pas de prompt à exécuter).
// ─────────────────────────────────────────────────────────────────────

const quickSetupSchema = z.object({
  workspaceName: z.string().min(1).max(80),
  brandName: z.string().min(1).max(80),
  domain: z
    .string()
    .min(3)
    .max(120)
    .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i, "Format domaine invalide"),
});

export type QuickSetupInput = z.infer<typeof quickSetupSchema>;

export async function quickSetup(raw: QuickSetupInput): Promise<OnboardingResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non authentifié");

  const existing = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, session.user.id))
    .limit(1);
  if (existing[0]) {
    redirect("/app/dashboard");
  }

  const parsed = quickSetupSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
  }
  const data = parsed.data;

  const workspaceId = randomUUID();
  const slug = `${slugify(data.workspaceName)}-${workspaceId.slice(0, 6)}`;

  await db.insert(workspaces).values({
    id: workspaceId,
    name: data.workspaceName,
    slug,
    plan: "trialing",
    trialEndsAt: trialEndsAtFromNow(),
  });

  await db.insert(workspaceMembers).values({
    workspaceId,
    userId: session.user.id,
    role: "owner",
  });

  const brandId = randomUUID();
  await db.insert(brands).values({
    id: brandId,
    workspaceId,
    name: data.brandName,
    domain: data.domain,
    aliases: [],
  });

  logCronEvent({
    event: "onboarding_quick_setup",
    workspaceId,
    userId: session.user.id,
  });

  await captureServerEvent({
    event: "workspace_created",
    distinctId: session.user.id,
    ctx: { workspaceId, plan: "trialing" },
    properties: { source: "quick", prompts_count: 0, competitors_count: 0 },
  });

  return { ok: true, workspaceId };
}

// ─────────────────────────────────────────────────────────────────────
// Server action séparée : suggestion de prompts via Claude Haiku 4.5
// Pas de DB write, pas de side effect, juste un appel LLM.
// ─────────────────────────────────────────────────────────────────────

const suggestSchema = z.object({
  brandName: z.string().min(1).max(80),
  domain: z
    .string()
    .min(3)
    .max(120)
    .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i),
  // Contexte métier (scraping onboarding) — sans lui, les suggestions sont
  // hors-sujet (cf. doc 09 § 2026-06-16).
  sector: z.string().min(2).max(120).optional(),
  proposition: z.string().min(2).max(400).optional(),
  competitors: z.array(z.string().min(1).max(80)).max(10).default([]),
  aliases: z.array(z.string().min(1).max(80)).max(10).default([]),
  existingPrompts: z.array(z.string().min(1).max(500)).max(50).default([]),
});

export type SuggestPromptsInput = z.input<typeof suggestSchema>;

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

  // Bascule 2026-06-09 (cf. doc 09) : Mistral Small 3 par défaut (EU,
  // ~5× moins cher que Haiku sur ce use case JSON-only), fallback Haiku
  // si la clé Mistral n'est pas configurée. Le scoring reste sur Haiku
  // (besoin de fidélité tool_use stricte) — c'est uniquement le générateur
  // de prompts qui bascule.
  const generator: PromptGenerator = env.MISTRAL_API_KEY
    ? createMistralPromptGenerator({ apiKey: env.MISTRAL_API_KEY })
    : env.ANTHROPIC_API_KEY
      ? createAnthropicPromptGenerator({ apiKey: env.ANTHROPIC_API_KEY })
      : (() => {
          throw new Error(
            "Aucun provider LLM configuré pour la suggestion (MISTRAL_API_KEY ou ANTHROPIC_API_KEY requis)",
          );
        })();

  const result = await generator.suggest({
    brandName: data.brandName,
    domain: data.domain,
    language: "fr",
    sector: data.sector,
    proposition: data.proposition,
    competitors: data.competitors.length > 0 ? data.competitors : undefined,
    aliases: data.aliases.length > 0 ? data.aliases : undefined,
    existingPrompts: data.existingPrompts.length > 0 ? data.existingPrompts : undefined,
    count: 5,
  });

  return { prompts: result.prompts, costUsd: result.costUsd };
}

// ─────────────────────────────────────────────────────────────────────
// Détection du profil métier depuis le site (onboarding, étape 3).
// Scrape la home + 2 pages internes (à propos / produit) puis 1 appel
// Mistral pour déduire marque + secteur + zone + proposition. Le wizard
// l'appelle au moment de suggérer les prompts pour ancrer la génération
// dans la vraie activité (sans ça : prompts hors-sujet, cf. doc 09
// § 2026-06-16). Réutilise exactement le moteur des scans publics.
// ─────────────────────────────────────────────────────────────────────

export type OnboardingProfile = SiteProfile;

export async function detectOnboardingProfile(
  rawDomain: string,
): Promise<OnboardingProfile | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non authentifié");

  const domain = normalizeDomainInput(typeof rawDomain === "string" ? rawDomain : "");
  if (!domain || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) return null;
  if (!env.MISTRAL_API_KEY) return null;

  const pagePath = pathFromDomainInput(rawDomain) || undefined;
  const profile = await detectSiteProfile({
    domain,
    pagePath,
    apiKey: env.MISTRAL_API_KEY,
    extraPages: 2,
  });
  logCronEvent({
    event: profile ? "onboarding_profile_detected" : "onboarding_profile_failed",
    userId: session.user.id,
    domain,
    ...(profile ? { sector: profile.sector, hasZone: Boolean(profile.zone) } : {}),
  });
  return profile;
}
