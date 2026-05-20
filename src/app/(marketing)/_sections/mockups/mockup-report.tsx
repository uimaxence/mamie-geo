"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

// Mockup utilisé en étape 3 de HowItWorks : « Reçois ton premier rapport ».
// Refonte 2026-05-13 (9ᵉ itération polish UX), l'ancien mini-barchart en
// CSS pur est remplacé par un vrai AreaChart Recharts avec gradient bleu
// primaire (couleur de marque logo). Donne plus de vie + cohérence avec
// la même bibliothèque que les cartes hero showcase.

const TREND_DATA = [
  { d: 1, v: 18 },
  { d: 2, v: 22 },
  { d: 3, v: 28 },
  { d: 4, v: 33 },
  { d: 5, v: 38 },
  { d: 6, v: 41 },
  { d: 7, v: 44 },
];

export function MockupReport() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[color:var(--color-gray-50)] px-6">
      <div className="w-full max-w-[280px] rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white p-4 shadow-[var(--shadow-md)]">
        <div className="flex items-baseline justify-between">
          <p className="text-[9px] font-medium uppercase tracking-wider text-[color:var(--color-muted)]">
            Score visibilité
          </p>
          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[color:var(--color-success)]">
            <TrendingUp size={10} strokeWidth={2.5} />
            +12
          </span>
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="font-semibold text-3xl leading-none tracking-tight text-[color:var(--color-ink)]">
            44
          </span>
          <span className="text-xs text-[color:var(--color-muted)]">/100</span>
        </div>

        {/* AreaChart Recharts avec gradient primary (bleu logo). */}
        <div className="mt-3 h-[72px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={TREND_DATA} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="mockup-report-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#329cff" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#329cff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke="#329cff"
                strokeWidth={2.5}
                fill="url(#mockup-report-gradient)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Mini-légende LLM stats sous le chart, format compact. */}
        <div className="mt-2 flex justify-between text-[9px] uppercase tracking-wider text-[color:var(--color-muted)]">
          <span>Lun</span>
          <span>Mar</span>
          <span>Mer</span>
          <span>Jeu</span>
          <span>Ven</span>
          <span>Sam</span>
          <span>Dim</span>
        </div>
      </div>
    </div>
  );
}
