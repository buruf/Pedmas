import { NextRequest, NextResponse } from "next/server";
import { createAccount, startSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  const role = body.role === "STUDENT" ? "STUDENT" : "PARENT";
  const result = await createAccount(body.email, body.password, role, body.name ?? "");
  if ("error" in result) return NextResponse.json(result, { status: 400 });
  await startSession(result.id);
  return NextResponse.json({ id: result.id, email: result.email, role: result.role, name: result.name });
}
