import { NextResponse } from "next/server";
import { requireParent, isResponse, bad } from "@/lib/api";
import { allRows } from "@/lib/store/db";
import type { Account, StudentProfile } from "@/lib/model";
import { GRADES, allSkills } from "@/curriculum";
import { lessonEffectiveness } from "@/lib/lessonEffect";
import { recentErrors } from "@/lib/errors";
import { entitlementFor } from "@/lib/billing/entitlement";
import type { QuestionFlag } from "@/app/api/admin/flags/route";

export async function GET() {
  const account = await requireParent();
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
    // Families, so an admin can see who is locked out and unlock them.
    families: accounts
      .filter((a) => a.role !== "ADMIN")
      .map((a) => ({
        id: a.id,
        email: a.email,
        children: students.filter((s) => s.accountId === a.id).length,
        billingStatus: a.billing?.status ?? null,
        comp: a.compAccess ? { reason: a.compAccess.reason, grantedBy: a.compAccess.grantedBy, expiresAt: a.compAccess.expiresAt ?? null } : null,
        unlocked: entitlementFor(a).active,
      }))
      .sort((a, b) => Number(a.unlocked) - Number(b.unlocked)),
    lessons: lessonEffectiveness(students),
    errors: await recentErrors(),
    flags: (await allRows<QuestionFlag>("questionFlags")).sort((a, b) => b.flaggedAt - a.flaggedAt),
    reports: (await allRows<Record<string, unknown>>("bugReports")).sort(
      (a, b) => Number(b.createdAt) - Number(a.createdAt)
    ),
  });
}
