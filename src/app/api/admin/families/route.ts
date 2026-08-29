import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireParent, isResponse, bad } from "@/lib/api";
import { createAccount } from "@/lib/auth";
import { createStudent } from "@/lib/students";
import { putRow } from "@/lib/store/db";
import { MAX_CHILDREN } from "@/lib/billing/plan";

/**
 * Admin-created test families.
 *
 * Registration is closed while the platform is under test, so the admin
 * needs a way to onboard real testers: create the parent account with a
 * generated password (shown once, like a child's sign-in code), add the
 * children, and grant complimentary access so the family is not stopped by
 * the paywall they were invited past.
 *
 * Consent is recorded as with any signup — the admin creating the account
 * is doing so with the family's agreement, which is what the testing
 * arrangement is.
 */
export async function POST(req: Request) {
  const admin = await requireParent();
  if (isResponse(admin)) return admin;
  if (admin.role !== "ADMIN") return bad("Admin only.", 403);

  const body = await req.json().catch(() => null);
  const parentName = typeof body?.parentName === "string" ? body.parentName.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const children: { name: string; grade: number }[] = Array.isArray(body?.children)
    ? body.children
        .map((c: { name?: unknown; grade?: unknown }) => ({
          name: typeof c?.name === "string" ? c.name.trim() : "",
          grade: Number(c?.grade),
        }))
        .filter((c: { name: string; grade: number }) => c.name && c.grade >= 1 && c.grade <= 12)
    : [];

  if (!parentName || !email) return bad("Parent name and email are required.");
  if (children.length === 0) return bad("At least one child is required.");
  if (children.length > MAX_CHILDREN) return bad(`At most ${MAX_CHILDREN} children per family.`);

  // A password the parent can actually type from a note, shown exactly once.
  const password = `Pedmas-${randomBytes(4).toString("hex")}`;
  const account = await createAccount(email, password, "PARENT", parentName, {
    acceptedTerms: true,
    parentAffirmed: true,
  });
  if ("error" in account) return bad(account.error);

  // Invited testers must not hit the paywall they were invited past.
  account.compAccess = {
    grantedAt: Date.now(),
    grantedBy: admin.email,
    reason: "Test family created by admin",
  };
  await putRow("accounts", account.id, account);

  const created = [];
  for (const child of children) {
    const student = await createStudent(account, { name: child.name, grade: child.grade });
    created.push({ id: student.id, name: student.name, grade: student.grade });
  }

  return NextResponse.json({
    ok: true,
    email: account.email,
    password, // shown once; only the hash is stored
    children: created,
  });
}

/**
 * Delete a family the admin created in error — a typo'd email cannot be
 * signed into and no mail will ever reach it, so the honest fix is removal.
 * Runs through eraseAccount, the same erasure path as self-service deletion,
 * and refuses to touch an ADMIN account.
 */
/**
 * PATCH: correct a family's region (US customary vs international metric).
 *
 * Region is normally auto-detected from the account's first request, which a
 * VPN or oddly-routed carrier gets wrong — and a wrong region serves the
 * wrong measurement curriculum. Unfinished practice sessions are rebuilt so
 * the units change immediately, not tomorrow.
 */
export async function PATCH(req: Request) {
  const admin = await requireParent();
  if (isResponse(admin)) return admin;
  if (admin.role !== "ADMIN") return bad("Admin only.", 403);
  const body = await req.json().catch(() => null);
  const accountId = typeof body?.accountId === "string" ? body.accountId : "";
  const region = body?.region;
  if (!accountId) return bad("Missing accountId.");
  if (region !== "US" && region !== "INTL") return bad("Region must be US or INTL.");
  const { getRow } = await import("@/lib/store/db");
  const { setAccountRegion } = await import("@/lib/regionServer");
  const target = await getRow<import("@/lib/model").Account>("accounts", accountId);
  if (!target) return bad("Account not found.", 404);
  await setAccountRegion(target, region);
  return NextResponse.json({ ok: true, email: target.email, region });
}

export async function DELETE(req: Request) {
  const admin = await requireParent();
  if (isResponse(admin)) return admin;
  if (admin.role !== "ADMIN") return bad("Admin only.", 403);
  const accountId = new URL(req.url).searchParams.get("accountId");
  if (!accountId) return bad("Missing accountId.");
  const { getRow } = await import("@/lib/store/db");
  const { eraseAccount } = await import("@/lib/retention");
  const target = await getRow<import("@/lib/model").Account>("accounts", accountId);
  if (!target) return bad("Account not found.", 404);
  if (target.role === "ADMIN") return bad("The admin account cannot be deleted this way.", 400);
  const { childrenRemoved } = await eraseAccount(target, { context: "admin:family-delete" });
  return NextResponse.json({ ok: true, email: target.email, childrenRemoved });
}
