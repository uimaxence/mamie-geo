// Vagues organiques décoratives — signature carousel Mamie GEO.
// SVG inline (compatibles html-to-image), 8 arcs concentriques de rayons
// 80 → 332 stroke 3.5px, positionnés en absolute hors-canvas pour ne
// montrer que l'arc visible dans un coin.

interface WavesDecorationProps {
  position: "top-right" | "bottom-left";
  tint: string;
  opacity?: number;
}

export function WavesDecoration({ position, tint, opacity = 0.55 }: WavesDecorationProps) {
  const isTopRight = position === "top-right";
  return (
    <svg
      width={620}
      height={620}
      viewBox="0 0 620 620"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{
        position: "absolute",
        top: isTopRight ? -180 : "auto",
        right: isTopRight ? -180 : "auto",
        bottom: isTopRight ? "auto" : -180,
        left: isTopRight ? "auto" : -180,
        pointerEvents: "none",
        opacity,
        transform: isTopRight ? "rotate(0deg)" : "rotate(180deg)",
      }}
    >
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const r = 80 + i * 36;
        return (
          <path
            key={i}
            d={`M ${310 - r} 310 a ${r} ${r} 0 1 1 ${r * 2} 0`}
            stroke={tint}
            strokeWidth={3.5}
            fill="none"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}
