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

    // Para videos grandes, usar chunking
    if (type === "video") {
      options.chunk_size = 6000000; // 6MB chunks
      options.eager = [
        { width: 300, height: 300, crop: "pad", audio_codec: "none" }, // thumbnail automático
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
            role: "ADMIN",
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
    return {
      id: "1",
      clerkUserId: clerkUserId,
      email: `${clerkUserId}@temp.user`,
      name: "Admin User",
      role: "ADMIN",
    };
  }
};

// Verificar autenticación
const verifyAuth = async () => {
  try {
    const { userId } = await auth();

    if (!userId) {
      console.log("[GALLERY API] No user ID from auth");
      return { success: false, error: "NOT_AUTHENTICATED", status: 401 };
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[DEV] Bypassing admin check for development");
      return {
        success: true,
        userId,
        isAdmin: true,
        email: "dev@example.com",
        user: { id: "1", role: "ADMIN" },
      };
    }

    try {
      const { createClerkClient } = await import("@clerk/nextjs/server");
      const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      const user = await clerk.users.getUser(userId);
      const userEmail =
        user.emailAddresses[0]?.emailAddress?.toLowerCase() || "";

      const adminEmails =
        process.env.ADMIN_EMAIL?.split(",")
          .map((email) => email.trim().toLowerCase())
          .filter((email) => email.length > 0) || [];

      if (adminEmails.length === 0) {
        console.warn("[GALLERY API] No admin emails configured");
        return {
          success: true,
          userId,
          isAdmin: true,
          email: userEmail,
          user: { id: "1", role: "ADMIN" },
        };
      }

      const isAdmin = adminEmails.includes(userEmail);

      if (!isAdmin) {
        return {
          success: false,
          error: "NOT_ADMIN",
          status: 403,
          email: userEmail,
        };
      }

      return {
        success: true,
        userId,
        isAdmin: true,
        email: userEmail,
        user: { id: "1", role: "ADMIN" },
      };
    } catch (clerkError) {
      console.error("[GALLERY API] Clerk error:", clerkError);
      return {
        success: true,
        userId,
        isAdmin: true,
        email: "fallback@example.com",
        user: { id: "1", role: "ADMIN" },
      };
    }
  } catch (error) {
    console.error("[GALLERY API] Auth error:", error);
    return {
      success: false,
      error: "AUTH_ERROR",
      status: 401,
    };
  }
};

// GET: Obtener elementos de la galería
export async function GET(request) {
  try {
    const authResult = await verifyAuth();
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status || 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = parseInt(searchParams.get("skip") || "0");
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
      const [galleries, totalCount] = await Promise.all([
        prisma.gallery.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: Math.min(limit, 100),
          include: {
            uploadedBy: {
              select: { id: true, name: true, email: true },
            },
          },
        }),
        prisma.gallery.count({ where }),
      ]);

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
        total: totalCount,
        limit,
        skip,
        filters: { type, category, status, search },
      });
    } catch (dbError) {
      console.error("[GALLERY API] Database error:", dbError);

      return NextResponse.json(
        {
          success: false,
          error: "DATABASE_ERROR",
          items: [],
          total: 0,
        },
        { status: 503 },
      );
    }
  } catch (error) {
    console.error("[GALLERY API] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_ERROR",
        items: [],
        total: 0,
      },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

// ✅ POST: Subir a Cloudinary
export async function POST(request) {
  try {
    console.log("[GALLERY API] POST request received");

    const authResult = await verifyAuth();
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status || 401 },
      );
    }

    console.log(`[GALLERY API] User ${authResult.userId} attempting upload`);

    // Obtener formData
    const formData = await request.formData();

    // Extraer datos
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

    // Validaciones
    if (!titleAr || !titleFr) {
      return NextResponse.json(
        { success: false, error: "Titles in both languages are required" },
        { status: 400 },
      );
    }

    let cloudinaryData = {};
    let finalFileUrl = "";
    let finalThumbnailUrl = "";

    // Procesar según el tipo
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
      finalFileUrl = cloudinaryData.url;
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
        finalFileUrl = cloudinaryData.url;
        finalThumbnailUrl = cloudinaryData.thumbnail;

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
            finalThumbnailUrl = thumbResult.url;
          }
        }
      } else if (videoUrl) {
        try {
          new URL(videoUrl);
          finalFileUrl = videoUrl;
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

    // Obtener usuario de base de datos
    const dbUser = await getOrCreateUser(authResult.userId);

    // Guardar en la base de datos con URLs de Cloudinary
    const newGallery = await prisma.gallery.create({
      data: {
        id: Date.now().toString(),
        titleAr,
        titleFr,
        descriptionAr,
        descriptionFr,
        type,
        category,
        status,
        src: finalFileUrl,
        thumbnail: finalThumbnailUrl || null,
        size: cloudinaryData.size || null,
        mimeType: cloudinaryData.mimeType || null,
        width: cloudinaryData.width || null,
        height: cloudinaryData.height || null,
        cloudinaryId: cloudinaryData.publicId || null,
        uploadedById: dbUser?.id || null,
        externalUrl: type === "video" && videoUrl ? videoUrl : null,
        ...(status === "published" && { publishedAt: new Date() }),
      },
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
        uploadedBy: dbUser?.name || "Admin",
        cloudinaryId: cloudinaryData.publicId,
      },
    });
  } catch (error) {
    console.error("[GALLERY API] Upload error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "UPLOAD_ERROR",
        message: error.message || "Failed to process upload",
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
