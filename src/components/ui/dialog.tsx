"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

// Wrapper Radix Dialog stylisé tokens custom. Focus trap + ESC + a11y
// gérés par Radix. Overlay sombre semi-opaque + content card-radius-xl
// centré. Animation fade + zoom subtile (cf. globals.css keyframes).

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;

export const DialogOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(function DialogOverlay({ className, ...props }, ref) {
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

export const DialogContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showClose?: boolean;
  }
>(function DialogContent({ className, children, showClose = true, ...props }, ref) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
          "rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6",
          "shadow-[var(--shadow-lg)] focus:outline-none",
          "data-[state=open]:animate-zoom-in data-[state=closed]:animate-zoom-out",
          className,
        )}
        {...props}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close
            aria-label="Fermer"
            className="absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-[var(--radius-md)] text-[color:var(--color-muted)] transition hover:bg-[color:var(--color-gray-100)] hover:text-[color:var(--color-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)] focus-visible:ring-offset-2"
          >
            <X size={16} strokeWidth={2} />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});

export function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

export const DialogTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function DialogTitle({ className, ...props }, ref) {
  return <DialogPrimitive.Title ref={ref} className={cn("type-h2", className)} {...props} />;
});

export const DialogDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function DialogDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("type-body text-sm", className)}
      {...props}
    />
  );
});
