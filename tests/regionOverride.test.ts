import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { setAccountRegion } from "@/lib/regionServer";
import { putRow, getRow } from "@/lib/store/db";
import type { Account, StudentProfile } from "@/lib/model";

/**
 * The region override exists because detection stamps the account from its
 * FIRST request — and a VPN or oddly-routed carrier makes that guess wrong
 * permanently and invisibly. A family in Canada was served American
 * customary units this way (found by a child's bug report). Correcting the
 * region must also refresh unfinished sessions, because their questions were
 * generated in the wrong unit system.
 */

describe("setAccountRegion", () => {
  it("stamps the account and discards unfinished sessions, keeping finished ones", async () => {
    const account = { id: "acc_region_t", email: "region-t@example.com", role: "PARENT", region: "US" } as Account;
    await putRow("accounts", account.id, account);

    const unfinished = {
      id: "stu_region_a",
      accountId: account.id,
      name: "A",
      activeSession: { id: "ps1", items: [{}], index: 0 },
    } as unknown as StudentProfile;
    const finished = {
      id: "stu_region_b",
      accountId: account.id,
      name: "B",
      activeSession: { id: "ps2", items: [{}], index: 1, completedAt: 123 },
    } as unknown as StudentProfile;
    await putRow("students", unfinished.id, unfinished);
    await putRow("students", finished.id, finished);

    await setAccountRegion(account, "INTL");

    const acc = await getRow<Account>("accounts", account.id);
    expect(acc?.region).toBe("INTL");
    const a = await getRow<StudentProfile>("students", unfinished.id);
    const b = await getRow<StudentProfile>("students", finished.id);
    expect(a?.activeSession, "unfinished session must be rebuilt in the new region").toBeUndefined();
    expect(b?.activeSession?.completedAt, "finished sessions are history and must stay").toBe(123);
  });
});

describe("override endpoints", () => {
  const adminRoute = readFileSync(join(process.cwd(), "src/app/api/admin/families/route.ts"), "utf8");
  const accountRoute = readFileSync(join(process.cwd(), "src/app/api/account/route.ts"), "utf8");

  it("both validate the region against the two known values", () => {
    for (const src of [adminRoute, accountRoute]) {
      expect(src).toContain('region !== "US" && region !== "INTL"');
      expect(src).toContain("setAccountRegion");
    }
  });

  it("the parent override goes through requireParent, so child sessions cannot change it", () => {
    expect(accountRoute).toMatch(/export async function PATCH[\s\S]*?requireParent\(\)/);
  });

  it("the admin variant is admin-only", () => {
    const patch = adminRoute.slice(adminRoute.indexOf("export async function PATCH"));
    expect(patch).toContain('admin.role !== "ADMIN"');
  });
});
