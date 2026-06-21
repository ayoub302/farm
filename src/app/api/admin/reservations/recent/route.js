import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    console.log("[RESERVATIONS RECENT API] Starting...");

    const session = request.cookies.get("admin_session");
    if (session?.value !== "authenticated") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const reservations = await prisma.booking.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
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

    const formattedReservations = reservations.map((r) => ({
      id: r.id,
      bookingCode: r.bookingCode,
      activity: r.activity,
      clientName: r.clientName,
      clientEmail: r.clientEmail,
      clientPhone: r.clientPhone,
      numPeople: r.numPeople,
      status: r.status,
      paymentStatus: r.paymentStatus,
      paymentMethod: r.paymentMethod,
      bookingDate: r.bookingDate,
      activityDate: r.activityDate,
      specialRequests: r.specialRequests,
      notes: r.notes,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    return NextResponse.json(formattedReservations);
  } catch (error) {
    console.error("[RESERVATIONS RECENT API ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 },
    );
  }
}
