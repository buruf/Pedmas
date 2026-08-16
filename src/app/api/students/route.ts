import { NextRequest, NextResponse } from "next/server";
import { requireAccount, isResponse, bad } from "@/lib/api";
import { createStudent, studentsOf } from "@/lib/students";
import { MAX_CHILDREN, canAddChild } from "@/lib/billing/plan";
import { syncSeats } from "@/lib/billing/service";

export async function GET() {
  const account = await requireAccount();
  if (isResponse(account)) return account;
  const students = await studentsOf(account);
  return NextResponse.json(
    students.map((s) => ({
      id: s.id,
      name: s.name,
      grade: s.grade,
      placed: Boolean(s.placedAt),
      streak: s.streak.count,
    }))
  );
}

export async function POST(req: NextRequest) {
  const account = await requireAccount();
  if (isResponse(account)) return account;
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.grade) return bad("Name and grade are required.");
  const grade = Number(body.grade);
  if (!Number.isInteger(grade) || grade < 1 || grade > 12) return bad("Grade must be 1-12.");

  const existing = await studentsOf(account);
  if (account.role !== "ADMIN" && !canAddChild(existing.length)) {
    return bad(`The family plan covers up to ${MAX_CHILDREN} children.`, 409);
  }

  const student = await createStudent(account, {
    name: String(body.name),
    grade,
    age: body.age ? Number(body.age) : undefined,
    goal: body.goal ? String(body.goal) : undefined,
  });

  // Keep the billed seat count in step; never block adding a child on it.
  try {
    await syncSeats(account, existing.length + 1);
  } catch (err) {
    console.error("[billing:syncSeats]", err instanceof Error ? err.message : err);
  }

  return NextResponse.json({ id: student.id, name: student.name, grade: student.grade });
}
