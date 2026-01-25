// app/api/admin/activities/recent/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    console.log("[ACTIVITIES RECENT] Fetching activities...");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // El middleware YA verificó que es admin
    const activities = await prisma.activity.findMany({
      take: 10,
      orderBy: { date: "asc" },
      where: {
        date: { gte: today },
      },
      include: {
        bookings: {
          select: {
            id: true,
            status: true,
            numPeople: true,
          },
        },
      },
    });

    console.log(`[ACTIVITIES RECENT] Found ${activities.length} activities`);

    // Transformar datos
    const formattedActivities = activities.map((activity) => {
      const confirmedBookings = activity.bookings.filter(
        (booking) => booking.status === "confirmed",
      );

      const currentParticipants = confirmedBookings.reduce(
        (sum, booking) => sum + (booking.numPeople || 0),
        0,
      );

      return {
        id: activity.id,
        titleFr: activity.titleFr,
        titleAr: activity.titleAr,
        date: activity.date,
        endDate: activity.endDate,
        location: activity.location,
        maxCapacity: activity.maxCapacity,
        currentParticipants,
        status: activity.status,
        category: activity.category,
        imageUrl: activity.imageUrl,
        bookingsCount: activity.bookings.length,
        confirmedBookingsCount: confirmedBookings.length,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
      };
    });

    return NextResponse.json(formattedActivities);
  } catch (error) {
    console.error("[ACTIVITIES RECENT ERROR]", error);
    return NextResponse.json(
      {
        error: "Failed to fetch activities",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
