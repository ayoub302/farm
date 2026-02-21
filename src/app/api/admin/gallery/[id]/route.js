// app/api/admin/gallery/[id]/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

const verifyAuth = async () => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "No user authenticated", status: 401 };
    }
    return { success: true, userId };
  } catch (error) {
    console.error("Auth verification error:", error);
    return { success: false, error: "Authentication error", status: 401 };
  }
};

// Función para eliminar archivo de Cloudinary
const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  if (!publicId) return false;

  try {
    console.log(
      `[CLOUDINARY DELETE] Attempting to delete: ${publicId} (${resourceType})`,
    );

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    console.log(`[CLOUDINARY DELETE] Result:`, result);

    return result.result === "ok";
  } catch (error) {
    console.error(`[CLOUDINARY DELETE] Error:`, error);
    return false;
  }
};

// Función para extraer publicId de una URL de Cloudinary
const extractPublicIdFromUrl = (url) => {
  if (!url) return null;

  try {
    // Las URLs de Cloudinary tienen formato:
    // https://res.cloudinary.com/cloud_name/type/upload/v1234567/folder/public_id.extension
    const matches = url.match(/\/v\d+\/(.+)\./);
    if (matches && matches[1]) {
      return matches[1];
    }

    // Intento alternativo
    const parts = url.split("/");
    const lastPart = parts[parts.length - 1];
    const publicIdWithExt = lastPart.split(".")[0];
    const folder = parts[parts.length - 2];

    if (folder === "upload" || folder === "image" || folder === "video") {
      return publicIdWithExt;
    }

    return `${folder}/${publicIdWithExt}`;
  } catch (error) {
    console.error("[CLOUDINARY] Error extracting publicId:", error);
    return null;
  }
};

// DELETE: Eliminar un elemento específico (también de Cloudinary)
export async function DELETE(request, { params }) {
  try {
    const authResult = await verifyAuth();
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status || 401 },
      );
    }

    const { id } = await params;
    console.log(
      `[GALLERY DELETE] User ${authResult.userId} deleting item: ${id}`,
    );

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 },
      );
    }

    // Buscar el item en la base de datos
    let galleryItem = null;
    let cloudinaryResults = {
      main: false,
      thumbnail: false,
    };

    try {
      galleryItem = await prisma.gallery.findUnique({
        where: { id: id },
      });

      if (galleryItem) {
        console.log(`[GALLERY DELETE] Found item:`, {
          id: galleryItem.id,
          src: galleryItem.src,
          thumbnail: galleryItem.thumbnail,
          cloudinaryId: galleryItem.cloudinaryId,
        });

        // Determinar el tipo de recurso para Cloudinary
        const resourceType = galleryItem.type === "video" ? "video" : "image";

        // Opción 1: Si tenemos cloudinaryId guardado en BD
        if (galleryItem.cloudinaryId) {
          console.log(
            `[GALLERY DELETE] Using cloudinaryId: ${galleryItem.cloudinaryId}`,
          );
          cloudinaryResults.main = await deleteFromCloudinary(
            galleryItem.cloudinaryId,
            resourceType,
          );
        }
        // Opción 2: Extraer publicId de la URL
        else if (
          galleryItem.src &&
          galleryItem.src.includes("cloudinary.com")
        ) {
          const publicId = extractPublicIdFromUrl(galleryItem.src);
          if (publicId) {
            console.log(
              `[GALLERY DELETE] Extracted publicId from URL: ${publicId}`,
            );
            cloudinaryResults.main = await deleteFromCloudinary(
              publicId,
              resourceType,
            );
          }
        }

        // Eliminar thumbnail si existe y es de Cloudinary
        if (
          galleryItem.thumbnail &&
          galleryItem.thumbnail.includes("cloudinary.com")
        ) {
          const thumbPublicId = extractPublicIdFromUrl(galleryItem.thumbnail);
          if (thumbPublicId) {
            console.log(
              `[GALLERY DELETE] Deleting thumbnail: ${thumbPublicId}`,
            );
            cloudinaryResults.thumbnail = await deleteFromCloudinary(
              thumbPublicId,
              "image",
            );
          }
        }

        // Eliminar de la base de datos
        await prisma.gallery.delete({
          where: { id: id },
        });

        console.log(`[GALLERY DELETE] Deleted item ${id} from database`);
        console.log(`[GALLERY DELETE] Cloudinary results:`, cloudinaryResults);
      } else {
        console.log(`[GALLERY DELETE] Item ${id} not found in database`);
      }
    } catch (dbError) {
      console.error("[GALLERY DELETE] Database error:", dbError);

      // En desarrollo, continuamos
      if (process.env.NODE_ENV !== "development") {
        throw dbError;
      }
    }

    // Devolver éxito
    return NextResponse.json({
      success: true,
      message: "Item deleted successfully",
      id: id,
      cloudinaryDeleted: cloudinaryResults,
      databaseDeleted: !!galleryItem,
    });
  } catch (error) {
    console.error("[GALLERY DELETE] Error:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET: Obtener un elemento específico
export async function GET(request, { params }) {
  try {
    const authResult = await verifyAuth();
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status || 401 },
      );
    }

    const { id } = await params;
    console.log(`[GALLERY GET] Fetching item: ${id}`);

    const galleryItem = await prisma.gallery.findUnique({
      where: { id: id },
    });

    if (!galleryItem) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      item: {
        ...galleryItem,
        cloudinaryId: galleryItem.cloudinaryId || null,
      },
    });
  } catch (error) {
    console.error("[GALLERY GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT: Actualizar un elemento
export async function PUT(request, { params }) {
  try {
    const authResult = await verifyAuth();
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status || 401 },
      );
    }

    const { id } = await params;
    const body = await request.json();

    const updatedItem = await prisma.gallery.update({
      where: { id: id },
      data: body,
    });

    return NextResponse.json({
      success: true,
      message: "Item updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.error("[GALLERY PUT] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
