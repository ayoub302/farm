import { NextResponse } from "next/server";
const prisma = require("@/lib/prisma");

// GET: Get recent messages (simplified version for dashboard)
export async function GET(request) {
  try {
    console.log("[ADMIN MESSAGES RECENT] GET request...");

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    // Build where clause
    const where = {};

    // Status filter
    if (status && status !== "all") {
      where.status = status;
    }

    // Get recent messages (simplified for dashboard)
    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        subject: true,
        message: true,
        status: true,
        source: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log(`[ADMIN MESSAGES RECENT] Found ${messages.length} messages`);

    // Format messages for dashboard
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      name: msg.name,
      email: msg.email,
      phone: msg.phone,
      subject: msg.subject,
      message:
        msg.message.substring(0, 100) + (msg.message.length > 100 ? "..." : ""),
      status: msg.status,
      source: msg.source,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
    }));

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error("[ADMIN MESSAGES RECENT ERROR]", error);

    if (error.name === "PrismaClientValidationError") {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: "One or more query parameters are invalid",
        },
        { status: 400 },
      );
    }

    if (error.name === "PrismaClientInitializationError") {
      return NextResponse.json(
        {
          error: "Database connection error",
          details: "Cannot connect to the database",
        },
        { status: 503 },
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

// POST: Create a test message for debugging
export async function POST(request) {
  try {
    const body = await request.json();

    const { name, email, subject, message } = body;

    // Create test message
    const testMessage = await prisma.message.create({
      data: {
        name: name || "Test User",
        email: email || "test@example.com",
        subject: subject || "Test Message from Admin Dashboard",
        message:
          message ||
          "This is a test message created from the admin dashboard for debugging purposes.",
        status: "unread",
        source: "admin_test",
        ipAddress: "127.0.0.1",
        userAgent: "Admin Dashboard",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Test message created successfully",
        data: testMessage,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[CREATE TEST MESSAGE ERROR]", error);
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
