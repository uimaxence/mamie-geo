import { forwardRef, type InputHTMLAttributes, type LabelHTMLAttributes } from "react";

// Input éditorial : bord chaud subtil, focus ring terracotta. Pas de
// rounded prononcé, pas d'ombre, on reste dans la grammaire imprimée.

const inputClass =
  "w-full rounded-[var(--radius-md)] border border-[color:var(--color-warm-gray-soft)] bg-white px-3 py-2 text-base text-[color:var(--color-ink)] placeholder:text-[color:var(--color-warm-gray)] outline-none transition focus:border-[color:var(--color-terracotta)] focus:ring-2 focus:ring-[color:var(--color-terracotta)]/20 disabled:opacity-60";

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

// Field = Label + slot pour Input + hint/error optionnels.
// Usage : <Field label="Email" hint="On envoie un magic-link"><Input ... /></Field>
export function Field({ label, hint, error, className = "", children, ...props }: FieldProps) {
  return (
    <label className={`flex flex-col gap-2 ${className}`} {...props}>
      <span className="text-sm font-medium text-[color:var(--color-ink)]">{label}</span>
      {children}
      {hint && !error && <span className="type-meta">{hint}</span>}
      {error && <span className="text-xs text-[color:var(--color-error)]">{error}</span>}
    </label>
  );
}
