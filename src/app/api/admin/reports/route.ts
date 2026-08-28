import { NextResponse } from "next/server";
import { requireParent, isResponse, bad } from "@/lib/api";
import { deleteRow } from "@/lib/store/db";

/** Resolve (remove) a bug report once it has been acted on. */
export async function DELETE(req: Request) {
  const admin = await requireParent();
  if (isResponse(admin)) return admin;
  if (admin.role !== "ADMIN") return bad("Admin only.", 403);
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return bad("Missing id.");
  await deleteRow("bugReports", id);
  return NextResponse.json({ ok: true });
}
