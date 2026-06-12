import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Normalise une saisie « domaine » en acceptant une URL collée telle
 * quelle : "https://www.monsite.fr/page?x=1" → "monsite.fr". Les
 * prospects collent presque toujours l'URL complète de leur site
 * (constaté 2026-06-12 sur les deux lead magnets).
 */
export function normalizeDomainInput(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[/?#].*$/, "")
    .replace(/\.$/, "");
}
