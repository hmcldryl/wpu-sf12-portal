import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { SF12Response } from "@/lib/types";

export async function GET() {
  try {
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
      };
    });

    return NextResponse.json({ success: true, responses });
  } catch (err) {
    console.error("Failed to fetch responses:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch responses" }, { status: 500 });
  }
}
