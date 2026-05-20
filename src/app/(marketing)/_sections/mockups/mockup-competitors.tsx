"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, Cell, ResponsiveContainer, YAxis } from "recharts";

// Mockup utilisé en card 4 de SansAvec : « Tes concurrents en miroir ».
// Refonte 2026-05-13 (9ᵉ itération polish UX), passage du bar-list CSS
// statique à un vrai BarChart Recharts. La barre de la marque user
// (« Toi ») est en bleu primaire, les concurrents en gray-300.

interface BarDatum {
  name: string;
  value: number;
  isUser: boolean;
}

const DATA: BarDatum[] = [
  { name: "Toi", value: 76, isUser: true },
  { name: "C1", value: 64, isUser: false },
  { name: "C2", value: 52, isUser: false },
  { name: "C3", value: 38, isUser: false },
];

export function MockupCompetitors() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[color:var(--color-gray-50)] px-6">
      <div className="w-full max-w-[280px] rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white p-4 shadow-[var(--shadow-md)]">
        <div className="flex items-baseline justify-between">
          <p className="text-[9px] font-medium uppercase tracking-wider text-[color:var(--color-muted)]">
            Score par marque
          </p>
          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[color:var(--color-success)]">
            <TrendingUp size={10} strokeWidth={2.5} />
            +12
          </span>
        </div>

        {/* BarChart vertical Recharts. La barre user (« Toi ») prend
         * le primary blue, les autres restent en gray-300. */}
        <div className="mt-3 h-[90px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DATA} margin={{ top: 4, right: 0, left: 0, bottom: 4 }}>
              <YAxis hide domain={[0, 100]} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {DATA.map((d) => (
                  <Cell key={d.name} fill={d.isUser ? "#329cff" : "#d4d4d4"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Légende des marques sous le chart */}
        <div className="mt-2 flex justify-between text-[10px] font-medium">
          {DATA.map((d) => (
            <span
              key={d.name}
              className={
                d.isUser
                  ? "text-[color:var(--color-primary)] font-semibold"
                  : "text-[color:var(--color-muted)]"
              }
            >
              {d.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
