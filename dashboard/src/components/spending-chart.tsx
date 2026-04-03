"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import type { LedgerEntry } from "@/lib/types";

interface SpendingChartProps {
  entries: LedgerEntry[];
}

export function SpendingChart({ entries }: SpendingChartProps) {
  // Group entries by date for the last 14 days
  const now = new Date();
  const days: { date: string; amount: number }[] = [];

  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({ date: dateStr, amount: 0 });
  }

  for (const entry of entries) {
    const dateStr = new Date(entry.timestamp).toISOString().split("T")[0];
    const day = days.find((d) => d.date === dateStr);
    if (day) {
      day.amount += parseFloat(entry.amount);
    }
  }

  const chartData = days.map((d) => ({
    date: d.date.slice(5), // MM-DD
    amount: parseFloat(d.amount.toFixed(4)),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          axisLine={{ stroke: "hsl(var(--border))" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          axisLine={{ stroke: "hsl(var(--border))" }}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--card-foreground))",
          }}
          labelStyle={{ color: "hsl(var(--muted-foreground))" }}
        />
        <Bar
          dataKey="amount"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
