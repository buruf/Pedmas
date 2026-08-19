import { headers } from "next/headers";
import type { Account } from "./model";
import { putRow } from "./store/db";
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
  if (account.region) return account.region;
  const detected = await regionForRequest(null);
  account.region = detected;
  await putRow("accounts", account.id, account);
  return detected;
}
