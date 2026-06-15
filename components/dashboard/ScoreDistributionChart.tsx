"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getScoreDistribution } from "@/lib/dashboardUtils";
import { SF12Response } from "@/lib/types";

interface ScoreDistributionChartProps {
  responses: SF12Response[];
  field: "pcs12" | "mcs12";
  title: string;
}

const BAND_COLORS: Record<string, string> = {
  "Below Average": "#dc2626",
  Average: "#d97706",
  "Above Average": "#16a34a",
};

export default function ScoreDistributionChart({ responses, field, title }: ScoreDistributionChartProps) {
  const dist = getScoreDistribution(responses, field);

  const data = [
    { name: "Below Average", count: dist.belowAverage.count, pct: dist.belowAverage.pct },
    { name: "Average", count: dist.average.count, pct: dist.average.pct },
    { name: "Above Average", count: dist.aboveAverage.count, pct: dist.aboveAverage.pct },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <h3 className="font-semibold text-[#1a3a5c] mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value) => [`${value}`, "Respondents"]}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={BAND_COLORS[entry.name]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-3 gap-2 mt-2 text-center text-xs">
        {data.map((d) => (
          <div key={d.name}>
            <p className="font-semibold" style={{ color: BAND_COLORS[d.name] }}>
              {d.count} ({d.pct.toFixed(1)}%)
            </p>
            <p className="text-gray-500">{d.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
