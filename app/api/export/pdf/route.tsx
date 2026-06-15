import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { SF12Response } from "@/lib/types";
import { computeSummaryStats, getScoreDistribution, groupByField } from "@/lib/dashboardUtils";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica", color: "#1a1a1a" },
  title: { fontSize: 22, fontWeight: "bold", color: "#1a3a5c", marginBottom: 8 },
  subtitle: { fontSize: 13, color: "#444", marginBottom: 4 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#1a3a5c", marginBottom: 12 },
  text: { marginBottom: 6, lineHeight: 1.5 },
  table: { display: "flex", flexDirection: "column", marginTop: 8, marginBottom: 16 },
  tableRow: { flexDirection: "row", borderBottom: "1 solid #e5e7eb", paddingVertical: 4 },
  tableHeaderRow: { flexDirection: "row", borderBottom: "2 solid #1a3a5c", paddingVertical: 4 },
  cell: { flex: 1, fontSize: 10 },
  cellHeader: { flex: 1, fontSize: 10, fontWeight: "bold", color: "#1a3a5c" },
  cover: { flex: 1, justifyContent: "center", alignItems: "center", textAlign: "center" },
  goldBar: { width: 80, height: 4, backgroundColor: "#c8a951", marginVertical: 16 },
  footerText: { fontSize: 9, color: "#666", marginTop: 4, lineHeight: 1.5 },
});

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

interface ReportProps {
  responses: SF12Response[];
}

function ReportDocument({ responses }: ReportProps) {
  const stats = computeSummaryStats(responses);
  const pcsDist = getScoreDistribution(responses, "pcs12");
  const mcsDist = getScoreDistribution(responses, "mcs12");
  const belowPCS = responses.filter((r) => r.pcs12 < 45).length;
  const belowMCS = responses.filter((r) => r.mcs12 < 45).length;
  const total = stats.total || 1;

  const byDepartment = groupByField(responses, "department");
  const byEmploymentType = groupByField(responses, "employmentType");
  const bySex = groupByField(responses, "sex");

  return (
    <Document>
      {/* Page 1 — Cover */}
      <Page size="A4" style={styles.page}>
        <View style={styles.cover}>
          <Text style={styles.title}>WPU SF-12 Portal</Text>
          <Text style={styles.subtitle}>Western Philippines University</Text>
          <View style={styles.goldBar} />
          <Text style={styles.text}>Report generated: {formatDate()}</Text>
          <Text style={styles.text}>Total respondents: {stats.total}</Text>
        </View>
      </Page>

      {/* Page 2 — Executive Summary */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        <Text style={styles.text}>Average PCS-12: {stats.avgPCS.toFixed(2)} (±{stats.sdPCS.toFixed(2)})</Text>
        <Text style={styles.text}>Average MCS-12: {stats.avgMCS.toFixed(2)} (±{stats.sdMCS.toFixed(2)})</Text>
        <Text style={styles.text}>
          Respondents below average on PCS: {belowPCS} ({((belowPCS / total) * 100).toFixed(1)}%)
        </Text>
        <Text style={styles.text}>
          Respondents below average on MCS: {belowMCS} ({((belowMCS / total) * 100).toFixed(1)}%)
        </Text>
        <Text style={styles.text}>
          Respondents below average on either: {stats.belowAverageCount} ({stats.belowAveragePct.toFixed(1)}%)
        </Text>
      </Page>

      {/* Page 3 — Score Distribution */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Score Distribution</Text>

        <Text style={[styles.text, { fontWeight: "bold" }]}>PCS-12 Band Breakdown</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.cellHeader}>Band</Text>
            <Text style={styles.cellHeader}>Count</Text>
            <Text style={styles.cellHeader}>Percentage</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cell}>Below Average</Text>
            <Text style={styles.cell}>{pcsDist.belowAverage.count}</Text>
            <Text style={styles.cell}>{pcsDist.belowAverage.pct.toFixed(1)}%</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cell}>Average</Text>
            <Text style={styles.cell}>{pcsDist.average.count}</Text>
            <Text style={styles.cell}>{pcsDist.average.pct.toFixed(1)}%</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cell}>Above Average</Text>
            <Text style={styles.cell}>{pcsDist.aboveAverage.count}</Text>
            <Text style={styles.cell}>{pcsDist.aboveAverage.pct.toFixed(1)}%</Text>
          </View>
        </View>

        <Text style={[styles.text, { fontWeight: "bold" }]}>MCS-12 Band Breakdown</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.cellHeader}>Band</Text>
            <Text style={styles.cellHeader}>Count</Text>
            <Text style={styles.cellHeader}>Percentage</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cell}>Below Average</Text>
            <Text style={styles.cell}>{mcsDist.belowAverage.count}</Text>
            <Text style={styles.cell}>{mcsDist.belowAverage.pct.toFixed(1)}%</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cell}>Average</Text>
            <Text style={styles.cell}>{mcsDist.average.count}</Text>
            <Text style={styles.cell}>{mcsDist.average.pct.toFixed(1)}%</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cell}>Above Average</Text>
            <Text style={styles.cell}>{mcsDist.aboveAverage.count}</Text>
            <Text style={styles.cell}>{mcsDist.aboveAverage.pct.toFixed(1)}%</Text>
          </View>
        </View>
      </Page>

      {/* Page 4 — Breakdown by Group */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Breakdown by Group</Text>

        <Text style={[styles.text, { fontWeight: "bold" }]}>By Department / College</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.cellHeader}>Department</Text>
            <Text style={styles.cellHeader}>Count</Text>
            <Text style={styles.cellHeader}>Avg PCS-12</Text>
            <Text style={styles.cellHeader}>Avg MCS-12</Text>
          </View>
          {Object.entries(byDepartment).map(([name, s]) => (
            <View style={styles.tableRow} key={name}>
              <Text style={styles.cell}>{name}</Text>
              <Text style={styles.cell}>{s.count}</Text>
              <Text style={styles.cell}>{s.avgPCS.toFixed(2)}</Text>
              <Text style={styles.cell}>{s.avgMCS.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.text, { fontWeight: "bold" }]}>By Employment Type</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.cellHeader}>Type</Text>
            <Text style={styles.cellHeader}>Count</Text>
            <Text style={styles.cellHeader}>Avg PCS-12</Text>
            <Text style={styles.cellHeader}>Avg MCS-12</Text>
          </View>
          {Object.entries(byEmploymentType).map(([name, s]) => (
            <View style={styles.tableRow} key={name}>
              <Text style={styles.cell}>{name}</Text>
              <Text style={styles.cell}>{s.count}</Text>
              <Text style={styles.cell}>{s.avgPCS.toFixed(2)}</Text>
              <Text style={styles.cell}>{s.avgMCS.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.text, { fontWeight: "bold" }]}>By Sex</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.cellHeader}>Sex</Text>
            <Text style={styles.cellHeader}>Count</Text>
            <Text style={styles.cellHeader}>Avg PCS-12</Text>
            <Text style={styles.cellHeader}>Avg MCS-12</Text>
          </View>
          {Object.entries(bySex).map(([name, s]) => (
            <View style={styles.tableRow} key={name}>
              <Text style={styles.cell}>{name}</Text>
              <Text style={styles.cell}>{s.count}</Text>
              <Text style={styles.cell}>{s.avgPCS.toFixed(2)}</Text>
              <Text style={styles.cell}>{s.avgMCS.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </Page>

      {/* Page 5 — Citation & Disclaimer */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Citation &amp; Disclaimer</Text>
        <Text style={styles.text}>
          Based on the SF-12v1 Health Survey (Ware, Kosinski &amp; Keller, 1996). This tool is for
          wellness awareness only and does not constitute a clinical diagnosis.
        </Text>

        <Text style={[styles.text, { marginTop: 16, fontWeight: "bold" }]}>References</Text>
        <Text style={styles.footerText}>
          Ware, J. E., Kosinski, M., &amp; Keller, S. D. (1996). A 12-Item Short-Form Health Survey:
          Construction of scales and preliminary tests of reliability and validity. Medical Care,
          34(3), 220–233. https://doi.org/10.1097/00005650-199603000-00003
        </Text>
        <Text style={styles.footerText}>
          Gandek, B., Ware, J. E., Aaronson, N. K., Apolone, G., Bjorner, J. B., Brazier, J. E.,
          Bullinger, M., Kaasa, S., Leplege, A., Prieto, L., &amp; Sullivan, M. (1998).
          Cross-validation of item selection and scoring for the SF-12 Health Survey in nine
          countries: Results from the IQOLA Project. Journal of Clinical Epidemiology, 51(11),
          1171–1178. https://doi.org/10.1016/S0895-4356(98)00109-7
        </Text>
        <Text style={styles.footerText}>
          OrthoToolKit. (n.d.). Free online SF-12 score calculator. https://orthotoolkit.com/sf-12/
        </Text>

        <Text style={[styles.text, { marginTop: 16, fontWeight: "bold" }]}>
          This report is for institutional wellness awareness only and does not constitute
          clinical diagnosis or medical advice.
        </Text>
      </Page>
    </Document>
  );
}

export async function GET() {
  const db = getAdminDb();
  const snapshot = await db.collection("sf12_responses").get();

  const responses: SF12Response[] = snapshot.docs.map((doc) => {
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

  const buffer = await renderToBuffer(<ReportDocument responses={responses} />);
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="wpu-sf12-summary-report-${date}.pdf"`,
    },
  });
}
