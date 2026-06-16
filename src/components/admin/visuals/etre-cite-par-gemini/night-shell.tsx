import type { ReactNode } from "react";
import { NightShell as BaseNightShell } from "../_primitives/night-shell";

// Wrapper du shell bleu nuit partagé (promu en _primitives le 2026-06-16)
// qui fige l'eyebrow « GEMINI · GEO ». Les 5 slides du carrousel Gemini
// continuent d'importer NightShell/NIGHT/MONO/BrandMark depuis ce fichier.

export { NIGHT, MONO, BrandMark } from "../_primitives/night-shell";

interface Props {
  index: number;
  total: number;
  children: ReactNode;
  brandLockup?: "header" | "footer";
}

export function NightShell({ index, total, children, brandLockup = "header" }: Props) {
  return (
    <BaseNightShell index={index} total={total} brandLockup={brandLockup} eyebrow="GEMINI · GEO">
      {children}
    </BaseNightShell>
  );
}
