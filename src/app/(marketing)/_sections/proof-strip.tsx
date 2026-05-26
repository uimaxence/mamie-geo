import { Bot, ListChecks, Timer } from "lucide-react";
import { Section, Stat } from "@/components/ui";

// Bande de "social proof honnête" : 3 chiffres-clés du produit qu'on
// peut prouver factuellement, sans inventer de "200+ marques nous font
// confiance" qu'on ne peut pas justifier en V0. Cf. plan V0 P0.4
// (2026-05-26) — bascule en wall of love quand 3+ vrais clients
// pilote acceptent d'apparaître nommément.

const PROOF_STATS = [
  {
    label: "IA trackées",
    value: "5",
    hint: "ChatGPT · Claude · Perplexity · Gemini · Le Chat",
    icon: Bot,
    iconTone: "blue" as const,
  },
  {
    label: "Checks gratuits",
    value: "30+",
    hint: "SEO + GEO + A11y + Perf · sans inscription",
    icon: ListChecks,
    iconTone: "accent" as const,
  },
  {
    label: "Premier rapport",
    value: "10 min",
    hint: "de l'inscription au premier insight",
    icon: Timer,
    iconTone: "purple" as const,
  },
];

// Variant `default` (blanc) plutôt que `tinted` malgré le plan
// d'origine : LLMBadges juste avant est déjà tinted → deux tinted
// consécutifs cassent le rythme visuel. Blanc ici alterne proprement.
export function ProofStrip() {
  return (
    <Section variant="default" pad="lg" aria-label="Chiffres-clés produit">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {PROOF_STATS.map((stat) => (
          <Stat key={stat.label} {...stat} />
        ))}
      </div>
    </Section>
  );
}
