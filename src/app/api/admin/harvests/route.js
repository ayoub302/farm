import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// ✅ CORREGIDO: Helper function asíncrona para verificar admin
async function verifyAdmin(request) {
  try {
    const cookieStore = await cookies(); // 👈 Añadir await
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
  } catch (error) {
    console.error("[VERIFY_ADMIN_ERROR]", error);
    return { authenticated: false, error: "Authentication error" };
  }
}

// Función para obtener usuario admin (versión simplificada sin Clerk)
async function getAdminUser() {
  try {
    // En tu sistema, el admin ya está autenticado por la cookie
    // Aquí puedes buscar o crear un usuario en la base de datos si lo necesitas

    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      return { error: "Admin email not configured", status: 500 };
    }

    // Buscar usuario en la base de datos por email
    let user = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: { id: true, email: true, name: true },
    });

    // Si no existe, crearlo
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: adminEmail,
          clerkUserId: "admin_" + Date.now(), // ID único para el admin
          name: "Admin",
          clerkData: {
            id: "admin_" + Date.now(),
            firstName: "Admin",
            lastName: "User",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
        select: { id: true, email: true, name: true },
      });

      console.log(
        `[USER_CREATED] Created admin user in database: ${adminEmail}`,
      );
    }

    return { user };
  } catch (error) {
    console.error("[GET_ADMIN_USER_ERROR]", error);
    return { error: "Failed to get admin user", status: 500 };
  }
}

// GET - Obtener cosechas
export async function GET(request) {
  try {
    // ✅ Verificar administrador con await
    const auth = await verifyAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error || "Unauthorized" },
        { status: 401 },
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
    // ✅ Verificar administrador con await
    const auth = await verifyAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error || "Unauthorized" },
        { status: 401 },
      );
    }

    // Obtener usuario admin para logs
    const userResult = await getAdminUser();
    if (userResult.error) {
      console.warn(
        "[WARNING] Could not get admin user for logging:",
        userResult.error,
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

    // Registrar en logs (si tenemos usuario)
    try {
      if (userResult.user) {
        await prisma.systemLog.create({
          data: {
            action: "harvest_created",
            module: "harvests",
            userId: userResult.user.id,
            userEmail: userResult.user.email,
            details: {
              harvestId: harvest.id,
              productAr: harvest.productAr,
              productFr: harvest.productFr,
            },
            severity: "info",
          },
        });
      }
    } catch (logError) {
      console.warn("[WARNING] Could not create system log:", logError);
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
