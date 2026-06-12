// Prompts du scan express : 3 templates paramétrés par le secteur saisi,
// pas de génération LLM (spec doc 06 § n°1bis — coût zéro, déterministe,
// et le prospect voit exactement ce qui a été demandé à l'IA).
//
// Formulations volontairement « consommateur » : c'est le type de
// question que les clients du prospect posent réellement à ChatGPT/Le
// Chat. Neutres grammaticalement pour encaisser n'importe quel secteur
// (« menuiserie », « crm », « agence seo »…).

export function buildExpressPrompts(sector: string): string[] {
  const s = sector.trim();
  return [
    `Quels sont les meilleurs acteurs en ${s} en France ? Donne-moi les noms les plus recommandés.`,
    `Je cherche un prestataire ou une solution en ${s}. Qui me recommandes-tu et pourquoi ?`,
    `Quelles marques ou entreprises faut-il comparer avant de choisir en ${s} ?`,
  ];
}
