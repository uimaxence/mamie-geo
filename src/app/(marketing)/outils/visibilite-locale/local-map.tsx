"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import type { CityVisibility } from "@/lib/local-map/types";

// Vraie carte (Leaflet + tuiles claires CARTO Positron sans labels,
// RGPD-friendly) avec une ZONE colorée autour de chaque ville (vert =
// l'IA te recommande, rouge = un concurrent à ta place) et un point +
// tooltip par ville. Rendu impératif (dynamic import) pour éviter tout
// accès à `window` côté serveur.

const GREEN = "#16a34a";
const RED = "#dc2626";
const INK = "#191919";
const ZONE_RADIUS_M = 18000;

export function LocalMap({ cities, brand }: { cities: CityVisibility[]; brand: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  const geo = cities.filter(
    (c): c is CityVisibility & { lat: number; lng: number } => c.lat !== null && c.lng !== null,
  );

  useEffect(() => {
    if (geo.length === 0 || !containerRef.current) return;
    let cancelled = false;

    void (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        maxZoom: 19,
      }).addTo(map);

      geo.forEach((city, i) => {
        const isMain = i === 0;
        const color = city.recommended ? GREEN : RED;

        // Zone : cercle généreux et doux (chevauchement = territoire).
        L.circle([city.lat, city.lng], {
          radius: ZONE_RADIUS_M,
          stroke: false,
          fillColor: color,
          fillOpacity: 0.12,
        }).addTo(map);

        // Point ville : pastille pleine (centrale = ink + bord blanc).
        const marker = L.circleMarker([city.lat, city.lng], {
          radius: isMain ? 7 : 5,
          color: "#ffffff",
          weight: 2,
          fillColor: isMain ? INK : color,
          fillOpacity: 1,
        }).addTo(map);

        // Label : tooltip permanent (style Leaflet par défaut, propre).
        const label = isMain ? `<strong>${escapeHtml(brand)}</strong>` : escapeHtml(city.name);
        marker.bindTooltip(label, {
          permanent: true,
          direction: "top",
          offset: [0, -6],
          className: "local-map-tip",
        });
      });

      const bounds = L.latLngBounds(geo.map((c) => [c.lat, c.lng] as [number, number]));
      map.fitBounds(bounds.pad(0.3));
      map.setMaxBounds(bounds.pad(1.5));
      setTimeout(() => map.invalidateSize(), 60);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (geo.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] px-4 py-6 text-center text-sm text-[color:var(--color-muted)]">
        On n&apos;a pas pu placer tes villes sur la carte cette fois — le détail par ville reste
        ci-dessous.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="local-map h-[440px] w-full overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] shadow-[var(--shadow-sm)]"
      role="img"
      aria-label={`Carte de visibilité IA locale de ${brand}`}
    />
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
