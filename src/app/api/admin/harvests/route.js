import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
// Función para verificar administrador y obtener/cargar usuario
async function verifyAdminAndGetUser() {
  try {
    // Obtener usuario actual de Clerk
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return { error: "Not authenticated", status: 401 };
    }

    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return { error: "User email not found", status: 400 };
    }

    // Verificar si es administrador
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const isAdminByRole = clerkUser.publicMetadata?.role === "admin";
    const isAdminByEmail = userEmail === ADMIN_EMAIL;
    const isAdmin = isAdminByRole || isAdminByEmail;

    if (!isAdmin) {
      return { error: "Unauthorized - Admin access required", status: 403 };
    }

    // Buscar usuario en la base de datos por clerkUserId
    let user = await prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id },
      select: { id: true, email: true, name: true },
    });

    // Si no existe, crearlo
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userEmail,
          clerkUserId: clerkUser.id,
          name: clerkUser.firstName || userEmail.split("@")[0],
          clerkData: {
            id: clerkUser.id,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            createdAt: clerkUser.createdAt,
            updatedAt: clerkUser.updatedAt,
          },
        },
        select: { id: true, email: true, name: true },
      });

      console.log(`[USER_CREATED] Created user in database: ${userEmail}`);
    }

    return { user };
  } catch (error) {
    console.error("[VERIFY_ADMIN_ERROR]", error);
    return { error: "Failed to verify admin", status: 500 };
  }
}

// GET - Obtener cosechas
export async function GET(request) {
  try {
    // Verificar administrador y obtener usuario
    const result = await verifyAdminAndGetUser();
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
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
    // Verificar administrador y obtener usuario
    const result = await verifyAdminAndGetUser();
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

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
        unit: data.unit || "kg",
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

    // Registrar en logs
    await prisma.systemLog.create({
      data: {
        action: "harvest_created",
        module: "harvests",
        userId: result.user.id,
        userEmail: result.user.email,
        details: {
          harvestId: harvest.id,
          productAr: harvest.productAr,
          productFr: harvest.productFr,
        },
        severity: "info",
      },
    });

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
