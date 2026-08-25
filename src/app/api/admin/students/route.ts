import { NextResponse } from "next/server";
import { requireParent, isResponse, bad } from "@/lib/api";
import { getRow, putRow } from "@/lib/store/db";
import type { StudentProfile } from "@/lib/model";

/**
 * Admin data-entry corrections for a student. Currently: school grade —
 * created wrong, it skews the placement entry point and every age-styled
 * screen, and a parent has no way to change it themselves.
 */
export async function PATCH(req: Request) {
  const admin = await requireParent();
  if (isResponse(admin)) return admin;
  if (admin.role !== "ADMIN") return bad("Admin only.", 403);

  const body = await req.json().catch(() => null);
  const studentId = typeof body?.studentId === "string" ? body.studentId : "";
  const grade = Number(body?.grade);
  if (!studentId) return bad("Missing studentId.");
  if (!Number.isInteger(grade) || grade < 1 || grade > 12) return bad("grade must be 1-12.");

  const student = await getRow<StudentProfile>("students", studentId);
  if (!student) return bad("Student not found.", 404);
  student.grade = grade;
  await putRow("students", student.id, student);
  return NextResponse.json({ ok: true, id: student.id, name: student.name, grade });
}
