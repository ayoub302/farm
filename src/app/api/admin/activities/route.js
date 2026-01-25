// app/api/admin/activities/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper function to convert BigInt to Number
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

// Helper function to get color by category
function getColorByCategory(category) {
  switch (category.toLowerCase()) {
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
      return "#6b7280"; // gray
  }
}

// GET: Get all activities
export async function GET(request) {
  try {
    console.log("[ACTIVITIES API GET] Starting...");

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    console.log(`[ACTIVITIES API GET] Fetching activities with filters:`, {
      status,
      category,
      dateFrom,
      dateTo,
      page,
      limit,
    });

    // Build filters
    const where = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        where.date.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.date.lte = new Date(dateTo);
      }
    }

    // Get total activities for pagination
    const totalActivities = await prisma.activity.count({ where });

    // Get activities with pagination
    const activities = await prisma.activity.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        date: "asc",
      },
      include: {
        bookings: {
          select: {
            id: true,
            status: true,
            numPeople: true,
            clientName: true,
            clientEmail: true,
          },
        },
      },
    });

    console.log(`[ACTIVITIES API GET] Found ${activities.length} activities`);

    // If no activities found
    if (activities.length === 0) {
      console.log(
        "[ACTIVITIES API GET] No activities found with current filters",
      );
      const safeData = convertBigInts({
        activities: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
        message: "No activities found",
      });
      return NextResponse.json(safeData);
    }

    // Transform data
    const formattedActivities = activities.map((activity) => {
      const currentParticipants = activity.bookings
        .filter((b) => b.status === "confirmed")
        .reduce((sum, booking) => sum + (booking.numPeople || 0), 0);

      const bookingStatusCount = {
        pending: activity.bookings.filter((b) => b.status === "pending").length,
        confirmed: activity.bookings.filter((b) => b.status === "confirmed")
          .length,
        cancelled: activity.bookings.filter((b) => b.status === "cancelled")
          .length,
      };

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
        bookingStatusCount,
        availability: activity.maxCapacity - currentParticipants,
        occupancyRate:
          activity.maxCapacity > 0
            ? Math.round((currentParticipants / activity.maxCapacity) * 100)
            : 0,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
      };
    });

    const safeData = convertBigInts({
      activities: formattedActivities,
      pagination: {
        page,
        limit,
        total: totalActivities,
        totalPages: Math.ceil(totalActivities / limit),
        hasNextPage: page * limit < totalActivities,
        hasPrevPage: page > 1,
      },
    });

    return NextResponse.json(safeData);
  } catch (error) {
    console.error("[ACTIVITIES API GET ERROR]", error);
    console.error("[ACTIVITIES API GET ERROR Stack]:", error.stack);

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

// POST: Create new activity
export async function POST(request) {
  try {
    console.log("[ACTIVITIES API POST] Starting...");

    // Si necesitas el userId para logs, puedes obtenerlo de headers
    const userId = request.headers.get("x-user-id");
    const userEmail = request.headers.get("x-user-email");

    // Parse activity data
    const activityData = await request.json();

    console.log(
      "[ACTIVITIES API POST] Creating activity with data:",
      activityData,
    );

    // Validate required fields
    const requiredFields = [
      "titleFr",
      "titleAr",
      "descriptionFr",
      "descriptionAr",
      "date",
      "location",
      "maxCapacity",
    ];
    const missingFields = requiredFields.filter(
      (field) => !activityData[field],
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          missingFields,
        },
        { status: 400 },
      );
    }

    // Validate dates
    if (
      activityData.endDate &&
      new Date(activityData.endDate) <= new Date(activityData.date)
    ) {
      return NextResponse.json(
        {
          error: "End date must be after start date",
        },
        { status: 400 },
      );
    }

    // Validate capacity
    if (activityData.maxCapacity < 1) {
      return NextResponse.json(
        {
          error: "Maximum capacity must be at least 1",
        },
        { status: 400 },
      );
    }

    // Create activity in database
    const newActivity = await prisma.activity.create({
      data: {
        titleFr: activityData.titleFr,
        titleAr: activityData.titleAr,
        descriptionFr: activityData.descriptionFr,
        descriptionAr: activityData.descriptionAr,
        date: new Date(activityData.date),
        endDate: activityData.endDate ? new Date(activityData.endDate) : null,
        location: activityData.location,
        maxCapacity: parseInt(activityData.maxCapacity),
        currentParticipants: 0,
        status: activityData.status || "upcoming",
        category: activityData.category || "visit",
        requirements: activityData.requirements,
        whatToBring: activityData.whatToBring,
        duration: activityData.duration ? parseInt(activityData.duration) : 2,
        featured: activityData.featured || false,
        imageUrl: activityData.imageUrl,
      },
    });

    console.log(
      `[ACTIVITIES API POST] Activity created with ID: ${newActivity.id}`,
    );

    // Create calendar event
    try {
      const calendarEvent = await prisma.calendarEvent.create({
        data: {
          titleFr: activityData.titleFr,
          titleAr: activityData.titleAr,
          descriptionFr: activityData.descriptionFr,
          descriptionAr: activityData.descriptionAr,
          startDate: new Date(activityData.date),
          endDate: activityData.endDate
            ? new Date(activityData.endDate)
            : new Date(
                new Date(activityData.date).getTime() +
                  (activityData.duration || 2) * 60 * 60 * 1000,
              ),
          type: "activity",
          color: getColorByCategory(activityData.category || "visit"),
          isPublic: true,
          location: activityData.location,
          activityId: newActivity.id,
        },
      });

      console.log(
        `[ACTIVITIES API POST] Calendar event created with ID: ${calendarEvent.id}`,
      );
    } catch (calendarError) {
      console.error(
        "[ACTIVITIES API POST] Error creating calendar event:",
        calendarError,
      );
      // Don't fail if calendar event can't be created
    }

    // Log the action if we have user info
    if (userId && userEmail) {
      try {
        await prisma.systemLog.create({
          data: {
            action: "create_activity",
            module: "activities",
            userId: userId,
            userEmail: userEmail,
            details: {
              activityId: newActivity.id,
              titleFr: activityData.titleFr,
              titleAr: activityData.titleAr,
              date: activityData.date,
            },
            severity: "info",
          },
        });
      } catch (logError) {
        console.error("[ACTIVITIES API POST] Error creating log:", logError);
        // Don't fail if log can't be created
      }
    }

    // Create response object
    const safeActivity = {
      id: newActivity.id,
      titleFr: newActivity.titleFr,
      titleAr: newActivity.titleAr,
      descriptionFr: newActivity.descriptionFr,
      descriptionAr: newActivity.descriptionAr,
      date: newActivity.date,
      endDate: newActivity.endDate,
      location: newActivity.location,
      maxCapacity: newActivity.maxCapacity,
      currentParticipants: newActivity.currentParticipants,
      status: newActivity.status,
      category: newActivity.category,
      requirements: newActivity.requirements,
      whatToBring: newActivity.whatToBring,
      duration: newActivity.duration,
      featured: newActivity.featured,
      imageUrl: newActivity.imageUrl,
      createdAt: newActivity.createdAt,
      updatedAt: newActivity.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Activity created successfully",
        activity: safeActivity,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[ACTIVITIES API POST ERROR]", error);
    console.error("[ACTIVITIES API POST ERROR Stack]:", error.stack);

    // Handle Prisma specific errors
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          error: "Activity with similar data already exists",
          details: "Please check the activity details",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create activity",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
