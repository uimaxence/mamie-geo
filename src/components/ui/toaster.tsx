"use client";

import { Toaster as SonnerToaster } from "sonner";

// Wrapper sonner avec config alignée tokens custom.
// Mount unique dans (app)/layout.tsx. Helper toast() reste importable
// depuis "sonner" directement.

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      closeButton
      richColors={false}
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            "rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white text-[color:var(--color-ink)] shadow-[var(--shadow-md)]",
          title: "text-sm font-semibold",
          description: "text-sm text-[color:var(--color-ink-soft)]",
          actionButton:
            "bg-[color:var(--color-ink)] text-white rounded-[var(--radius-pill)] px-3 py-1.5 text-xs",
          cancelButton:
            "text-[color:var(--color-muted)] rounded-[var(--radius-pill)] px-3 py-1.5 text-xs",
        },
      }}
    />
  );
}

export { toast } from "sonner";
