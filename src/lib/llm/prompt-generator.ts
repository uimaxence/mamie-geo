import Anthropic from "@anthropic-ai/sdk";
import type { Tool, ToolUseBlock } from "@anthropic-ai/sdk/resources/messages/messages";
import { ANTHROPIC_PRICING, MISTRAL_PRICING, computeCost } from "./pricing";

// Génère N prompts pertinents pour une marque donnée — utilisé par
// l'onboarding wizard (étape 3) pour offrir un "Suggérer 5 prompts via
// IA" qui remplace la saisie manuelle.
//
// Deux backends supportés :
//   1. Anthropic Claude Haiku 4.5 (legacy, fallback) — tool_use forcé.
//      Coût ~$0.003-0.008 par appel.
//   2. Mistral Small 3 (par défaut, EU, 2026-06-09) — function calling
//      OpenAI-compatible sur le même schema. Coût ~5× moins cher
//      (~$0.001 par appel), bonne fidélité au schema sur ce use case
//      simple (array de strings). Choisi car notre USP est EU/RGPD et
//      Mistral est déjà un provider configuré (clé partagée).
//
// Pattern : la mémoire user `feedback_aux_llm_cost.md` actait la bascule
// dès qu'un second provider land. C'est le cas depuis Phase C.

const DEFAULT_MODEL = "claude-haiku-4-5-20251001";
const DEFAULT_MAX_TOKENS = 1024;

export interface PromptSuggestionInput {
  brandName: string;
  domain: string;
  language: "fr" | "en";
  // Concurrents optionnels — si fournis, on instruit Haiku de générer
  // des prompts où la marque ET les concurrents sont plausibles dans la
  // réponse. Sinon, prompts plus génériques sur la catégorie.
  competitors?: readonly string[];
  // Aliases marque (ex: "Mamie GEO" + "MamieGEO" + "mamie-geo") — utilisés
  // par Haiku comme contexte enrichi sur les variations de nommage.
  aliases?: readonly string[];
  // Prompts déjà trackés — passés à Haiku pour qu'il ÉVITE les doublons
  // et génère des questions complémentaires. Permet une vraie « régénération
  // depuis profil » plutôt qu'une suggestion isolée.
  existingPrompts?: readonly string[];
  // Nombre de prompts à générer (default 5, max 10)
  count?: number;
}

export interface PromptSuggestionResult {
  prompts: string[];
  // Métadonnées pour audit + facturation
  costUsd: number;
  durationMs: number;
  model: string;
}

export interface PromptGeneratorOptions {
  apiKey: string;
  // Override fetch pour les tests
  fetch?: typeof fetch;
  model?: string;
  maxTokens?: number;
}

export interface PromptGenerator {
  suggest(input: PromptSuggestionInput): Promise<PromptSuggestionResult>;
}

const SUGGEST_TOOL: Tool = {
  name: "report_prompts",
  description:
    "Rapporte la liste de prompts générés. Le champ `prompts` doit contenir entre 3 et 10 questions naturelles, telles qu'un prospect réel les poserait à un LLM grand public.",
  input_schema: {
    type: "object",
    properties: {
      prompts: {
        type: "array",
        items: { type: "string", minLength: 8, maxLength: 280 },
        minItems: 3,
        maxItems: 10,
        description:
          "Liste de questions concrètes que les prospects de la marque cible posent (ou pourraient poser) à ChatGPT, Claude, Le Chat etc.",
      },
    },
    required: ["prompts"],
  },
};

export function createAnthropicPromptGenerator(options: PromptGeneratorOptions): PromptGenerator {
  const model = options.model ?? DEFAULT_MODEL;
  const maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;
  const pricing = ANTHROPIC_PRICING[model];
  if (!pricing) {
    throw new Error(`Tarif inconnu pour le modèle prompt-generator ${model}`);
  }

  const sdk = new Anthropic({ apiKey: options.apiKey, fetch: options.fetch });

  return {
    async suggest(input: PromptSuggestionInput): Promise<PromptSuggestionResult> {
      const count = Math.min(Math.max(input.count ?? 5, 3), 10);
      const startedAt = Date.now();

      const message = await sdk.messages.create({
        model,
        max_tokens: maxTokens,
        system: buildSystemPrompt(input.language, count),
        tools: [SUGGEST_TOOL],
        tool_choice: { type: "tool", name: SUGGEST_TOOL.name },
        messages: [
          {
            role: "user",
            content: buildUserPrompt(input, count),
          },
        ],
      });
      const durationMs = Date.now() - startedAt;

      const toolUse = message.content.find(
        (block): block is ToolUseBlock =>
          block.type === "tool_use" && block.name === SUGGEST_TOOL.name,
      );
      if (!toolUse) {
        throw new Error(
          `Génération prompts : pas de tool_use ${SUGGEST_TOOL.name} (stop_reason=${message.stop_reason})`,
        );
      }

      const parsed = parseToolInput(toolUse.input, count);
      const costUsd = computeCost(pricing, {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
        webSearchRequests: 0,
      });

      return {
        prompts: parsed,
        costUsd,
        durationMs,
        model: message.model,
      };
    },
  };
}

function buildSystemPrompt(language: "fr" | "en", count: number): string {
  // Stratégie Generative Engine Optimization : on a besoin de DEUX types
  // de prompts pour bien mesurer une marque dans les LLMs (cf. doc 09
  // § 2026-06-09 — branded + non-branded mix).
  //
  // 1. NON-BRANDED (majoritaires, ~70%) — questions sur la catégorie /
  //    le besoin / le cas d'usage SANS jamais nommer la marque. Mesurent
  //    l'émergence naturelle (la marque apparaît-elle dans la réponse
  //    quand le prospect ne la connaît pas encore ?).
  // 2. BRANDED (minoritaires, ~30%) — questions qui NOMMENT la marque
  //    directement (ou la comparent à un concurrent nommé). Mesurent le
  //    sentiment et le positionnement quand on est dans une conversation
  //    ciblée sur la marque.
  //
  // Sans branded, on rate le sentiment. Sans non-branded, on rate la
  // découvrabilité. Le mix est non négociable.
  const ratio = ratioForCount(count);

  if (language === "fr") {
    return [
      "Tu génères des questions que de vrais prospects posent aux LLMs grand public",
      "(ChatGPT, Claude, Perplexity, Gemini, Le Chat) sur le secteur de la marque cible.",
      `Tu DOIS appeler l'outil \`report_prompts\` avec EXACTEMENT ${count} questions.`,
      "",
      "RÉPARTITION OBLIGATOIRE :",
      `- ${ratio.nonBranded} questions NON-BRANDED : couvrent le besoin / la catégorie / le cas d'usage SANS jamais nommer la marque cible ni un alias. But : mesurer si la marque émerge naturellement dans la réponse du LLM.`,
      `- ${ratio.branded} question${ratio.branded > 1 ? "s" : ""} BRANDED : nomme(nt) explicitement la marque cible (ex. « Que vaut <Marque> pour … ? », « <Marque> vs <Concurrent> ? », « Comment fonctionne <Marque> ? »). But : mesurer le sentiment et la position quand la marque est dans le contexte.`,
      "",
      "Toutes doivent être : naturelles (pas de jargon marketing), concrètes (contexte d'usage clair), variées (différents moments du parcours d'achat), formulées du point de vue du prospect (« quel », « comment », « pour qui », « combien »).",
      "Évite les questions trop génériques (« qu'est-ce que X »).",
    ].join("\n");
  }
  return [
    "You generate questions that real prospects ask grand-public LLMs",
    "(ChatGPT, Claude, Perplexity, Gemini, Le Chat) about the target brand's sector.",
    `You MUST call the \`report_prompts\` tool with EXACTLY ${count} questions.`,
    "",
    "MANDATORY SPLIT:",
    `- ${ratio.nonBranded} NON-BRANDED questions: cover the need / category / use case WITHOUT ever naming the target brand or an alias. Goal: measure whether the brand emerges naturally in the LLM's answer.`,
    `- ${ratio.branded} BRANDED question${ratio.branded > 1 ? "s" : ""}: explicitly name(s) the target brand (e.g. \"Is <Brand> any good for…?\", \"<Brand> vs <Competitor>?\", \"How does <Brand> work?\"). Goal: measure sentiment and positioning when the brand is in context.`,
    "",
    "All must be: natural (no marketing jargon), concrete (clear usage context), varied (different stages of the buying journey), phrased from the prospect's perspective (what, how, for whom, how much).",
    "Avoid overly generic questions (\"what is X\").",
  ].join("\n");
}

// Répartition branded / non-branded pour un total donné. Cap à 1 minimum
// pour le branded (sinon le sentiment ne peut JAMAIS être capté). Cap à
// ~30% pour ne pas saturer en branded (le branded est moins utile pour
// la découvrabilité, qui est l'enjeu principal pour des marques inconnues).
function ratioForCount(count: number): { branded: number; nonBranded: number } {
  if (count <= 3) return { branded: 1, nonBranded: count - 1 };
  if (count <= 6) return { branded: 2, nonBranded: count - 2 };
  return { branded: 3, nonBranded: count - 3 };
}

function buildUserPrompt(input: PromptSuggestionInput, count: number): string {
  const ratio = ratioForCount(count);

  const competitorBlock =
    input.competitors && input.competitors.length > 0
      ? `Concurrents directs (utilise certains noms pour les questions BRANDED comparatives) : ${input.competitors.join(", ")}.`
      : "Pas de liste de concurrents fournie — pour les questions BRANDED comparatives, tu peux comparer la marque à des alternatives génériques du secteur.";

  const aliasBlock =
    input.aliases && input.aliases.length > 0
      ? `Alias / variations du nom (à ne PAS utiliser dans les questions NON-BRANDED) : ${input.aliases.join(", ")}.`
      : null;

  // Bloc des prompts déjà trackés. On les expose explicitement avec une
  // consigne « ne propose RIEN d'équivalent ». Truncation à 25 entries
  // pour rester sous la limite de tokens (input.length max ~280 chars
  // × 25 = 7000 chars).
  const existingBlock =
    input.existingPrompts && input.existingPrompts.length > 0
      ? [
          "",
          "Prompts DÉJÀ trackés (à NE PAS reproposer, même paraphrasés) :",
          ...input.existingPrompts.slice(0, 25).map((p, i) => `${i + 1}. ${p}`),
          "",
          "Tes suggestions doivent être COMPLÉMENTAIRES : couvrir d'autres angles, étapes du parcours, ou personas que la liste ci-dessus ne couvre pas encore. Conserve la répartition BRANDED / NON-BRANDED imposée.",
        ].join("\n")
      : null;

  return [
    `Marque cible : ${input.brandName}`,
    `Domaine : ${input.domain}`,
    aliasBlock,
    competitorBlock,
    existingBlock,
    "",
    `Génère ${count} questions en ${input.language === "fr" ? "français" : "anglais"}, dont EXACTEMENT ${ratio.nonBranded} NON-BRANDED (sans mention de « ${input.brandName} » ni d'aliases) et ${ratio.branded} BRANDED (qui nomment « ${input.brandName} » ou la comparent à un concurrent nommé).`,
    "Pour les NON-BRANDED, formule comme un prospect qui ne connaît pas encore la marque mais cherche une solution à un besoin de la catégorie.",
    "Pour les BRANDED, formule comme un prospect qui a déjà entendu parler de la marque et veut savoir ce qu'elle vaut, ses concurrents, son fonctionnement, son prix, ses cas d'usage.",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

function parseToolInput(raw: unknown, expectedCount: number): string[] {
  if (!raw || typeof raw !== "object") {
    throw new Error("Tool input prompt-generator invalide : pas un objet");
  }
  const r = raw as { prompts?: unknown };
  if (!Array.isArray(r.prompts)) {
    throw new Error("Tool input prompt-generator : `prompts` n'est pas un array");
  }
  const cleaned = r.prompts
    .filter((p): p is string => typeof p === "string")
    .map((p) => p.trim())
    .filter((p) => p.length >= 8 && p.length <= 280);

  if (cleaned.length < 3) {
    throw new Error(
      `Tool input prompt-generator : seulement ${cleaned.length} prompts valides (min 3 attendu)`,
    );
  }
  // Si Haiku a renvoyé plus que demandé, on tronque proprement.
  return cleaned.slice(0, expectedCount);
}

// ─────────────────────────────────────────────────────────────────────
// Backend Mistral Small (par défaut depuis 2026-06-09) — function call
// OpenAI-compatible sur le même schema JSON. ~5× moins cher que Haiku.
// ─────────────────────────────────────────────────────────────────────

const MISTRAL_DEFAULT_MODEL = "mistral-small-latest";
const MISTRAL_API_BASE_URL = "https://api.mistral.ai/v1";

interface MistralChatCompletionResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: "function";
        function: { name: string; arguments: string };
      }>;
    };
    finish_reason: string;
  }>;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export interface MistralPromptGeneratorOptions {
  apiKey: string;
  fetch?: typeof fetch;
  model?: string;
  maxTokens?: number;
  baseUrl?: string;
}

export function createMistralPromptGenerator(
  options: MistralPromptGeneratorOptions,
): PromptGenerator {
  const model = options.model ?? MISTRAL_DEFAULT_MODEL;
  const maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;
  const baseUrl = options.baseUrl ?? MISTRAL_API_BASE_URL;
  const fetchImpl = options.fetch ?? fetch;
  const pricing = MISTRAL_PRICING[model];
  if (!pricing) {
    throw new Error(`Tarif inconnu pour le modèle Mistral prompt-generator ${model}`);
  }

  return {
    async suggest(input: PromptSuggestionInput): Promise<PromptSuggestionResult> {
      const count = Math.min(Math.max(input.count ?? 5, 3), 10);
      const startedAt = Date.now();

      const response = await fetchImpl(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${options.apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          messages: [
            { role: "system", content: buildSystemPrompt(input.language, count) },
            { role: "user", content: buildUserPrompt(input, count) },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: SUGGEST_TOOL.name,
                description: SUGGEST_TOOL.description,
                parameters: SUGGEST_TOOL.input_schema,
              },
            },
          ],
          tool_choice: "any", // Mistral : "any" force le tool_use (équivalent Anthropic strict)
        }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "<unreadable>");
        throw new Error(
          `Mistral prompt-generator HTTP ${response.status}: ${body.slice(0, 500)}`,
        );
      }

      const data = (await response.json()) as MistralChatCompletionResponse;
      const durationMs = Date.now() - startedAt;

      const toolCall = data.choices[0]?.message?.tool_calls?.[0];
      if (!toolCall || toolCall.function.name !== SUGGEST_TOOL.name) {
        throw new Error(
          `Mistral prompt-generator : pas de tool_call ${SUGGEST_TOOL.name} (finish_reason=${data.choices[0]?.finish_reason})`,
        );
      }

      // Mistral renvoie les arguments en string JSON, pas en objet
      let rawArgs: unknown;
      try {
        rawArgs = JSON.parse(toolCall.function.arguments);
      } catch (error) {
        throw new Error(
          `Mistral prompt-generator : arguments tool_call non JSON: ${(error as Error).message}`,
        );
      }

      const parsed = parseToolInput(rawArgs, count);
      const costUsd = computeCost(pricing, {
        inputTokens: data.usage.prompt_tokens,
        outputTokens: data.usage.completion_tokens,
        webSearchRequests: 0,
      });

      return {
        prompts: parsed,
        costUsd,
        durationMs,
        model: data.model,
      };
    },
  };
}
