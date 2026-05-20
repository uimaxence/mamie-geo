import { Briefcase, Building2, Users, type LucideIcon } from "lucide-react";
import { Section } from "@/components/ui";

// "Pour qui c'est", 3 personas (cf. doc 10 § Composants obligatoires).
// PR 12a : suppression du featured permanent. Chaque card a un hover
// warm gradient + lift subtil pour le dynamisme, sans crash de texte
// au repos. Pattern uniforme = plus pro (l'œil n'est pas attiré sur
// une seule card par hasard, l'attention est portée par la lecture).

interface Persona {
  eyebrow: string;
  name: string;
  role: string;
  benefit: string;
  Icon: LucideIcon;
}

const PERSONAS: Persona[] = [
  {
    eyebrow: "Persona 01",
    name: "Sophie",
    role: "Freelance SEO",
    benefit:
      "Pose une question simple à 3 prospects : « Et pour ChatGPT, vous y êtes ? ». Tu réponds avec un rapport au lieu de hausser les épaules.",
    Icon: Briefcase,
  },
  {
    eyebrow: "Persona 02",
    name: "Thomas",
    role: "Marketing PME",
    benefit:
      "Tu reportes ton score de visibilité IA chaque lundi en CODIR avec un graphique propre. Plus de fichiers Excel hebdomadaires.",
    Icon: Users,
  },
  {
    eyebrow: "Persona 03",
    name: "Aline",
    role: "Agence SEO/Marketing",
    benefit:
      "Rapport en marque blanche pour chaque client, automatique chaque semaine. Tu vends une nouvelle prestation 300 €/mois sans recruter.",
    Icon: Building2,
  },
];

export function PourQui() {
  return (
    <Section pad="xl" id="pour-qui">
      <div className="mx-auto max-w-3xl text-center">
        <span className="type-eyebrow">Pour qui c&apos;est</span>
        <h2 className="type-h1 mt-3">Conçu pour 3 profils.</h2>
        <p className="type-body mt-4 mx-auto max-w-2xl">
          Mamie GEO n&apos;est pas pour tout le monde. Si tu te reconnais dans une de ces trois
          fiches, tu vas gagner du temps.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
        {PERSONAS.map((persona) => (
          <article
            key={persona.name}
            className="card-hover-warm rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-[color:var(--color-gray-100)] text-[color:var(--color-ink)]">
              <persona.Icon size={18} strokeWidth={2.2} />
            </span>
            <span className="type-eyebrow mt-4 block">{persona.eyebrow}</span>
            <h3 className="type-h3 mt-2">{persona.name}</h3>
            <p className="text-sm font-medium text-[color:var(--color-muted)]">{persona.role}</p>
            <p className="type-body mt-3 text-sm">{persona.benefit}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
