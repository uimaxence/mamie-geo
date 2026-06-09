"use client";

import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import { GLOSSARY, type GlossaryTerm } from "@/lib/glossary";
import { cn } from "@/lib/utils";

// Petite icône info + tooltip, à coller à côté d'un label métier
// (ex: "Part de voix") pour expliquer le terme en 1-2 phrases. Le
// tooltip reste hover/focus (Radix gère le clavier), sans clic
// volontaire.
//
// Deux modes :
//   - `term` : pioche la définition dans GLOSSARY (source de vérité)
//   - `definition` : passe une chaîne arbitraire (échappement)

export interface GlossaryInfoProps {
  term?: GlossaryTerm;
  definition?: string;
  /** Override le label aria (par défaut "Définition") */
  ariaLabel?: string;
  /** Taille de l'icône en px. Défaut 12. */
  size?: number;
  className?: string;
}

export function GlossaryInfo({
  term,
  definition,
  ariaLabel = "Définition",
  size = 12,
  className,
}: GlossaryInfoProps) {
  const text = definition ?? (term ? GLOSSARY[term] : undefined);
  if (!text) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full text-[color:var(--color-muted)] transition-colors",
            "hover:text-[color:var(--color-ink)] focus-visible:text-[color:var(--color-ink)] focus-visible:outline-none",
            className,
          )}
        >
          <Info size={size} strokeWidth={2.25} aria-hidden />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-pretty leading-snug" side="top">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

// Inline glossary term : enrobe un mot du texte courant d'un trait
// dotted + tooltip. Utile pour le blog / l'app où on cite un terme
// dans une phrase sans vouloir d'icône séparée.
export function GlossaryTerm({
  term,
  definition,
  children,
  className,
}: {
  term?: GlossaryTerm;
  definition?: string;
  children: ReactNode;
  className?: string;
}) {
  const text = definition ?? (term ? GLOSSARY[term] : undefined);
  if (!text) return <>{children}</>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className={cn(
            "cursor-help underline decoration-dotted decoration-[color:var(--color-border)] underline-offset-2",
            "hover:decoration-[color:var(--color-ink)] focus-visible:decoration-[color:var(--color-ink)] focus-visible:outline-none",
            className,
          )}
        >
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-pretty leading-snug" side="top">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
