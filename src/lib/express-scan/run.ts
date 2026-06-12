import { detectMentions } from "@/lib/citation/detect";
import type { BrandExtraction } from "./extract";
import { buildExpressPrompts } from "./templates";
import type {
  ExpressPosition,
  ExpressPromptResult,
  ExpressScanReport,
  ExpressScanResult,
} from "./types";

// Moteur du scan express : 3 prompts templates posés en parallèle à
// 1 LLM. Verdict cité/absent = regex (detectMentions, la même que le
// tracking) OU jugement de l'appel d'extraction (qui attrape les
// variantes de nom — « BoursoBank » vs « Boursorama Banque »). La
// position n'est connue que via la regex. L'écart 1 vs 5 IA est
// volontaire : c'est l'argument du CTA (variance inter-LLM ×8, doc 11).

// Seuils de position dans la réponse, alignés sur l'esprit du scoring
// (first_paragraph / middle / end).
const POSITION_DEBUT_RATIO = 0.25;
const POSITION_MILIEU_RATIO = 0.7;

export interface ExpressExecuteResult {
  text: string;
}

export interface ExpressScanParams {
  brand: string;
  sector: string;
  /** Appel LLM (Le Chat / mistral-small en prod, fake en test). */
  execute: (prompt: string) => Promise<ExpressExecuteResult>;
  /** Extraction marques citées + jugement variante de nom (Mistral en prod, fake en test). */
  extractBrands: (responseTexts: string[]) => Promise<BrandExtraction>;
  llmLabel?: string;
}

function positionOf(firstIndex: number, textLength: number): ExpressPosition {
  if (textLength === 0) return "debut";
  const ratio = firstIndex / textLength;
  if (ratio < POSITION_DEBUT_RATIO) return "debut";
  if (ratio < POSITION_MILIEU_RATIO) return "milieu";
  return "fin";
}

export async function runExpressScan(params: ExpressScanParams): Promise<ExpressScanResult> {
  const brand = params.brand.trim();
  const prompts = buildExpressPrompts(params.sector);

  let texts: string[];
  try {
    const responses = await Promise.all(prompts.map((prompt) => params.execute(prompt)));
    texts = responses.map((r) => r.text);
  } catch (error) {
    return {
      ok: false,
      code: "llm_unavailable",
      message: `LLM indisponible: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  const extraction = await params.extractBrands(texts);

  const results: ExpressPromptResult[] = prompts.map((prompt, i) => {
    const text = texts[i] ?? "";
    const detected = detectMentions(text, [
      { id: "brand", name: brand, type: "brand", patterns: [brand] },
    ]);
    const mention = detected[0];
    return {
      prompt,
      cited: Boolean(mention) || (extraction.targetCitedPerResponse[i] ?? false),
      position: mention ? positionOf(mention.firstIndex, text.length) : null,
      brandsCited: extraction.brandsPerResponse[i] ?? [],
    };
  });

  const report: ExpressScanReport = {
    brand,
    sector: params.sector.trim(),
    llmLabel: params.llmLabel ?? "Le Chat (Mistral)",
    results,
    citedCount: results.filter((r) => r.cited).length,
    totalPrompts: results.length,
    fetchedAt: new Date().toISOString(),
  };
  return { ok: true, report };
}
