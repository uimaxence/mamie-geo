import Anthropic from "@anthropic-ai/sdk";
import type { Tool, ToolUseBlock } from "@anthropic-ai/sdk/resources/messages/messages";
import { ANTHROPIC_PRICING, computeCost } from "@/lib/llm/pricing";

// Étape 2 du scoring (cf. doc 03 § 700) : enrichir la détection regex
// avec une analyse qualitative LLM. Claude Haiku 4.5 en tool_use forcé
// pour garantir un JSON conforme au schema (plus robuste que prompter
// "réponds en JSON").
//
// Coût observé Phase A : ~$0,002-0,005 par scoring (rawText typique
// 1-3k tokens en input + 100-200 tokens en output, pas de web_search).
//
// On reste sur Anthropic pour le scoring car le tracking l'utilise déjà
// et on bénéficie de la même clé API + facturation centralisée.

const DEFAULT_MODEL = "claude-haiku-4-5-20251001";
const DEFAULT_MAX_TOKENS = 1024;

export type ScoringSentiment = "positive" | "neutral" | "negative";
export type ScoringPosition = "first_paragraph" | "middle" | "end" | "absent";
/** Position d'une mention concurrent — jamais "absent" (il est mentionné). */
export type ScoringMentionPosition = Exclude<ScoringPosition, "absent">;

export interface ScoringCompetitorMention {
  name: string;
  sentiment: ScoringSentiment;
  /**
   * Position de la première mention du concurrent (étape 3 ranking, cf.
   * doc 02 § Ranking). Optionnel : les payloads scorés avant 2026-06-10
   * n'ont pas ce champ.
   */
  position?: ScoringMentionPosition;
}

export interface ScoringResult {
  brandMentioned: boolean;
  brandSentiment: ScoringSentiment | "absent";
  brandPosition: ScoringPosition;
  competitorsMentioned: ScoringCompetitorMention[];
  // Métadonnées LLM pour traçabilité (audit + facturation)
  costUsd: number;
  durationMs: number;
  model: string;
}

export interface ScoringInput {
  rawText: string;
  brand: { name: string; aliases: readonly string[] };
  competitors: ReadonlyArray<{ name: string; aliases: readonly string[] }>;
  language: "fr" | "en";
}

export interface ScoringClientOptions {
  apiKey: string;
  // Override fetch pour les tests (injection cassette JSON)
  fetch?: typeof fetch;
  model?: string;
  maxTokens?: number;
}

export interface ScoringClient {
  score(input: ScoringInput): Promise<ScoringResult>;
}

// Schema du tool report_scoring forcé via tool_choice. Anthropic valide
// l'output côté serveur, donc on reçoit un input JSON garanti structuré.
const SCORING_TOOL: Tool = {
  name: "report_scoring",
  description: "Rapporte l'analyse de la réponse LLM pour la marque cible et les concurrents.",
  input_schema: {
    type: "object",
    properties: {
      brandMentioned: {
        type: "boolean",
        description: "La marque cible est-elle citée dans la réponse ?",
      },
      brandSentiment: {
        type: "string",
        enum: ["positive", "neutral", "negative", "absent"],
        description: "Sentiment de la mention de la marque cible.",
      },
      brandPosition: {
        type: "string",
        enum: ["first_paragraph", "middle", "end", "absent"],
        description:
          "Position de la première mention de la marque cible : premier paragraphe (recommandation forte), milieu (mention secondaire), fin (mention de complément), ou absent.",
      },
      competitorsMentioned: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            sentiment: {
              type: "string",
              enum: ["positive", "neutral", "negative"],
            },
            position: {
              type: "string",
              enum: ["first_paragraph", "middle", "end"],
              description:
                "Position de la première mention du concurrent : premier paragraphe, milieu ou fin de la réponse.",
            },
          },
          required: ["name", "sentiment", "position"],
        },
        description: "Liste des concurrents cités avec leur sentiment et leur position.",
      },
    },
    required: ["brandMentioned", "brandSentiment", "brandPosition", "competitorsMentioned"],
  },
};

export function createAnthropicScoringClient(options: ScoringClientOptions): ScoringClient {
  const model = options.model ?? DEFAULT_MODEL;
  const maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;
  const pricing = ANTHROPIC_PRICING[model];
  if (!pricing) {
    throw new Error(`Tarif inconnu pour le modèle de scoring ${model} — ajouter dans pricing.ts`);
  }

  const sdk = new Anthropic({ apiKey: options.apiKey, fetch: options.fetch });

  return {
    async score(input: ScoringInput): Promise<ScoringResult> {
      const startedAt = Date.now();
      const message = await sdk.messages.create({
        model,
        max_tokens: maxTokens,
        system: buildSystemPrompt(input.language),
        tools: [SCORING_TOOL],
        tool_choice: { type: "tool", name: SCORING_TOOL.name },
        messages: [{ role: "user", content: buildUserPrompt(input) }],
      });
      const durationMs = Date.now() - startedAt;

      const toolUse = message.content.find(
        (block): block is ToolUseBlock =>
          block.type === "tool_use" && block.name === SCORING_TOOL.name,
      );
      if (!toolUse) {
        throw new Error(
          `Réponse Haiku scoring sans tool_use ${SCORING_TOOL.name} — stop_reason=${message.stop_reason}`,
        );
      }

      const parsed = parseToolInput(toolUse.input);
      const costUsd = computeCost(pricing, {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
        webSearchRequests: 0,
      });

      return {
        ...parsed,
        costUsd,
        durationMs,
        model: message.model,
      };
    },
  };
}

function buildSystemPrompt(language: "fr" | "en"): string {
  if (language === "fr") {
    return [
      "Tu es un analyste expert en visibilité IA pour les marques.",
      "On te donne une réponse générée par un LLM (ChatGPT, Claude, etc.) à une question d'utilisateur.",
      "Ton rôle : déterminer si la marque cible est citée, à quelle position, avec quel sentiment, et lister les concurrents mentionnés avec leur position et leur sentiment.",
      "Tu DOIS répondre en appelant l'outil `report_scoring` avec les champs requis.",
    ].join(" ");
  }
  return [
    "You are an expert AI visibility analyst for brands.",
    "You are given a response generated by an LLM (ChatGPT, Claude, etc.) to a user question.",
    "Your role: determine whether the target brand is mentioned, in what position, with what sentiment, and list mentioned competitors with their position and sentiment.",
    "You MUST respond by calling the `report_scoring` tool with the required fields.",
  ].join(" ");
}

function buildUserPrompt(input: ScoringInput): string {
  const aliasList = (aliases: readonly string[]) =>
    aliases.length > 0 ? aliases.join(", ") : "(aucun)";
  const competitorBlock = input.competitors
    .map((c) => `- ${c.name} (alias : ${aliasList(c.aliases)})`)
    .join("\n");
  return [
    `Marque cible : ${input.brand.name}`,
    `Aliases marque : ${aliasList(input.brand.aliases)}`,
    "",
    "Concurrents à détecter :",
    competitorBlock || "(aucun concurrent listé)",
    "",
    "Réponse LLM à analyser (raw) :",
    "---",
    input.rawText,
    "---",
  ].join("\n");
}

interface RawScoringInput {
  brandMentioned?: unknown;
  brandSentiment?: unknown;
  brandPosition?: unknown;
  competitorsMentioned?: unknown;
}

function parseToolInput(raw: unknown): Omit<ScoringResult, "costUsd" | "durationMs" | "model"> {
  if (!raw || typeof raw !== "object") {
    throw new Error("Tool input scoring invalide : pas un objet");
  }
  const r = raw as RawScoringInput;
  const brandMentioned = r.brandMentioned === true;
  const brandSentiment = isSentimentOrAbsent(r.brandSentiment) ? r.brandSentiment : "absent";
  const brandPosition = isPosition(r.brandPosition) ? r.brandPosition : "absent";
  const competitorsMentioned = Array.isArray(r.competitorsMentioned)
    ? r.competitorsMentioned.flatMap((entry): ScoringCompetitorMention[] => {
        if (!entry || typeof entry !== "object") return [];
        const e = entry as { name?: unknown; sentiment?: unknown; position?: unknown };
        if (typeof e.name !== "string" || !isSentiment(e.sentiment)) return [];
        // position léniente : champ récent (2026-06-10), absent des vieux
        // payloads et potentiellement omis malgré le schema.
        return isMentionPosition(e.position)
          ? [{ name: e.name, sentiment: e.sentiment, position: e.position }]
          : [{ name: e.name, sentiment: e.sentiment }];
      })
    : [];
  return { brandMentioned, brandSentiment, brandPosition, competitorsMentioned };
}

function isSentiment(value: unknown): value is ScoringSentiment {
  return value === "positive" || value === "neutral" || value === "negative";
}

function isSentimentOrAbsent(value: unknown): value is ScoringSentiment | "absent" {
  return isSentiment(value) || value === "absent";
}

function isPosition(value: unknown): value is ScoringPosition {
  return value === "first_paragraph" || value === "middle" || value === "end" || value === "absent";
}

function isMentionPosition(value: unknown): value is ScoringMentionPosition {
  return value === "first_paragraph" || value === "middle" || value === "end";
}
