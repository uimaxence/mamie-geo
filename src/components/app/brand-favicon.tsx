"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// Affiche le favicon du domaine de la marque trackée. Source : Google
// s2 favicons (gratuit, fiable, pas de quota auth). Fallback sur un
// carré ink + initiale du nom si le favicon échoue à charger (404,
// CORS, domaine fictif…).
//
// Préchargé par Google côté CDN, donc pas d'impact perf notable. Si
// privacy est une concern future (Google sait que tel user regarde tel
// domaine), on pourra basculer sur DuckDuckGo `icons.duckduckgo.com`
// ou self-host les favicons via Cloudflare R2.

function getInitial(name: string): string {
  const match = name.match(/[\p{L}\p{N}]/u);
  return (match?.[0] ?? "?").toUpperCase();
}

function googleFaviconUrl(domain: string, sizePx: number): string {
  // sz= renvoie l'icône la plus proche dispo. Google sert un 16/32/64 etc.
  // On demande 2x le rendu pour la HiDPI.
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const size = Math.max(16, sizePx * 2);
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(cleanDomain)}&sz=${size}`;
}

interface BrandFaviconProps {
  domain: string;
  /** Nom de la marque pour le fallback (1ʳᵉ lettre) et l'alt text */
  name: string;
  /** Taille en px (default 20) */
  size?: number;
  className?: string;
}

export function BrandFavicon({ domain, name, size = 20, className }: BrandFaviconProps) {
  const [failed, setFailed] = useState(false);
  const initial = getInitial(name);
  const radius = size <= 18 ? "rounded-[4px]" : "rounded-[var(--radius-sm)]";

  if (failed) {
    return (
      <span
        aria-hidden
        className={cn(
          "flex shrink-0 items-center justify-center bg-[color:var(--color-ink)] font-semibold text-white",
          radius,
          className,
        )}
        style={{ width: size, height: size, fontSize: Math.round(size * 0.45) }}
      >
        {initial}
      </span>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={googleFaviconUrl(domain, size)}
      alt={`Favicon ${name}`}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className={cn(
        "shrink-0 bg-white object-contain",
        radius,
        // Border 1px très subtile pour bien détacher du fond, surtout
        // quand le favicon est blanc/transparent.
        "border border-[color:var(--color-border)]",
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}
