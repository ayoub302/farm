// app/api/admin/harvests/[id]/route.js - CORREGIDO
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Obtener una cosecha específica
export async function GET(request, { params }) {
  try {
    // ⚠️ IMPORTANTE: Await params
    const { id } = await params;
    console.log(`[GET_HARVEST] Fetching harvest ID: ${id}`);

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const harvest = await prisma.harvest.findUnique({
      where: { id },
      select: {
        id: true,
        productAr: true,
        productFr: true,
        icon: true,
        season: true,
        year: true,
        nextHarvest: true,
        isActive: true,
        statusAr: true,
        statusFr: true,
        availabilityAr: true,
        availabilityFr: true,
        descriptionAr: true,
        descriptionFr: true,
        createdAt: true,
        updatedAt: true,
        activities: {
          orderBy: { date: "asc" },
          take: 10,
          select: {
            id: true,
            titleAr: true,
            titleFr: true,
            date: true,
            location: true,
            status: true,
          },
        },
        _count: {
          select: {
            activities: true,
            bookings: true,
            products: true,
            calendarEvents: true,
          },
        },
      },
    });

    if (!harvest) {
      return NextResponse.json({ error: "Harvest not found" }, { status: 404 });
    }

    console.log(`[GET_HARVEST] Found harvest: ${harvest.productFr}`);

    return NextResponse.json({
      success: true,
      harvest,
    });
  } catch (error) {
    console.error("[GET_HARVEST_ERROR]", error);

    return NextResponse.json(
      {
        error: "Failed to fetch harvest",
        message: error.message,
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
      },
      { status: 500 },
    );
  }
}

// PUT - Actualizar una cosecha
export async function PUT(request, { params }) {
  try {
    // ⚠️ IMPORTANTE: Await params
    const { id } = await params;
    console.log(`[UPDATE_HARVEST] Updating harvest ID: ${id}`);

    const data = await request.json();

    // Validar datos
    if (!data.productAr || !data.productFr) {
      return NextResponse.json(
        { error: "Product name in both Arabic and French is required" },
        { status: 400 },
      );
    }

    // Actualizar
    const harvest = await prisma.harvest.update({
      where: { id },
      data: {
        productAr: data.productAr,
        productFr: data.productFr,
        icon: data.icon || "🌱",
        nextHarvest: data.nextHarvest ? new Date(data.nextHarvest) : undefined,
        season: data.season,
        year: data.year ? parseInt(data.year) : undefined,
        isActive: data.isActive,
        descriptionAr: data.descriptionAr,
        descriptionFr: data.descriptionFr,
      },
    });

    console.log(`[HARVEST_UPDATED] Harvest updated: ${harvest.productFr}`);

    return NextResponse.json({
      success: true,
      message: "Harvest updated successfully",
      harvest,
    });
  } catch (error) {
    console.error("[UPDATE_HARVEST_ERROR]", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Harvest not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update harvest" },
      { status: 500 },
    );
  }
}

// DELETE - Eliminar una cosecha con todas sus relaciones
export async function DELETE(request, { params }) {
  try {
    // ⚠️⚠️⚠️ IMPORTANTE: Await params (ESTO ES LO QUE FALTA)
    const { id } = await params;
    console.log(`[DELETE_HARVEST] Deleting harvest ID: ${id}`);

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Verificar si la cosecha existe
    const harvest = await prisma.harvest.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            activities: true,
            bookings: true,
            calendarEvents: true,
            products: true,
          },
        },
      },
    });

    if (!harvest) {
      return NextResponse.json({ error: "Harvest not found" }, { status: 404 });
    }

    console.log(`[DELETE_HARVEST] Found harvest: ${harvest.productFr}`);
    console.log(
      `[DELETE_HARVEST] Related counts - Activities: ${harvest._count.activities}, Bookings: ${harvest._count.bookings}, Events: ${harvest._count.calendarEvents}, Products: ${harvest._count.products}`,
    );

    // Usar transacción para asegurar que todo se elimine
    await prisma.$transaction(async (tx) => {
      await tx.harvest.delete({
        where: { id },
      });
    });

    console.log(
      `[HARVEST_DELETED] Harvest deleted successfully: ${harvest.productFr}`,
    );

    return NextResponse.json({
      success: true,
      message: "Harvest deleted successfully along with all related data",
      deletedCounts: {
        activities: harvest._count.activities,
        bookings: harvest._count.bookings,
        calendarEvents: harvest._count.calendarEvents,
        products: harvest._count.products,
      },
    });
  } catch (error) {
    console.error("[DELETE_HARVEST_ERROR]", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Harvest not found" }, { status: 404 });
    }

    // Si hay error de foreign key, hacer eliminación manual
    if (error.code === "P2003") {
      try {
        const { id } = await params; // Obtener id nuevamente
        console.log(
          "[DELETE_HARVEST] Foreign key constraint error, trying manual cascade...",
        );

        // Eliminar manualmente en orden inverso
        await prisma.booking.deleteMany({
          where: { harvestId: id },
        });

        await prisma.activity.deleteMany({
          where: { harvestId: id },
        });

        await prisma.calendarEvent.deleteMany({
          where: { harvestId: id },
        });

        await prisma.product.deleteMany({
          where: { harvestId: id },
        });

        // Finalmente eliminar el harvest
        await prisma.harvest.delete({
          where: { id },
        });

        return NextResponse.json({
          success: true,
          message: "Harvest deleted manually (cascade workaround)",
        });
      } catch (manualError) {
        console.error("[DELETE_HARVEST_MANUAL_ERROR]", manualError);
        return NextResponse.json(
          { error: "Failed to delete harvest even with manual cascade" },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      {
        error: `Failed to delete harvest: ${error.message}`,
        code: error.code,
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
      },
      { status: 500 },
    );
  }
}
