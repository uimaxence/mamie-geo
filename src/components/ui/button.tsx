import { Sparkles } from "lucide-react";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";

// Bouton primitif, direction designme.agency / taap.it (cf. doc 10
// § Direction actée 2026-05-11). CTA principal = noir plein arrondi
// pill, secondaire = outline gris, ghost = transparent. Le bleu brand
// `#329cff` (variant `accent`, pivot terracotta→bleu du 2026-06-03)
// ne sert plus pour les CTAs principaux — réservé aux cas marginaux.
//
// Variant `ai` (ajouté 2026-05-16, refonte gradient 2026-06-03) :
// dégradé bleu brand → purple → pink + glow externe. Réservé aux
// actions IA (Suggérer, Ask AI, audit IA…).
// L'icône Sparkles est injectée automatiquement à gauche.
//
// Tous les boutons sont en `rounded-pill` (full radius) pour matcher
// le langage des refs.

type Variant = "primary" | "secondary" | "ghost" | "accent" | "ai";
type Size = "md" | "sm" | "lg";

const variantClass: Record<Variant, string> = {
  primary:
    "button-shape bg-[color:var(--color-ink)] text-white hover:bg-[color:var(--color-gray-800)] border-[color:var(--color-ink)] no-underline",
  secondary:
    "button-shape bg-white text-[color:var(--color-ink)] border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-gray-50)] no-underline",
  ghost:
    "bg-transparent text-[color:var(--color-ink)] border-transparent hover:bg-[color:var(--color-gray-100)] no-underline",
  accent:
    "button-shape bg-[color:var(--color-accent)] text-white hover:bg-[color:var(--color-accent-dim)] border-[color:var(--color-accent)] no-underline",
  // AI, utilise sa propre classe `button-ai-shape` (cf. globals.css)
  // qui pose le dégradé, le glow externe et le hover. Pas de button-shape
  // ici (sinon les inset shadows neutres écrasent le rendu doux).
  ai: "button-ai-shape no-underline",
};

const sizeClass: Record<Size, string> = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-5 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

const baseClass =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-pill)] border font-medium disabled:cursor-not-allowed disabled:opacity-50";

function buildContent(variant: Variant, children: ReactNode): ReactNode {
  if (variant !== "ai") return children;
  // Inject Sparkles icône à gauche pour le variant `ai`, pas besoin
  // que l'appelant le pense. La taille suit la baseline du texte.
  return (
    <>
      <Sparkles size={14} strokeWidth={2.2} aria-hidden="true" />
      {children}
    </>
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className = "", children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`${baseClass} ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...props}
    >
      {buildContent(variant, children)}
    </button>
  );
});

export interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
  size?: Size;
}

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(function LinkButton(
  { variant = "primary", size = "md", className = "", children, ...props },
  ref,
) {
  return (
    <a
      ref={ref}
      className={`${baseClass} ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...props}
    >
      {buildContent(variant, children)}
    </a>
  );
});
