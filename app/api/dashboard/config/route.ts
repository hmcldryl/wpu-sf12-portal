import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { DEFAULT_WEIGHTS, SF12Weights } from "@/lib/sf12Scoring";

export async function GET() {
  try {
    const db = getAdminDb();
    const doc = await db.collection("sf12_config").doc("weights").get();
    if (doc.exists) {
      const raw = doc.data()?.weightsJson;
      if (raw) {
        const weights: SF12Weights = JSON.parse(raw);
        return NextResponse.json({ weights });
      }
    }
  } catch {
    // fall through to defaults
  }
  return NextResponse.json({ weights: DEFAULT_WEIGHTS });
}

export async function POST(request: NextRequest) {
  try {
    const { weights }: { weights: SF12Weights } = await request.json();
    const db = getAdminDb();
    await db.collection("sf12_config").doc("weights").set({
      weightsJson: JSON.stringify(weights),
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to save config:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
