import { ShieldCheck, MapPin, Lock, XCircle } from "lucide-react";
import { Section } from "@/components/ui";
import { LLMPill, LLM_KEYS_ORDER } from "@/components/marketing/llm-pill";

// Bande de réassurance placée juste sous le hero (P0.2 plan V0 belle home,
// 2026-05-26). Lève les 4 objections les plus communes en un coup d'œil :
// garantie, hébergement, compliance, friction de sortie.
//
// Sous-bandeau "Fonctionne avec [5 LLMs]" qui anticipe ce que la section
// <LLMBadges> détaillera plus bas — ici juste un signal de présence
// multi-LLM immédiatement après le hero, sans devoir scroller.

const TRUST_ITEMS = [
  { Icon: ShieldCheck, label: "Garantie 14j remboursement" },
  { Icon: MapPin, label: "Hébergé en Europe 🇪🇺" },
  { Icon: Lock, label: "RGPD natif" },
  { Icon: XCircle, label: "Annulable en 1 clic" },
] as const;

export function TrustStrip() {
  return (
    <Section variant="tinted" pad="md" aria-label="Garanties et compatibilité">
      <div className="flex flex-col items-center gap-6">
        {/* Ligne 1 : 4 garanties avec icônes Lucide.
         * Sur mobile, stack en 2×2 grille pour rester lisible (gap-y-3). */}
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[color:var(--color-ink-soft)]">
          {TRUST_ITEMS.map(({ Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon size={16} strokeWidth={2} className="text-[color:var(--color-ink)]" />
              <span className="type-meta">{label}</span>
            </li>
          ))}
        </ul>

        {/* Ligne 2 : compatibility multi-LLM. Réutilise <LLMPill> existant
         * en taille sm pour rester sobre. Rotations conservées (effet sticker). */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <span className="type-meta mr-1 text-[color:var(--color-muted)]">Fonctionne avec</span>
          {LLM_KEYS_ORDER.map((llm) => (
            <LLMPill key={llm} llm={llm} size="sm" />
          ))}
        </div>
      </div>
    </Section>
  );
}
