import { NextResponse } from "next/server";
import { currentAccount, ensureAdmin } from "./auth";
import type { Account } from "./model";

export async function requireAccount(): Promise<Account | NextResponse> {
  await ensureAdmin();
  const account = await currentAccount();
  if (!account) {
    return NextResponse.json({ error: "Please log in." }, { status: 401 });
  }
  return account;
}

export function isResponse(x: unknown): x is NextResponse {
  return x instanceof NextResponse;
}

export function bad(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}
