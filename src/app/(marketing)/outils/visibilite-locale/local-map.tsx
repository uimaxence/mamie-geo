"use client";

import { useEffect, useState } from "react";
import { Check, MapPin, X } from "lucide-react";
import type { CityVisibility } from "@/lib/local-map/types";

// La « carte » qui s'allume : ville principale au centre, villes autour
// en satellites reliés par des traits, chacune verte (l'IA te recommande)
// ou rouge (un concurrent à ta place). Rendu en HTML positionné en % +
// SVG pour les liens → responsive, et révélation animée des nœuds.

const SATELLITE_RADIUS = 37; // % du demi-côté
const START_ANGLE = -90; // premier satellite en haut

interface Pos {
  x: number;
  y: number;
}

function satellitePositions(count: number): Pos[] {
  if (count === 0) return [];
  return Array.from({ length: count }, (_, i) => {
    const angle = ((START_ANGLE + (i * 360) / count) * Math.PI) / 180;
    return {
      x: 50 + SATELLITE_RADIUS * Math.cos(angle),
      y: 50 + SATELLITE_RADIUS * Math.sin(angle),
    };
  });
}

export function LocalMap({ cities, brand }: { cities: CityVisibility[]; brand: string }) {
  const [mounted, setMounted] = useState(false);
  // Déclenche la révélation animée des nœuds après le 1er rendu.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const [main, ...satellites] = cities;
  const positions = satellitePositions(satellites.length);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px]">
      {/* Liens centre → satellites (couleur = verdict de la ville). */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full"
        aria-hidden
      >
        {satellites.map((city, i) => {
          const p = positions[i]!;
          return (
            <line
              key={city.name}
              x1={50}
              y1={50}
              x2={p.x}
              y2={p.y}
              stroke={city.recommended ? "var(--color-success)" : "var(--color-error)"}
              strokeWidth={0.5}
              strokeOpacity={mounted ? 0.35 : 0}
              style={{
                transition: "stroke-opacity 600ms ease",
                transitionDelay: `${200 + i * 120}ms`,
              }}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>

      {/* Nœud central : ta marque / ta ville. */}
      {main && (
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={{ left: "50%", top: "50%" }}
        >
          <div className="flex flex-col items-center gap-1 rounded-[var(--radius-lg)] border-2 border-[color:var(--color-ink)] bg-white px-4 py-2.5 text-center shadow-[var(--shadow-md)]">
            <span className="inline-flex items-center gap-1 type-eyebrow">
              <MapPin size={11} /> {main.name}
            </span>
            <span className="max-w-[7rem] truncate text-sm font-semibold text-[color:var(--color-ink)]">
              {brand}
            </span>
          </div>
        </div>
      )}

      {/* Satellites : villes autour. */}
      {satellites.map((city, i) => {
        const p = positions[i]!;
        return (
          <div
            key={city.name}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              opacity: mounted ? 1 : 0,
              transform: `translate(-50%, -50%) scale(${mounted ? 1 : 0.8})`,
              transition: "opacity 500ms ease, transform 500ms ease",
              transitionDelay: `${300 + i * 120}ms`,
            }}
          >
            <CityNode city={city} />
          </div>
        );
      })}
    </div>
  );
}

function CityNode({ city }: { city: CityVisibility }) {
  const good = city.recommended;
  return (
    <div
      className={`flex items-center gap-1.5 rounded-[var(--radius-pill)] border bg-white px-3 py-1.5 shadow-[var(--shadow-sm)] ${
        good ? "border-[color:var(--color-success)]/40" : "border-[color:var(--color-error)]/40"
      }`}
    >
      <span
        className={`flex size-4 shrink-0 items-center justify-center rounded-full ${
          good ? "bg-[color:var(--color-success)]" : "bg-[color:var(--color-error)]"
        }`}
      >
        {good ? (
          <Check size={10} strokeWidth={3} className="text-white" />
        ) : (
          <X size={10} strokeWidth={3} className="text-white" />
        )}
      </span>
      <span className="whitespace-nowrap text-xs font-medium text-[color:var(--color-ink)]">
        {city.name}
      </span>
    </div>
  );
}
