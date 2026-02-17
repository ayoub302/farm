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

    // ✅ NO convertir a número - mantener como string
    const { id } = await params;
    const itemId = id; // Usar directamente como string

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 },
      );
    }

    const validStatuses = ["draft", "published", "archived"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 },
      );
    }

    // Buscar por ID como string
    const existingItem = await prisma.gallery.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 },
      );
    }

    const updateData = {
      status,
      updatedAt: new Date(),
    };

    if (status === "published") {
      if (!existingItem.publishedAt) {
        updateData.publishedAt = new Date();
      }
      updateData.archivedAt = null;
    } else if (status === "archived") {
      updateData.archivedAt = new Date();
      updateData.publishedAt = null;
    } else if (status === "draft") {
      updateData.publishedAt = null;
      updateData.archivedAt = null;
    }

    // Actualizar usando ID como string
    const updatedGallery = await prisma.gallery.update({
      where: { id: itemId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Status updated to ${status}`,
      item: {
        id: updatedGallery.id,
        status: updatedGallery.status,
        publishedAt: updatedGallery.publishedAt,
        archivedAt: updatedGallery.archivedAt,
        titleFr: updatedGallery.titleFr,
        titleAr: updatedGallery.titleAr,
      },
    });
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
