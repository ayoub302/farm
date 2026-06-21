import { NextResponse } from "next/server";

export async function GET(req) {
  const session = req.cookies.get("admin_session");

  console.log("[CHECK-SESSION] Cookie:", session);

  if (session?.value !== "authenticated") {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
