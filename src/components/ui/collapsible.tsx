"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

// Radix Collapsible, wrapper minimal. On laisse l'utilisateur appliquer
// son className sur Trigger/Content via les props. Pas de style imposé
// ici parce que les usages varient trop (row de table, card, sidebar…).
//
// Pattern : <Collapsible> <CollapsibleTrigger asChild>…</CollapsibleTrigger>
//          <CollapsibleContent>…</CollapsibleContent> </Collapsible>

export const Collapsible = CollapsiblePrimitive.Root;
export const CollapsibleTrigger = CollapsiblePrimitive.Trigger;
export const CollapsibleContent = CollapsiblePrimitive.Content;
