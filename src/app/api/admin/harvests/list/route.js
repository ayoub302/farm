// /api/admin/harvests/list/route.js
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    // Obtener usuario actual de Clerk
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    // Verificar si es administrador
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const isAdminByRole = clerkUser.publicMetadata?.role === "admin";
    const isAdminByEmail = userEmail === ADMIN_EMAIL;
    const isAdmin = isAdminByRole || isAdminByEmail;

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

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
      { status: 500 }
    );
  }
}
