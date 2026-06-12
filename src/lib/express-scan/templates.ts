// Prompts du scan express : 3 templates paramétrés par le secteur saisi,
// pas de génération LLM (spec doc 06 § n°1bis — coût zéro, déterministe,
// et le prospect voit exactement ce qui a été demandé à l'IA).
//
// Formulations volontairement « consommateur » : c'est le type de
// question que les clients du prospect posent réellement à ChatGPT/Le
// Chat. Neutres grammaticalement pour encaisser n'importe quel secteur
// (« menuiserie », « crm », « agence seo »…).
//
// Localité optionnelle (2026-06-12) : une PME locale n'est pas en
// compétition nationale — « meilleur plombier » ne la citera jamais,
// « meilleur plombier à Tours » si. Les questions deviennent locales
// quand le prospect renseigne sa ville.

export function buildExpressPrompts(sector: string, location?: string): string[] {
  const s = sector.trim();
  const loc = location?.trim();
  const where = loc ? ` à ${loc}` : " en France";
  return [
    `Quels sont les meilleurs acteurs en ${s}${where} ? Donne-moi les noms les plus recommandés.`,
    `Je cherche un prestataire ou une solution en ${s}${loc ? ` à ${loc}` : ""}. Qui me recommandes-tu et pourquoi ?`,
    `Quelles marques ou entreprises faut-il comparer avant de choisir en ${s}${loc ? ` à ${loc}` : ""} ?`,
  ];
}
