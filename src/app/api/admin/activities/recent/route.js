// app/api/admin/activities/recent/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    console.log("[ACTIVITIES RECENT API] Starting...");

    const session = request.cookies.get("admin_session");
    if (session?.value !== "authenticated") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const activities = await prisma.activity.findMany({
      take: 50,
      orderBy: { date: "asc" },
      where: {
        date: { gte: new Date() },
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

    if (activities.length === 0) return NextResponse.json([]);

    const formattedActivities = activities.map((activity) => {
      const currentParticipants = activity.bookings
        .filter((b) => b.status === "confirmed")
        .reduce((sum, b) => sum + (b.numPeople || 0), 0);

      return {
        id: activity.id,
        titleFr: activity.titleFr,
        titleAr: activity.titleAr,
        descriptionFr: activity.descriptionFr,
        descriptionAr: activity.descriptionAr,
        date: activity.date,
        endDate: activity.endDate,
        location: activity.location,
        maxCapacity: activity.maxCapacity,
        currentParticipants,
        status: activity.status,
        category: activity.category,
        requirements: activity.requirements,
        whatToBring: activity.whatToBring,
        duration: activity.duration,
        featured: activity.featured,
        imageUrl: activity.imageUrl,
        bookingsCount: activity.bookings.length,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
      };
    });

    return NextResponse.json(formattedActivities);
  } catch (error) {
    console.error("[ACTIVITIES RECENT API ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 },
    );
  }
}
