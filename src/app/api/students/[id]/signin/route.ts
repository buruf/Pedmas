import { NextResponse } from "next/server";
import { requireParent, isResponse, bad } from "@/lib/api";
import { studentFor, saveStudent } from "@/lib/students";
import { issueCode, revokeCode, hasSignIn } from "@/lib/childSignIn";

/** Parent-only: issue, replace or withdraw a child's own sign-in code. */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const account = await requireParent();
  if (isResponse(account)) return account;
  const { id } = await ctx.params;
  const student = await studentFor(account, id);
  if (!student) return bad("Student not found.", 404);

  // Shown to the parent exactly once — only its hash is kept.
  const code = await issueCode(student);
  return NextResponse.json({ ok: true, code, name: student.name });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const account = await requireParent();
  if (isResponse(account)) return account;
  const { id } = await ctx.params;
  const student = await studentFor(account, id);
  if (!student) return bad("Student not found.", 404);
  await revokeCode(student);
  await saveStudent(student);
  return NextResponse.json({ ok: true, enabled: hasSignIn(student) });
}
