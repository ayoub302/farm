// src/app/api/admin/messages/[id]/route.js
import { NextResponse } from "next/server";
const prisma = require("@/lib/prisma");

// GET: Get single message by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    console.log(`[GET SINGLE MESSAGE] Getting message ${id}`);

    // Obtener información del usuario de headers (opcional, para logs)
    const userId = request.headers.get("x-user-id");
    const userEmail = request.headers.get("x-user-email");

    // Get message - solo campos que existen
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

    // Manejar errores específicos de Prisma
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
    const { status } = body; // Solo status es válido

    console.log(`[UPDATE MESSAGE] Updating message ${id}`);
    console.log(`[UPDATE MESSAGE] Update data:`, body);

    // Obtener información del usuario de headers (para logs)
    const userId = request.headers.get("x-user-id");
    const userEmail = request.headers.get("x-user-email");

    // Verificar si el mensaje existe primero
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

    // Preparar datos de actualización
    const updateData = {
      updatedAt: new Date(),
    };

    // Validar y agregar status si está presente
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

      // Solo actualizamos el status
      if (status === "responded") {
        console.log(`[UPDATE MESSAGE] Message ${id} marked as responded`);
      }
    } else {
      // Si no se proporciona status, no hacer nada
      return NextResponse.json(
        {
          error: "No status provided",
          message: "Status field is required for update",
        },
        { status: 400 },
      );
    }

    // Update message - SOLO campos que existen en el modelo
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

    // Registrar la acción en logs usando SystemLog (si tenemos info del usuario)
    if (userId && userEmail) {
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
            userId: userId,
            userEmail: userEmail,
            details: detailsObj,
            ipAddress: request.headers.get("x-forwarded-for") || "unknown",
            userAgent: request.headers.get("user-agent") || "unknown",
          },
        });
      } catch (logError) {
        console.error("[UPDATE MESSAGE] Failed to log action:", logError);
        // No fallamos si el log falla
      }
    }

    return NextResponse.json({
      success: true,
      message: "Message updated successfully",
      data: updatedMessage,
    });
  } catch (error) {
    console.error("[UPDATE MESSAGE ERROR]", error);

    // Handle message not found
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

    // Obtener información del usuario de headers (para logs)
    const userId = request.headers.get("x-user-id");
    const userEmail = request.headers.get("x-user-email");

    // Verificar si el mensaje existe primero
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

    // Primero guardar en logs antes de eliminar (si tenemos info del usuario)
    if (userId && userEmail) {
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
            userId: userId,
            userEmail: userEmail,
            details: detailsObj,
            ipAddress: request.headers.get("x-forwarded-for") || "unknown",
            userAgent: request.headers.get("user-agent") || "unknown",
          },
        });
      } catch (logError) {
        console.error("[DELETE MESSAGE] Failed to log deletion:", logError);
        // Continuamos con la eliminación incluso si el log falla
      }
    }

    // Eliminar el mensaje
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

    // Handle message not found
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

// POST: Add notes or reply to message (opcional - deshabilitado porque el modelo no tiene los campos)
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
    ); // 501 Not Implemented
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
