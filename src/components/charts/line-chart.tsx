"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LLM_COLORS, LLM_LABELS } from "./llm-colors";

// Évolution multi-LLM sur N jours. Une ligne par LLM, axe Y 0-100.
// data : { date: string, [llm: string]: number }[]
// `series` : liste des LLMs à tracer (clés de LLM_COLORS).

export interface LineChartDatum {
  date: string;
  [llm: string]: string | number;
}

export function LineChart({
  data,
  series,
  height = 280,
}: {
  data: LineChartDatum[];
  series: string[];
  height?: number;
}) {
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
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: "var(--color-muted)" }}
          axisLine={false}
          tickLine={false}
          unit="%"
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
          cursor={{ stroke: "var(--color-border-strong)", strokeWidth: 1 }}
        />
        <Legend
          verticalAlign="top"
          align="right"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingBottom: 12 }}
        />
        {series.map((llm) => (
          <Line
            key={llm}
            type="monotone"
            dataKey={llm}
            name={LLM_LABELS[llm] ?? llm}
            stroke={LLM_COLORS[llm] ?? "#737373"}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
