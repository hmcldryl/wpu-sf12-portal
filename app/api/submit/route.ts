import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { SF12Submission } from "@/lib/types";
import { computeWithWeights, DEFAULT_WEIGHTS, SF12Weights } from "@/lib/sf12Scoring";

async function getConfigWeights(): Promise<SF12Weights> {
  try {
    const db = getAdminDb();
    const doc = await db.collection("sf12_config").doc("weights").get();
    if (doc.exists) {
      const raw = doc.data()?.weightsJson;
      if (raw) return JSON.parse(raw);
    }
  } catch {
    // fall through
  }
  return DEFAULT_WEIGHTS;
}

export async function POST(request: NextRequest) {
  const body: SF12Submission = await request.json();
  const { respondentInfo, rawResponses } = body;

  const weights = await getConfigWeights();
  const { pcs12, mcs12 } = computeWithWeights(rawResponses, weights);

  const timestamp = new Date().toISOString();

  const doc = {
    timestamp,
    collegeUnit: respondentInfo.collegeUnit,
    campus: respondentInfo.campus,
    ageGroup: respondentInfo.ageGroup,
    sexAtBirth: respondentInfo.sexAtBirth,
    gender: respondentInfo.gender,
    employmentType: respondentInfo.employmentType,
    academicRank: respondentInfo.academicRank || "",
    teachingLoad: respondentInfo.teachingLoad || "",
    employmentStatus: respondentInfo.employmentStatus,
    salaryGrade: respondentInfo.salaryGrade,
    walkableSpaces: respondentInfo.walkableSpaces,
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
