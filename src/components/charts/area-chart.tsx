"use client";

import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// AreaChart simple série avec gradient bleu doux, pattern écran 2.
// Optionnel : ligne de référence dashée orange (moyenne, seuil…).
// Couleur par défaut bleu pastel (--color-blue). Bascule via prop.

export interface AreaChartDatum {
  x: string;
  y: number;
}

const COLOR_MAP = {
  blue: "#2563eb",
  green: "#16a34a",
  orange: "#ea580c",
  purple: "#7c3aed",
  pink: "#db2777",
} as const;

export type AreaChartTone = keyof typeof COLOR_MAP;

export function AreaChart({
  data,
  height = 240,
  tone = "blue",
  referenceValue,
  referenceLabel = "Moy.",
  yUnit,
}: {
  data: AreaChartDatum[];
  height?: number;
  tone?: AreaChartTone;
  referenceValue?: number;
  referenceLabel?: string;
  yUnit?: string;
}) {
  const color = COLOR_MAP[tone];
  const gradientId = `area-gradient-${tone}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 12, right: 24, left: 0, bottom: 8 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 2" vertical={false} />
        <XAxis
          dataKey="x"
          tick={{ fontSize: 11, fill: "var(--color-muted)" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
          minTickGap={32}
        />
        <YAxis
          orientation="right"
          tick={{ fontSize: 11, fill: "var(--color-muted)" }}
          axisLine={false}
          tickLine={false}
          unit={yUnit}
          width={42}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-ink)",
            border: "none",
            borderRadius: 8,
            color: "white",
            fontSize: 12,
            padding: "8px 10px",
          }}
          labelStyle={{ color: "var(--color-faint)", marginBottom: 4 }}
          itemStyle={{ color: "white" }}
          cursor={{ stroke: "var(--color-border-strong)", strokeWidth: 1 }}
        />
        {typeof referenceValue === "number" && (
          <ReferenceLine
            y={referenceValue}
            stroke="var(--color-accent)"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: referenceLabel,
              position: "right",
              fill: "var(--color-accent)",
              fontSize: 11,
              fontWeight: 600,
            }}
          />
        )}
        <Area
          type="monotone"
          dataKey="y"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
