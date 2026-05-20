import { Section } from "@/components/ui";

// "Mamie GEO n'est pas...", section de différentiation concurrentielle
// (cf. doc 10 § Composants obligatoires). 3 blocs sobres, chacun pose
// une frontière claire avec un concurrent ou un type d'outil voisin.
// Honnêteté commerciale revendiquée : on dit ce qu'on n'est PAS.

const POINTS = [
  {
    title: "Un outil SEO classique",
    body: "On ne fait pas de recherche de mots-clés Google, ni d'analyse de backlinks. Pour ça, Semrush et Ahrefs sont meilleurs et installés. Mamie GEO mesure la visibilité dans les IA, pas dans Google.",
  },
  {
    title: "Un générateur de contenu",
    body: "On ne va pas écrire ton article à ta place. On te dit ce qui manque pour être cité, pas comment l'écrire. Le contenu reste ta valeur ajoutée.",
  },
  {
    title: "Profound",
    body: "Si tu as 500 $/mois et que tu veux du Fortune 1000 grade avec 8 LLMs et SOC 2 Type II, va chez eux. Nous on cible les freelances et PME francophones avec un rapport qualité/prix imbattable.",
  },
];

export function NEstPas() {
  return (
    <Section pad="xl">
      <div className="mx-auto max-w-3xl text-center">
        <span className="type-eyebrow">Soyons honnêtes</span>
        <h2 className="type-h1 mt-3">
          Mamie GEO n&apos;est <strong className="font-bold">pas</strong>…
        </h2>
        <p className="type-body mt-4 mx-auto max-w-2xl">
          Pour qu&apos;on évite les malentendus avant que tu sortes la carte bleue.
        </p>
      </div>

      <div className="mt-12 mx-auto max-w-3xl flex flex-col">
        {POINTS.map((point, idx) => (
          <div
            key={point.title}
            className={`py-6 ${idx > 0 ? "border-t border-[color:var(--color-border)]" : ""}`}
          >
            <h3 className="type-h3">
              <span className="text-[color:var(--color-muted)]">Mamie GEO n&apos;est pas </span>
              <span className="text-[color:var(--color-ink)]">{point.title}.</span>
            </h3>
            <p className="type-body mt-3 text-sm">{point.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
