import { forwardRef, type InputHTMLAttributes, type LabelHTMLAttributes } from "react";

// Input Airbnb-like : bordure gris-300, focus ring noir (pas de couleur
// d'accent au focus pour rester sobre, l'accent est réservé aux CTAs).

const inputClass =
  "w-full rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-white px-3.5 py-2.5 text-base text-[color:var(--color-ink)] placeholder:text-[color:var(--color-faint)] outline-none transition focus:border-[color:var(--color-ink)] focus:ring-2 focus:ring-[color:var(--color-gray-200)] disabled:opacity-50";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return <input ref={ref} className={`${inputClass} ${className}`} {...props} />;
  },
);

export interface FieldProps extends LabelHTMLAttributes<HTMLLabelElement> {
  label: string;
  hint?: string;
  error?: string;
}

export function Field({ label, hint, error, className = "", children, ...props }: FieldProps) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`} {...props}>
      <span className="text-sm font-medium text-[color:var(--color-ink)]">{label}</span>
      {children}
      {hint && !error && <span className="type-meta">{hint}</span>}
      {error && <span className="text-xs text-[color:var(--color-error)]">{error}</span>}
    </label>
  );
}
