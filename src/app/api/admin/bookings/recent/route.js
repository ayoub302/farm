// app/api/admin/reservations/recent/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    console.log("[RESERVATIONS RECENT] Starting request...");

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    // Construir where clause si hay filtro de estado
    const where = {};
    if (status && status !== "all") {
      where.status = status;
    }

    // Obtener reservas recientes
    const reservations = await prisma.booking.findMany({
      where,
      take: Math.min(limit, 50), // Máximo 50 por seguridad
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        bookingCode: true,
        clientName: true,
        clientEmail: true,
        clientPhone: true,
        numPeople: true,
        status: true,
        activityType: true,
        visitDate: true,
        visitTime: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Obtener estadísticas
    const total = await prisma.booking.count({ where });
    const pendingCount = await prisma.booking.count({
      where: { status: "pending" },
    });
    const confirmedCount = await prisma.booking.count({
      where: { status: "confirmed" },
    });

    // Contar reservas de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await prisma.booking.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    console.log(
      `[RESERVATIONS RECENT] Found ${reservations.length} reservations (total: ${total})`,
    );

    // Agregar estadísticas a la respuesta
    const responseData = {
      reservations,
      stats: {
        total,
        pending: pendingCount,
        confirmed: confirmedCount,
        today: todayCount,
      },
    };

    // Devolver respuesta con headers adicionales
    const response = NextResponse.json(responseData, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Total-Count": total.toString(),
        "X-Pending-Count": pendingCount.toString(),
        "X-Confirmed-Count": confirmedCount.toString(),
        "X-Today-Count": todayCount.toString(),
      },
    });

    return response;
  } catch (error) {
    console.error("[RESERVATIONS RECENT ERROR]", error);

    // Manejar errores específicos de Prisma
    if (error.name === "PrismaClientInitializationError") {
      return NextResponse.json(
        {
          error: "Database connection error",
          details: "Cannot connect to database",
        },
        { status: 500 },
      );
    }

    if (error.name === "PrismaClientKnownRequestError") {
      return NextResponse.json(
        {
          error: "Database query error",
          details: "Invalid database query",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

// Método POST para crear nuevas reservas (útil para testing)
export async function POST(request) {
  try {
    console.log("[RESERVATIONS RECENT] POST request...");
    // Obtener datos del cuerpo
    const body = await request.json();
    const {
      clientName = "Test Client",
      clientEmail = "test@example.com",
      clientPhone = "+212 612345678",
      numPeople = 2,
      activityType = "tour",
      visitDate = new Date().toISOString().split("T")[0],
      visitTime = "10:00",
      status = "pending",
      notes = "Test reservation created from admin panel",
    } = body;

    // Generar código de reserva único
    const bookingCode = `RES-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 4)
      .toUpperCase()}`;

    // Crear nueva reserva - SIN PRECIO
    const newReservation = await prisma.booking.create({
      data: {
        bookingCode,
        clientName,
        clientEmail,
        clientPhone,
        numPeople,
        activityType,
        visitDate: new Date(visitDate),
        visitTime,
        status,
        notes,
        source: "admin_test",
      },
    });

    console.log(
      `[RESERVATIONS RECENT] Created reservation: ${newReservation.id} - ${newReservation.bookingCode}`,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Reservation created successfully",
        data: newReservation,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[RESERVATIONS RECENT POST ERROR]", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
