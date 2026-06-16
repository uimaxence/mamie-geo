import { sql } from "drizzle-orm";
import { db } from "@/db/client";
export { encodeSourceSlug, decodeSourceSlug } from "./slug";

// Queries pour la page /app/sources (V0+ URL drill-down). On unnest
// runs.parsed_citations (jsonb LLMSource[]) côté SQL pour agréger les
// citations par URL — bien plus performant qu'un fetch + reduce JS.
//
// Les URLs sont la dimension naturelle ; pas d'ID stable côté DB. La
// route détail utilise un base64url de l'URL pour rester URL-safe.

export interface SourceListItem {
  url: string;
  title: string | null;
  /** Nombre total de runs distincts où l'URL apparaît. */
  citationCount: number;
  /** Liste des LLMs qui ont cité cette URL (ordre alphabétique). */
  llms: string[];
  /** Dernière apparition (executedAt) ; ISO string. */
  lastCitedAt: string;
}

/**
 * Liste les URLs citées au moins une fois dans un run success d'une ou
 * plusieurs brands, classées par nombre de citations décroissant. Une
 * URL peut apparaître dans plusieurs runs (différents prompts ou
 * différents jours) et par plusieurs LLMs. Accepte un array de brandIds
 * pour le filtre multi-brand côté /app/sources (V0+).
 */
export async function listCitedSources(brandIds: string[]): Promise<SourceListItem[]> {
  if (brandIds.length === 0) return [];

  const idList = sql.join(
    brandIds.map((id) => sql`${id}`),
    sql.raw(", "),
  );

  const rows = await db.execute<{
    url: string;
    title: string | null;
    citation_count: string;
    llms: string[];
    last_cited_at: string;
  }>(sql`
    SELECT
      src->>'url' as url,
      MAX(src->>'title') as title,
      COUNT(DISTINCT r.id)::text as citation_count,
      ARRAY_AGG(DISTINCT r.llm ORDER BY r.llm) as llms,
      MAX(r.executed_at)::text as last_cited_at
    FROM runs r
    INNER JOIN prompts p ON p.id = r.prompt_id
    CROSS JOIN LATERAL jsonb_array_elements(r.parsed_citations) src
    WHERE p.brand_id IN (${idList})
      AND r.status = 'success'
      AND r.parsed_citations IS NOT NULL
      AND src ? 'url'
    GROUP BY src->>'url'
    ORDER BY citation_count DESC, last_cited_at DESC
    LIMIT 500
  `);

  return rows.rows.map((r) => ({
    url: r.url,
    title: r.title,
    citationCount: Number(r.citation_count),
    llms: r.llms ?? [],
    lastCitedAt: r.last_cited_at,
  }));
}

export interface SourceRunRow {
  runId: string;
  llm: string;
  executedAt: string;
  promptText: string;
  promptId: string;
  title: string | null;
}

/**
 * Détail d'une URL : tous les runs success des brands listées où cette
 * URL apparaît dans parsed_citations. Utilisé par /app/sources/[id]
 * avec le même filtre multi-brand que la page liste.
 */
export async function getSourceRuns(brandIds: string[], url: string): Promise<SourceRunRow[]> {
  if (brandIds.length === 0) return [];

  const idList = sql.join(
    brandIds.map((id) => sql`${id}`),
    sql.raw(", "),
  );

  const rows = await db.execute<{
    run_id: string;
    llm: string;
    executed_at: string;
    prompt_text: string;
    prompt_id: string;
    title: string | null;
  }>(sql`
    SELECT
      r.id as run_id,
      r.llm,
      r.executed_at::text as executed_at,
      p.text as prompt_text,
      p.id as prompt_id,
      src->>'title' as title
    FROM runs r
    INNER JOIN prompts p ON p.id = r.prompt_id
    CROSS JOIN LATERAL jsonb_array_elements(r.parsed_citations) src
    WHERE p.brand_id IN (${idList})
      AND r.status = 'success'
      AND r.parsed_citations IS NOT NULL
      AND src->>'url' = ${url}
    ORDER BY r.executed_at DESC
    LIMIT 200
  `);

  return rows.rows.map((r) => ({
    runId: r.run_id,
    llm: r.llm,
    executedAt: r.executed_at,
    promptText: r.prompt_text,
    promptId: r.prompt_id,
    title: r.title,
  }));
}
