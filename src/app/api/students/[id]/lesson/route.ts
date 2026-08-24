import { NextRequest, NextResponse } from "next/server";
import { requireAccount, isResponse, bad, guardStudentScope } from "@/lib/api";
import { markLessonSeen, saveStudent, studentFor } from "@/lib/students";
import { LESSON_KEYS } from "@/lib/lessons";

/** POST: record that a lesson has been taught, so it is not shown again. */
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
  const key = body?.key;
  if (typeof key !== "string" || !(LESSON_KEYS as readonly string[]).includes(key)) {
    return bad("Unknown lesson.");
  }
  markLessonSeen(student, key);
  await saveStudent(student);
  return NextResponse.json({ ok: true });
}
