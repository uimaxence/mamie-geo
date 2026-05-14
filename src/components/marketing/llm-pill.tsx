import { Bot, Cat, MessageCircle, Search, Sparkles, type LucideIcon } from "lucide-react";

// Pastille LLM réutilisable — source de vérité unique pour le badge
// nommé d'un LLM. Utilisée dans :
//   - <LLMBadges /> (section home « Les 5 IA »)
//   - <PourquoiMaintenant /> (section scroll-fill, inline dans le texte)
//   - Tout futur écran qui veut citer un LLM avec son identité visuelle
//
// Rotation légère par LLM (déterministe, pas random) pour donner un
// effet « sticker » dynamique sans casser la lisibilité. Toujours subtle
// (max ±3deg).

export type LLMKey = "chatgpt" | "claude" | "perplexity" | "gemini" | "lechat";

interface LLMConfig {
  name: string;
  /** Couleur token Tailwind pastel (bg + text) */
  toneClass: string;
  Icon: LucideIcon;
  /** Rotation déterministe en degrés, ±3 max */
  rotateDeg: number;
}

const LLM_CONFIG: Record<LLMKey, LLMConfig> = {
  chatgpt: {
    name: "ChatGPT",
    toneClass: "bg-[color:var(--color-green-bg)] text-[color:var(--color-green)]",
    Icon: MessageCircle,
    rotateDeg: -2,
  },
  claude: {
    name: "Claude",
    toneClass: "bg-[color:var(--color-purple-bg)] text-[color:var(--color-purple)]",
    Icon: Bot,
    rotateDeg: 3,
  },
  perplexity: {
    name: "Perplexity",
    toneClass: "bg-[color:var(--color-blue-bg)] text-[color:var(--color-blue)]",
    Icon: Search,
    rotateDeg: -1,
  },
  gemini: {
    name: "Gemini",
    toneClass: "bg-[color:var(--color-orange-bg)] text-[color:var(--color-orange)]",
    Icon: Sparkles,
    rotateDeg: 2,
  },
  lechat: {
    name: "Le Chat",
    toneClass: "bg-[color:var(--color-pink-bg)] text-[color:var(--color-pink)]",
    Icon: Cat,
    rotateDeg: -3,
  },
};

export const LLM_KEYS_ORDER: ReadonlyArray<LLMKey> = [
  "chatgpt",
  "claude",
  "perplexity",
  "gemini",
  "lechat",
] as const;

export function LLMPill({
  llm,
  size = "md",
  rotate = true,
  className = "",
}: {
  llm: LLMKey;
  size?: "sm" | "md" | "lg";
  rotate?: boolean;
  className?: string;
}) {
  const config = LLM_CONFIG[llm];
  const sizeClass =
    size === "sm"
      ? "px-2 py-0.5 text-[11px] gap-1"
      : size === "lg"
        ? "px-4 py-1.5 text-2xl sm:text-3xl gap-2.5 font-semibold tracking-tight"
        : "px-3 py-1 text-sm gap-1.5";
  const iconSize = size === "sm" ? 11 : size === "lg" ? 22 : 13;
  return (
    <span
      className={`inline-flex items-center rounded-[var(--radius-pill)] font-medium align-middle ${sizeClass} ${config.toneClass} ${className}`}
      style={rotate ? { transform: `rotate(${config.rotateDeg}deg)` } : undefined}
    >
      <config.Icon size={iconSize} strokeWidth={2.2} />
      {config.name}
    </span>
  );
}

/** Petit utilitaire pour accéder à la config (par ex. pour le rotator hero). */
export function getLLMConfig(llm: LLMKey): LLMConfig {
  return LLM_CONFIG[llm];
}
