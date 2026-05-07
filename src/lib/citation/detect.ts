// Détection regex des mentions de marque dans une réponse LLM brute.
// Étape 1 du scoring (cheap, déterministe). Si rien n'est détecté ici, on
// peut skip le scoring LLM et économiser un appel Haiku — c'est le
// pre-screening du § 690 de doc 03.
//
// Stratégie : normaliser (minuscule + accents enlevés), puis match avec
// frontière de mots pour éviter "geo" qui matche "geographie". Aliases
// inclus côté brand et concurrents.

export interface MentionTarget {
  // identifiant stable pour pouvoir agréger ensuite
  id: string;
  name: string;
  // type pour distinguer brand vs concurrents en sortie
  type: "brand" | "competitor";
  // tous les patterns à chercher (name + aliases). Doit contenir au moins 1.
  patterns: readonly string[];
}

export interface DetectedMention {
  targetId: string;
  name: string;
  type: "brand" | "competitor";
  // nombre total d'occurrences détectées (toutes patterns confondues)
  occurrences: number;
  // index de la 1re occurrence dans le texte normalisé — sert à classer
  // "premier paragraphe" vs "milieu" vs "fin" en scoring qualitatif
  firstIndex: number;
}

/**
 * Détecte les mentions de la marque cible et de ses concurrents dans
 * `rawText`. Insensible à la casse et aux accents. Match en frontière de
 * mot pour éviter les faux positifs sur des sous-chaînes.
 *
 * Retourne uniquement les targets effectivement mentionnés (pas de row
 * occurrences=0). Ordre indéterminé — l'appelant trie si besoin.
 */
export function detectMentions(
  rawText: string,
  targets: readonly MentionTarget[],
): DetectedMention[] {
  const normalizedText = normalize(rawText);
  const results: DetectedMention[] = [];

  for (const target of targets) {
    let occurrences = 0;
    let firstIndex = Number.POSITIVE_INFINITY;

    for (const pattern of target.patterns) {
      const normalizedPattern = normalize(pattern);
      if (!normalizedPattern) continue;

      const regex = buildBoundaryRegex(normalizedPattern);
      let match: RegExpExecArray | null;
      while ((match = regex.exec(normalizedText)) !== null) {
        occurrences += 1;
        if (match.index < firstIndex) firstIndex = match.index;
        // Évite la boucle infinie sur les patterns lookahead-only
        if (regex.lastIndex === match.index) regex.lastIndex += 1;
      }
    }

    if (occurrences > 0) {
      results.push({
        targetId: target.id,
        name: target.name,
        type: target.type,
        occurrences,
        firstIndex,
      });
    }
  }

  return results;
}

/**
 * Décide si l'appel LLM de scoring est nécessaire. Si aucune mention
 * détectée par regex, le scoring n'apportera rien (et coûte ~$0,005).
 * Cf. doc 03 § 690 — pre-screening regex avant LLM.
 */
export function shouldScoreWithLLM(detections: readonly DetectedMention[]): boolean {
  return detections.length > 0;
}

// Normalise pour matcher insensible à la casse et aux accents (NFD →
// strip diacritics → lowercase). On garde apostrophes et tirets qui font
// partie de noms de marques (« Le Chat », « Peec AI »).
function normalize(input: string): string {
  return input.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Échappe les meta-caractères regex avant d'envelopper en frontière.
function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Frontière "word-boundary like" mais qui marche avec espaces en pattern
// (ex: "Le Chat"). \b standard ne marche que sur word chars donc on
// utilise un lookbehind/ahead sur non-word-or-edge.
function buildBoundaryRegex(normalizedPattern: string): RegExp {
  const escaped = escapeRegex(normalizedPattern);
  return new RegExp(`(?:^|[^a-z0-9])(${escaped})(?=[^a-z0-9]|$)`, "gi");
}
