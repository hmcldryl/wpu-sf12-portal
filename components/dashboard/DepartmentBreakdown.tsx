"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { groupByField } from "@/lib/dashboardUtils";
import { SF12Response } from "@/lib/types";

interface DepartmentBreakdownProps {
  responses: SF12Response[];
  field: keyof SF12Response;
  title: string;
}

export default function DepartmentBreakdown({ responses, field, title }: DepartmentBreakdownProps) {
  const groups = groupByField(responses, field);

  const data = Object.entries(groups)
    .map(([name, stats]) => ({
      name,
      count: stats.count,
      avgPCS: parseFloat(stats.avgPCS.toFixed(2)),
      avgMCS: parseFloat(stats.avgMCS.toFixed(2)),
    }))
    .sort((a, b) => b.avgPCS - a.avgPCS);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <h3 className="font-semibold text-[#1a3a5c] mb-4">{title}</h3>

      <ResponsiveContainer width="100%" height={Math.max(220, data.length * 50)}>
        <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={120} />
          <Tooltip />
          <Legend />
          <Bar dataKey="avgPCS" name="Avg PCS-12" fill="#1a3a5c" radius={[0, 4, 4, 0]} />
          <Bar dataKey="avgMCS" name="Avg MCS-12" fill="#c8a951" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-2 pr-4">{title}</th>
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
