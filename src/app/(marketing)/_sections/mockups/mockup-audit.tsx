"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

// Mockup utilisé par <AuditTeaser /> sur la home. Simule le rendu
// d'un rapport `/outils/audit-technique` : score global + 4 sub-scores
// (SEO / GEO / A11y / Perf) avec progress bars qui s'animent au mount,
// et une issue critique avec sa recommandation en aperçu.
//
// Pas de logique métier — visuel pur. Le vrai rapport est plus riche.

interface SubScore {
  label: string;
  value: number;
  // Couleur intentionnelle : on cherche le contraste GEO faible vs
  // SEO/A11y correct → l'œil tilte « il y a un truc à corriger ».
  tone: "ok" | "warn" | "ko";
}

const SUB_SCORES: SubScore[] = [
  { label: "SEO", value: 82, tone: "ok" },
  { label: "GEO", value: 41, tone: "ko" },
  { label: "Accessibilité", value: 74, tone: "ok" },
  { label: "Performance", value: 68, tone: "warn" },
];

const TONE_COLOR: Record<SubScore["tone"], string> = {
  ok: "#16a34a", // green-600
  warn: "#d97706", // amber-600
  ko: "#dc2626", // red-600
};

export function MockupAudit() {
  // Animation : on part de 0 et on remplit au mount (transition CSS).
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="w-full rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6 shadow-[var(--shadow-md)]">
      {/* Header rapport : score global + URL */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="type-eyebrow">Score global</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-semibold text-5xl leading-none tracking-tight text-[color:var(--color-ink)]">
              67
            </span>
            <span className="text-sm text-[color:var(--color-muted)]">/100</span>
          </div>
        </div>
        <div className="truncate rounded-full bg-[color:var(--color-gray-100)] px-3 py-1 text-[11px] font-medium text-[color:var(--color-ink-soft)]">
          mamarque.fr
        </div>
      </div>

      {/* 4 sub-scores avec progress bars animées */}
      <div className="mt-6 space-y-3">
        {SUB_SCORES.map((sub) => (
          <div key={sub.label}>
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium text-[color:var(--color-ink-soft)]">
                {sub.label}
              </span>
              <span
                className="text-xs font-semibold tabular-nums"
                style={{ color: TONE_COLOR[sub.tone] }}
              >
                {sub.value}/100
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--color-gray-100)]">
              <div
                className="h-full rounded-full transition-[width] duration-1000 ease-out"
                style={{
                  width: animated ? `${sub.value}%` : "0%",
                  backgroundColor: TONE_COLOR[sub.tone],
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Issue critique en aperçu — la valeur du rapport */}
      <div className="mt-6 rounded-[var(--radius-lg)] border border-[color:var(--color-red-200,#fecaca)] bg-[color:var(--color-red-50,#fef2f2)] p-3">
        <div className="flex items-start gap-2">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-[#dc2626]" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#991b1b]">FAQPage JSON-LD manquant</p>
            <p className="mt-0.5 text-[11px] leading-snug text-[color:var(--color-ink-soft)]">
              Les IA s&apos;appuient sur les structured data pour citer des réponses. Sans FAQPage,
              tu rates les requêtes &quot;comment / pourquoi / quel&quot;.
            </p>
          </div>
        </div>
      </div>

      {/* Mini check passé pour casser le ton anxiogène */}
      <div className="mt-2 flex items-center gap-2 px-1 text-[11px] text-[color:var(--color-muted)]">
        <CheckCircle2 size={12} className="text-[#16a34a]" />
        <span>27 autres checks validés</span>
      </div>
    </div>
  );
}
