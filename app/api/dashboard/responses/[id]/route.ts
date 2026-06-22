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
    await db.collection("sf12_responses").doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete response:", err);
    return NextResponse.json({ success: false, error: "Failed to delete response" }, { status: 500 });
  }
}
