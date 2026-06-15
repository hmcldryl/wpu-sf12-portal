import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export async function DELETE() {
  try {
    const db = getAdminDb();
    const collection = db.collection("sf12_responses");

    let deleted = 0;
    while (true) {
      const snapshot = await collection.limit(500).get();
      if (snapshot.empty) break;

      const batch = db.batch();
      for (const doc of snapshot.docs) {
        batch.delete(doc.ref);
      }
      await batch.commit();
      deleted += snapshot.size;
    }

    return NextResponse.json({ success: true, deleted });
  } catch (err) {
    console.error("Failed to reset responses:", err);
    return NextResponse.json({ success: false, error: "Failed to reset data" }, { status: 500 });
  }
}
