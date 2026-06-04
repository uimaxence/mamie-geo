import { COLORS } from "./tokens";

// Tag pill discret en haut à droite, format `01 / 05` en tabular-nums.
// 2 variants : dark (sur fond clair) ou light (sur fond sombre).

interface SlideNumberProps {
  index: number;
  total: number;
  variant?: "dark" | "light";
}

export function SlideNumber({ index, total, variant = "dark" }: SlideNumberProps) {
  const isDark = variant === "dark";
  const bg = isDark ? "rgba(10, 10, 10, 0.06)" : "rgba(255, 255, 255, 0.16)";
  const fg = isDark ? COLORS.ink : COLORS.white;
  const sep = isDark ? COLORS.muted : "rgba(255, 255, 255, 0.55)";
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 14px",
        background: bg,
        borderRadius: 9999,
        color: fg,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.08em",
        fontVariantNumeric: "tabular-nums",
        backdropFilter: "blur(8px)",
      }}
    >
      <span>{String(index).padStart(2, "0")}</span>
      <span style={{ color: sep }}>/</span>
      <span style={{ color: sep }}>{String(total).padStart(2, "0")}</span>
    </div>
  );
}
