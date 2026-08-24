import { NextResponse } from "next/server";
import { requireAccount, isResponse, sessionStudentId } from "@/lib/api";
import { studentsOf, placementConcern } from "@/lib/students";
import { ensureAccountRegion } from "@/lib/regionServer";

export async function GET() {
  const account = await requireAccount();
  if (isResponse(account)) return account;

  // A child session sees only itself. Route guards alone were not enough
  // here: this endpoint is reachable by any session, and it was handing a
  // signed-in child their parent's email address and every sibling's name
  // and streak. Scope the payload, not just the routes.
  const scopedStudentId = await sessionStudentId();
  const all = await studentsOf(account);
  const students = scopedStudentId ? all.filter((s) => s.id === scopedStudentId) : all;

  // Detected once on first sight, then stable and overridable.
  const region = await ensureAccountRegion(account);
  return NextResponse.json({
    id: account.id,
    // The parent's identity is not a child's business.
    email: scopedStudentId ? undefined : account.email,
    role: scopedStudentId ? "CHILD" : account.role,
    name: scopedStudentId ? (students[0]?.name ?? "Learner") : account.name,
    isChildSession: Boolean(scopedStudentId),
    region,
    students: students.map((s) => ({
      id: s.id,
      name: s.name,
      grade: s.grade,
      placed: Boolean(s.placedAt),
      streak: s.streak.count,
      // Whether this child can sign in on their own. The code itself is
      // never sent — only its hash is stored.
      signInEnabled: Boolean(s.signIn?.codeHash),
      // Set when the stored placement is not trustworthy any more, so the
      // parent can be offered a retake rather than having to suspect it.
      placementConcern: placementConcern(s),
    })),
  });
}
