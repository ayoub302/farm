// proxy.js
import { NextResponse } from "next/server";

export async function proxy(req) {
  const { pathname } = req.nextUrl;

  console.log("\n" + "=".repeat(50));
  console.log(`[PROXY] Path: ${pathname}`);
  console.log(`[PROXY] Timestamp: ${new Date().toISOString()}`);

  // Rutas públicas que no requieren autenticación
  const publicPaths = [
    "/",
    "/api/admin/login",
    "/api/admin/logout",
    "/api/activities",
    "/api/harvests",
    "/api/calendar",
  ];

  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path),
  );

  // Verificar autenticación SOLO para rutas protegidas
  const isProtectedRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  // Si es una ruta pública, permitir acceso sin verificar
  if (isPublicPath) {
    console.log(`[PROXY] Ruta pública, acceso permitido`);
    console.log("=".repeat(50) + "\n");
    return NextResponse.next();
  }

  // Si NO es una ruta protegida, continuar
  if (!isProtectedRoute) {
    console.log(`[PROXY] Ruta no protegida, acceso permitido`);
    console.log("=".repeat(50) + "\n");
    return NextResponse.next();
  }

  // ✅ CORREGIDO: Leer cookies correctamente
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    console.log(`[PROXY] Cookie header: ${cookieHeader}`);

    const sessionMatch = cookieHeader.match(/admin_session=([^;]+)/);
    const sessionValue = sessionMatch ? sessionMatch[1] : null;
    const isAuthenticated = sessionValue === "authenticated";

    console.log(`[PROXY] Admin route detected`);
    console.log(`[PROXY] Session value: ${sessionValue}`);
    console.log(`[PROXY] User authenticated: ${isAuthenticated}`);

    if (!isAuthenticated) {
      console.log("[PROXY] 🔒 Acceso denegado - No autenticado");
      console.log("=".repeat(50) + "\n");

      // ✅ Para APIs, devolver JSON con status 401
      if (pathname.startsWith("/api/admin")) {
        return new NextResponse(JSON.stringify({ error: "Non autorisé" }), {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      // Para páginas, redirigir al home
      return NextResponse.redirect(new URL("/", req.url));
    }

    console.log("[PROXY] ✅ Acceso permitido");
    console.log("=".repeat(50) + "\n");
    return NextResponse.next();
  } catch (error) {
    console.error("[PROXY ERROR]", error);
    console.log("=".repeat(50) + "\n");

    if (pathname.startsWith("/api/admin")) {
      return new NextResponse(
        JSON.stringify({ error: "Erreur d'authentification" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/activities",
    "/api/harvests",
    "/api/calendar",
  ],
};

export default proxy;
