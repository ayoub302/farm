// app/api/admin/harvests/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// NOTA: La función verifyAdminAndGetUser fue eliminada
// porque el middleware YA verificó que es admin

// GET - Obtener cosechas
export async function GET(request) {
  try {
    console.log("[GET_HARVESTS] Fetching harvests...");

    // IMPORTANTE: El middleware YA verificó que es admin
    // No necesitamos verificar permisos aquí

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

    console.log(`[GET_HARVESTS] Found ${total} harvests`);

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
    console.error("[GET_HARVESTS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch harvests" },
      { status: 500 },
    );
  }
}

// POST - Crear nueva cosecha
export async function POST(request) {
  try {
    console.log("[CREATE_HARVEST] Creating new harvest...");

    // IMPORTANTE: El middleware YA verificó que es admin
    // No necesitamos verificar permisos aquí

    // Obtener userId y userEmail de los headers (si el frontend los envía)
    const userId = request.headers.get("x-user-id");
    const userEmail = request.headers.get("x-user-email");

    const data = await request.json();

    // Validar datos requeridos
    if (!data.productAr || !data.productFr) {
      return NextResponse.json(
        { error: "Product name in both Arabic and French is required" },
        { status: 400 },
      );
    }

    if (!data.nextHarvest) {
      return NextResponse.json(
        { error: "Next harvest date is required" },
        { status: 400 },
      );
    }

    // Crear la cosecha
    const harvest = await prisma.harvest.create({
      data: {
        productAr: data.productAr,
        productFr: data.productFr,
        icon: data.icon || "🌱",
        statusAr: data.statusAr || "متوفر",
        statusFr: data.statusFr || "Disponible",
        availabilityAr: data.availabilityAr || "متاح للحصاد",
        availabilityFr: data.availabilityFr || "Disponible pour récolte",
        nextHarvest: new Date(data.nextHarvest),
        season: data.season || "Spring",
        year: parseInt(data.year) || new Date().getFullYear(),
        isActive: data.isActive !== undefined ? data.isActive : true,
        descriptionAr: data.descriptionAr || null,
        descriptionFr: data.descriptionFr || null,
      },
    });

    // Crear evento de calendario automáticamente
    await prisma.calendarEvent.create({
      data: {
        titleAr: `حصاد ${data.productAr}`,
        titleFr: `Récolte ${data.productFr}`,
        descriptionAr: data.descriptionAr || null,
        descriptionFr: data.descriptionFr || null,
        startDate: new Date(data.nextHarvest),
        endDate: new Date(data.nextHarvest),
        type: "harvest",
        color: "#10B981",
        isPublic: data.isActive !== false,
        location: "Farm",
        harvestId: harvest.id,
      },
    });

    // Registrar en logs SOLO si tenemos información del usuario
    if (userId && userEmail) {
      try {
        await prisma.systemLog.create({
          data: {
            action: "harvest_created",
            module: "harvests",
            userId: userId,
            userEmail: userEmail,
            details: {
              harvestId: harvest.id,
              productAr: harvest.productAr,
              productFr: harvest.productFr,
            },
            severity: "info",
          },
        });
      } catch (logError) {
        console.error("[CREATE_HARVEST_LOG_ERROR]", logError);
        // No fallar si el log no se puede crear
      }
    }

    console.log(
      `[HARVEST_CREATED] New harvest created: ${harvest.productFr} (ID: ${harvest.id})`,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Harvest created successfully",
        harvest,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[CREATE_HARVEST_ERROR]", error);

    // Manejar error de unicidad si existe
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A harvest with similar data already exists" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create harvest" },
      { status: 500 },
    );
  }
}
