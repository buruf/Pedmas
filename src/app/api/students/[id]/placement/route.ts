import { NextRequest, NextResponse } from "next/server";
import { requireAccount, isResponse, bad } from "@/lib/api";
import {
  beginPlacement,
  placementAnswer,
  placementCurrent,
  saveStudent,
  studentFor,
} from "@/lib/students";

/** GET: current placement question (starts placement if needed). */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const account = await requireAccount();
  if (isResponse(account)) return account;
  const { id } = await ctx.params;
  const student = await studentFor(account, id);
  if (!student) return bad("Student not found.", 404);
  if (student.placedAt && !student.placement?.done) {
    // placedAt implies a finished run; fall through to report below.
  }
  if (!student.placement) {
    beginPlacement(student);
    await saveStudent(student);
  }
  if (student.placement!.done) {
    return NextResponse.json({ done: true, report: student.placementReport ?? [] });
  }
  const current = placementCurrent(student);
  await saveStudent(student);
  return NextResponse.json({ done: false, current });
}

/** POST: submit an answer to the current placement question. */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const account = await requireAccount();
  if (isResponse(account)) return account;
  const { id } = await ctx.params;
  const student = await studentFor(account, id);
  if (!student) return bad("Student not found.", 404);
  const body = await req.json().catch(() => null);
  if (typeof body?.answer !== "string") return bad("An answer is required.");
  const result = placementAnswer(student, body.answer);
  if (!result) return bad("No placement in progress.", 409);
  await saveStudent(student);
  return NextResponse.json(result);
}

/** PUT: restart placement (retake). */
export async function PUT(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const account = await requireAccount();
  if (isResponse(account)) return account;
  const { id } = await ctx.params;
  const student = await studentFor(account, id);
  if (!student) return bad("Student not found.", 404);
  beginPlacement(student);
  await saveStudent(student);
  return NextResponse.json({ ok: true });
}
