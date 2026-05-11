import { Section, Badge } from "@/components/ui";

// "Comment ça marche" — 3 étapes avec badges colorés (cf. doc 10
// § Composants et patterns obligatoires + § Patterns de personnalité).

const STEPS: {
  eyebrow: string;
  tone: "blue" | "orange" | "green";
  title: string;
  description: string;
}[] = [
  {
    eyebrow: "Étape 01",
    tone: "blue",
    title: "Ajoute ta marque et tes concurrents",
    description:
      "30 secondes. Tu donnes ton domaine et 1 à 5 concurrents. Mamie GEO récupère tes aliases et ceux de tes concurrents automatiquement.",
  },
  {
    eyebrow: "Étape 02",
    tone: "orange",
    title: "Mamie GEO génère 25 prompts pertinents",
    description:
      "Auto, via IA. Des questions réelles que tes futurs clients posent sur ChatGPT, Claude et consorts. Tu peux les éditer si besoin.",
  },
  {
    eyebrow: "Étape 03",
    tone: "green",
    title: "Reçois ton premier rapport en 10 minutes",
    description:
      "Et ensuite chaque jour. Dashboard, email hebdo, comparatif concurrents, recommandations actionnables. Tu sais quoi corriger.",
  },
];

export function HowItWorks() {
  return (
    <Section variant="tinted" pad="xl" id="how-it-works">
      <div className="mx-auto max-w-3xl text-center">
        <span className="type-eyebrow">Comment ça marche</span>
        <h2 className="type-h1 mt-3">Trois étapes pour mesurer ta visibilité IA.</h2>
      </div>

      <ol className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {STEPS.map((step) => (
          <li
            key={step.title}
            className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6"
          >
            <Badge tone={step.tone} className="mb-4">
              {step.eyebrow}
            </Badge>
            <h3 className="type-h3">{step.title}</h3>
            <p className="type-body mt-2 text-sm">{step.description}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
