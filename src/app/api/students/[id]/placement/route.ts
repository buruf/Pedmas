import { NextRequest, NextResponse } from "next/server";
import { requireAccount, isResponse, bad, guardStudentScope } from "@/lib/api";
import {
  beginPlacement,
  placementAnswer,
  placementCurrent,
  saveStudent,
  studentFor,
} from "@/lib/students";
import { ensureAccountRegion } from "@/lib/regionServer";
import { sendMail } from "@/lib/email/send";
import { placementReportMail } from "@/lib/email/templates";
import { appUrl } from "@/lib/billing/stripe";

/** GET: current placement question (starts placement if needed). */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const account = await requireAccount();
  if (isResponse(account)) return account;
  const { id } = await ctx.params;
  // A child session may reach only its own record; anything else is 404,
  // which reveals nothing about whether a sibling exists.
  const scope = await guardStudentScope(id);
  if (scope) return scope;
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
  const region = await ensureAccountRegion(account);
  const current = placementCurrent(student, region);
  await saveStudent(student);
  return NextResponse.json({ done: false, current });
}

/** POST: submit an answer to the current placement question. */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const account = await requireAccount();
  if (isResponse(account)) return account;
  const { id } = await ctx.params;
  // A child session may reach only its own record; anything else is 404,
  // which reveals nothing about whether a sibling exists.
  const scope = await guardStudentScope(id);
  if (scope) return scope;
  const student = await studentFor(account, id);
  if (!student) return bad("Student not found.", 404);
  const body = await req.json().catch(() => null);
  const idk = body?.idk === true;
  if (!idk && typeof body?.answer !== "string") return bad("An answer is required.");
  const wasPlaced = Boolean(student.placedAt);
  const result = placementAnswer(student, idk ? "" : body.answer, { idk });
  if (!result) return bad("No placement in progress.", 409);
  await saveStudent(student);

  // First completion only: email the parent the starting profile.
  if (!wasPlaced && student.placedAt && student.placementReport?.length) {
    try {
      await sendMail(
        placementReportMail(
          account.email,
          account.name,
          student.name,
          student.grade,
          student.placementReport.map((r) => ({
            strandName: r.strandName,
            level: r.level,
            status: r.status,
          })),
          `${appUrl()}/parent/${student.id}`
        )
      );
    } catch (err) {
      console.error("[email:placementReport]", err instanceof Error ? err.message : err);
    }
  }

  return NextResponse.json(result);
}

/** PUT: restart placement (retake). */
export async function PUT(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const account = await requireAccount();
  if (isResponse(account)) return account;
  const { id } = await ctx.params;
  // A child session may reach only its own record; anything else is 404,
  // which reveals nothing about whether a sibling exists.
  const scope = await guardStudentScope(id);
  if (scope) return scope;
  const student = await studentFor(account, id);
  if (!student) return bad("Student not found.", 404);
  beginPlacement(student);
  await saveStudent(student);
  return NextResponse.json({ ok: true });
}
