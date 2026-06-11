"use client";

import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Évolution du rang de la marque dans le classement concurrentiel
// (doc 02 § Ranking étape 2). Axe Y inversé : rang 1 en haut, la courbe
// qui monte = la marque qui progresse. Ticks entiers uniquement.
// data : points (date, rank) issus de computeRankHistory.

export interface RankLineChartDatum {
  date: string;
  rank: number;
}

export function RankLineChart({
  data,
  maxRank,
  height = 220,
}: {
  data: RankLineChartDatum[];
  /** Borne basse de l'axe (taille du classement). */
  maxRank: number;
  height?: number;
}) {
  const ticks = Array.from({ length: maxRank }, (_, i) => i + 1);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 2" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "var(--color-muted)" }}
          axisLine={{ stroke: "var(--color-border)" }}
          tickLine={false}
          interval="preserveStartEnd"
          minTickGap={32}
        />
        <YAxis
          reversed
          domain={[1, Math.max(maxRank, 2)]}
          ticks={ticks}
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "var(--color-muted)" }}
          axisLine={false}
          tickLine={false}
          width={36}
          tickFormatter={(value: number) => `#${value}`}
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
          formatter={(value) => [`#${value}`, "Rang"]}
        />
        <Line
          type="stepAfter"
          dataKey="rank"
          stroke="var(--color-accent)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
