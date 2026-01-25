import { NextResponse } from "next/server";
const prisma = require("@/lib/prisma");

export async function GET() {
  try {
    console.log("[RESERVATIONS RECENT API] Starting...");

    console.log("[RESERVATIONS RECENT API] Fetching reservations...");

    // Obtener reservaciones recientes
    const reservations = await prisma.booking.findMany({
      take: 50,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        activity: {
          select: {
            titleAr: true,
            titleFr: true,
          },
        },
      },
    });

    console.log(
      `[RESERVATIONS RECENT] Found ${reservations.length} reservations`,
    );

    // Transformar los datos para el frontend
    const formattedReservations = reservations.map((reservation) => ({
      id: reservation.id,
      bookingCode: reservation.bookingCode,
      activity: reservation.activity,
      clientName: reservation.clientName,
      clientEmail: reservation.clientEmail,
      clientPhone: reservation.clientPhone,
      numPeople: reservation.numPeople,
      status: reservation.status,
      paymentStatus: reservation.paymentStatus,
      paymentMethod: reservation.paymentMethod,
      bookingDate: reservation.bookingDate,
      activityDate: reservation.activityDate,
      specialRequests: reservation.specialRequests,
      notes: reservation.notes,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
    }));

    return NextResponse.json(formattedReservations);
  } catch (error) {
    console.error("[RESERVATIONS RECENT API ERROR]", error);

    return NextResponse.json(
      {
        error: "Failed to fetch reservations",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
