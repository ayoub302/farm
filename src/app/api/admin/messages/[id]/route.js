// src/app/api/admin/messages/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ CORREGIDO: Helper function SIN usar cookies() de next/headers
function verifyAdmin(request) {
  try {
    const session = request.cookies.get("admin_session");
    const isAuthenticated = session?.value === "authenticated";

    if (!isAuthenticated) {
      return { authenticated: false, error: "Not authenticated" };
    }

    return {
      authenticated: true,
      adminEmail: process.env.ADMIN_EMAIL,
      userId: session?.value || "admin",
    };
  } catch (error) {
    console.error("[VERIFY_ADMIN_ERROR]", error);
    return { authenticated: false, error: "Authentication error" };
  }
}

// GET: Get single message by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    console.log(`[GET SINGLE MESSAGE] Getting message ${id}`);

    // ✅ Verificar autenticación (sin await porque verifyAdmin no es async)
    const auth = verifyAdmin(request);

    if (!auth.authenticated) {
      console.log("[GET SINGLE MESSAGE] Not authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[GET SINGLE MESSAGE] Admin verified");

    const message = await prisma.message.findUnique({
      where: { id },
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

    if (!message) {
      console.log(`[GET SINGLE MESSAGE] Message ${id} not found`);
      return NextResponse.json(
        {
          error: "Message not found",
          message: "The requested message does not exist",
        },
        { status: 404 },
      );
    }

    console.log(`[GET SINGLE MESSAGE] Found message: ${message.subject}`);

    return NextResponse.json(message);
  } catch (error) {
    console.error("[GET SINGLE MESSAGE ERROR]", error);

    if (error.name === "PrismaClientValidationError") {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: "Invalid message ID format",
        },
        { status: 400 },
      );
    }

    if (error.code === "P2023") {
      return NextResponse.json(
        {
          error: "Invalid ID format",
          details: "The provided message ID is not valid",
        },
        { status: 400 },
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

// PATCH: Update message status or other fields
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    console.log(`[UPDATE MESSAGE] Updating message ${id}`);
    console.log(`[UPDATE MESSAGE] Update data:`, body);

    // ✅ Verificar autenticación (sin await)
    const auth = verifyAdmin(request);

    if (!auth.authenticated) {
      console.log("[UPDATE MESSAGE] Not authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[UPDATE MESSAGE] Admin verified");

    const existingMessage = await prisma.message.findUnique({
      where: { id },
    });

    if (!existingMessage) {
      console.log(`[UPDATE MESSAGE] Message ${id} not found`);
      return NextResponse.json(
        {
          error: "Message not found",
          message: "The message does not exist in the database",
        },
        { status: 404 },
      );
    }

    const updateData = {
      updatedAt: new Date(),
    };

    if (status) {
      const validStatuses = ["unread", "read", "responded", "archived"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          {
            error: "Invalid status",
            details: "Status must be: unread, read, responded, or archived",
            validStatuses,
          },
          { status: 400 },
        );
      }
      updateData.status = status;

      if (status === "responded") {
        console.log(
          `[UPDATE MESSAGE] Message ${id} marked as responded by ${auth.adminEmail}`,
        );
      }
    } else {
      return NextResponse.json(
        {
          error: "No status provided",
          message: "Status field is required for update",
        },
        { status: 400 },
      );
    }

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        subject: true,
        updatedAt: true,
        phone: true,
        message: true,
        source: true,
        createdAt: true,
      },
    });

    console.log(`[UPDATE MESSAGE] Successfully updated message ${id}`);

    try {
      const detailsObj = {
        messageId: id,
        previousStatus: existingMessage.status,
        newStatus: status,
        action: "update_message",
      };

      await prisma.systemLog.create({
        data: {
          action: "update_message",
          module: "messages",
          userId: auth.userId,
          userEmail: auth.adminEmail,
          details: detailsObj,
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      });
    } catch (logError) {
      console.error("[UPDATE MESSAGE] Failed to log action:", logError);
    }

    return NextResponse.json({
      success: true,
      message: "Message updated successfully",
      data: updatedMessage,
    });
  } catch (error) {
    console.error("[UPDATE MESSAGE ERROR]", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        {
          error: "Message not found",
          message: "The message does not exist in the database",
        },
        { status: 404 },
      );
    }

    if (error.code === "P2023") {
      return NextResponse.json(
        {
          error: "Invalid ID format",
          details: "The provided message ID is not valid",
        },
        { status: 400 },
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

// DELETE: Delete a message
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    console.log(`[DELETE MESSAGE] Deleting message ${id}`);

    // ✅ Verificar autenticación (sin await)
    const auth = verifyAdmin(request);

    if (!auth.authenticated) {
      console.log("[DELETE MESSAGE] Not authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[DELETE MESSAGE] Admin verified");

    const existingMessage = await prisma.message.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        status: true,
      },
    });

    if (!existingMessage) {
      console.log(`[DELETE MESSAGE] Message ${id} not found`);
      return NextResponse.json(
        {
          error: "Message not found",
          message: "The message no longer exists or was previously deleted",
        },
        { status: 404 },
      );
    }

    try {
      const detailsObj = {
        messageId: id,
        subject: existingMessage.subject,
        status: existingMessage.status,
        name: existingMessage.name,
        email: existingMessage.email,
        action: "delete_message",
      };

      await prisma.systemLog.create({
        data: {
          action: "delete_message",
          module: "messages",
          userId: auth.userId,
          userEmail: auth.adminEmail,
          details: detailsObj,
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      });
    } catch (logError) {
      console.error("[DELETE MESSAGE] Failed to log deletion:", logError);
    }

    await prisma.message.delete({
      where: { id },
    });

    console.log(`[DELETE MESSAGE] Successfully deleted message ${id}`);

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully",
      deletedMessage: {
        id: existingMessage.id,
        name: existingMessage.name,
        email: existingMessage.email,
        subject: existingMessage.subject,
      },
    });
  } catch (error) {
    console.error("[DELETE MESSAGE ERROR]", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        {
          error: "Message not found",
          message: "The message does not exist in the database",
        },
        { status: 404 },
      );
    }

    if (error.code === "P2023") {
      return NextResponse.json(
        {
          error: "Invalid ID format",
          details: "The provided message ID is not valid",
        },
        { status: 400 },
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

// POST: Add notes or reply to message
export async function POST(request, { params }) {
  try {
    const { id } = await params;

    console.log(
      `[POST MESSAGE] Adding content to message ${id} - NOT SUPPORTED`,
    );

    return NextResponse.json(
      {
        success: false,
        message: "This endpoint is not supported",
        note: "The Message model does not have fields for notes or replies. Update the model to enable this feature.",
      },
      { status: 501 },
    );
  } catch (error) {
    console.error("[POST MESSAGE ERROR]", error);
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
