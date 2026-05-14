"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import { cn } from "@/lib/utils";

// Radix Tabs avec indicator underline 2px noir sur l'onglet actif.
// Style éditorial sobre — pas de pill bg, juste une barre sous l'onglet.

export const Tabs = TabsPrimitive.Root;

export const TabsList = forwardRef<
  ElementRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(function TabsList({ className, ...props }, ref) {
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "flex items-center gap-6 border-b border-[color:var(--color-border)]",
        className,
      )}
      {...props}
    />
  );
});

export const TabsTrigger = forwardRef<
  ElementRef<typeof TabsPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(function TabsTrigger({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "relative -mb-px inline-flex items-center gap-2 border-b-2 border-transparent px-0.5 pb-3 pt-1 text-sm font-medium transition-colors",
        "text-[color:var(--color-muted)] hover:text-[color:var(--color-ink-soft)]",
        "data-[state=active]:border-[color:var(--color-ink)] data-[state=active]:text-[color:var(--color-ink)]",
        "disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)] focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    />
  );
});

export const TabsContent = forwardRef<
  ElementRef<typeof TabsPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(function TabsContent({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        "mt-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)] focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    />
  );
});
