"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { groupByField } from "@/lib/dashboardUtils";
import { SF12Response } from "@/lib/types";
import ChartModal from "./ChartModal";

interface DepartmentBreakdownProps {
  responses: SF12Response[];
  field: keyof SF12Response;
  title: string;
}

function ChartContent({ data, itemHeight, title }: { data: { name: string; count: number; avgPCS: number; avgMCS: number }[]; itemHeight: number; title: string }) {
  return (
    <>
      <ResponsiveContainer width="100%" height={Math.max(220, data.length * itemHeight)}>
        <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={120} />
          <Tooltip />
          <Legend />
          <Bar dataKey="avgPCS" name="Avg PCS-12" fill="#0076cd" radius={[0, 4, 4, 0]} />
          <Bar dataKey="avgMCS" name="Avg MCS-12" fill="#35a529" radius={[0, 4, 4, 0]} />
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
    </>
  );
}

export default function DepartmentBreakdown({ responses, field, title }: DepartmentBreakdownProps) {
  const [expanded, setExpanded] = useState(false);

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
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded px-2 py-1"
          >
            ⛶ Expand
          </button>
        </div>
        <ChartContent data={data} itemHeight={50} title={title} />
      </div>

      {expanded && (
        <ChartModal title={title} onClose={() => setExpanded(false)}>
          <ChartContent data={data} itemHeight={65} title={title} />
        </ChartModal>
      )}
    </>
  );
}
