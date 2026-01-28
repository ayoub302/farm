// src/middleware.js
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  const { userId } = auth();
  const pathname = req.nextUrl.pathname;

  // ==================== RUTAS IGNORADAS ====================
  const ignoredPaths = ["/_next", "/favicon.ico", "/public", "/api/webhook"];

  if (ignoredPaths.some((path) => pathname.includes(path))) {
    return NextResponse.next();
  }

  console.log("\n" + "=".repeat(50));
  console.log(`[MIDDLEWARE] Path: ${pathname}`);
  console.log(`[MIDDLEWARE] User authenticated: ${!!userId}`);

  // ==================== RUTAS PÚBLICAS ====================
  const publicPaths = [
    "/",
    "/about",
    "/contact",
    "/sign-in",
    "/sign-up",
    "/access-denied",
    "/error",
    "/api/contact",
    "/api/calendar",
    "/api/activities",
    "/api/harvests",
    "/api/bookings",
    "/api/messages",
    "/api/admin/verify", // ← AÑADIDO: Permite que el endpoint de verificación sea accesible
  ];

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    console.log("[MIDDLEWARE] Public route - allowing access");
    console.log("=".repeat(50));
    return NextResponse.next();
  }

  // ==================== RUTAS DE ADMIN ====================
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    console.log("[MIDDLEWARE] Admin route detected");

    // 1. No autenticado → login
    if (!userId) {
      console.log("[MIDDLEWARE] No user - redirecting to sign-in");
      console.log("=".repeat(50));

      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    // 2. Verificar admin
    try {
      const { createClerkClient } = await import("@clerk/nextjs/server");
      const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      const user = await clerk.users.getUser(userId);
      const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase();

      // CORRECCIÓN: Manejar múltiples emails correctamente
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

      // CORRECCIÓN: Usar includes() en lugar de comparación directa
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

  // ==================== OTRAS RUTAS PROTEGIDAS ====================
  if (!userId) {
    console.log("[MIDDLEWARE] Protected route - redirecting to sign-in");
    console.log("=".repeat(50));

    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // ==================== ACCESO PERMITIDO ====================
  console.log("[MIDDLEWARE] Access granted");
  console.log("=".repeat(50));
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
