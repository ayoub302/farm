// src/middleware.js
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const pathname = req.nextUrl.pathname;

  // ==================== RUTAS IGNORADAS (para evitar bucles) ====================
  const ignoredPaths = ["/_next", "/favicon.ico", "/public", "/api/webhook"];

  // Si es ruta ignorada, saltar middleware
  if (ignoredPaths.some((path) => pathname.includes(path))) {
    return NextResponse.next();
  }

  console.log("\n" + "=".repeat(50));
  console.log(`[MIDDLEWARE] Path: ${pathname}`);
  console.log(`[MIDDLEWARE] User authenticated: ${!!userId}`);

  // ==================== RUTAS PÚBLICAS ====================
  const publicPaths = [
    "/",
    "/api/calendar",
    "/api/activities",
    "/api/harvests",
    "/sign-in",
    "/sign-up",
    "/about",
    "/contact",
    "/api/contact",
    "/api/bookings",
    "/api/messages",
  ];

  // Si es ruta pública, permitir acceso
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    console.log("[MIDDLEWARE] Public route - allowing access");
    console.log("=".repeat(50));
    return NextResponse.next();
  }

  // ==================== RUTAS DE ADMIN ====================
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    console.log("[MIDDLEWARE] Admin route detected");

    // 1. Si no está autenticado, redirigir a login
    if (!userId) {
      console.log("[MIDDLEWARE] No user - redirecting to sign-in");
      console.log("=".repeat(50));

      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    // 2. Verificar si es admin
    try {
      // Import dinámico para evitar problemas de build
      const { createClerkClient } = await import("@clerk/nextjs/server");
      const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      const user = await clerk.users.getUser(userId);
      const userEmail = user.emailAddresses[0]?.emailAddress;
      const adminEmail = process.env.ADMIN_EMAIL;

      console.log(`[MIDDLEWARE] User email: ${userEmail}`);
      console.log(`[MIDDLEWARE] Admin email: ${adminEmail}`);

      // Verificar si es admin
      const isAdmin = userEmail === adminEmail;

      if (!isAdmin) {
        console.log(`[MIDDLEWARE] Access DENIED - not admin`);
        console.log("=".repeat(50));

        // Redirigir a acceso denegado
        return NextResponse.redirect(new URL("/access-denied", req.url));
      }

      console.log(`[MIDDLEWARE] Access GRANTED - user is admin`);
      console.log("=".repeat(50));

      return NextResponse.next();
    } catch (error) {
      console.error("[MIDDLEWARE] Error checking admin:", error);
      console.log("=".repeat(50));

      return NextResponse.redirect(new URL("/error?code=auth_failed", req.url));
    }
  }

  // ==================== OTRAS RUTAS PROTEGIDAS ====================
  // Para rutas que requieren autenticación pero no son admin
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
