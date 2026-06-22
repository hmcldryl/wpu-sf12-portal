"use client";

import { Fragment, useMemo, useState } from "react";
import { getScoreBand } from "@/lib/dashboardUtils";
import { SF12Response } from "@/lib/types";

interface ResponsesTableProps {
  responses: SF12Response[];
}

type SortKey =
  | "timestamp"
  | "collegeUnit"
  | "campus"
  | "ageGroup"
  | "sexAtBirth"
  | "gender"
  | "employmentType"
  | "academicRank"
  | "teachingLoad"
  | "employmentStatus"
  | "salaryGrade"
  | "walkableSpaces"
  | "pcs12"
  | "mcs12";

const PAGE_SIZE = 20;

export default function ResponsesTable({ responses }: ResponsesTableProps) {
  const [search, setSearch] = useState("");
  const [employmentFilter, setEmploymentFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [pcsBandFilter, setPcsBandFilter] = useState("");
  const [mcsBandFilter, setMcsBandFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return responses.filter((r) => {
      if (term) {
        const haystack = `${r.collegeUnit} ${r.campus}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (employmentFilter && r.employmentType !== employmentFilter) return false;
      if (genderFilter && r.gender !== genderFilter) return false;
      if (pcsBandFilter && getScoreBand(r.pcs12) !== pcsBandFilter) return false;
      if (mcsBandFilter && getScoreBand(r.mcs12) !== mcsBandFilter) return false;
      return true;
    });
  }, [responses, search, employmentFilter, genderFilter, pcsBandFilter, mcsBandFilter]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      let cmp = 0;
      if (typeof av === "number" && typeof bv === "number") {
        cmp = av - bv;
      } else {
        cmp = String(av ?? "").localeCompare(String(bv ?? ""));
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " â–²" : " â–¼";
  }

  const columns: { key: SortKey; label: string }[] = [
    { key: "timestamp", label: "Timestamp" },
    { key: "collegeUnit", label: "College / Unit" },
    { key: "campus", label: "Campus / Station" },
    { key: "ageGroup", label: "Age" },
    { key: "sexAtBirth", label: "Sex at Birth" },
    { key: "gender", label: "Gender" },
    { key: "employmentType", label: "Type" },
    { key: "academicRank", label: "Academic Rank" },
    { key: "teachingLoad", label: "Teaching Load" },
    { key: "employmentStatus", label: "Employment Status" },
    { key: "salaryGrade", label: "Salary Grade" },
    { key: "walkableSpaces", label: "Walkable Spaces" },
    { key: "pcs12", label: "PCS-12" },
    { key: "mcs12", label: "MCS-12" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <h3 className="font-semibold text-[#0927eb] mb-4">Individual Responses</h3>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by college/unit or campus..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 min-w-[200px] border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0927eb]"
        />
        <select
          value={employmentFilter}
          onChange={(e) => { setEmploymentFilter(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">All Types</option>
          <option value="Faculty">Faculty</option>
          <option value="Staff">Staff</option>
        </select>
        <select
          value={genderFilter}
          onChange={(e) => { setGenderFilter(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Non-binary">Non-binary</option>
          <option value="Prefer not to say">Prefer not to say</option>
        </select>
        <select
          value={pcsBandFilter}
          onChange={(e) => { setPcsBandFilter(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">All PCS Bands</option>
          <option value="Above Average">PCS: Above Average</option>
          <option value="Average">PCS: Average</option>
          <option value="Below Average">PCS: Below Average</option>
        </select>
        <select
          value={mcsBandFilter}
          onChange={(e) => { setMcsBandFilter(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">All MCS Bands</option>
          <option value="Above Average">MCS: Above Average</option>
          <option value="Average">MCS: Average</option>
          <option value="Below Average">MCS: Below Average</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-2 pr-4">#</th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className="py-2 pr-4 cursor-pointer select-none hover:text-gray-700 whitespace-nowrap"
                >
                  {col.label}
                  {sortIndicator(col.key)}
                </th>
              ))}
              <th className="py-2 pr-4">PCS Band</th>
              <th className="py-2 pr-4">MCS Band</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((r, idx) => {
              const pcsBand = getScoreBand(r.pcs12);
              const mcsBand = getScoreBand(r.mcs12);
              const isLow = r.pcs12 < 45 || r.mcs12 < 45;
              const isExpanded = expandedId === r.id;

              return (
                <Fragment key={r.id}>
                  <tr
                    onClick={() => setExpandedId(isExpanded ? null : r.id)}
                    className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${isLow ? "bg-red-50" : ""}`}
                  >
                    <td className="py-2 pr-4">{(currentPage - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="py-2 pr-4 whitespace-nowrap">{new Date(r.timestamp).toLocaleString()}</td>
                    <td className="py-2 pr-4">{r.collegeUnit}</td>
                    <td className="py-2 pr-4">{r.campus}</td>
                    <td className="py-2 pr-4">{r.ageGroup}</td>
                    <td className="py-2 pr-4">{r.sexAtBirth}</td>
                    <td className="py-2 pr-4">{r.gender}</td>
                    <td className="py-2 pr-4">{r.employmentType}</td>
                    <td className="py-2 pr-4">{r.academicRank || "—"}</td>
                    <td className="py-2 pr-4">{r.teachingLoad || "—"}</td>
                    <td className="py-2 pr-4">{r.employmentStatus}</td>
                    <td className="py-2 pr-4">{r.salaryGrade}</td>
                    <td className="py-2 pr-4">{r.walkableSpaces}</td>
                    <td className="py-2 pr-4">{r.pcs12.toFixed(2)}</td>
                    <td className="py-2 pr-4">{r.mcs12.toFixed(2)}</td>
                    <td className="py-2 pr-4">{pcsBand}</td>
                    <td className="py-2 pr-4">{mcsBand}</td>
                  </tr>
                  {isExpanded && (
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <td colSpan={columns.length + 3} className="py-3 px-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs text-gray-600">
                          {Object.entries(r.rawResponses).map(([q, val]) => (
                            <div key={q} className="bg-white rounded border border-gray-200 px-2 py-1">
                              <span className="font-semibold">{q}:</span> {val}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={columns.length + 3} className="py-6 text-center text-gray-400">
                  No responses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
        <span>
          Showing {pageItems.length} of {sorted.length} responses
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-40"
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
