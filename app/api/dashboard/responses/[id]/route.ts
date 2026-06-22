import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const ref = db.collection("sf12_responses").doc(id);
    const snap = await ref.get();
    const timestamp: string | undefined = snap.data()?.timestamp;

    await ref.delete();

    const gasUrl = process.env.GAS_WEBHOOK_URL;
    if (gasUrl && timestamp) {
      fetch(gasUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", timestamp }),
      }).catch((err) => console.error("Failed to notify GAS of delete:", err));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete response:", err);
    return NextResponse.json({ success: false, error: "Failed to delete response" }, { status: 500 });
  }
}
