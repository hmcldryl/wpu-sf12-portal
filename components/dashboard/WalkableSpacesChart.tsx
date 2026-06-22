"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { groupByField } from "@/lib/dashboardUtils";
import { SF12Response } from "@/lib/types";

interface WalkableSpacesChartProps {
  responses: SF12Response[];
}

const COLORS: Record<string, string> = {
  Yes: "#16a34a",
  No: "#dc2626",
};

export default function WalkableSpacesChart({ responses }: WalkableSpacesChartProps) {
  const total = responses.length;
  const groups = groupByField(responses, "walkableSpaces");

  const yes = groups["Yes"] ?? { count: 0, avgPCS: 0, avgMCS: 0 };
  const no = groups["No"] ?? { count: 0, avgPCS: 0, avgMCS: 0 };

  const pieData = [
    { name: "Yes", value: yes.count },
    { name: "No", value: no.count },
  ].filter((d) => d.value > 0);

  const pcsDiff = yes.avgPCS - no.avgPCS;
  const mcsDiff = yes.avgMCS - no.avgMCS;

  function insight(): string {
    if (total === 0) return "";
    if (yes.count === 0 || no.count === 0) return "";
    const pcsDir = pcsDiff > 0 ? "higher" : "lower";
    const mcsDir = mcsDiff > 0 ? "higher" : "lower";
    return `Respondents with walkable spaces score ${Math.abs(pcsDiff).toFixed(2)} pts ${pcsDir} on PCS-12 and ${Math.abs(mcsDiff).toFixed(2)} pts ${mcsDir} on MCS-12 than those without.`;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <h3 className="font-semibold text-[#0927eb] mb-1">Walkable Spaces Availability</h3>

      {total === 0 ? (
        <p className="text-sm text-gray-400">No responses yet.</p>
      ) : (
        <>
          {insight() && (
            <p className="text-sm text-gray-600 mb-4">{insight()}</p>
          )}

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Donut: Yes vs No distribution */}
            <div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={COLORS[entry.name] ?? "#9ca3af"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} respondents`, ""]} />
                  <Legend verticalAlign="bottom" height={32} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Score comparison table */}
            <div className="flex flex-col justify-center">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-200">
                    <th className="py-2 pr-4">Walkable Spaces</th>
                    <th className="py-2 pr-4">Count</th>
                    <th className="py-2 pr-4">Avg PCS-12</th>
                    <th className="py-2 pr-4">Avg MCS-12</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Yes", stats: yes, color: COLORS.Yes },
                    { label: "No", stats: no, color: COLORS.No },
                  ].map(({ label, stats, color }) => (
                    <tr key={label} className="border-b border-gray-100">
                      <td className="py-2 pr-4 font-medium flex items-center gap-2">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        {label}
                      </td>
                      <td className="py-2 pr-4">{stats.count}</td>
                      <td className="py-2 pr-4">
                        {stats.count > 0 ? stats.avgPCS.toFixed(2) : "—"}
                      </td>
                      <td className="py-2 pr-4">
                        {stats.count > 0 ? stats.avgMCS.toFixed(2) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { label: "Yes", count: yes.count },
                  { label: "No", count: no.count },
                ].map(({ label, count }) => (
                  <div
                    key={label}
                    className="rounded-lg border border-gray-200 p-3 text-center"
                  >
                    <p className="text-2xl font-bold" style={{ color: COLORS[label] }}>
                      {total > 0 ? ((count / total) * 100).toFixed(1) : 0}%
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{label} ({count})</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
