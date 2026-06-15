import { getAdminDb } from "@/lib/firebaseAdmin";
import { SF12Response } from "@/lib/types";
import { computeSummaryStats } from "@/lib/dashboardUtils";
import StatCard from "@/components/dashboard/StatCard";
import ScoreDistributionChart from "@/components/dashboard/ScoreDistributionChart";
import DepartmentBreakdown from "@/components/dashboard/DepartmentBreakdown";
import ResponsesTable from "@/components/dashboard/ResponsesTable";
import ExportButtons from "@/components/dashboard/ExportButtons";
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
        name: data.name,
        employeeId: data.employeeId || "",
        department: data.department,
        employmentType: data.employmentType,
        age: data.age,
        sex: data.sex,
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
          <div>
            <p className="text-xs text-[#c8a951] uppercase tracking-wide">Western Philippines University</p>
            <h1 className="text-lg font-semibold">WPU SF-12 Portal — Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <ExportButtons />
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

        {/* Section 2 — Score Distribution */}
        <section className="grid sm:grid-cols-2 gap-6">
          <ScoreDistributionChart responses={responses} field="pcs12" title="PCS-12 Distribution" />
          <ScoreDistributionChart responses={responses} field="mcs12" title="MCS-12 Distribution" />
        </section>

        {/* Section 3 — Breakdown by Group */}
        <section className="space-y-6">
          <DepartmentBreakdown responses={responses} field="department" title="Department / College" />
          <DepartmentBreakdown responses={responses} field="employmentType" title="Employment Type" />
          <DepartmentBreakdown responses={responses} field="sex" title="Sex" />
        </section>

        {/* Section 4 — Individual Responses */}
        <section>
          <ResponsesTable responses={responses} />
        </section>
      </main>
    </div>
  );
}
