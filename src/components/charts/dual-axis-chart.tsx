"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Graphe double-axe : trafic IA (barres, axe droit, échelle libre) vs score
// de visibilité (ligne, axe gauche 0-100). Le LineChart standard est verrouillé
// sur un axe unique 0-100 → composant dédié pour la corrélation « preuve de ROI ».
// data : { date, visits, visibility }[]

const VISITS_COLOR = "#94a3b8"; // slate-400 — barres trafic, neutre
const VISIBILITY_COLOR = "#329CFF"; // bleu brand — ligne visibilité

export interface DualAxisDatum {
  date: string;
  visits: number;
  visibility: number;
}

export function DualAxisChart({ data, height = 280 }: { data: DualAxisDatum[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 2" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "var(--color-muted)" }}
          axisLine={{ stroke: "var(--color-border)" }}
          tickLine={false}
          interval="preserveStartEnd"
          minTickGap={32}
        />
        {/* Axe gauche : score de visibilité 0-100 */}
        <YAxis
          yAxisId="visibility"
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: "var(--color-muted)" }}
          axisLine={false}
          tickLine={false}
          unit="%"
          width={36}
        />
        {/* Axe droit : visites IA, échelle automatique */}
        <YAxis
          yAxisId="visits"
          orientation="right"
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "var(--color-muted)" }}
          axisLine={false}
          tickLine={false}
          width={36}
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
          cursor={{ fill: "var(--color-border)", fillOpacity: 0.3 }}
        />
        <Legend
          verticalAlign="bottom"
          align="left"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 16, paddingLeft: 36 }}
        />
        <Bar
          yAxisId="visits"
          dataKey="visits"
          name="Visites IA"
          fill={VISITS_COLOR}
          radius={[3, 3, 0, 0]}
          maxBarSize={28}
        />
        <Line
          yAxisId="visibility"
          type="monotone"
          dataKey="visibility"
          name="Score de visibilité"
          stroke={VISIBILITY_COLOR}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
