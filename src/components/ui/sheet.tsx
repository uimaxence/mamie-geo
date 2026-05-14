"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import { cn } from "@/lib/utils";

// Sheet = Drawer mobile (slide-in left). Variante Radix Dialog avec
// animations slide + position fixed gauche full-height. Utilisé pour la
// sidebar collapsible < md.

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(function SheetOverlay({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm",
        "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
        className,
      )}
      {...props}
    />
  );
});

export const SheetContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(function SheetContent({ className, children, ...props }, ref) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-72 flex-col border-r border-[color:var(--color-border)] bg-white p-4",
          "shadow-[var(--shadow-lg)] focus:outline-none",
          "data-[state=open]:animate-slide-in-left data-[state=closed]:animate-slide-out-left",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label="Fermer le menu"
          className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-[var(--radius-md)] text-[color:var(--color-muted)] transition hover:bg-[color:var(--color-gray-100)] hover:text-[color:var(--color-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)]"
        >
          <X size={16} strokeWidth={2} />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </SheetPortal>
  );
});
