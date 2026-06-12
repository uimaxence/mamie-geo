import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Globe, Sparkles, Wrench } from "lucide-react";
import { Badge, Section } from "@/components/ui";
import { MarketingFooter } from "../_sections/marketing-footer";
import { MarketingHeader } from "../_sections/marketing-header";

export const metadata: Metadata = {
  title: "Outils gratuits — visibilité IA, comparateurs, audit technique",
  description:
    "Trois outils gratuits pour mesurer ta visibilité dans les IA : scan de présence sur les comparateurs, audit complet ChatGPT/Claude/Perplexity/Gemini/Le Chat, audit technique SEO + GEO en 10 secondes.",
  alternates: { canonical: "/outils" },
};

// Hub des lead magnets, linké depuis la nav « Outils gratuits ».
// Chaque outil garde sa page dédiée (SEO) ; ce hub sert de vitrine et
// d'entrée mémorisable à partager (LinkedIn, communautés).

interface Tool {
  href: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  isNew?: boolean;
  title: string;
  description: string;
  bullets: string[];
  meta: string;
}

const TOOLS: Tool[] = [
  {
    href: "/outils/comparateurs",
    Icon: Globe,
    isNew: true,
    title: "Scan comparateurs",
    description:
      "32 % des sources citées par les IA sont des comparateurs. Donne ton site, on détecte ta marque, ton secteur et ta zone, et on vérifie ta présence sur les sites que les IA lisent.",
    bullets: [
      "Site + email, le reste est détecté automatiquement",
      "Verdict présent/absent par site, avec la page trouvée",
      "Plan d'action pour être inclus là où tu manques",
    ],
    meta: "~15 secondes · résultat immédiat",
  },
  {
    href: "/outils/test-visibilite-ia",
    Icon: Sparkles,
    title: "Test de visibilité IA",
    description:
      "3 vraies questions de ton secteur posées à une IA en direct : tu vois si elle te cite ou si elle recommande tes concurrents à ta place.",
    bullets: [
      "Site + email, le reste est détecté automatiquement",
      "Verdict immédiat : cité ou pas, à quelle position",
      "Récap par email + appel découverte avec le fondateur si tu veux déléguer",
    ],
    meta: "~20 secondes · IA interrogée en direct",
  },
  {
    href: "/outils/audit-technique",
    Icon: Wrench,
    title: "Audit technique SEO + GEO",
    description:
      "30+ checks techniques de ton site : SEO classique, signaux GEO (FAQPage, llms.txt, E-E-A-T) et Core Web Vitals. Avec le HTML exact à coller pour chaque correction.",
    bullets: [
      "Score global + 4 sous-scores",
      "Checks GEO que personne d'autre ne fait",
      "Recommandations écrites à la main, pas par une IA",
    ],
    meta: "~10 secondes · sans inscription",
  },
];

export default function OutilsPage() {
  return (
    <>
      <MarketingHeader />

      <Section pad="xl">
        <div className="mx-auto max-w-3xl text-center">
          <Badge tone="accent" className="mb-6">
            Gratuit · sans carte bancaire
          </Badge>
          <h1 className="type-display">
            Trois outils gratuits pour <strong className="font-bold">mesurer ta visibilité IA</strong>.
          </h1>
          <p className="type-body-lg mt-6">
            Les IA recommandent déjà des marques à tes clients. Ces outils te montrent où tu en es
            — avant de décider si tu veux suivre ça tous les jours.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          {TOOLS.map((tool) => (
            <ToolCard key={tool.href} tool={tool} />
          ))}
        </div>
      </Section>

      <MarketingFooter />
    </>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const { href, Icon, isNew, title, description, bullets, meta } = tool;
  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-[var(--radius-xl)] border bg-white p-6 transition hover:shadow-[var(--shadow-md)] ${
        isNew ? "border-2 border-[color:var(--color-ink)]" : "border-[color:var(--color-border)]"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-[var(--radius-pill)] bg-[color:var(--color-accent-faint)] text-[color:var(--color-accent)] shadow-[var(--shadow-sm)]">
          <Icon size={16} strokeWidth={2} />
        </span>
        {isNew && <Badge tone="accent">Nouveau</Badge>}
      </div>
      <h2 className="type-h3 mt-4">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
        {description}
      </p>
      <ul className="mt-4 flex flex-col gap-2">
        {bullets.map((b) => (
          <li key={b} className="text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
            · {b}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex items-center justify-between pt-6">
        <span className="type-meta">{meta}</span>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-[color:var(--color-ink)] transition group-hover:gap-2">
          Essayer <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}
