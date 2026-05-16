import type { HTMLAttributes, ReactNode } from "react";

// Badge minimaliste avec slot icône optionnel. 2 styles :
//
//   variant="soft" (défaut) — fond pastel + texte coloré, look Linear/
//     Vercel. Bon pour catégoriser (LLMs, types de prompt, blog tags).
//
//   variant="solid" (refs Kree8 2026-05-16) — fond blanc + ombre douce
//     + icône dans un petit container coloré à gauche. Bon pour les
//     status (Pending / Submitted / Success / Failed / Expired).
//
// Le tone reste partagé entre les 2 variants pour pouvoir switcher sans
// changer le mapping sémantique.

type Tone =
  | "neutral"
  | "success"
  | "warning"
  | "error"
  | "accent"
  | "blue"
  | "green"
  | "orange"
  | "purple"
  | "pink"
  | "yellow";

type Variant = "soft" | "solid";

const softToneClass: Record<Tone, string> = {
  neutral: "bg-[color:var(--color-gray-100)] text-[color:var(--color-gray-700)]",
  success: "bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]",
  warning: "bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]",
  error: "bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]",
  accent: "bg-[color:var(--color-accent-faint)] text-[color:var(--color-accent)]",
  blue: "bg-[color:var(--color-blue-bg)] text-[color:var(--color-blue)]",
  green: "bg-[color:var(--color-green-bg)] text-[color:var(--color-green)]",
  orange: "bg-[color:var(--color-orange-bg)] text-[color:var(--color-orange)]",
  purple: "bg-[color:var(--color-purple-bg)] text-[color:var(--color-purple)]",
  pink: "bg-[color:var(--color-pink-bg)] text-[color:var(--color-pink)]",
  yellow: "bg-[color:var(--color-yellow-bg)] text-[color:var(--color-yellow)]",
};

// Texte hue saturé sur fond blanc (variant solid).
const solidToneText: Record<Tone, string> = {
  neutral: "text-[color:var(--color-gray-700)]",
  success: "text-[color:var(--color-success)]",
  warning: "text-[color:var(--color-warning)]",
  error: "text-[color:var(--color-error)]",
  accent: "text-[color:var(--color-accent)]",
  blue: "text-[color:var(--color-blue)]",
  green: "text-[color:var(--color-green)]",
  orange: "text-[color:var(--color-orange)]",
  purple: "text-[color:var(--color-purple)]",
  pink: "text-[color:var(--color-pink)]",
  yellow: "text-[color:var(--color-yellow)]",
};

// Container icône coloré gauche (variant solid). Fond = pastel, icône
// elle-même reste blanche/transparente — l'appelant pose son <Icon />.
const solidIconContainer: Record<Tone, string> = {
  neutral: "bg-[color:var(--color-gray-200)] text-[color:var(--color-gray-600)]",
  success: "bg-[color:var(--color-success)] text-white",
  warning: "bg-[color:var(--color-warning)] text-white",
  error: "bg-[color:var(--color-error)] text-white",
  accent: "bg-[color:var(--color-accent)] text-white",
  blue: "bg-[color:var(--color-blue)] text-white",
  green: "bg-[color:var(--color-green)] text-white",
  orange: "bg-[color:var(--color-orange)] text-white",
  purple: "bg-[color:var(--color-purple)] text-white",
  pink: "bg-[color:var(--color-pink)] text-white",
  yellow: "bg-[color:var(--color-yellow)] text-white",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  /** "soft" = pastel bg + colored text. "solid" = white bg + colored icon container. */
  variant?: Variant;
  /** Slot icône à gauche. L'appelant fixe la taille (ex : `<Bot size={12} />`). */
  icon?: ReactNode;
}

export function Badge({
  tone = "neutral",
  variant = "soft",
  icon,
  className = "",
  children,
  ...props
}: BadgeProps) {
  if (variant === "solid") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-white py-1 pl-1 pr-3 text-xs font-medium shadow-[var(--shadow-md)] ${solidToneText[tone]} ${className}`}
        {...props}
      >
        {icon && (
          <span
            className={`flex shrink-0 size-5 items-center justify-center rounded-full ${solidIconContainer[tone]}`}
          >
            {icon}
          </span>
        )}
        {children}
      </span>
    );
  }

  // soft (défaut)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-medium ${softToneClass[tone]} ${className}`}
      {...props}
    >
      {icon && <span className="flex shrink-0 items-center">{icon}</span>}
      {children}
    </span>
  );
}
