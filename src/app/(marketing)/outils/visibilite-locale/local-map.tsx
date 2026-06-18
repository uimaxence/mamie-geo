"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import type { CityVisibility } from "@/lib/local-map/types";

// Vraie carte (Leaflet + tuiles claires CARTO Positron sans labels,
// RGPD-friendly). Lecture pensée pour le coup d'œil :
//   - 1 pastille NUMÉROTÉE par ville (vert = l'IA te recommande, rouge =
//     un concurrent à ta place), ta ville = pastille foncée avec ★ ;
//   - le nom + le statut s'affichent au SURVOL (un seul label à la fois,
//     plus de boîtes qui se chevauchent) ;
//   - une ZONE colorée par ville dont le rayon s'adapte à l'écartement du
//     cluster → des disques distincts plutôt qu'une grosse tache ;
//   - une légende intégrée.
// Les numéros sont les mêmes que dans la liste « Détail par ville ».
// Rendu impératif (dynamic import) pour éviter tout accès `window` en SSR.

const GREEN = "#16a34a";
const AMBER = "#f59e0b";
const RED = "#dc2626";
const INK = "#191919";

type GeoCity = CityVisibility & { lat: number; lng: number };

function statusColor(city: CityVisibility): string {
  if (city.status === "top") return GREEN;
  if (city.status === "mentioned") return AMBER;
  return RED;
}

function distanceM(a: GeoCity, b: GeoCity): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Rayon des zones = ~0,55 × la distance médiane au voisin le plus proche.
// Adjacent → les disques se touchent à peine (territoire) sans fusionner.
function zoneRadiusM(geo: GeoCity[]): number {
  if (geo.length < 2) return 4000;
  const nn = geo
    .map((c, i) => {
      let min = Infinity;
      geo.forEach((o, j) => {
        if (i !== j) min = Math.min(min, distanceM(c, o));
      });
      return min;
    })
    .filter((d) => Number.isFinite(d))
    .sort((a, b) => a - b);
  const median = nn[Math.floor(nn.length / 2)] ?? 8000;
  return Math.max(1800, Math.min(6500, median * 0.55));
}

function statusLine(city: CityVisibility): string {
  if (city.status === "top") return "L'IA te recommande en premier";
  if (city.status === "mentioned") {
    return city.topRival
      ? `L'IA te cite, mais place ${escapeHtml(city.topRival)} devant`
      : "L'IA te cite, mais pas en tête";
  }
  if (city.topRival) return `L'IA cite ${escapeHtml(city.topRival)} à ta place`;
  return "L'IA ne te cite pas ici";
}

export function LocalMap({ cities, brand }: { cities: CityVisibility[]; brand: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  const geo = cities.filter((c): c is GeoCity => c.lat !== null && c.lng !== null);

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

      const radius = zoneRadiusM(geo);

      geo.forEach((city, i) => {
        const isMain = i === 0;
        const color = statusColor(city);

        // Zone : disque doux, fin liseré pour délimiter sans alourdir.
        L.circle([city.lat, city.lng], {
          radius,
          color,
          weight: 1,
          opacity: 0.35,
          fillColor: color,
          fillOpacity: 0.14,
        }).addTo(map);

        // Pastille numérotée (ou ★ pour ta ville). divIcon = stylé inline,
        // pas de dépendance CSS globale.
        const size = isMain ? 30 : 24;
        const ring = isMain ? `,0 0 0 3px ${INK}` : "";
        const inner = isMain ? "★" : String(i);
        const bg = isMain ? INK : color;
        const html = `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${bg};color:#fff;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)${ring};display:flex;align-items:center;justify-content:center;font:600 ${isMain ? 14 : 12}px/1 Inter,system-ui,sans-serif">${inner}</div>`;

        const marker = L.marker([city.lat, city.lng], {
          icon: L.divIcon({
            html,
            className: "",
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          }),
          riseOnHover: true,
        }).addTo(map);

        // Nom + statut au survol (un seul label visible à la fois).
        const title = isMain ? `Toi · ${escapeHtml(brand)}` : `${i}. ${escapeHtml(city.name)}`;
        marker.bindTooltip(
          `<strong>${title}</strong><br><span style="color:${color}">${statusLine(city)}</span>`,
          { direction: "top", offset: [0, -size / 2 - 2], opacity: 1 },
        );
      });

      // Légende intégrée.
      const legend = new L.Control({ position: "bottomleft" });
      legend.onAdd = () => {
        const div = L.DomUtil.create("div");
        div.style.cssText =
          "background:#fff;border:1px solid #e5e5e5;border-radius:8px;padding:7px 9px;font:500 11px/1.5 Inter,system-ui,sans-serif;color:#444;box-shadow:0 1px 4px rgba(0,0,0,.12)";
        div.innerHTML = `
          <div style="display:flex;align-items:center;gap:6px"><span style="width:10px;height:10px;border-radius:9999px;background:${GREEN};display:inline-block"></span>Cité en tête</div>
          <div style="display:flex;align-items:center;gap:6px;margin-top:3px"><span style="width:10px;height:10px;border-radius:9999px;background:${AMBER};display:inline-block"></span>Cité, mais pas en tête</div>
          <div style="display:flex;align-items:center;gap:6px;margin-top:3px"><span style="width:10px;height:10px;border-radius:9999px;background:${RED};display:inline-block"></span>Concurrent à ta place</div>
          <div style="display:flex;align-items:center;gap:6px;margin-top:3px"><span style="width:10px;height:10px;border-radius:9999px;background:${INK};color:#fff;font-size:8px;display:inline-flex;align-items:center;justify-content:center">★</span>Ta ville</div>`;
        return div;
      };
      legend.addTo(map);

      const bounds = L.latLngBounds(geo.map((c) => [c.lat, c.lng] as [number, number]));
      map.fitBounds(bounds.pad(0.35));
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
        On n&apos;a pas pu placer tes villes sur la carte cette fois. Le détail par ville reste
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
