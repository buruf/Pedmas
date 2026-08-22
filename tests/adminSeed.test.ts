import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ensureAdmin, login } from "@/lib/auth";
import { allRows, deleteRow } from "@/lib/store/db";
import type { Account } from "@/lib/model";

/**
 * A stray space pasted into a hosting dashboard must never be able to lock the
 * owner out of their own admin console. This is a regression test for exactly
 * that: it happened, and the symptom ("Email or password is incorrect", with
 * no way to tell which) gives the operator nothing to go on.
 */

async function clearAdmins() {
  for (const a of await allRows<Account>("accounts")) {
    if (a.role === "ADMIN") await deleteRow("accounts", a.id);
  }
}

const ENV = { ...process.env };
beforeEach(async () => {
  await clearAdmins();
  // The 60s memo would otherwise skip the scan between tests.
  process.env.PEDMAS_ADMIN_RESEED = "true";
});
afterEach(async () => {
  process.env = { ...ENV };
  await clearAdmins();
});

describe("admin seeding tolerates messy environment values", () => {
  it("signs in despite trailing whitespace and capitals in the env vars", async () => {
    process.env.PEDMAS_ADMIN_EMAIL = "  Admin@Pedmas.COM \n";
    process.env.PEDMAS_ADMIN_PASSWORD = "S3cret-Pass\n";
    await ensureAdmin();

    // Typed the way a human would: clean email, clean password.
    const ok = await login("admin@pedmas.com", "S3cret-Pass");
    expect(ok, "clean credentials must match a messily-seeded admin").not.toBeNull();
    expect(ok!.role).toBe("ADMIN");
  });

  it("stores the email normalized, so the indexed lookup can find it", async () => {
    process.env.PEDMAS_ADMIN_EMAIL = " MiXeD@Case.Com ";
    process.env.PEDMAS_ADMIN_PASSWORD = "pw-123456";
    await ensureAdmin();
    const admin = (await allRows<Account>("accounts")).find((a) => a.role === "ADMIN")!;
    expect(admin.email).toBe("mixed@case.com");
  });

  it("still refuses a genuinely wrong password", async () => {
    process.env.PEDMAS_ADMIN_EMAIL = "admin@pedmas.com";
    process.env.PEDMAS_ADMIN_PASSWORD = "right-password";
    await ensureAdmin();
    expect(await login("admin@pedmas.com", "wrong-password")).toBeNull();
  });
});

describe("opt-in reseed recovery", () => {
  it("does nothing to an existing admin unless explicitly asked", async () => {
    process.env.PEDMAS_ADMIN_EMAIL = "admin@pedmas.com";
    process.env.PEDMAS_ADMIN_PASSWORD = "original-pw";
    await ensureAdmin();

    delete process.env.PEDMAS_ADMIN_RESEED;
    process.env.PEDMAS_ADMIN_PASSWORD = "changed-in-env";
    await ensureAdmin();
    expect(await login("admin@pedmas.com", "changed-in-env")).toBeNull();
    expect(await login("admin@pedmas.com", "original-pw")).not.toBeNull();
  });

  it("restores access when PEDMAS_ADMIN_RESEED=true", async () => {
    process.env.PEDMAS_ADMIN_EMAIL = "admin@pedmas.com";
    process.env.PEDMAS_ADMIN_PASSWORD = "lost-password";
    await ensureAdmin();

    process.env.PEDMAS_ADMIN_RESEED = "true";
    process.env.PEDMAS_ADMIN_PASSWORD = "brand-new-password";
    await ensureAdmin();

    expect(await login("admin@pedmas.com", "brand-new-password")).not.toBeNull();
    expect(await login("admin@pedmas.com", "lost-password")).toBeNull();
  });

  it("creates no second admin when reseeding", async () => {
    process.env.PEDMAS_ADMIN_EMAIL = "admin@pedmas.com";
    process.env.PEDMAS_ADMIN_PASSWORD = "one";
    await ensureAdmin();
    process.env.PEDMAS_ADMIN_RESEED = "true";
    process.env.PEDMAS_ADMIN_PASSWORD = "two";
    await ensureAdmin();
    const admins = (await allRows<Account>("accounts")).filter((a) => a.role === "ADMIN");
    expect(admins.length).toBe(1);
  });

  it("leaves a second factor in place — reseeding is not an MFA bypass", async () => {
    process.env.PEDMAS_ADMIN_EMAIL = "admin@pedmas.com";
    process.env.PEDMAS_ADMIN_PASSWORD = "one";
    await ensureAdmin();
    const admin = (await allRows<Account>("accounts")).find((a) => a.role === "ADMIN")!;
    admin.mfa = { secret: "JBSWY3DPEHPK3PXP", enabledAt: Date.now() };
    const { putRow } = await import("@/lib/store/db");
    await putRow("accounts", admin.id, admin);

    process.env.PEDMAS_ADMIN_RESEED = "true";
    process.env.PEDMAS_ADMIN_PASSWORD = "two";
    await ensureAdmin();

    const after = (await allRows<Account>("accounts")).find((a) => a.role === "ADMIN")!;
    expect(after.mfa?.enabledAt).toBeTruthy();
  });
});
