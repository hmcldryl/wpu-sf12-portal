import { SF12Response, ScoreBand } from "./types";

export function getScoreBand(score: number): ScoreBand {
  if (score >= 55) return "Above Average";
  if (score >= 45) return "Average";
  return "Below Average";
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function stdDev(values: number[], avg: number): number {
  if (values.length === 0) return 0;
  const variance =
    values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function computeSummaryStats(responses: SF12Response[]) {
  const total = responses.length;
  const pcsValues = responses.map((r) => r.pcs12);
  const mcsValues = responses.map((r) => r.mcs12);

  const avgPCS = mean(pcsValues);
  const avgMCS = mean(mcsValues);
  const sdPCS = stdDev(pcsValues, avgPCS);
  const sdMCS = stdDev(mcsValues, avgMCS);

  const belowAverageCount = responses.filter(
    (r) => r.pcs12 < 45 || r.mcs12 < 45
  ).length;
  const belowAveragePct = total === 0 ? 0 : (belowAverageCount / total) * 100;

  return {
    total,
    avgPCS,
    sdPCS,
    avgMCS,
    sdMCS,
    belowAverageCount,
    belowAveragePct,
  };
}

export function getScoreDistribution(
  responses: SF12Response[],
  field: "pcs12" | "mcs12"
) {
  const total = responses.length;
  const counts = { belowAverage: 0, average: 0, aboveAverage: 0 };

  for (const r of responses) {
    const score = r[field];
    if (score < 45) counts.belowAverage++;
    else if (score < 55) counts.average++;
    else counts.aboveAverage++;
  }

  const pct = (count: number) => (total === 0 ? 0 : (count / total) * 100);

  return {
    belowAverage: { count: counts.belowAverage, pct: pct(counts.belowAverage) },
    average: { count: counts.average, pct: pct(counts.average) },
    aboveAverage: { count: counts.aboveAverage, pct: pct(counts.aboveAverage) },
  };
}

export type HealthCategory =
  | "Healthy"
  | "Physical Concern"
  | "Mental Concern"
  | "Combined Concern";

export function categorizeHealth(response: SF12Response): HealthCategory {
  const pcsLow = response.pcs12 < 45;
  const mcsLow = response.mcs12 < 45;

  if (pcsLow && mcsLow) return "Combined Concern";
  if (pcsLow) return "Physical Concern";
  if (mcsLow) return "Mental Concern";
  return "Healthy";
}

export function getHealthOverview(responses: SF12Response[]) {
  const total = responses.length;
  const counts: Record<HealthCategory, number> = {
    Healthy: 0,
    "Physical Concern": 0,
    "Mental Concern": 0,
    "Combined Concern": 0,
  };

  for (const r of responses) {
    counts[categorizeHealth(r)]++;
  }

  const pct = (count: number) => (total === 0 ? 0 : (count / total) * 100);

  return (Object.entries(counts) as [HealthCategory, number][]).map(([category, count]) => ({
    category,
    count,
    pct: pct(count),
  }));
}

export function groupByField(
  responses: SF12Response[],
  field: keyof SF12Response
): Record<string, { count: number; avgPCS: number; avgMCS: number }> {
  const groups: Record<string, SF12Response[]> = {};

  for (const r of responses) {
    const key = String(r[field] ?? "Unknown");
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  }

  const result: Record<string, { count: number; avgPCS: number; avgMCS: number }> = {};
  for (const [key, group] of Object.entries(groups)) {
    result[key] = {
      count: group.length,
      avgPCS: mean(group.map((r) => r.pcs12)),
      avgMCS: mean(group.map((r) => r.mcs12)),
    };
  }

  return result;
}

const CSV_HEADERS = [
  "Timestamp", "College/Unit", "Campus/Station", "Age Group", "Sex at Birth", "Gender",
  "Employment Type", "Academic Rank", "Teaching Load (Previous Sem.)", "Employment Status", "Salary Grade", "Walkable Spaces Available",
  "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10", "Q11", "Q12",
  "PCS-12", "MCS-12", "PCS Band", "MCS Band",
];

function csvEscape(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function formatForCSV(responses: SF12Response[]): string {
  const rows = [CSV_HEADERS.join(",")];

  for (const r of responses) {
    const row = [
      r.timestamp,
      r.collegeUnit,
      r.campus,
      r.ageGroup,
      r.sexAtBirth,
      r.gender,
      r.employmentType,
      r.academicRank || "",
      r.teachingLoad || "",
      r.employmentStatus,
      r.salaryGrade,
      r.walkableSpaces,
      r.rawResponses.Q1, r.rawResponses.Q2, r.rawResponses.Q3, r.rawResponses.Q4,
      r.rawResponses.Q5, r.rawResponses.Q6, r.rawResponses.Q7, r.rawResponses.Q8,
      r.rawResponses.Q9, r.rawResponses.Q10, r.rawResponses.Q11, r.rawResponses.Q12,
      r.pcs12,
      r.mcs12,
      getScoreBand(r.pcs12),
      getScoreBand(r.mcs12),
    ];
    rows.push(row.map(csvEscape).join(","));
  }

  return rows.join("\n");
}
