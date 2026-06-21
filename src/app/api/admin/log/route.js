import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Helper function to verify admin using your cookie system
function verifyAdmin(request) {
  const cookieStore = cookies();
  const session = cookieStore.get("admin_session");

  // Verificar si la sesión existe y es válida
  const isAuthenticated = session?.value === "authenticated";

  if (!isAuthenticated) {
    return { authenticated: false, error: "Not authenticated" };
  }

  return {
    authenticated: true,
    adminEmail: process.env.ADMIN_EMAIL,
    userId: session?.value || "admin",
  };
}

export async function POST(request) {
  try {
    // Verificar autenticación con tu sistema de cookies
    const auth = verifyAdmin(request);

    if (!auth.authenticated) {
      console.log("[ADMIN ACTION LOG] Not authenticated");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { action, userId, email, details } = await request.json();

    console.log("=".repeat(50));
    console.log("[ADMIN ACTION LOG]");
    console.log(`Action: ${action}`);
    console.log(`User ID: ${userId || auth.userId || "admin"}`);
    console.log(`Email: ${email || auth.adminEmail || "admin@farm.com"}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);

    if (details) {
      console.log("Details:", JSON.stringify(details, null, 2));
    }

    console.log("=".repeat(50));

    // Opcional: Guardar en base de datos si tienes un modelo de logs
    // try {
    //   await prisma.systemLog.create({
    //     data: {
    //       action,
    //       userId: userId || auth.userId,
    //       userEmail: email || auth.adminEmail,
    //       details: details || {},
    //       severity: "info",
    //       module: "admin",
    //     },
    //   });
    // } catch (dbError) {
    //   console.error("[ADMIN LOG] Error saving to database:", dbError);
    // }

    return NextResponse.json({
      success: true,
      message: "Action logged",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[ADMIN LOG ERROR]", error);
    return NextResponse.json(
      { error: "Error logging action" },
      { status: 500 },
    );
  }
}
