"use client";

import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Legend,
} from "recharts";
import { CHART_AXIS, CHART_COLORS, CHART_GRID, CHART_TOOLTIP_BG, CHART_TOOLTIP_BORDER } from "./chart-defaults";
import { fmtCompact } from "@/lib/utils";

const tooltipContent = {
  contentStyle: {
    background: CHART_TOOLTIP_BG,
    border: `1px solid ${CHART_TOOLTIP_BORDER}`,
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
  },
  cursor: { fill: "rgba(168, 85, 247, 0.08)" },
} as const;

export function TierBarChart({ data }: { data: { tier: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="tier-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={CHART_COLORS[0]} />
            <stop offset="100%" stopColor={CHART_COLORS[1]} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={CHART_GRID} horizontal={false} />
        <XAxis type="number" stroke={CHART_AXIS} fontSize={11} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="tier" stroke={CHART_AXIS} fontSize={11} tickLine={false} axisLine={false} width={80} />
        <Tooltip {...tooltipContent} formatter={(value: number) => [`${value} posts`, ""]} />
        <Bar dataKey="count" fill="url(#tier-grad)" radius={[0, 6, 6, 0]} barSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DurationDonut({
  data,
}: {
  data: { bucket: string; count: number }[];
}) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Tooltip {...tooltipContent} formatter={(value: number, name) => [`${value} posts (${total ? Math.round((value / total) * 100) : 0}%)`, name]} />
        <Pie
          data={data}
          dataKey="count"
          nameKey="bucket"
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="85%"
          stroke="#100822"
          strokeWidth={3}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Legend
          iconType="square"
          iconSize={10}
          wrapperStyle={{ fontSize: 12, color: CHART_AXIS, paddingLeft: 12 }}
          layout="vertical"
          verticalAlign="middle"
          align="right"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function AvgViewsByDurationChart({
  data,
}: {
  data: { bucket: string; avgViews: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={CHART_GRID} vertical={false} />
        <XAxis dataKey="bucket" stroke={CHART_AXIS} fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke={CHART_AXIS} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => fmtCompact(v as number)} />
        <Tooltip {...tooltipContent} formatter={(value: number) => [`${fmtCompact(value)} avg views`, ""]} />
        <Bar dataKey="avgViews" fill={CHART_COLORS[1]} radius={[6, 6, 0, 0]} barSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ViewsHistogram({ data }: { data: { label: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={CHART_GRID} vertical={false} />
        <XAxis dataKey="label" stroke={CHART_AXIS} fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke={CHART_AXIS} fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip {...tooltipContent} formatter={(value: number) => [`${value} posts`, ""]} />
        <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function FormatBreakdown({
  data,
}: {
  data: { name: string; value: number; color?: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Tooltip {...tooltipContent} />
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" stroke="#100822" strokeWidth={3}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color ?? CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12, color: CHART_AXIS }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MiniSparkline({ data, color = CHART_COLORS[0] }: { data: number[]; color?: string }) {
  const enriched = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={28}>
      <BarChart data={enriched} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <Bar dataKey="v" fill={color} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
