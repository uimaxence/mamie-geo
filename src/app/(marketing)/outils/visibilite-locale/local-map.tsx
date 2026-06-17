"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import type { CityVisibility } from "@/lib/local-map/types";

// Vraie carte (Leaflet + tuiles claires CARTO Positron, RGPD-friendly, pas
// de Google) avec une ZONE colorée autour de chaque ville : vert là où
// l'IA te recommande, rouge là où elle cite un concurrent à ta place. Les
// zones sont généreuses (rayon ~22 km) et se chevauchent → un « territoire »
// IA lisible d'un coup d'œil. Rendu impératif (dynamic import) pour éviter
// tout accès à `window` côté serveur.

const GREEN = "#16a34a";
const RED = "#dc2626";
const INK = "#191919";
const ZONE_RADIUS_M = 20000;

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
        attributionControl: true,
        zoomControl: true,
      });
      mapRef.current = map;

      // `light_nolabels` : carte claire SANS les noms de villes/routes du
      // fond → nos pastilles sont les seuls labels, rendu net et « à nous ».
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        maxZoom: 19,
      }).addTo(map);

      const main = geo[0];
      for (let i = 0; i < geo.length; i++) {
        const city = geo[i]!;
        const color = city.recommended ? GREEN : RED;
        // Zone (cercle généreux) — le « territoire » de la marque. Douce et
        // sans bord dur pour que les chevauchements restent lisibles.
        L.circle([city.lat, city.lng], {
          radius: ZONE_RADIUS_M,
          stroke: false,
          fillColor: color,
          fillOpacity: 0.12,
        }).addTo(map);

        // Pastille ville (divIcon HTML pour le style).
        const isMain = i === 0;
        const icon = city.recommended ? "✓" : "✕";
        const html = isMain
          ? `<div style="display:flex;flex-direction:column;align-items:center;gap:1px;padding:6px 11px;border:1.5px solid ${INK};border-radius:10px;background:#fff;box-shadow:0 6px 16px rgba(0,0,0,.12);white-space:nowrap;font-family:Inter,system-ui,sans-serif;">
               <span style="font-size:9px;letter-spacing:.04em;text-transform:uppercase;color:#9b9b9b;">${escapeHtml(city.name)}</span>
               <span style="font-size:12.5px;font-weight:600;color:${INK};max-width:150px;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(brand)}</span>
             </div>`
          : `<div style="display:flex;align-items:center;gap:6px;padding:3px 9px 3px 5px;border:1px solid #e6e6e6;border-radius:999px;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,.07);white-space:nowrap;font-family:Inter,system-ui,sans-serif;">
               <span style="display:inline-flex;width:15px;height:15px;align-items:center;justify-content:center;border-radius:999px;background:${color};color:#fff;font-size:9px;font-weight:700;line-height:1;">${icon}</span>
               <span style="font-size:11px;font-weight:500;color:${INK};">${escapeHtml(city.name)}</span>
             </div>`;

        L.marker([city.lat, city.lng], {
          icon: L.divIcon({
            html,
            className: "",
            iconSize: [0, 0],
            iconAnchor: [0, isMain ? 18 : 12],
          }),
          zIndexOffset: isMain ? 1000 : 0,
          interactive: false,
        }).addTo(map);
      }

      const bounds = L.latLngBounds(geo.map((c) => [c.lat, c.lng] as [number, number]));
      map.fitBounds(bounds.pad(0.25));
      if (main) map.setMaxBounds(bounds.pad(1.2));
      // Le conteneur peut être monté à 0px (transition) → recalcule la taille.
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
      className="h-[420px] w-full overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] shadow-[var(--shadow-sm)]"
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
