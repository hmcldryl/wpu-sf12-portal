"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SF12_STEPS } from "@/lib/sf12Questions";
import { DEFAULT_WEIGHTS, SF12Weights } from "@/lib/sf12Scoring";

type DraftWeights = Record<string, Record<string, [string, string]>>;

function toDraft(weights: SF12Weights): DraftWeights {
  const draft: DraftWeights = {};
  for (const [q, answers] of Object.entries(weights)) {
    draft[q] = {};
    for (const [k, [p, m]] of Object.entries(answers)) {
      draft[q][k] = [String(p), String(m)];
    }
  }
  return draft;
}

function toWeights(draft: DraftWeights): SF12Weights {
  const weights: SF12Weights = {};
  for (const [q, answers] of Object.entries(draft)) {
    weights[q] = {};
    for (const [k, [p, m]] of Object.entries(answers)) {
      weights[q][k] = [parseFloat(p) || 0, parseFloat(m) || 0];
    }
  }
  return weights;
}

const ALL_QUESTIONS = SF12_STEPS.flatMap((step) => step.questions);

export default function ConfigPage() {
  const [draft, setDraft] = useState<DraftWeights>(toDraft(DEFAULT_WEIGHTS));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [openQ, setOpenQ] = useState<string | null>("Q1");

  useEffect(() => {
    fetch("/api/dashboard/config")
      .then((r) => r.json())
      .then((data) => {
        if (data.weights) setDraft(toDraft(data.weights));
      })
      .catch(() => {});
  }, []);

  function setVal(q: string, k: string, idx: 0 | 1, val: string) {
    setDraft((prev) => ({
      ...prev,
      [q]: {
        ...prev[q],
        [k]: idx === 0
          ? [val, prev[q][k][1]]
          : [prev[q][k][0], val],
      },
    }));
  }

  async function handleSave() {
    setStatus("saving");
    try {
      const res = await fetch("/api/dashboard/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weights: toWeights(draft) }),
      });
      setStatus(res.ok ? "saved" : "error");
    } catch {
      setStatus("error");
    }
  }

  function handleReset() {
    setDraft(toDraft(DEFAULT_WEIGHTS));
    setStatus("idle");
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-[#1a3a5c] text-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Image src="/wpu-logo.png" alt="Western Philippines University" width={36} height={36} />
            <div>
              <p className="text-xs text-[#c8a951] uppercase tracking-wide">Western Philippines University</p>
              <h1 className="text-lg font-semibold">SF-12 Scoring Weights — Configuration</h1>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-[#c8a951] hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-6">
        {/* Info card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-[#1a3a5c] mb-1">About these weights</h2>
          <p className="text-sm text-gray-600">
            Each question/answer pair maps to a physical delta and mental delta used to compute
            PCS-12 and MCS-12. The defaults are from the SF-12 v1.0 norm-based scoring algorithm.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Source:{" "}
            <a
              href="https://doi.org/10.1097/00005650-199603000-00003"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[#1a3a5c]"
            >
              Ware et al. (1996). A 12-Item Short-Form Health Survey. <em>Medical Care</em> 34(3).
              doi:10.1097/00005650-199603000-00003
            </a>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Formula: <span className="font-mono">PCS-12 = Σ(physicalΔ) + 56.57706</span>
            {" · "}
            <span className="font-mono">MCS-12 = Σ(mentalΔ) + 60.75781</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={status === "saving"}
            className="px-4 py-2 bg-[#1a3a5c] text-white text-sm rounded-lg hover:bg-[#0f2a45] disabled:opacity-50 transition-colors"
          >
            {status === "saving" ? "Saving…" : "Save Changes"}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset to Defaults
          </button>
          {status === "saved" && (
            <span className="text-sm text-green-600">Saved. New submissions will use these weights.</span>
          )}
          {status === "error" && (
            <span className="text-sm text-red-600">Save failed. Try again.</span>
          )}
        </div>

        {/* Per-question tables */}
        {ALL_QUESTIONS.map((qDef) => {
          const q = qDef.id;
          const qDraft = draft[q] ?? {};
          const isOpen = openQ === q;
          return (
            <div key={q} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setOpenQ(isOpen ? null : q)}
                className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-[#1a3a5c]">
                  {q} — {qDef.text}
                </span>
                <span className="text-gray-400 select-none">{isOpen ? "▲" : "▼"}</span>
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 overflow-x-auto">
                  <table className="text-sm w-full border-collapse min-w-[480px]">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-4 py-2 border-b border-gray-200 text-gray-500 font-medium w-1/2">
                          Answer
                        </th>
                        <th className="text-center px-4 py-2 border-b border-gray-200 text-[#1a3a5c] font-medium">
                          Physical Δ
                        </th>
                        <th className="text-center px-4 py-2 border-b border-gray-200 text-[#c8a951] font-medium">
                          Mental Δ
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {qDef.options.map((opt, i) => {
                        const k = String(opt.value);
                        const [pVal, mVal] = qDraft[k] ?? ["0", "0"];
                        const isBest = parseFloat(pVal) === 0 && parseFloat(mVal) === 0;
                        return (
                          <tr key={k} className={isBest ? "bg-green-50" : i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="px-4 py-2 border-b border-gray-100 text-gray-700">
                              {opt.label}
                              {isBest && (
                                <span className="ml-2 text-green-600 text-[10px] font-medium">
                                  best health
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2 border-b border-gray-100">
                              <input
                                type="number"
                                step="any"
                                value={pVal}
                                onChange={(e) => setVal(q, k, 0, e.target.value)}
                                className="w-full font-mono text-xs text-center border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#1a3a5c] text-[#1a3a5c]"
                              />
                            </td>
                            <td className="px-4 py-2 border-b border-gray-100">
                              <input
                                type="number"
                                step="any"
                                value={mVal}
                                onChange={(e) => setVal(q, k, 1, e.target.value)}
                                className="w-full font-mono text-xs text-center border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#c8a951] text-[#c8a951]"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
