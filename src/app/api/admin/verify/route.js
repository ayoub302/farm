// app/api/admin/verify/route.js
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    console.log("[ADMIN_VERIFY] Starting verification...");

    const { userId } = await auth();

    if (!userId) {
      console.log("[ADMIN_VERIFY] No authenticated user");
      return NextResponse.json(
        { success: false, error: "NOT_AUTHENTICATED" },
        { status: 401 },
      );
    }

    // Obtener usuario de Clerk
    const { createClerkClient } = await import("@clerk/nextjs/server");
    const clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const user = await clerk.users.getUser(userId);
    const userEmail = user.emailAddresses[0]?.emailAddress;
    const adminEmail = process.env.ADMIN_EMAIL;

    console.log("[ADMIN_VERIFY] Checking:", {
      userEmail,
      adminEmail,
      isAdmin: userEmail === adminEmail,
    });

    if (!adminEmail) {
      console.error("[ADMIN_VERIFY] ADMIN_EMAIL not configured");
      return NextResponse.json(
        { success: false, error: "CONFIG_ERROR" },
        { status: 500 },
      );
    }

    const isAdmin = userEmail === adminEmail;

    if (!isAdmin) {
      console.log("[ADMIN_VERIFY] Access denied");
      return NextResponse.json(
        {
          success: false,
          error: "NOT_ADMIN",
          userEmail,
          requiredEmail: adminEmail,
        },
        { status: 403 },
      );
    }

    console.log("[ADMIN_VERIFY] Access granted");

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: userEmail,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: true,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[ADMIN_VERIFY] Error:", error);
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
