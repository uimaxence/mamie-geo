import type { Metadata } from "next";
import { Bot, Search, Sparkles, Wrench } from "lucide-react";
import { Badge, Section } from "@/components/ui";
import { MarketingFooter } from "../../_sections/marketing-footer";
import { MarketingHeader } from "../../_sections/marketing-header";
import { AuditForm } from "./audit-form";

export const metadata: Metadata = {
  title: "Audit technique gratuit, SEO + GEO sans IA",
  description:
    "Audit technique de ton site en 10 secondes : 30+ checks SEO classique + signaux GEO (FAQPage, llms.txt, E-E-A-T) + Core Web Vitals. Gratuit, sans inscription, sans IA.",
};

// Lead magnet additionnel, audit technique sans LLM. Différenciateur
// vs Screaming Frog / Lighthouse seul : checks GEO-specific (FAQPage
// JSON-LD, llms.txt, E-E-A-T signals) + recommandations actionnables
// rédigées à la main pour chaque finding.

export default function AuditTechniquePage() {
  return (
    <>
      <MarketingHeader />

      <Section pad="xl">
        <div className="mx-auto max-w-3xl text-center">
          <Badge tone="accent" className="mb-6">
            Outil gratuit · sans inscription
          </Badge>
          <h1 className="type-display">
            Audit technique de ton site, <strong className="font-bold">en 10 secondes</strong>.
          </h1>
          <p className="type-body-lg mt-6">
            30+ checks SEO + GEO + Core Web Vitals, avec recommandations actionnables. Sans IA, sans
            blabla. Score global + actions concrètes pour améliorer ta visibilité dans Google ET
            dans les LLM.
          </p>
        </div>

        <div className="mt-12">
          <AuditForm />
        </div>
      </Section>

      <Section variant="tinted" pad="xl">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <span className="type-eyebrow">Ce qu&apos;on vérifie</span>
            <h2 className="type-h1 mt-3">4 axes, 30+ signaux concrets.</h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            <AxisCard
              tone="blue"
              Icon={Search}
              title="SEO classique"
              bullets={[
                "Title + meta description (présence, longueur)",
                "Canonical, hiérarchie headings, lang",
                "Sitemap.xml + robots.txt",
                "Meta robots noindex/nofollow détectés",
              ]}
            />
            <AxisCard
              tone="purple"
              Icon={Sparkles}
              title="GEO (visibilité IA)"
              bullets={[
                "JSON-LD Article + FAQPage (boost LLM majeur)",
                "JSON-LD Organization + Person (E-E-A-T)",
                "llms.txt (nouveau standard LLM)",
                "Author info + dates publication visibles",
              ]}
              highlight
            />
            <AxisCard
              tone="green"
              Icon={Bot}
              title="Accessibilité + sécurité"
              bullets={[
                "Alt sur images, lang, skip-link",
                "HTTPS forcé, HSTS, CSP",
                "Mobile-friendly viewport",
              ]}
            />
            <AxisCard
              tone="orange"
              Icon={Wrench}
              title="Performance (Core Web Vitals)"
              bullets={[
                "LCP, CLS, INP via Google PageSpeed Insights",
                "Taille HTML, scripts externes, compression",
                "Headers cache, optimisations basiques",
              ]}
            />
          </div>
        </div>
      </Section>

      <Section pad="xl">
        <div className="mx-auto max-w-3xl">
          <span className="type-eyebrow">Pourquoi sans IA ?</span>
          <h2 className="type-h1 mt-3">Précision &gt; magie.</h2>
          <p className="type-body-lg mt-6 max-w-prose">
            Les outils SEO classiques utilisent souvent des LLM pour générer leurs recommandations.
            Résultat : phrases génériques (« améliore ton title »), pas d&apos;exemples concrets,
            parfois faux.
          </p>
          <p className="type-body-lg mt-4 max-w-prose">
            Chez Mamie GEO, chaque recommandation est écrite par un humain, du HTML exact à coller,
            l&apos;impact réel sur ton ranking GEO, l&apos;effort estimé. Pas de coût LLM = audit
            100 % gratuit pour toujours.
          </p>
          <p className="type-body-lg mt-4 max-w-prose">
            Bonus : on est probablement le seul outil au monde qui check spécifiquement les signaux
            GEO (FAQPage JSON-LD, llms.txt, E-E-A-T) que les LLM regardent pour décider de citer ta
            marque.
          </p>
        </div>
      </Section>

      <MarketingFooter />
    </>
  );
}

interface AxisCardProps {
  tone: "blue" | "purple" | "green" | "orange";
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  title: string;
  bullets: string[];
  highlight?: boolean;
}

function AxisCard({ tone, Icon, title, bullets, highlight }: AxisCardProps) {
  const borderClass = highlight
    ? "border-[color:var(--color-ink)] border-2"
    : "border-[color:var(--color-border)]";
  return (
    <div className={`rounded-[var(--radius-xl)] border bg-white p-6 ${borderClass}`}>
      <div className="flex items-center gap-3">
        <span
          className={`flex size-9 items-center justify-center rounded-[var(--radius-pill)] shadow-[var(--shadow-sm)] ${
            tone === "blue"
              ? "bg-[color:var(--color-blue-bg)] text-[color:var(--color-blue)]"
              : tone === "purple"
                ? "bg-[color:var(--color-purple-bg)] text-[color:var(--color-purple)]"
                : tone === "green"
                  ? "bg-[color:var(--color-green-bg)] text-[color:var(--color-green)]"
                  : "bg-[color:var(--color-orange-bg)] text-[color:var(--color-orange)]"
          }`}
        >
          <Icon size={16} strokeWidth={2} />
        </span>
        <h3 className="type-h3">{title}</h3>
        {highlight && <Badge tone="accent">notre différenciateur</Badge>}
      </div>
      <ul className="mt-4 flex flex-col gap-2">
        {bullets.map((b) => (
          <li key={b} className="text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
            · {b}
          </li>
        ))}
      </ul>
    </div>
  );
}
