import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// GET: Recent messages for dashboard
export async function GET(request) {
  try {
    console.log("[ADMIN MESSAGES RECENT] GET request...");

    const session = request.cookies.get("admin_session");
    if (session?.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    const where = {};
    if (status && status !== "all") {
      where.status = status;
    }

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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST: Create test message
export async function POST(request) {
  try {
    const session = request.cookies.get("admin_session");
    if (session?.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, subject, message } = await request.json();

    const testMessage = await prisma.message.create({
      data: {
        name: name || "Test User",
        email: email || "test@example.com",
        subject: subject || "Test Message from Admin Dashboard",
        message:
          message || "This is a test message created from the admin dashboard.",
        status: "unread",
        source: "admin_test",
        ipAddress: "127.0.0.1",
        userAgent: "Admin Dashboard",
      },
    });

    return NextResponse.json(
      { success: true, data: testMessage },
      { status: 201 },
    );
  } catch (error) {
    console.error("[CREATE TEST MESSAGE ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
