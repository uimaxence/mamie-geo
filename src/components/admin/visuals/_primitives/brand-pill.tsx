import { Logo } from "@/components/marketing/logo";
import { COLORS } from "./tokens";

// Pill brand Mamie GEO — cercle bleu logo + label small caps + wrapper
// pill ink (sur fond clair) ou blanc (sur fond sombre).

interface BrandPillProps {
  /** "dark" = pill ink texte blanc, "light" = pill blanc texte ink. */
  variant?: "dark" | "light";
}

export function BrandPill({ variant = "dark" }: BrandPillProps) {
  const isDark = variant === "dark";
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        padding: "8px 16px 8px 10px",
        background: isDark ? COLORS.ink : COLORS.white,
        borderRadius: 9999,
        color: isDark ? COLORS.white : COLORS.ink,
        boxShadow: isDark ? "none" : "0 2px 8px rgba(10, 10, 10, 0.08)",
      }}
    >
      <span
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: COLORS.blue,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Logo size={14} color={COLORS.white} />
      </span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        Mamie GEO
      </span>
    </div>
  );
}
