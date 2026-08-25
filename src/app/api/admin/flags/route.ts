import { NextResponse } from "next/server";
import { requireParent, isResponse, bad } from "@/lib/api";
import { allRows, putRow, deleteRow, newId } from "@/lib/store/db";

/**
 * Persistent question flags (spec §21).
 *
 * The preview's health check finds problems in the moment; this is the
 * memory. A question flagged during review stays flagged — with who, when,
 * why and the exact rendered text — until someone resolves it, so a concern
 * spotted on Tuesday is not lost by Wednesday.
 */
export interface QuestionFlag {
  id: string;
  skillId: string;
  stage: number;
  prompt: string;
  answer: string;
  reason: string;
  flaggedBy: string;
  flaggedAt: number;
}

async function requireAdmin() {
  const account = await requireParent();
  if (isResponse(account)) return account;
  if (account.role !== "ADMIN") return bad("Admin only.", 403);
  return account;
}

export async function GET() {
  const admin = await requireAdmin();
  if (isResponse(admin)) return admin;
  const flags = await allRows<QuestionFlag>("questionFlags");
  return NextResponse.json({ flags: flags.sort((a, b) => b.flaggedAt - a.flaggedAt) });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (isResponse(admin)) return admin;
  const body = await req.json().catch(() => null);
  const skillId = typeof body?.skillId === "string" ? body.skillId : "";
  const prompt = typeof body?.prompt === "string" ? body.prompt : "";
  if (!skillId || !prompt) return bad("skillId and prompt are required.");

  const flag: QuestionFlag = {
    id: newId("flag"),
    skillId,
    stage: typeof body?.stage === "number" ? body.stage : 0,
    prompt: prompt.slice(0, 500),
    answer: typeof body?.answer === "string" ? body.answer.slice(0, 200) : "",
    reason: (typeof body?.reason === "string" && body.reason.trim() ? body.reason.trim() : "Flagged for review").slice(0, 300),
    flaggedBy: admin.email,
    flaggedAt: Date.now(),
  };
  await putRow("questionFlags", flag.id, flag);
  return NextResponse.json({ ok: true, id: flag.id });
}

export async function DELETE(req: Request) {
  const admin = await requireAdmin();
  if (isResponse(admin)) return admin;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return bad("Missing id.");
  await deleteRow("questionFlags", id);
  return NextResponse.json({ ok: true });
}
