// /api/admin/harvests/list/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

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

export async function GET(request) {
  try {
    // Verificar autenticación con tu sistema de cookies
    const auth = verifyAdmin(request);

    if (!auth.authenticated) {
      console.log("[LIST_HARVESTS] Not authenticated");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    console.log("[LIST_HARVESTS] Admin user verified");

    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const skip = (page - 1) * limit;

    // Construir filtro
    const where = {};

    if (search) {
      where.OR = [
        { productAr: { contains: search, mode: "insensitive" } },
        { productFr: { contains: search, mode: "insensitive" } },
        { season: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status !== "all") {
      if (status === "active") {
        where.isActive = true;
      } else if (status === "inactive") {
        where.isActive = false;
      }
    }

    // Obtener cosechas
    const [harvests, total] = await Promise.all([
      prisma.harvest.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          productAr: true,
          productFr: true,
          icon: true,
          season: true,
          year: true,
          nextHarvest: true,
          unit: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              activities: true,
              bookings: true,
            },
          },
        },
      }),
      prisma.harvest.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      harvests,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("[LIST_HARVESTS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch harvests" },
      { status: 500 },
    );
  }
}
