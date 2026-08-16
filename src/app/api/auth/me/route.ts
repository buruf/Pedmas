import { NextResponse } from "next/server";
import { requireAccount, isResponse } from "@/lib/api";
import { studentsOf } from "@/lib/students";

export async function GET() {
  const account = await requireAccount();
  if (isResponse(account)) return account;
  const students = await studentsOf(account);
  return NextResponse.json({
    id: account.id,
    email: account.email,
    role: account.role,
    name: account.name,
    students: students.map((s) => ({
      id: s.id,
      name: s.name,
      grade: s.grade,
      placed: Boolean(s.placedAt),
      streak: s.streak.count,
    })),
  });
}
