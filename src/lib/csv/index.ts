// Helper CSV minimal — pas de dépendance externe (papaparse ferait
// 30 KB pour ce qu'on en fait).
//
// Format RFC 4180 :
//   - séparateur virgule
//   - newlines CRLF (compat Windows Excel)
//   - chaque cellule entre guillemets si elle contient `,`, `"` ou `\n`
//   - guillemets doublés à l'intérieur d'une cellule (`"` → `""`)
//
// BOM UTF-8 ajouté en tête pour que Excel détecte l'encodage et affiche
// correctement les accents français sans devoir passer par "Importer".

const BOM = "﻿";
const NEEDS_QUOTING = /[",\r\n]/;

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = value instanceof Date ? value.toISOString() : String(value);
  if (!NEEDS_QUOTING.test(str)) return str;
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Stringify un tableau de rows en CSV. Toutes les rows doivent partager
 * la même structure de clés (premier row détermine l'en-tête).
 */
export function stringifyCsv<T extends Record<string, unknown>>(
  rows: readonly T[],
  headers: readonly (keyof T & string)[],
): string {
  const lines: string[] = [];
  lines.push(headers.map(escapeCell).join(","));
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCell(row[h])).join(","));
  }
  return BOM + lines.join("\r\n") + "\r\n";
}

/**
 * Headers HTTP standard pour un download CSV.
 * `filename` doit inclure l'extension `.csv`.
 */
export function csvResponseHeaders(filename: string): HeadersInit {
  return {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": `attachment; filename="${filename}"`,
    // Données personnelles, jamais en CDN
    "Cache-Control": "private, no-cache, no-store, must-revalidate",
  };
}
