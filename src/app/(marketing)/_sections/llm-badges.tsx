import { Section } from "@/components/ui";
import { LLM_KEYS_ORDER, LLMPill } from "@/components/marketing/llm-pill";

// Les 5 LLMs trackés. Source de vérité visuelle = composant <LLMPill>
// (cf. src/components/marketing/llm-pill.tsx). Gap resserré + rotations
// légères déterministes par LLM pour un effet « stickers » dynamique
// sans casser la lisibilité (cf. doc 09 § 2026-05-13).

export function LLMBadges() {
  return (
    <Section variant="tinted" pad="lg">
      <div className="mx-auto max-w-4xl text-center">
        <span className="type-eyebrow">Sources trackées dès le jour J</span>
        <h2 className="type-h2 mt-3">
          Les 5 IA qui répondent aux questions de tes futurs clients.
        </h2>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
          {LLM_KEYS_ORDER.map((llm) => (
            <LLMPill key={llm} llm={llm} />
          ))}
        </div>
      </div>
    </Section>
  );
}
