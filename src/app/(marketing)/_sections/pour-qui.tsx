import { Briefcase, Building2, Users, type LucideIcon } from "lucide-react";
import { Section } from "@/components/ui";

// "Pour qui c'est" — 3 personas (Sophie/Thomas/Aline, cf. doc 10
// § Composants obligatoires). Card centrale "Thomas marketing PME"
// est mise en avant avec un dégradé warm interne (cf. doc 09 § PR 11a
// + refs Tanj testimonials). Cette persona est l'audience prioritaire
// (volume + ARPU).

interface Persona {
  eyebrow: string;
  name: string;
  role: string;
  benefit: string;
  Icon: LucideIcon;
  featured?: boolean;
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
    eyebrow: "Persona 02 · prioritaire",
    name: "Thomas",
    role: "Marketing PME",
    benefit:
      "Tu reportes ton score de visibilité IA chaque lundi en CODIR avec un graphique propre. Plus de fichiers Excel hebdomadaires.",
    Icon: Users,
    featured: true,
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
          <PersonaCard key={persona.name} persona={persona} />
        ))}
      </div>
    </Section>
  );
}

function PersonaCard({ persona }: { persona: Persona }) {
  if (persona.featured) {
    // Card featured — fond en dégradé warm + texte en blanc/ink pour
    // contraste. Bordure transparente, contenu serré pour ne pas trop
    // s'éloigner du langage des autres cards.
    return (
      <article className="gradient-warm-card relative flex flex-col rounded-[var(--radius-xl)] p-6 text-[color:var(--color-ink)]">
        <span className="flex size-10 items-center justify-center rounded-full bg-white/40 backdrop-blur-sm text-[color:var(--color-ink)]">
          <persona.Icon size={18} strokeWidth={2.2} />
        </span>
        <span className="type-eyebrow mt-4 text-[color:var(--color-ink)]/70">
          {persona.eyebrow}
        </span>
        <h3 className="type-h3 mt-2">{persona.name}</h3>
        <p className="text-sm font-medium text-[color:var(--color-ink)]/80">{persona.role}</p>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-ink)]/90">
          {persona.benefit}
        </p>
      </article>
    );
  }

  return (
    <article className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6">
      <span className="flex size-10 items-center justify-center rounded-full bg-[color:var(--color-gray-100)] text-[color:var(--color-ink)]">
        <persona.Icon size={18} strokeWidth={2.2} />
      </span>
      <span className="type-eyebrow mt-4 block">{persona.eyebrow}</span>
      <h3 className="type-h3 mt-2">{persona.name}</h3>
      <p className="text-sm font-medium text-[color:var(--color-muted)]">{persona.role}</p>
      <p className="type-body mt-3 text-sm">{persona.benefit}</p>
    </article>
  );
}
