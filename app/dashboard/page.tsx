import Image from "next/image";
import Link from "next/link";
import { version } from "@/package.json";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { SF12Response } from "@/lib/types";
import { computeSummaryStats } from "@/lib/dashboardUtils";
import StatCard from "@/components/dashboard/StatCard";
import ScoreDistributionChart from "@/components/dashboard/ScoreDistributionChart";
import HealthOverview from "@/components/dashboard/HealthOverview";
import DepartmentBreakdown from "@/components/dashboard/DepartmentBreakdown";
import WalkableSpacesChart from "@/components/dashboard/WalkableSpacesChart";
import TeachingLoadChart from "@/components/dashboard/TeachingLoadChart";
import ResponsesTable from "@/components/dashboard/ResponsesTable";
import ScoringGuide from "@/components/dashboard/ScoringGuide";
import ExportButtons from "@/components/dashboard/ExportButtons";
import ResetDataButton from "@/components/dashboard/ResetDataButton";
import LogoutButton from "@/components/dashboard/LogoutButton";

export const dynamic = "force-dynamic";

async function getResponses(): Promise<SF12Response[]> {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection("sf12_responses").get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        timestamp: data.timestamp,
        collegeUnit: data.collegeUnit,
        campus: data.campus,
        ageGroup: data.ageGroup,
        sexAtBirth: data.sexAtBirth,
        gender: data.gender,
        employmentType: data.employmentType,
        academicRank: data.academicRank || "",
        teachingLoad: typeof data.teachingLoad === "number" ? data.teachingLoad : undefined,
        employmentStatus: data.employmentStatus,
        salaryGrade: data.salaryGrade,
        walkableSpaces: data.walkableSpaces,
        rawResponses: data.rawResponses,
        pcs12: data.pcs12,
        mcs12: data.mcs12,
      } as SF12Response;
    });
  } catch (err) {
    console.error("Failed to fetch responses:", err);
    return [];
  }
}

export default async function DashboardPage() {
  const responses = await getResponses();
  const stats = computeSummaryStats(responses);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="text-white" style={{ background: "#0076cd" }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Image src="/wpu-logo.png" alt="Western Philippines University" width={36} height={36} />
            <div>
              <p className="text-xs text-[#fff504] uppercase tracking-wide">Western Philippines University</p>
              <h1 className="text-lg font-semibold">WPU SF-12 Portal | Admin Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ExportButtons />
            <Link
              href="/dashboard/config"
              className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-white/50 text-white text-sm font-medium hover:bg-white/10 transition-colors whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Scoring Config
            </Link>
            <ResetDataButton />
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 space-y-8">
        {/* Section 1 — KPI Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Total Responses"
            value={String(stats.total)}
            accentColor="#0076cd"
          />
          <StatCard
            label="Avg PCS-12"
            value={stats.avgPCS.toFixed(2)}
            detail={`±${stats.sdPCS.toFixed(2)} SD`}
            accentColor="#0076cd"
          />
          <StatCard
            label="Avg MCS-12"
            value={stats.avgMCS.toFixed(2)}
            detail={`±${stats.sdMCS.toFixed(2)} SD`}
            accentColor="#35a529"
          />
          <StatCard
            label="Below Average (either)"
            value={String(stats.belowAverageCount)}
            detail={`${stats.belowAveragePct.toFixed(1)}% of total`}
            accentColor={stats.belowAverageCount === 0 ? "#16a34a" : "#dc2626"}
          />
        </section>

        {/* Overall Wellbeing Overview */}
        <section>
          <HealthOverview responses={responses} />
        </section>

        {/* Section 2 — Score Distribution */}
        <section className="grid sm:grid-cols-2 gap-6">
          <ScoreDistributionChart responses={responses} field="pcs12" title="PCS-12 Distribution" />
          <ScoreDistributionChart responses={responses} field="mcs12" title="MCS-12 Distribution" />
        </section>

        {/* Walkable Spaces */}
        <section>
          <WalkableSpacesChart responses={responses} />
        </section>

        {/* Teaching Load (Faculty) */}
        <section>
          <TeachingLoadChart responses={responses} />
        </section>

        {/* Section 3 — Breakdown by Group */}
        <section className="space-y-6">
          <DepartmentBreakdown responses={responses} field="collegeUnit" title="College / Unit" />
          <DepartmentBreakdown responses={responses} field="campus" title="Campus / Station" />
          <DepartmentBreakdown responses={responses} field="ageGroup" title="Age Group" />
          <DepartmentBreakdown responses={responses} field="employmentType" title="Employment Type" />
          <DepartmentBreakdown responses={responses} field="employmentStatus" title="Employment Status" />
          <DepartmentBreakdown responses={responses} field="sexAtBirth" title="Sex at Birth" />
          <DepartmentBreakdown responses={responses} field="gender" title="Gender" />
        </section>

        {/* Scoring Methodology */}
        <section>
          <ScoringGuide />
        </section>

        {/* Section 4 — Individual Responses */}
        <section>
          <ResponsesTable responses={responses} />
        </section>
      </main>

      <footer className="border-t border-gray-200 py-3 px-4 text-center text-xs text-gray-400">
        WPU SF-12 Portal v{version}
      </footer>
    </div>
  );
}
