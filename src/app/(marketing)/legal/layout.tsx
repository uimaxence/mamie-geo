import Link from "next/link";
import { Section } from "@/components/ui";
import { MarketingFooter } from "../_sections/marketing-footer";
import { MarketingHeader } from "../_sections/marketing-header";

// Layout commun des pages /legal/* (CGU, Privacy, Mentions, DPA).
// Pose le header/footer marketing autour du contenu MDX + navigation
// inter-pages légales en haut.

const LEGAL_NAV = [
  { href: "/legal/cgu", label: "CGU" },
  { href: "/legal/privacy", label: "Confidentialité" },
  { href: "/legal/mentions", label: "Mentions légales" },
  { href: "/legal/dpa", label: "DPA" },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingHeader />

      <Section pad="lg">
        <div className="mx-auto max-w-3xl">
          <span className="type-eyebrow">Documents juridiques</span>
          <nav className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-b border-[color:var(--color-border)] pb-4">
            {LEGAL_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </Section>

      <Section pad="md">
        <div className="mx-auto max-w-3xl">{children}</div>
      </Section>

      <MarketingFooter />
    </>
  );
}
