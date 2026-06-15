import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { SF12Submission } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body: SF12Submission = await request.json();
  const { respondentInfo, rawResponses, pcs12, mcs12 } = body;

  const timestamp = new Date().toISOString();

  const doc = {
    timestamp,
    name: respondentInfo.name,
    employeeId: respondentInfo.employeeId || "",
    department: respondentInfo.department,
    employmentType: respondentInfo.employmentType,
    age: respondentInfo.age,
    sex: respondentInfo.sex,
    rawResponses,
    pcs12,
    mcs12,
  };

  try {
    const db = getAdminDb();
    await db.collection("sf12_responses").add(doc);
  } catch (err) {
    console.error("Failed to save response to Firestore:", err);
    return NextResponse.json({ success: false, error: "Failed to save response" }, { status: 500 });
  }

  const gasUrl = process.env.GAS_WEBHOOK_URL;
  if (gasUrl) {
    try {
      await fetch(gasUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doc),
      });
    } catch (err) {
      console.error("Failed to POST to GAS webhook:", err);
    }
  }

  return NextResponse.json({ success: true, pcs12, mcs12 });
}
