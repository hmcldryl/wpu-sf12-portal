import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { formatForCSV } from "@/lib/dashboardUtils";
import { SF12Response } from "@/lib/types";

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

  const csv = formatForCSV(responses);
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="wpu-sf12-responses-${date}.csv"`,
    },
  });
}
