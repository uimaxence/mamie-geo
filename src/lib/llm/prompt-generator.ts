import Anthropic from "@anthropic-ai/sdk";
import type { Tool, ToolUseBlock } from "@anthropic-ai/sdk/resources/messages/messages";
import { ANTHROPIC_PRICING, computeCost } from "./pricing";

// Génère N prompts pertinents pour une marque donnée — utilisé par
// l'onboarding wizard (étape 3) pour offrir un "Suggérer 5 prompts via
// IA" qui remplace la saisie manuelle.
//
// Stack : Anthropic Claude Haiku 4.5 + tool_use forcé sur un schema
// strict (même pattern que src/lib/citation/score.ts). Garantit qu'on
// récupère un array de strings bien formé, pas du texte libre à parser.
//
// Coût observé : ~$0.003-0.008 par appel (300-800 input tokens + 200
// output tokens, pas de web_search). Largement OK pour un onboarding
// qui se joue 1 fois par compte.

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
  if (language === "fr") {
    return [
      "Tu génères des questions que de vrais prospects posent aux LLMs grand public",
      "(ChatGPT, Claude, Perplexity, Gemini, Le Chat) avant de contacter une marque.",
      `Tu DOIS appeler l'outil \`report_prompts\` avec exactement ${count} questions.`,
      "Les questions doivent être : naturelles (pas du « jargon marketing »),",
      "concrètes (avec un contexte d'usage clair), variées (capter différents",
      "moments du parcours d'achat), et formulées du point de vue du prospect",
      "(« quel », « comment », « pour qui », « combien »).",
      "Évite les questions trop génériques (« qu'est-ce que X »).",
    ].join(" ");
  }
  return [
    "You generate questions that real prospects ask grand-public LLMs",
    "(ChatGPT, Claude, Perplexity, Gemini, Le Chat) before contacting a brand.",
    `You MUST call the \`report_prompts\` tool with exactly ${count} questions.`,
    "The questions must be: natural (no « marketing jargon »), concrete",
    "(with a clear usage context), varied (capturing different moments of the",
    "buying journey), and phrased from the prospect's perspective (« what »,",
    "« how », « for whom », « how much »).",
    "Avoid questions too generic (« what is X »).",
  ].join(" ");
}

function buildUserPrompt(input: PromptSuggestionInput, count: number): string {
  const competitorBlock =
    input.competitors && input.competitors.length > 0
      ? `Concurrents directs : ${input.competitors.join(", ")}.`
      : "Pas de liste de concurrents fournie — génère des prompts qui couvrent la catégorie générale.";

  const aliasBlock =
    input.aliases && input.aliases.length > 0
      ? `Alias / variations du nom : ${input.aliases.join(", ")}.`
      : null;

  // Bloc des prompts déjà trackés. On les expose explicitement à Haiku
  // avec une consigne « ne propose RIEN d'équivalent ». Truncation à 25
  // entries pour rester sous la limite de tokens (input.length max ~280
  // chars × 25 = 7000 chars).
  const existingBlock =
    input.existingPrompts && input.existingPrompts.length > 0
      ? [
          "",
          "Prompts DÉJÀ trackés (à NE PAS reproposer, même paraphrasés) :",
          ...input.existingPrompts.slice(0, 25).map((p, i) => `${i + 1}. ${p}`),
          "",
          "Tes suggestions doivent être COMPLÉMENTAIRES : couvrir d'autres angles, étapes du parcours, ou personas que la liste ci-dessus ne couvre pas encore.",
        ].join("\n")
      : null;

  return [
    `Marque cible : ${input.brandName}`,
    `Domaine : ${input.domain}`,
    aliasBlock,
    competitorBlock,
    existingBlock,
    "",
    `Génère ${count} questions, en ${input.language === "fr" ? "français" : "anglais"}, que les prospects de cette marque posent (ou poseraient) à ChatGPT/Claude/Le Chat avant d'envisager de la contacter ou d'acheter chez elle.`,
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
