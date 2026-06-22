"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SF12Response } from "@/lib/types";

interface TeachingLoadChartProps {
  responses: SF12Response[];
}

export default function TeachingLoadChart({ responses }: TeachingLoadChartProps) {
  const faculty = responses.filter((r) => r.employmentType === "Faculty" && r.teachingLoad !== undefined);

  if (faculty.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h3 className="font-semibold text-[#0927eb] mb-1">Teaching Load (Previous Semester)</h3>
        <p className="text-sm text-gray-400">No faculty responses with teaching load data yet.</p>
      </div>
    );
  }

  const grouped: Record<number, { count: number; pcsSum: number; mcsSum: number }> = {};
  for (const r of faculty) {
    const key = r.teachingLoad!;
    if (!grouped[key]) grouped[key] = { count: 0, pcsSum: 0, mcsSum: 0 };
    grouped[key].count++;
    grouped[key].pcsSum += r.pcs12;
    grouped[key].mcsSum += r.mcs12;
  }

  const data = Object.entries(grouped)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([load, g]) => ({
      name: `${load} units`,
      count: g.count,
      avgPCS: parseFloat((g.pcsSum / g.count).toFixed(2)),
      avgMCS: parseFloat((g.mcsSum / g.count).toFixed(2)),
    }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <h3 className="font-semibold text-[#0927eb] mb-1">Teaching Load (Previous Semester)</h3>
      <p className="text-sm text-gray-500 mb-4">Faculty only · {faculty.length} respondent{faculty.length !== 1 ? "s" : ""}</p>

      <ResponsiveContainer width="100%" height={Math.max(220, data.length * 55)}>
        <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
          <Tooltip />
          <Legend />
          <Bar dataKey="avgPCS" name="Avg PCS-12" fill="#0927eb" radius={[0, 4, 4, 0]} />
          <Bar dataKey="avgMCS" name="Avg MCS-12" fill="#fff504" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-2 pr-4">Teaching Load</th>
              <th className="py-2 pr-4">Count</th>
              <th className="py-2 pr-4">Avg PCS-12</th>
              <th className="py-2 pr-4">Avg MCS-12</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.name} className="border-b border-gray-100">
                <td className="py-2 pr-4 font-medium text-gray-700">{row.name}</td>
                <td className="py-2 pr-4">{row.count}</td>
                <td className="py-2 pr-4">{row.avgPCS.toFixed(2)}</td>
                <td className="py-2 pr-4">{row.avgMCS.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
