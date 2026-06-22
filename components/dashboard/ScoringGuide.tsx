"use client";

import { useState } from "react";

const LOOKUP_TABLE = [
  {
    q: "Q1",
    label: "General Health",
    rows: [
      { answer: "Excellent", value: 1, physical: 0, mental: 0 },
      { answer: "Very Good", value: 2, physical: -1.31872, mental: -0.06064 },
      { answer: "Good", value: 3, physical: -3.02396, mental: 0.03482 },
      { answer: "Fair", value: 4, physical: -5.56461, mental: -0.16891 },
      { answer: "Poor", value: 5, physical: -8.37399, mental: -1.71175 },
    ],
  },
  {
    q: "Q2",
    label: "Moderate Activities limited?",
    rows: [
      { answer: "Limited a lot", value: 1, physical: -7.23216, mental: 3.93115 },
      { answer: "Limited a little", value: 2, physical: -3.45555, mental: 1.86840 },
      { answer: "Not limited", value: 3, physical: 0, mental: 0 },
    ],
  },
  {
    q: "Q3",
    label: "Climbing Stairs limited?",
    rows: [
      { answer: "Limited a lot", value: 1, physical: -6.24397, mental: 2.68282 },
      { answer: "Limited a little", value: 2, physical: -2.73557, mental: 1.43103 },
      { answer: "Not limited", value: 3, physical: 0, mental: 0 },
    ],
  },
  {
    q: "Q4",
    label: "Accomplished less due to physical health?",
    rows: [
      { answer: "Yes", value: 1, physical: -4.61617, mental: 1.44060 },
      { answer: "No", value: 2, physical: 0, mental: 0 },
    ],
  },
  {
    q: "Q5",
    label: "Limited in kind of work due to physical health?",
    rows: [
      { answer: "Yes", value: 1, physical: -5.51747, mental: 1.66968 },
      { answer: "No", value: 2, physical: 0, mental: 0 },
    ],
  },
  {
    q: "Q6",
    label: "Accomplished less due to emotional problems?",
    rows: [
      { answer: "Yes", value: 1, physical: 3.04365, mental: -6.82672 },
      { answer: "No", value: 2, physical: 0, mental: 0 },
    ],
  },
  {
    q: "Q7",
    label: "Didn't do work carefully due to emotional problems?",
    rows: [
      { answer: "Yes", value: 1, physical: 2.32091, mental: -5.69921 },
      { answer: "No", value: 2, physical: 0, mental: 0 },
    ],
  },
  {
    q: "Q8",
    label: "Pain interfered with work",
    rows: [
      { answer: "Not at all", value: 1, physical: 0, mental: 0 },
      { answer: "A little bit", value: 2, physical: -3.80130, mental: 0.90384 },
      { answer: "Moderately", value: 3, physical: -6.50522, mental: 1.49384 },
      { answer: "Quite a bit", value: 4, physical: -8.38063, mental: 1.76691 },
      { answer: "Extremely", value: 5, physical: -11.25544, mental: 1.48619 },
    ],
  },
  {
    q: "Q9",
    label: "Felt calm and peaceful",
    rows: [
      { answer: "All of the time", value: 1, physical: 0, mental: 0 },
      { answer: "Most of the time", value: 2, physical: 0.66514, mental: -1.94949 },
      { answer: "A Good Bit of the time", value: 3, physical: 1.36689, mental: -4.09842 },
      { answer: "Some of the time", value: 4, physical: 2.37241, mental: -6.31121 },
      { answer: "A little of the time", value: 5, physical: 2.90426, mental: -7.92717 },
      { answer: "None of the time", value: 6, physical: 3.46638, mental: -10.19085 },
    ],
  },
  {
    q: "Q10",
    label: "Had a lot of energy",
    rows: [
      { answer: "All of the time", value: 1, physical: 0, mental: 0 },
      { answer: "Most of the time", value: 2, physical: -0.42251, mental: -0.92057 },
      { answer: "A Good Bit of the time", value: 3, physical: -1.14387, mental: -1.65178 },
      { answer: "Some of the time", value: 4, physical: -1.61850, mental: -3.29805 },
      { answer: "A little of the time", value: 5, physical: -2.02168, mental: -4.88962 },
      { answer: "None of the time", value: 6, physical: -2.44706, mental: -6.02409 },
    ],
  },
  {
    q: "Q11",
    label: "Felt downhearted and blue",
    rows: [
      { answer: "All of the time", value: 1, physical: 4.61446, mental: -16.15395 },
      { answer: "Most of the time", value: 2, physical: 3.41593, mental: -10.77911 },
      { answer: "A Good Bit of the time", value: 3, physical: 2.34247, mental: -8.09914 },
      { answer: "Some of the time", value: 4, physical: 1.28044, mental: -4.59055 },
      { answer: "A little of the time", value: 5, physical: 0.41188, mental: -1.95934 },
      { answer: "None of the time", value: 6, physical: 0, mental: 0 },
    ],
  },
  {
    q: "Q12",
    label: "Social activities interfered",
    rows: [
      { answer: "All of the time", value: 1, physical: -0.33682, mental: -6.29724 },
      { answer: "Most of the time", value: 2, physical: -0.94342, mental: -8.26066 },
      { answer: "Some of the time", value: 3, physical: -0.18043, mental: -5.63286 },
      { answer: "A little of the time", value: 4, physical: 0.11038, mental: -3.13896 },
      { answer: "None of the time", value: 5, physical: 0, mental: 0 },
    ],
  },
];

function fmt(n: number) {
  if (n === 0) return "0";
  return (n > 0 ? "+" : "") + n.toFixed(5);
}

export default function ScoringGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div>
          <h2 className="text-base font-semibold text-[#0927eb]">SF-12 Scoring Methodology</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Lookup table values, formulas, and score band definitions
          </p>
        </div>
        <span className="text-gray-400 text-lg select-none">{open ? "︿" : "﹀"}</span>
      </button>

      {open && (
        <div className="px-6 pb-8 space-y-8 border-t border-gray-100">
          {/* Overview */}
          <div className="pt-6 grid sm:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <p className="text-xs font-semibold text-[#0927eb] uppercase tracking-wide mb-1">PCS-12</p>
              <p className="text-sm text-gray-700">Physical Component Summary — measures physical health functioning.</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
              <p className="text-xs font-semibold text-[#fff504] uppercase tracking-wide mb-1">MCS-12</p>
              <p className="text-sm text-gray-700">Mental Component Summary — measures mental health functioning.</p>
            </div>
          </div>

          {/* Formulas */}
          <div>
            <h3 className="text-sm font-semibold text-[#0927eb] mb-3">Formulas</h3>
            <p className="text-sm text-gray-600 mb-3">
              Each question maps the respondent&apos;s answer to a physical delta and mental delta via the
              lookup table below. The 12 physical deltas are summed and a constant is added to produce PCS-12;
              likewise for MCS-12. Both constants represent the US population norm baseline.
            </p>
            <div className="space-y-2 font-mono text-sm bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p>
                <span className="text-[#0927eb] font-bold">PCS-12</span>
                {" = Σ(physicalΔ, Q1—Q12) + "}
                <span className="text-[#0927eb] font-bold">56.57706</span>
              </p>
              <p>
                <span className="text-[#fff504] font-bold">MCS-12</span>
                {" = Σ(mentalΔ,   Q1—Q12) + "}
                <span className="text-[#fff504] font-bold">60.75781</span>
              </p>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Score 50 = US population average; SD = 10. Higher = better health. Best-health answers all map to
              [0, 0] so perfect health → PCS = 56.58, MCS = 60.76.
            </p>
          </div>

          {/* Score bands */}
          <div>
            <h3 className="text-sm font-semibold text-[#0927eb] mb-3">Score Bands</h3>
            <div className="overflow-x-auto">
              <table className="text-sm w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-3 py-2 border border-gray-200 text-gray-600 font-medium">Band</th>
                    <th className="text-left px-3 py-2 border border-gray-200 text-gray-600 font-medium">PCS-12 or MCS-12 Range</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-2 border border-gray-200 font-medium text-green-700">Above Average</td>
                    <td className="px-3 py-2 border border-gray-200 text-gray-700">≥ 55</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-3 py-2 border border-gray-200 font-medium text-yellow-700">Average</td>
                    <td className="px-3 py-2 border border-gray-200 text-gray-700">45 — 54.9</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border border-gray-200 font-medium text-red-700">Below Average</td>
                    <td className="px-3 py-2 border border-gray-200 text-gray-700">&lt; 45</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Lookup table */}
          <div>
            <h3 className="text-sm font-semibold text-[#0927eb] mb-1">
              Lookup Table
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Coefficients verified against{" "}
              <a
                href="https://orthotoolkit.com/sf-12/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#0927eb]"
              >
                orthotoolkit.com/sf-12/
              </a>
              {" · "}
              Source:{" "}
              <a
                href="https://doi.org/10.1097/00005650-199603000-00003"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#0927eb]"
              >
                Ware et al. (1996), <em>Medical Care</em> 34(3)
              </a>
              {". "}
              Q9—Q11 have 6 response options (includes &ldquo;A Good Bit of the time&rdquo;).
              Green rows = best-health anchor [0, 0].
            </p>
            <div className="space-y-4">
              {LOOKUP_TABLE.map(({ q, label, rows }) => (
                <div key={q} className="overflow-x-auto">
                  <p className="text-xs font-semibold text-[#0927eb] mb-1">
                    {q} — {label}
                  </p>
                  <table className="text-xs w-full border-collapse min-w-[420px]">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-3 py-1.5 border border-gray-200 text-gray-500 font-medium">Answer</th>
                        <th className="text-center px-3 py-1.5 border border-gray-200 text-gray-500 font-medium">Value</th>
                        <th className="text-right px-3 py-1.5 border border-gray-200 text-[#0927eb] font-medium">PhysicalΔ</th>
                        <th className="text-right px-3 py-1.5 border border-gray-200 text-[#fff504] font-medium">MentalΔ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => {
                        const isBest = row.physical === 0 && row.mental === 0;
                        return (
                          <tr key={i} className={isBest ? "bg-green-50" : i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="px-3 py-1.5 border border-gray-200 text-gray-700">
                              {row.answer}
                              {isBest && (
                                <span className="ml-2 text-green-600 text-[10px] font-medium">best health</span>
                              )}
                            </td>
                            <td className="px-3 py-1.5 border border-gray-200 text-center text-gray-500">{row.value}</td>
                            <td className="px-3 py-1.5 border border-gray-200 text-right font-mono text-[#0927eb]">
                              {fmt(row.physical)}
                            </td>
                            <td className="px-3 py-1.5 border border-gray-200 text-right font-mono text-[#fff504]">
                              {fmt(row.mental)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
