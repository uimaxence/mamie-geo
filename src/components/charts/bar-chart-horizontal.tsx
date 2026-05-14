"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { LLM_COLORS, LLM_LABELS } from "./llm-colors";

// Score par LLM en barres horizontales (5 lignes). Domaine 0-100.
// data : { llm: string, value: number }[]
// `llm` doit être une clé de LLM_COLORS (chatgpt|claude|perplexity|gemini|lechat).

export interface BarChartHorizontalDatum {
  llm: string;
  value: number;
}

export function BarChartHorizontal({
  data,
  height = 240,
}: {
  data: BarChartHorizontalDatum[];
  height?: number;
}) {
  const normalized = data.map((d) => ({
    ...d,
    label: LLM_LABELS[d.llm] ?? d.llm,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={normalized}
        layout="vertical"
        margin={{ top: 8, right: 24, left: 4, bottom: 8 }}
        barCategoryGap={10}
      >
        <CartesianGrid horizontal={false} stroke="var(--color-border)" strokeDasharray="2 2" />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: "var(--color-muted)" }}
          axisLine={false}
          tickLine={false}
          unit="%"
        />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fontSize: 13, fill: "var(--color-ink-soft)" }}
          axisLine={false}
          tickLine={false}
          width={80}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
          {normalized.map((d) => (
            <Cell key={d.llm} fill={LLM_COLORS[d.llm] ?? "#737373"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
