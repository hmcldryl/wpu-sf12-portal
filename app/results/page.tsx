"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ScoreGauge from "@/components/ScoreGauge";
import { getScoreBand } from "@/lib/dashboardUtils";
import { RespondentInfo } from "@/lib/types";

interface StoredResult {
  respondent: RespondentInfo;
  rawResponses: Record<string, number>;
  pcs12: number;
  mcs12: number;
}

const RECOMMENDATIONS: Record<string, { pcs: string; mcs: string }> = {
  "Above Average": {
    pcs: "Your physical health appears strong. Keep up regular activity, balanced nutrition, and routine check-ups to maintain this level.",
    mcs: "Your mental and emotional wellbeing appears strong. Continue practices that support this, such as social connection and stress management.",
  },
  Average: {
    pcs: "Your physical health is in the typical range. Consider regular exercise, adequate sleep, and a balanced diet to support or improve it.",
    mcs: "Your mental and emotional wellbeing is in the typical range. Mindfulness, social support, and healthy work-life balance can help sustain it.",
  },
  "Below Average": {
    pcs: "Your physical health score suggests you may be experiencing challenges. Consider consulting a healthcare professional and reviewing your activity, pain management, and energy levels.",
    mcs: "Your mental and emotional wellbeing score suggests you may be experiencing challenges. Consider reaching out to a counselor, trusted colleague, or support resources available at WPU.",
  },
};

function diffLabel(score: number): string {
  const diff = score - 50;
  const rounded = Math.abs(diff).toFixed(2);
  if (diff > 0) return `+${rounded} above average`;
  if (diff < 0) return `-${rounded} below average`;
  return "at the average";
}

function bandColorClass(band: string): string {
  if (band === "Above Average") return "text-green-600 bg-green-50 border-green-200";
  if (band === "Average") return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-red-600 bg-red-50 border-red-200";
}

export default function ResultsPage() {
  const [result, setResult] = useState<StoredResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("sf12_result");
    if (!raw) {
      setNotFound(true);
      return;
    }
    setResult(JSON.parse(raw));
  }, []);

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <p className="text-gray-600 mb-4">No results found. Please complete the assessment first.</p>
        <Link href="/" className="text-[#1a3a5c] font-semibold underline">
          Go to Home
        </Link>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="w-8 h-8 border-2 border-gray-300 border-t-[#1a3a5c] rounded-full animate-spin" />
      </div>
    );
  }

  const { respondent, pcs12, mcs12 } = result;
  const pcsBand = getScoreBand(pcs12);
  const mcsBand = getScoreBand(mcs12);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-[#1a3a5c] text-white py-6 px-4 text-center no-print">
        <h1 className="text-lg font-semibold">WPU SF-12 Portal — Results</h1>
      </header>

      <main className="flex-1 max-w-2xl mx-auto px-4 py-8 w-full">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-6 text-center">
          <h2 className="text-xl font-bold text-[#1a3a5c]">{respondent.name}</h2>
          <p className="text-gray-500 text-sm">{respondent.department}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
            <h3 className="font-semibold text-[#1a3a5c] mb-2">Physical Health (PCS-12)</h3>
            <ScoreGauge score={pcs12} label="PCS-12" />
            <p className="text-sm text-gray-600 mt-2">{diffLabel(pcs12)}</p>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${bandColorClass(pcsBand)}`}
            >
              {pcsBand}
            </span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
            <h3 className="font-semibold text-[#1a3a5c] mb-2">Mental Health (MCS-12)</h3>
            <ScoreGauge score={mcs12} label="MCS-12" />
            <p className="text-sm text-gray-600 mt-2">{diffLabel(mcs12)}</p>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${bandColorClass(mcsBand)}`}
            >
              {mcsBand}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-6 space-y-4">
          <div>
            <h3 className="font-semibold text-[#1a3a5c] mb-1">Physical Health Summary</h3>
            <p className="text-sm text-gray-600">
              The Physical Component Summary (PCS-12) reflects your ability to perform
              physical activities, manage pain, and maintain energy levels.{" "}
              {RECOMMENDATIONS[pcsBand].pcs}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-[#1a3a5c] mb-1">Mental Health Summary</h3>
            <p className="text-sm text-gray-600">
              The Mental Component Summary (MCS-12) reflects your mood, sense of calm,
              and ability to engage in social activities.{" "}
              {RECOMMENDATIONS[mcsBand].mcs}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center no-print mb-6">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-6 py-2 rounded-md border border-[#1a3a5c] text-[#1a3a5c] text-sm font-semibold hover:bg-[#1a3a5c]/5 transition-colors"
          >
            Print / Save Results
          </button>
          <Link
            href="/"
            className="px-6 py-2 rounded-md bg-[#c8a951] text-[#1a3a5c] text-sm font-semibold hover:bg-[#ddc379] transition-colors text-center"
          >
            Submit Another Response
          </Link>
        </div>
      </main>

      <footer className="bg-gray-50 border-t border-gray-200 py-4 px-4 text-center text-xs text-gray-500">
        SF-12v1 Health Survey © Ware, Kosinski &amp; Keller (1996). Scores are norm-based
        relative to the US general population (mean = 50, SD = 10).
      </footer>
    </div>
  );
}
