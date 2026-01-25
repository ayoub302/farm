import { NextResponse } from "next/server";
const prisma = require("@/lib/prisma");

// NOTA: La función verifyAdmin fue eliminada
// porque el middleware YA verificó que es admin

// GET /api/admin/reservations/[id] - Obtener una reservación específica
export async function GET(request, { params }) {
  try {
    // ✅ IMPORTANTE: Usar await para params
    const { id } = await params;

    console.log(`[RESERVATION GET API] Starting for ID: ${id}`);

    // IMPORTANTE: El middleware YA verificó que es admin
    // No necesitamos verificar permisos aquí

    // Buscar la reservación por ID
    const reservation = await prisma.booking.findUnique({
      where: { id },
      include: {
        activity: {
          select: {
            titleAr: true,
            titleFr: true,
            id: true,
            location: true,
          },
        },
      },
    });

    if (!reservation) {
      console.log(`[RESERVATION GET API] Reservation ${id} not found`);
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 },
      );
    }

    console.log(`[RESERVATION GET API] Found reservation ${id}`);

    // Formatear la respuesta
    const formattedReservation = {
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
    };

    return NextResponse.json(formattedReservation);
  } catch (error) {
    console.error("[RESERVATION GET API ERROR]", error);
    return NextResponse.json(
      {
        error: "Failed to fetch reservation",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

// PATCH /api/admin/reservations/[id] - Actualizar una reservación
export async function PATCH(request, { params }) {
  try {
    // ✅ IMPORTANTE: Usar await para params
    const { id } = await params;

    console.log(`[RESERVATION PATCH API] Starting for ID: ${id}`);

    // IMPORTANTE: El middleware YA verificó que es admin
    // No necesitamos verificar permisos aquí

    // Obtener info del usuario de headers (opcional, para logs)
    const userId = request.headers.get("x-user-id");
    const userEmail = request.headers.get("x-user-email");

    const body = await request.json();

    console.log(`[RESERVATION PATCH API] Updates for ${id}:`, body);

    // Validar campos que se pueden actualizar
    const allowedUpdates = {
      status: body.status,
      paymentStatus: body.paymentStatus,
      notes: body.notes,
      specialRequests: body.specialRequests,
      numPeople:
        body.numPeople !== undefined ? parseInt(body.numPeople) : undefined,
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      clientPhone: body.clientPhone,
      bookingDate: body.bookingDate,
      activityDate: body.activityDate,
      paymentMethod: body.paymentMethod,
    };

    // Filtrar campos undefined
    const updates = Object.fromEntries(
      Object.entries(allowedUpdates).filter(
        ([_, value]) => value !== undefined,
      ),
    );

    if (Object.keys(updates).length === 0) {
      console.log(`[RESERVATION PATCH API] No valid updates for ${id}`);
      return NextResponse.json(
        { error: "No valid updates provided" },
        { status: 400 },
      );
    }

    // Agregar timestamp de actualización
    updates.updatedAt = new Date();

    console.log(`[RESERVATION PATCH API] Final updates for ${id}:`, updates);

    // Actualizar la reservación
    const updatedReservation = await prisma.booking.update({
      where: { id },
      data: updates,
      include: {
        activity: {
          select: {
            titleAr: true,
            titleFr: true,
            id: true,
          },
        },
      },
    });

    console.log(`[RESERVATION PATCH API] Successfully updated ${id}`);

    // Registrar en logs si tenemos info del usuario
    if (userId && userEmail) {
      try {
        await prisma.systemLog.create({
          data: {
            action: "update_reservation",
            module: "reservations",
            userId: userId,
            userEmail: userEmail,
            details: {
              reservationId: id,
              updates: Object.keys(updates),
            },
            severity: "info",
          },
        });
      } catch (logError) {
        console.error("[RESERVATION PATCH API] Failed to log:", logError);
        // No fallar si el log falla
      }
    }

    // Formatear la respuesta
    const formattedReservation = {
      id: updatedReservation.id,
      bookingCode: updatedReservation.bookingCode,
      activity: updatedReservation.activity,
      clientName: updatedReservation.clientName,
      clientEmail: updatedReservation.clientEmail,
      clientPhone: updatedReservation.clientPhone,
      numPeople: updatedReservation.numPeople,
      status: updatedReservation.status,
      paymentStatus: updatedReservation.paymentStatus,
      paymentMethod: updatedReservation.paymentMethod,
      bookingDate: updatedReservation.bookingDate,
      activityDate: updatedReservation.activityDate,
      specialRequests: updatedReservation.specialRequests,
      notes: updatedReservation.notes,
      createdAt: updatedReservation.createdAt,
      updatedAt: updatedReservation.updatedAt,
    };

    return NextResponse.json({
      success: true,
      message: "Reservation updated successfully",
      reservation: formattedReservation,
    });
  } catch (error) {
    console.error("[RESERVATION PATCH API ERROR]", error);

    // Manejar error de registro no encontrado
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to update reservation",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/reservations/[id] - Eliminar una reservación
export async function DELETE(request, { params }) {
  try {
    // ✅ IMPORTANTE: Usar await para params
    const { id } = await params;

    console.log(`[RESERVATION DELETE API] Starting for ID: ${id}`);

    // IMPORTANTE: El middleware YA verificó que es admin
    // No necesitamos verificar permisos aquí

    // Obtener info del usuario de headers (opcional, para logs)
    const userId = request.headers.get("x-user-id");
    const userEmail = request.headers.get("x-user-email");

    // Verificar si existe antes de eliminar
    const reservationExists = await prisma.booking.findUnique({
      where: { id },
      select: {
        id: true,
        bookingCode: true,
        clientName: true,
      },
    });

    if (!reservationExists) {
      console.log(`[RESERVATION DELETE API] Reservation ${id} not found`);
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 },
      );
    }

    // Registrar en logs antes de eliminar (si tenemos info del usuario)
    if (userId && userEmail) {
      try {
        await prisma.systemLog.create({
          data: {
            action: "delete_reservation",
            module: "reservations",
            userId: userId,
            userEmail: userEmail,
            details: {
              reservationId: id,
              bookingCode: reservationExists.bookingCode,
              clientName: reservationExists.clientName,
            },
            severity: "warning",
          },
        });
      } catch (logError) {
        console.error("[RESERVATION DELETE API] Failed to log:", logError);
        // Continuar con la eliminación incluso si el log falla
      }
    }

    // Eliminar la reservación
    await prisma.booking.delete({
      where: { id },
    });

    console.log(`[RESERVATION DELETE API] Successfully deleted ${id}`);

    return NextResponse.json({
      success: true,
      message: "Reservation deleted successfully",
    });
  } catch (error) {
    console.error("[RESERVATION DELETE API ERROR]", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to delete reservation",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
