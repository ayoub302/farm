import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    console.log("[VERIFY API] Checking authentication...");

    const session = request.cookies.get("admin_session");
    const isAuthenticated = session?.value === "authenticated";

    console.log(`[VERIFY API] Session:`, session);
    console.log(`[VERIFY API] Authenticated: ${isAuthenticated}`);

    if (!isAuthenticated) {
      return NextResponse.json(
        { authenticated: false, error: "Not authenticated" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: "admin",
        email: process.env.ADMIN_EMAIL || "admin@farm.com",
        role: "admin",
      },
    });
  } catch (error) {
    console.error("[VERIFY API ERROR]", error);
    return NextResponse.json(
      { authenticated: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// También soportar POST si es necesario
export async function POST(request) {
  return GET(request);
}
