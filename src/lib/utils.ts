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

/**
 * Path d'une saisie « domaine » : "taap.it/fr" → "/fr", "monsite.fr" →
 * "". Quand le prospect colle l'URL de sa home localisée, l'analyse de
 * profil doit lire CETTE page, pas la racine (constaté 2026-06-12 :
 * taap.it racine est en anglais, la home FR vit sur /fr).
 */
export function pathFromDomainInput(raw: string): string {
  const withoutProtocol = raw.trim().replace(/^https?:\/\//i, "");
  const slash = withoutProtocol.indexOf("/");
  if (slash === -1) return "";
  const path = withoutProtocol
    .slice(slash)
    .replace(/[?#].*$/, "")
    .replace(/\/+$/, "");
  return path === "" || path === "/" ? "" : path;
}
