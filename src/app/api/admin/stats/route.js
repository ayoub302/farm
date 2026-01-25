import { NextResponse } from "next/server";
const prisma = require("@/lib/prisma");

// Función helper para convertir BigInt a Number
function convertBigInts(obj) {
  if (typeof obj === "bigint") {
    return Number(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => convertBigInts(item));
  }
  if (obj !== null && typeof obj === "object") {
    const newObj = {};
    for (const key in obj) {
      newObj[key] = convertBigInts(obj[key]);
    }
    return newObj;
  }
  return obj;
}

export async function GET() {
  try {
    console.log("[ADMIN STATS] Starting request...");

    // Obtener fecha de hoy para estadísticas
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    // Obtener estadísticas básicas en paralelo
    const [
      totalActivities,
      upcomingActivities,
      activeActivities,
      totalMessages,
      unreadMessages,
      readMessages,
      todayMessages,
      weekMessages,
      monthMessages,
      totalReservations,
      pendingReservations,
      confirmedReservations,
      cancelledReservations,
      todayReservations,
      weekReservations,
      totalUsers,
      activeUsers,
      todayUsers,
      weekUsers,
      totalProducts,
      activeHarvests,
      totalEvents,
      upcomingEvents,
      todayEvents,
      totalParticipantsResult,
      avgParticipantsResult,
    ] = await Promise.all([
      // Actividades
      prisma.activity.count(),
      prisma.activity.count({
        where: {
          date: { gte: today },
          status: { in: ["upcoming", "active"] },
        },
      }),
      prisma.activity.count({
        where: { status: "active" },
      }),

      // Mensajes
      prisma.message.count(),
      prisma.message.count({ where: { status: "unread" } }),
      prisma.message.count({ where: { status: "read" } }),
      prisma.message.count({
        where: { createdAt: { gte: today } },
      }),
      prisma.message.count({
        where: { createdAt: { gte: weekAgo } },
      }),
      prisma.message.count({
        where: { createdAt: { gte: monthAgo } },
      }),

      // Reservas
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "pending" } }),
      prisma.booking.count({ where: { status: "confirmed" } }),
      prisma.booking.count({ where: { status: "cancelled" } }),
      prisma.booking.count({
        where: { createdAt: { gte: today } },
      }),
      prisma.booking.count({
        where: { createdAt: { gte: weekAgo } },
      }),

      // Usuarios
      prisma.user.count(),
      prisma.user.count({
        where: { updatedAt: { gte: monthAgo } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: today } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: weekAgo } },
      }),

      // Productos y cosechas
      prisma.product.count(),
      prisma.harvest.count({ where: { isActive: true } }),

      // Eventos del calendario
      prisma.calendarEvent.count(),
      prisma.calendarEvent.count({
        where: {
          startDate: { gte: today },
          isPublic: true,
        },
      }),
      prisma.calendarEvent.count({
        where: {
          startDate: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Estadísticas de participación
      prisma.booking.aggregate({
        _sum: { numPeople: true },
      }),
      prisma.booking.aggregate({
        _avg: { numPeople: true },
      }),
    ]);

    // Obtener fuentes de mensajes con conversión explícita
    let messageSources = [];
    try {
      const rawSources = await prisma.$queryRaw`
        SELECT source, COUNT(*)::int as count
        FROM messages
        GROUP BY source
        ORDER BY count DESC
        LIMIT 5
      `;
      messageSources = rawSources.map((source) => ({
        source: source.source,
        count: Number(source.count),
      }));
    } catch (error) {
      console.log("[ADMIN STATS] Error getting message sources:", error);
      // Método alternativo
      const allMessages = await prisma.message.findMany({
        select: { source: true },
        take: 1000,
      });

      const sourceCount = {};
      allMessages.forEach((msg) => {
        sourceCount[msg.source] = (sourceCount[msg.source] || 0) + 1;
      });

      messageSources = Object.entries(sourceCount)
        .map(([source, count]) => ({
          source,
          count: Number(count),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    }

    // Obtener estados de reservas populares con conversión explícita
    let bookingStatus = [];
    try {
      const rawStatus = await prisma.$queryRaw`
        SELECT status, COUNT(*)::int as count
        FROM bookings
        GROUP BY status
        ORDER BY count DESC
        LIMIT 5
      `;
      bookingStatus = rawStatus.map((status) => ({
        status: status.status,
        count: Number(status.count),
      }));
    } catch (error) {
      console.log("[ADMIN STATS] Error getting booking status:", error);
      // Método alternativo
      bookingStatus = [
        { status: "pending", count: Number(pendingReservations) },
        { status: "confirmed", count: Number(confirmedReservations) },
        { status: "cancelled", count: Number(cancelledReservations) },
      ]
        .filter((item) => item.count > 0)
        .sort((a, b) => b.count - a.count);
    }

    // Calcular total de participantes y promedio
    const totalParticipants =
      Number(totalParticipantsResult._sum.numPeople) || 0;
    const avgParticipants = Number(avgParticipantsResult._avg.numPeople) || 0;

    // Calcular mensajes respondidos
    let respondedMessages = 0;
    try {
      respondedMessages = Number(
        await prisma.message.count({
          where: { status: "responded" },
        }),
      );
    } catch (error) {
      console.log(
        "[ADMIN STATS] 'responded' status not available, using 'read' instead",
      );
      respondedMessages = Number(readMessages);
    }

    // Calcular porcentajes y ratios
    const messageResponseRate =
      totalMessages > 0
        ? Math.round((respondedMessages / totalMessages) * 100)
        : 0;

    const reservationConfirmationRate =
      totalReservations > 0
        ? Math.round((confirmedReservations / totalReservations) * 100)
        : 0;

    const activityParticipationRate =
      totalActivities > 0 && avgParticipants > 0
        ? Math.min(Math.round((avgParticipants / 20) * 100), 100)
        : 0;

    // Preparar estadísticas con conversión de números
    const stats = {
      // Totales principales
      totalActivities: Number(totalActivities),
      activeHarvests: Number(activeHarvests),
      totalUsers: Number(totalUsers),
      upcomingEvents: Number(upcomingEvents),
      unreadMessages: Number(unreadMessages),
      participationRate: activityParticipationRate,
      totalBookings: Number(totalReservations),
      totalProducts: Number(totalProducts),
      totalMessages: Number(totalMessages),

      // Estadísticas detalladas
      detailedStats: {
        activities: {
          total: Number(totalActivities),
          upcoming: Number(upcomingActivities),
          active: Number(activeActivities),
        },
        messages: {
          total: Number(totalMessages),
          unread: Number(unreadMessages),
          read: Number(readMessages),
          responded: Number(respondedMessages),
          today: Number(todayMessages),
          week: Number(weekMessages),
          month: Number(monthMessages),
          responseRate: messageResponseRate,
          sources: messageSources,
        },
        bookings: {
          total: Number(totalReservations),
          pending: Number(pendingReservations),
          confirmed: Number(confirmedReservations),
          cancelled: Number(cancelledReservations),
          today: Number(todayReservations),
          week: Number(weekReservations),
          confirmationRate: reservationConfirmationRate,
          statusBreakdown: bookingStatus,
          participants: {
            total: totalParticipants,
            average: Math.round(avgParticipants * 10) / 10,
          },
        },
        users: {
          total: Number(totalUsers),
          active: Number(activeUsers),
          today: Number(todayUsers),
          week: Number(weekUsers),
        },
        products: {
          total: Number(totalProducts),
          activeHarvests: Number(activeHarvests),
        },
        events: {
          total: Number(totalEvents),
          upcoming: Number(upcomingEvents),
          today: Number(todayEvents),
        },
      },

      // Métricas adicionales
      metrics: {
        messageResponseRate,
        reservationConfirmationRate,
        activityParticipationRate,
        avgParticipants: Math.round(avgParticipants * 10) / 10,
        totalParticipants,
      },
    };

    console.log("[ADMIN STATS] Stats calculated successfully");
    console.log("[ADMIN STATS] Unread messages:", stats.unreadMessages);
    console.log("[ADMIN STATS] Message sources:", messageSources);

    // Convertir cualquier BigInt restante
    const safeStats = convertBigInts(stats);

    return NextResponse.json(safeStats, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
        "X-Stats-Generated": new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[ADMIN STATS ERROR]", error);
    console.error("[ADMIN STATS ERROR Stack]:", error.stack);

    // Manejar errores específicos de Prisma
    if (error.name === "PrismaClientInitializationError") {
      return NextResponse.json(
        {
          error: "Database connection error",
          details: "Cannot connect to the database",
          timestamp: new Date().toISOString(),
        },
        { status: 503 },
      );
    }

    if (
      error.code === "P2025" ||
      error.name === "PrismaClientKnownRequestError"
    ) {
      return NextResponse.json(
        {
          error: "Database query error",
          details: "One or more database queries failed",
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

// Método POST para forzar actualización de caché
export async function POST(request) {
  try {
    console.log("[ADMIN STATS] POST request for cache refresh...");

    // Obtener info del usuario de headers (opcional, para logs)
    const userId = request.headers.get("x-user-id");
    const userEmail = request.headers.get("x-user-email");

    // Registrar la acción si tenemos info del usuario
    if (userId && userEmail) {
      try {
        await prisma.adminLog.create({
          data: {
            action: "refresh_stats",
            userId: userId,
            userEmail: userEmail,
            details: "Admin manually refreshed dashboard statistics",
            metadata: {
              timestamp: new Date().toISOString(),
            },
          },
        });
      } catch (logError) {
        console.error("[ADMIN STATS] Failed to log refresh:", logError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Statistics cache refresh triggered",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[ADMIN STATS POST ERROR]", error);
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
