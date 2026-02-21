// /app/api/admin/gallery/route.js
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

// Función para subir a Cloudinary
async function uploadToCloudinary(file, type) {
  try {
    console.log(`[CLOUDINARY] Uploading ${type}...`);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Crear base64
    const base64 = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64}`;

    // Opciones según tipo
    const options = {
      folder: type === "image" ? "gallery/images" : "gallery/videos",
      resource_type: type === "image" ? "image" : "video",
      use_filename: true,
      unique_filename: true,
    };

    // Para videos, generar thumbnail automático
    if (type === "video") {
      options.chunk_size = 6000000; // 6MB chunks para videos grandes
      options.eager = [
        { width: 300, height: 300, crop: "pad", audio_codec: "none" },
      ];
      options.eager_async = true;
    }

    const result = await cloudinary.uploader.upload(dataURI, options);

    console.log(`[CLOUDINARY] Upload successful: ${result.public_id}`);

    return {
      url: result.secure_url,
      thumbnail: type === "video" ? result.eager?.[0]?.secure_url : null,
      size: file.size,
      mimeType: file.type,
      width: result.width,
      height: result.height,
      publicId: result.public_id,
      format: result.format,
    };
  } catch (error) {
    console.error("[CLOUDINARY] Upload error:", error);
    throw error;
  }
}

// Función para obtener o crear usuario
const getOrCreateUser = async (clerkUserId) => {
  try {
    let user = await prisma.user.findUnique({
      where: { clerkUserId: clerkUserId },
    });

    if (!user) {
      const clerkUser = await fetch(
        `https://api.clerk.com/v1/users/${clerkUserId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          },
        },
      ).then((res) => res.json());

      const primaryEmail =
        clerkUser.email_addresses?.find((email) => email.primary)
          ?.email_address ||
        clerkUser.email_addresses?.[0]?.email_address ||
        `${clerkUserId}@clerk.user`;

      user = await prisma.user.findUnique({
        where: { email: primaryEmail },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            clerkUserId,
            email: primaryEmail,
            name:
              `${clerkUser.first_name || ""} ${clerkUser.last_name || ""}`.trim() ||
              clerkUser.username ||
              primaryEmail.split("@")[0],
            clerkData: JSON.stringify(clerkUser),
          },
        });
      } else {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            clerkUserId,
            clerkData: JSON.stringify(clerkUser),
          },
        });
      }
    }

    return user;
  } catch (error) {
    console.error("Error getting/creating user:", error);
    return null;
  }
};

// Verificación de autenticación
const verifyAuth = async (request) => {
  try {
    const { userId } = await auth();

    console.log("[GALLERY API] Clerk auth result:", {
      userId: userId || "none",
    });

    if (!userId) {
      return { success: false, error: "No user authenticated", status: 401 };
    }

    const user = await getOrCreateUser(userId);

    if (!user) {
      console.error("[GALLERY API] Could not get or create user");

      if (process.env.NODE_ENV === "development") {
        console.log("[DEV] Using fallback user for development");
        return {
          success: true,
          user: null,
          clerkUserId: userId,
          isDevMode: true,
        };
      }

      return { success: false, error: "User not found", status: 404 };
    }

    return {
      success: true,
      user,
      clerkUserId: userId,
      isDevMode: false,
    };
  } catch (error) {
    console.error("Auth verification error:", error);

    if (process.env.NODE_ENV === "development") {
      return {
        success: true,
        user: null,
        clerkUserId: "dev-user",
        isDevMode: true,
      };
    }

    return { success: false, error: "Authentication error", status: 401 };
  }
};

// GET: Obtener galería
export async function GET(request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status || 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where = {};

    if (type && type !== "all") where.type = type;
    if (category && category !== "all") where.category = category;
    if (status && status !== "all") where.status = status;

    if (search) {
      where.OR = [
        { titleAr: { contains: search, mode: "insensitive" } },
        { titleFr: { contains: search, mode: "insensitive" } },
        { descriptionAr: { contains: search, mode: "insensitive" } },
        { descriptionFr: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    try {
      const galleries = await prisma.gallery.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          uploadedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      const items = galleries.map((gallery) => ({
        id: gallery.id,
        titleAr: gallery.titleAr || "",
        titleFr: gallery.titleFr || "",
        descriptionAr: gallery.descriptionAr || "",
        descriptionFr: gallery.descriptionFr || "",
        type: gallery.type || "image",
        category: gallery.category || "activities",
        status: gallery.status || "draft",
        src: gallery.src || "",
        thumbnail: gallery.thumbnail || "",
        url: gallery.src || "",
        uploadedAt: gallery.createdAt,
        size: gallery.size
          ? gallery.size > 1024 * 1024
            ? `${(gallery.size / (1024 * 1024)).toFixed(1)} MB`
            : `${(gallery.size / 1024).toFixed(1)} KB`
          : "N/A",
        views: gallery.views || 0,
        downloads: gallery.downloads || 0,
        uploadedBy: gallery.uploadedBy?.name || "Admin",
        cloudinaryId: gallery.cloudinaryId || null,
      }));

      return NextResponse.json({
        success: true,
        items,
        count: items.length,
      });
    } catch (dbError) {
      console.error("[GALLERY API] Database error:", dbError);

      // En caso de error de base de datos, devolver array vacío
      return NextResponse.json(
        {
          success: false,
          error: "Database error",
          items: [],
          count: 0,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("[GALLERY API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        items: [],
        count: 0,
      },
      { status: 500 },
    );
  }
}

// ✅ POST: Subir nuevo elemento a Cloudinary
export async function POST(request) {
  try {
    // Verificar autenticación
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status || 401 },
      );
    }

    console.log(`[GALLERY API] Auth result:`, authResult);

    // Obtener formData
    const formData = await request.formData();

    // Extraer campos del formulario
    const titleAr = formData.get("titleAr")?.toString().trim() || "";
    const titleFr = formData.get("titleFr")?.toString().trim() || "";
    const descriptionAr =
      formData.get("descriptionAr")?.toString().trim() || "";
    const descriptionFr =
      formData.get("descriptionFr")?.toString().trim() || "";
    const type = formData.get("type")?.toString() || "image";
    const category = formData.get("category")?.toString() || "activities";
    const status = formData.get("status")?.toString() || "draft";
    const videoUrl = formData.get("videoUrl")?.toString().trim() || "";

    // Validar títulos
    if (!titleAr || !titleFr) {
      return NextResponse.json(
        { success: false, error: "Titles in both languages are required" },
        { status: 400 },
      );
    }

    let cloudinaryData = {};
    let fileUrl = "";
    let thumbnailUrl = "";

    // Procesar archivo principal según tipo
    if (type === "image") {
      const imageFile = formData.get("image") || formData.get("file");

      if (!imageFile || imageFile.size === 0) {
        return NextResponse.json(
          { success: false, error: "Image file is required" },
          { status: 400 },
        );
      }

      // Validar tipo
      const allowedImageTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/heic",
        "image/heif",
      ];

      if (!allowedImageTypes.includes(imageFile.type)) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid image format. Allowed: JPEG, JPG, PNG, GIF, WebP, HEIC",
          },
          { status: 400 },
        );
      }

      // Subir a Cloudinary
      cloudinaryData = await uploadToCloudinary(imageFile, "image");
      fileUrl = cloudinaryData.url;
    } else if (type === "video") {
      const videoFile = formData.get("video") || formData.get("file");

      if (videoFile && videoFile.size > 0) {
        // Validar tipo
        const allowedVideoTypes = [
          "video/mp4",
          "video/webm",
          "video/quicktime",
          "video/x-msvideo",
          "video/x-matroska",
        ];

        if (!allowedVideoTypes.includes(videoFile.type)) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid video format. Allowed: MP4, WebM, MOV, AVI, MKV",
            },
            { status: 400 },
          );
        }

        // Subir video a Cloudinary
        cloudinaryData = await uploadToCloudinary(videoFile, "video");
        fileUrl = cloudinaryData.url;
        thumbnailUrl = cloudinaryData.thumbnail;

        // Procesar thumbnail si se subió uno adicional
        const thumbnailFile = formData.get("thumbnail");
        if (thumbnailFile && thumbnailFile.size > 0) {
          const allowedThumbnailTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
          ];

          if (allowedThumbnailTypes.includes(thumbnailFile.type)) {
            const thumbResult = await uploadToCloudinary(
              thumbnailFile,
              "image",
            );
            thumbnailUrl = thumbResult.url;
          }
        }
      } else if (videoUrl) {
        try {
          new URL(videoUrl);
          fileUrl = videoUrl;
          cloudinaryData = {
            url: videoUrl,
            size: 0,
            mimeType: "video/url",
            publicId: null,
          };
        } catch {
          return NextResponse.json(
            { success: false, error: "Invalid video URL" },
            { status: 400 },
          );
        }
      } else {
        return NextResponse.json(
          { success: false, error: "Either video file or URL is required" },
          { status: 400 },
        );
      }
    }

    // Guardar en base de datos
    const galleryData = {
      id: Date.now().toString(),
      titleAr,
      titleFr,
      descriptionAr,
      descriptionFr,
      type,
      category,
      status,
      src: fileUrl,
      thumbnail: thumbnailUrl || null,
      size: cloudinaryData.size || null,
      mimeType: cloudinaryData.mimeType || null,
      width: cloudinaryData.width || null,
      height: cloudinaryData.height || null,
      cloudinaryId: cloudinaryData.publicId || null,
      externalUrl: type === "video" && videoUrl ? videoUrl : null,
      ...(status === "published" && { publishedAt: new Date() }),
    };

    if (authResult.user && authResult.user.id) {
      galleryData.uploadedById = authResult.user.id;
    }

    console.log(`[GALLERY API] Creating gallery with data:`, galleryData);

    const newGallery = await prisma.gallery.create({
      data: galleryData,
    });

    console.log(`[GALLERY API] Created new item: ${newGallery.id}`);

    return NextResponse.json({
      success: true,
      message: "Media uploaded successfully to Cloudinary",
      item: {
        id: newGallery.id,
        titleAr: newGallery.titleAr,
        titleFr: newGallery.titleFr,
        descriptionAr: newGallery.descriptionAr,
        descriptionFr: newGallery.descriptionFr,
        type: newGallery.type,
        category: newGallery.category,
        status: newGallery.status,
        src: newGallery.src,
        thumbnail: newGallery.thumbnail,
        url: newGallery.src,
        uploadedAt: newGallery.createdAt,
        size: cloudinaryData.size
          ? `${(cloudinaryData.size / (1024 * 1024)).toFixed(1)} MB`
          : "N/A",
        views: 0,
        downloads: 0,
        uploadedBy: authResult.user?.name || "Admin",
        cloudinaryId: cloudinaryData.publicId,
      },
    });
  } catch (error) {
    console.error("[GALLERY API] Error uploading media:", error);

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

// OPTIONS
export async function OPTIONS() {
  return NextResponse.json(
    {
      success: true,
      methods: ["GET", "POST", "OPTIONS"],
      description: "Gallery management API with Cloudinary",
    },
    { status: 200 },
  );
}
