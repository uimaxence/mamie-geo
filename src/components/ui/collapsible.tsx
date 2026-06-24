"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

// Radix Collapsible, wrapper minimal. On laisse l'utilisateur appliquer
// son className sur Trigger/Content via les props. Pas de style imposé
// ici parce que les usages varient trop (row de table, card, sidebar…).
//
// Pattern : <Collapsible> <CollapsibleTrigger asChild>…</CollapsibleTrigger>
//          <CollapsibleContent>…</CollapsibleContent> </Collapsible>
//
// CollapsibleContent anime sa hauteur + un léger fade via les keyframes
// `collapsible-down/up` (globals.css) pilotées par `data-state`. Radix
// expose `--radix-collapsible-content-height` → pas de mesure JS.
// `overflow-hidden` est requis pour que la hauteur clippe le contenu
// pendant le tween. Garde prefers-reduced-motion dans globals.css.

export const Collapsible = CollapsiblePrimitive.Root;
export const CollapsibleTrigger = CollapsiblePrimitive.Trigger;

export function CollapsibleContent({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>) {
  return (
    <CollapsiblePrimitive.Content
      data-slot="collapsible-content"
      className={cn(
        "overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up",
        className,
      )}
      {...props}
    />
  );
}
