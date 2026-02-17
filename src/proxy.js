// src/middleware.js
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const pathname = req.nextUrl.pathname;

  // ==================== ARCHIVOS ESTÁTICOS ====================
  // Siempre permitir archivos estáticos
  const isStaticFile =
    /\.(jpg|jpeg|png|gif|mp4|webp|svg|ico|css|js|json|pdf|txt)$/.test(pathname);

  if (
    isStaticFile ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  console.log("\n" + "=".repeat(50));
  console.log(`[MIDDLEWARE] Path: ${pathname}`);
  console.log(`[MIDDLEWARE] User authenticated: ${!!userId}`);

  // ==================== SOLO RUTAS DE ADMIN SON PROTEGIDAS ====================
  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (isAdminRoute) {
    console.log("[MIDDLEWARE] Admin route detected");

    // Si no está autenticado, redirigir a sign-in
    if (!userId) {
      console.log("[MIDDLEWARE] No user - redirecting to sign-in");
      console.log("=".repeat(50));

      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Verificar si es admin por email
    try {
      const { createClerkClient } = await import("@clerk/nextjs/server");
      const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      const user = await clerk.users.getUser(userId);
      const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase();

      const adminEmails = process.env.ADMIN_EMAIL?.split(",")
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email.length > 0);

      console.log("[MIDDLEWARE] User email:", userEmail);
      console.log("[MIDDLEWARE] Admin emails:", adminEmails);

      if (!adminEmails || adminEmails.length === 0) {
        console.error("[MIDDLEWARE] ADMIN_EMAIL not configured");
        return NextResponse.redirect(
          new URL("/error?code=config_error", req.url),
        );
      }

      const isAdmin = adminEmails.includes(userEmail);

      if (!isAdmin) {
        console.log("[MIDDLEWARE] Access DENIED - not admin");
        console.log("=".repeat(50));
        return NextResponse.redirect(new URL("/access-denied", req.url));
      }

      console.log("[MIDDLEWARE] Access GRANTED - user is admin");
      console.log("=".repeat(50));
      return NextResponse.next();
    } catch (error) {
      console.error("[MIDDLEWARE] Error checking admin:", error);
      console.log("=".repeat(50));
      return NextResponse.redirect(new URL("/error?code=auth_failed", req.url));
    }
  }

  // ==================== TODAS LAS DEMÁS RUTAS SON PÚBLICAS ====================
  console.log("[MIDDLEWARE] Public route - allowing access");
  console.log("=".repeat(50));
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
