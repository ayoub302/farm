// src/middleware.js
import { NextResponse } from "next/server";

export default function middleware(req) {
  const { pathname } = req.nextUrl;

  console.log("\n" + "=".repeat(50));
  console.log(`[MIDDLEWARE] Path: ${pathname}`);
  console.log(`[MIDDLEWARE] Timestamp: ${new Date().toISOString()}`);

  // Rutas admin protegidas (excepto el login API)
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginApi = pathname === "/api/admin/login";
  const isLogoutApi = pathname === "/api/admin/logout";

  if (isAdminRoute && !isLoginApi && !isLogoutApi) {
    const session = req.cookies.get("admin_session");
    const isAuthenticated = session?.value === "authenticated";

    console.log(`[MIDDLEWARE] Admin route detected`);
    console.log(`[MIDDLEWARE] User authenticated: ${isAuthenticated}`);

    if (!isAuthenticated) {
      console.log("[MIDDLEWARE] Redirecting to home — no session");
      console.log("=".repeat(50) + "\n");
      return NextResponse.redirect(new URL("/", req.url));
    }
  } else {
    console.log(`[MIDDLEWARE] User authenticated: false`);
  }

  console.log("=".repeat(50) + "\n");
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
