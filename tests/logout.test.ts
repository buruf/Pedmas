import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * Every signed-in surface must offer a way out.
 *
 * Found at launch review: only the parent hub had a Log out button. An admin
 * console with no exit is a security problem, and — worse for a children's
 * product — a child practising on a shared family tablet could not leave
 * their own session, so the next person to pick up the device was still
 * signed in as them.
 */

const SIGNED_IN_PAGES = [
  "src/app/home/page.tsx", // parent hub
  "src/app/admin/page.tsx", // platform admin
  "src/app/app/[id]/page.tsx", // child dashboard
  "src/app/parent/[id]/page.tsx", // parent view of one child
  "src/app/account/page.tsx",
  "src/app/billing/page.tsx",
];

describe("every signed-in surface can sign out", () => {
  for (const page of SIGNED_IN_PAGES) {
    it(page, () => {
      const path = join(process.cwd(), page);
      expect(existsSync(path), `${page} moved — update this list`).toBe(true);
      const src = readFileSync(path, "utf8");
      const hasLogout = src.includes("LogoutButton") || src.includes("auth/logout");
      expect(hasLogout, `${page} has no way to sign out`).toBe(true);
    });
  }

  it("the shared control ends the server session and does not leave it on the back stack", () => {
    const src = readFileSync(join(process.cwd(), "src/components/LogoutButton.tsx"), "utf8");
    expect(src).toContain('"/api/auth/logout"');
    expect(src).toContain('method: "POST"');
    // replace, not push: Back must not return to a signed-in screen.
    expect(src).toContain('router.replace("/")');
  });
});
