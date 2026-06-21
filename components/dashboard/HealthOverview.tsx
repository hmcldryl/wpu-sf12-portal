"use client";

import {
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getHealthOverview, HealthCategory } from "@/lib/dashboardUtils";
import { SF12Response } from "@/lib/types";

interface HealthOverviewProps {
  responses: SF12Response[];
}

const CATEGORY_COLORS: Record<HealthCategory, string> = {
  Healthy: "#16a34a",
  "Physical Concern": "#d97706",
  "Mental Concern": "#2563eb",
  "Combined Concern": "#dc2626",
};

const CATEGORY_DESCRIPTIONS: Record<HealthCategory, string> = {
  Healthy: "PCS-12 and MCS-12 both 45 or above",
  "Physical Concern": "PCS-12 below 45 (physical health may need attention)",
  "Mental Concern": "MCS-12 below 45 (mental/emotional health may need attention)",
  "Combined Concern": "Both PCS-12 and MCS-12 below 45",
};

export default function HealthOverview({ responses }: HealthOverviewProps) {
  const overview = getHealthOverview(responses);
  const total = responses.length;
  const healthyPct = overview.find((o) => o.category === "Healthy")?.pct ?? 0;
  const concernCount = total - (overview.find((o) => o.category === "Healthy")?.count ?? 0);

  const scatterData = responses.map((r) => ({
    pcs: r.pcs12,
    mcs: r.mcs12,
    category: categoryFor(r.pcs12, r.mcs12),
  }));

  function categoryFor(pcs: number, mcs: number): HealthCategory {
    const pcsLow = pcs < 45;
    const mcsLow = mcs < 45;
    if (pcsLow && mcsLow) return "Combined Concern";
    if (pcsLow) return "Physical Concern";
    if (mcsLow) return "Mental Concern";
    return "Healthy";
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <h3 className="font-semibold text-[#0927eb] mb-1">Overall Wellbeing Overview</h3>
      <p className="text-sm text-gray-600 mb-4">
        {total === 0
          ? "No responses yet."
          : `${healthyPct.toFixed(1)}% of respondents are within the healthy range on both PCS-12 and MCS-12. ${concernCount} respondent${concernCount === 1 ? "" : "s"} may benefit from follow-up.`}
      </p>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Donut: category breakdown */}
        <div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={overview}
                dataKey="count"
                nameKey="category"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
              >
                {overview.map((entry) => (
                  <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value}`, name]} />
              <Legend verticalAlign="bottom" height={48} />
            </PieChart>
          </ResponsiveContainer>
          <ul className="text-xs text-gray-500 space-y-1 mt-2">
            {overview.map((entry) => (
              <li key={entry.category} className="flex items-center gap-2">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[entry.category] }}
                />
                <span className="font-medium text-gray-700">{entry.category}:</span>
                <span>{CATEGORY_DESCRIPTIONS[entry.category]}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Scatter: PCS vs MCS quadrants */}
        <div>
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="pcs"
                name="PCS-12"
                domain={[0, 80]}
                tick={{ fontSize: 11 }}
                label={{ value: "PCS-12 (Physical)", position: "insideBottom", offset: -5, fontSize: 11 }}
              />
              <YAxis
                type="number"
                dataKey="mcs"
                name="MCS-12"
                domain={[0, 80]}
                tick={{ fontSize: 11 }}
                label={{ value: "MCS-12 (Mental)", angle: -90, position: "insideLeft", fontSize: 11 }}
              />
              <ReferenceLine x={45} stroke="#9ca3af" strokeDasharray="4 4" />
              <ReferenceLine y={45} stroke="#9ca3af" strokeDasharray="4 4" />
              <Tooltip
                formatter={(value) => Number(value).toFixed(2)}
                labelFormatter={() => ""}
              />
              <Scatter data={scatterData} fill="#0927eb">
                {scatterData.map((entry, idx) => (
                  <Cell key={idx} fill={CATEGORY_COLORS[entry.category]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 text-center mt-1">
            Each dot is one respondent. Dashed lines mark the &quot;average&quot; threshold (45) for PCS-12 and MCS-12.
          </p>
        </div>
      </div>
    </div>
  );
}
