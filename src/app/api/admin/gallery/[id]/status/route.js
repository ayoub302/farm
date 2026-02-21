// app/api/admin/gallery/[id]/status/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Obtener ID de los parámetros
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 },
      );
    }

    // Validar status
    const validStatuses = ["draft", "published", "archived"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid status. Must be: draft, published, archived",
        },
        { status: 400 },
      );
    }

    // Buscar el item
    const existingItem = await prisma.gallery.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        publishedAt: true,
        archivedAt: true,
        titleAr: true,
        titleFr: true,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 },
      );
    }

    // Preparar datos de actualización
    const updateData = {
      status,
      updatedAt: new Date(),
    };

    // Manejar fechas según el nuevo status
    if (status === "published") {
      updateData.publishedAt = existingItem.publishedAt || new Date();
      updateData.archivedAt = null;
    } else if (status === "archived") {
      updateData.archivedAt = new Date();
      updateData.publishedAt = null;
    } else if (status === "draft") {
      updateData.publishedAt = null;
      updateData.archivedAt = null;
    }

    // Actualizar
    const updatedGallery = await prisma.gallery.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        status: true,
        publishedAt: true,
        archivedAt: true,
        titleAr: true,
        titleFr: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Status updated to ${status}`,
      item: updatedGallery,
    });
  } catch (error) {
    console.error("[STATUS UPDATE] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Opcional: GET para obtener el status actual
export async function GET(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 },
      );
    }

    const item = await prisma.gallery.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        publishedAt: true,
        archivedAt: true,
        titleAr: true,
        titleFr: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      item,
    });
  } catch (error) {
    console.error("[STATUS GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
