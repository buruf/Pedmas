import { NextResponse } from "next/server";
import { requireAccount, isResponse, bad } from "@/lib/api";
import { allRows } from "@/lib/store/db";
import type { Account, StudentProfile } from "@/lib/model";
import { GRADES, allSkills } from "@/curriculum";

export async function GET() {
  const account = await requireAccount();
  if (isResponse(account)) return account;
  if (account.role !== "ADMIN") return bad("Admin only.", 403);
  const accounts = await allRows<Account>("accounts");
  const students = await allRows<StudentProfile>("students");
  const skills = allSkills();
  return NextResponse.json({
    counts: {
      accounts: accounts.length,
      students: students.length,
      placedStudents: students.filter((s) => s.placedAt).length,
      grades: GRADES.length,
      skills: skills.length,
      strands: new Set(skills.map((s) => s.strandId)).size,
    },
    students: students.map((s) => ({
      id: s.id,
      name: s.name,
      grade: s.grade,
      placed: Boolean(s.placedAt),
      streak: s.streak.count,
      sessions: s.recentSessions.length,
      mastered: Object.values(s.skills).filter((k) => k.mastered && !k.assumed).length,
      struggling: Object.values(s.skills).filter((k) => k.needsRepair).length,
    })),
  });
}
