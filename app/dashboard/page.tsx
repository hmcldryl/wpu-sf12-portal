import Image from "next/image";
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
        teachingLoad: data.teachingLoad || "",
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
      <header className="bg-[#1a3a5c] text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Image src="/wpu-logo.png" alt="Western Philippines University" width={36} height={36} />
            <div>
              <p className="text-xs text-[#c8a951] uppercase tracking-wide">Western Philippines University</p>
              <h1 className="text-lg font-semibold">WPU SF-12 Portal — Admin Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ExportButtons />
            <ResetDataButton />
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 space-y-8">
        {/* Section 1 — KPI Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Responses" value={String(stats.total)} />
          <StatCard
            label="Avg PCS-12"
            value={stats.avgPCS.toFixed(2)}
            detail={`±${stats.sdPCS.toFixed(2)} SD`}
          />
          <StatCard
            label="Avg MCS-12"
            value={stats.avgMCS.toFixed(2)}
            detail={`±${stats.sdMCS.toFixed(2)} SD`}
          />
          <StatCard
            label="Below Average (either)"
            value={String(stats.belowAverageCount)}
            detail={`${stats.belowAveragePct.toFixed(1)}% of total`}
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
