// app/api/admin/calendar/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper functions for colors
function getActivityColor(activity) {
  switch (activity.category?.toLowerCase()) {
    case "harvest":
    case "récolte":
    case "حصاد":
      return "#10b981"; // green
    case "workshop":
    case "atelier":
    case "ورشة":
      return "#f59e0b"; // yellow
    case "visit":
    case "visite":
    case "زيارة":
      return "#3b82f6"; // blue
    case "tasting":
    case "dégustation":
    case "تذوق":
      return "#8b5cf6"; // purple
    case "educational":
    case "éducation":
    case "تعليمي":
      return "#ec4899"; // pink
    default:
      return activity.status === "upcoming"
        ? "#3b82f6"
        : activity.status === "active"
          ? "#10b981"
          : activity.status === "completed"
            ? "#6b7280"
            : activity.status === "cancelled"
              ? "#ef4444"
              : "#6b7280";
  }
}

function getBookingColor(status) {
  switch (status?.toLowerCase()) {
    case "confirmed":
      return "#10b981"; // green
    case "pending":
      return "#f59e0b"; // yellow
    case "cancelled":
      return "#ef4444"; // red
    default:
      return "#6b7280"; // gray
  }
}

export async function GET(request) {
  try {
    console.log("[ADMIN CALENDAR API] Starting...");

    // Get date parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const view = searchParams.get("view") || "month"; // month, week, day

    console.log("[ADMIN CALENDAR API] Fetching calendar data with:", {
      startDate,
      endDate,
      view,
    });

    // Set default dates if not provided
    let dateFrom, dateTo;
    const today = new Date();

    if (view === "month") {
      dateFrom = startDate
        ? new Date(startDate)
        : new Date(today.getFullYear(), today.getMonth(), 1);
      dateTo = endDate
        ? new Date(endDate)
        : new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (view === "week") {
      dateFrom = startDate
        ? new Date(startDate)
        : new Date(today.setDate(today.getDate() - today.getDay()));
      dateTo = new Date(dateFrom);
      dateTo.setDate(dateTo.getDate() + 6);
    } else if (view === "day") {
      dateFrom = startDate ? new Date(startDate) : today;
      dateTo = new Date(dateFrom);
    }

    dateTo.setHours(23, 59, 59, 999);

    console.log("[ADMIN CALENDAR API] Date range:", { dateFrom, dateTo });

    // Get activities within date range
    const activities = await prisma.activity.findMany({
      where: {
        date: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      include: {
        bookings: {
          select: {
            id: true,
            status: true,
            numPeople: true,
            clientName: true,
            clientEmail: true,
            clientPhone: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Get calendar events
    const calendarEvents = await prisma.calendarEvent.findMany({
      where: {
        startDate: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      include: {
        activity: {
          select: {
            id: true,
            titleFr: true,
            titleAr: true,
          },
        },
        harvest: {
          select: {
            id: true,
            productFr: true,
            productAr: true,
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
    });

    // Get bookings within date range
    const bookings = await prisma.booking.findMany({
      where: {
        activityDate: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      include: {
        activity: {
          select: {
            titleFr: true,
            titleAr: true,
            location: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        activityDate: "asc",
      },
    });

    console.log(
      `[ADMIN CALENDAR API] Found ${activities.length} activities, ${calendarEvents.length} events, ${bookings.length} bookings`,
    );

    // Format activities for calendar
    const formattedActivities = activities.map((activity) => {
      const confirmedBookings = activity.bookings.filter(
        (b) => b.status === "confirmed",
      );
      const currentParticipants = confirmedBookings.reduce(
        (sum, booking) => sum + (booking.numPeople || 0),
        0,
      );

      return {
        id: activity.id,
        title: `${activity.titleFr} / ${activity.titleAr}`,
        start: activity.date,
        end:
          activity.endDate ||
          new Date(
            new Date(activity.date).getTime() +
              activity.duration * 60 * 60 * 1000,
          ),
        type: "activity",
        color: getActivityColor(activity),
        extendedProps: {
          activityId: activity.id,
          titleFr: activity.titleFr,
          titleAr: activity.titleAr,
          location: activity.location,
          capacity: `${currentParticipants}/${activity.maxCapacity}`,
          availability: activity.maxCapacity - currentParticipants,
          status: activity.status,
          category: activity.category,
          bookingsCount: activity.bookings.length,
          bookingDetails: activity.bookings.map((b) => ({
            id: b.id,
            clientName: b.clientName,
            status: b.status,
            numPeople: b.numPeople,
          })),
        },
      };
    });

    // Format calendar events
    const formattedEvents = calendarEvents.map((event) => ({
      id: event.id,
      title: `${event.titleFr} / ${event.titleAr}`,
      start: event.startDate,
      end: event.endDate,
      type: event.type,
      color: event.color,
      extendedProps: {
        eventId: event.id,
        titleFr: event.titleFr,
        titleAr: event.titleAr,
        descriptionFr: event.descriptionFr,
        descriptionAr: event.descriptionAr,
        isPublic: event.isPublic,
        location: event.location,
        activity: event.activity,
        harvest: event.harvest,
      },
    }));

    // Format bookings for calendar
    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      title: `${booking.clientName} - ${
        booking.activity?.titleFr || "Booking"
      }`,
      start: booking.activityDate,
      end: new Date(new Date(booking.activityDate).getTime() + 60 * 60 * 1000), // 1 hour default
      type: "booking",
      color: getBookingColor(booking.status),
      extendedProps: {
        bookingId: booking.id,
        bookingCode: booking.bookingCode,
        clientName: booking.clientName,
        clientEmail: booking.clientEmail,
        clientPhone: booking.clientPhone,
        numPeople: booking.numPeople,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        activity: booking.activity,
        specialRequests: booking.specialRequests,
        notes: booking.notes,
      },
    }));

    // Combine all events
    const calendarData = [
      ...formattedActivities,
      ...formattedEvents,
      ...formattedBookings,
    ];

    // If no data found, return empty with message
    if (calendarData.length === 0) {
      console.log(
        "[ADMIN CALENDAR API] No calendar data found for the selected period",
      );

      const response = {
        events: [],
        statistics: {
          activities: 0,
          upcomingActivities: 0,
          ongoingActivities: 0,
          events: 0,
          publicEvents: 0,
          bookings: 0,
          confirmedBookings: 0,
          pendingBookings: 0,
          totalParticipants: 0,
        },
        dateRange: {
          start: dateFrom,
          end: dateTo,
          view,
        },
        summary: {
          activities: [],
          bookings: [],
        },
        message: "No calendar data found for the selected period",
      };

      return NextResponse.json(response);
    }

    // Calendar statistics
    const statistics = {
      activities: activities.length,
      upcomingActivities: activities.filter((a) => a.status === "upcoming")
        .length,
      ongoingActivities: activities.filter((a) => a.status === "active").length,
      events: calendarEvents.length,
      publicEvents: calendarEvents.filter((e) => e.isPublic).length,
      bookings: bookings.length,
      confirmedBookings: bookings.filter((b) => b.status === "confirmed")
        .length,
      pendingBookings: bookings.filter((b) => b.status === "pending").length,
      totalParticipants: bookings
        .filter((b) => b.status === "confirmed")
        .reduce((sum, booking) => sum + (booking.numPeople || 0), 0),
    };

    const response = {
      events: calendarData,
      statistics,
      dateRange: {
        start: dateFrom,
        end: dateTo,
        view,
      },
      summary: {
        activities: activities.map((a) => ({
          id: a.id,
          titleFr: a.titleFr,
          date: a.date,
          status: a.status,
          bookingsCount: a.bookings.length,
        })),
        bookings: bookings.map((b) => ({
          id: b.id,
          clientName: b.clientName,
          activityDate: b.activityDate,
          status: b.status,
          numPeople: b.numPeople,
        })),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[ADMIN CALENDAR API ERROR]", error);
    console.error("[ADMIN CALENDAR API ERROR Stack]:", error.stack);

    return NextResponse.json(
      {
        error: "Failed to fetch calendar data",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
