import { headers } from "next/headers";
import type { Account, StudentProfile } from "./model";
import { putRow, studentsByAccount } from "./store/db";
import { regionForCountry, type Region } from "./region";

/**
 * The region for the current request.
 *
 * Vercel attaches the caller's country to every request, so detection costs
 * nothing and needs no permission prompt. A stored choice always wins:
 * detection is a sensible default, not a verdict on where a family belongs.
 */
export async function regionForRequest(account?: Pick<Account, "region"> | null): Promise<Region> {
  if (account?.region) return account.region;
  try {
    const h = await headers();
    return regionForCountry(h.get("x-vercel-ip-country"));
  } catch {
    return "INTL";
  }
}

/**
 * Stamp an account with its detected region the first time we see it, so the
 * experience stops moving around if the family travels.
 */
export async function ensureAccountRegion(account: Account): Promise<Region> {
  const hadRegion = Boolean(account.region);
  const hadZone = Boolean(account.timezone);
  if (hadRegion && hadZone) return account.region!;

  let country: string | null = null;
  let zone: string | null = null;
  try {
    const h = await headers();
    country = h.get("x-vercel-ip-country");
    zone = h.get("x-vercel-ip-timezone");
  } catch {
    // Outside a request context: keep whatever is stored.
  }
  if (!hadRegion) account.region = regionForCountry(country);
  // The timezone decides when a streak day ends, so it is worth storing even
  // when the region was already known.
  if (!hadZone && zone) account.timezone = zone;
  await putRow("accounts", account.id, account);
  return account.region!;
}

/**
 * Explicitly set a family's region — the override the detection above needs.
 *
 * Detection stamps whatever country the account's FIRST request appears to
 * come from, and a VPN or oddly-routed carrier makes that guess wrong
 * permanently and invisibly: a family in Canada was served American
 * customary units this way. Questions are generated into the day's session
 * with the region they were born under, so the fix also discards unfinished
 * sessions — a Canadian child must not finish a sheet of inches. Recorded
 * answers live on the student's skills, not the session, so no progress is
 * lost.
 */
export async function setAccountRegion(account: Account, region: Region): Promise<void> {
  account.region = region;
  await putRow("accounts", account.id, account);
  for (const s of await studentsByAccount<StudentProfile>(account.id)) {
    if (s.activeSession && !s.activeSession.completedAt) {
      s.activeSession = undefined;
      await putRow("students", s.id, s);
    }
  }
}
