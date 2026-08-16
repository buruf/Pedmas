import { NextRequest, NextResponse } from "next/server";
import { ensureAdmin, login, startSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  await ensureAdmin();
  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  const account = await login(body.email, body.password);
  if (!account) {
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }
  await startSession(account.id);
  return NextResponse.json({ id: account.id, email: account.email, role: account.role, name: account.name });
}
