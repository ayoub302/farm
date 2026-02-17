// /app/api/admin/gallery/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import formidable from "formidable";
import { IncomingMessage } from "http";

// Desactivar bodyParser de Next.js para manejar archivos grandes
export const config = {
  api: {
    bodyParser: false,
  },
};

const prisma = new PrismaClient();

// Directorios
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const IMAGES_DIR = path.join(UPLOAD_DIR, "images");
const VIDEOS_DIR = path.join(UPLOAD_DIR, "videos");
const THUMBNAILS_DIR = path.join(UPLOAD_DIR, "thumbnails");

// Asegurar directorios
const ensureDirectories = async () => {
  const dirs = [UPLOAD_DIR, IMAGES_DIR, VIDEOS_DIR, THUMBNAILS_DIR];
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }
};

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
      }));

      return NextResponse.json({
        success: true,
        items,
        count: items.length,
      });
    } catch (dbError) {
      console.error("[GALLERY API] Database error:", dbError);

      if (process.env.NODE_ENV === "development") {
        const sampleItems = [
          {
            id: "1",
            titleAr: "صورة النشاط",
            titleFr: "Image d'activité",
            descriptionAr: "وصف النشاط بالعربية",
            descriptionFr: "Description de l'activité en français",
            type: "image",
            category: "activities",
            status: "published",
            src: "/images/sample.jpg",
            url: "/images/sample.jpg",
            uploadedAt: new Date().toISOString(),
            size: "2.3 MB",
            views: 150,
            downloads: 25,
            uploadedBy: "Admin",
          },
        ];
        return NextResponse.json({
          success: true,
          items: sampleItems,
          count: sampleItems.length,
          isSampleData: true,
        });
      }

      return NextResponse.json(
        { success: false, error: "Database error" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("[GALLERY API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ✅ POST: Subir nuevo elemento con formidable (para archivos grandes)
export async function POST(request) {
  let uploadedFiles = [];

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

    // Asegurar que los directorios existen
    await ensureDirectories();

    // Convertir NextRequest a IncomingMessage para formidable
    const req = new IncomingMessage(request);

    // Crear formulario formidable
    const form = formidable({
      uploadDir: IMAGES_DIR, // Directorio temporal, luego moveremos según tipo
      keepExtensions: true,
      maxFileSize: 200 * 1024 * 1024, // 200MB máximo
      maxFiles: 2, // Máximo 2 archivos (archivo principal + thumbnail)
      allowEmptyFiles: false,
    });

    // Parsear el formulario
    const parseForm = () => {
      return new Promise((resolve, reject) => {
        form.parse(req, async (err, fields, files) => {
          if (err) {
            console.error("[GALLERY API] Form parse error:", err);
            reject(err);
          } else {
            resolve({ fields, files });
          }
        });
      });
    };

    const { fields, files } = await parseForm();

    // Extraer campos del formulario
    const titleAr = Array.isArray(fields.titleAr)
      ? fields.titleAr[0]
      : fields.titleAr || "";
    const titleFr = Array.isArray(fields.titleFr)
      ? fields.titleFr[0]
      : fields.titleFr || "";
    const descriptionAr = Array.isArray(fields.descriptionAr)
      ? fields.descriptionAr[0]
      : fields.descriptionAr || "";
    const descriptionFr = Array.isArray(fields.descriptionFr)
      ? fields.descriptionFr[0]
      : fields.descriptionFr || "";
    const type = Array.isArray(fields.type)
      ? fields.type[0]
      : fields.type || "image";
    const category = Array.isArray(fields.category)
      ? fields.category[0]
      : fields.category || "activities";
    const status = Array.isArray(fields.status)
      ? fields.status[0]
      : fields.status || "draft";
    const videoUrl = Array.isArray(fields.videoUrl)
      ? fields.videoUrl[0]
      : fields.videoUrl || "";

    // Validar títulos
    if (!titleAr || !titleFr) {
      return NextResponse.json(
        { success: false, error: "Titles in both languages are required" },
        { status: 400 },
      );
    }

    let fileSize = 0;
    let mimeType = "";
    let fileUrl = "";
    let thumbnailUrl = "";

    // Procesar archivo principal (imagen o video)
    if (type === "image") {
      const imageFile = files.image || files.file;

      if (!imageFile) {
        return NextResponse.json(
          { success: false, error: "Image file is required" },
          { status: 400 },
        );
      }

      const fileInfo = Array.isArray(imageFile) ? imageFile[0] : imageFile;

      // Validar tipo
      const allowedImageTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];

      if (!allowedImageTypes.includes(fileInfo.mimetype || "")) {
        await unlink(fileInfo.filepath).catch(() => {});
        return NextResponse.json(
          {
            success: false,
            error: "Invalid image format. Allowed: JPEG, JPG, PNG, GIF, WebP",
          },
          { status: 400 },
        );
      }

      // El archivo ya está en IMAGES_DIR, solo necesitamos la URL
      const fileName = path.basename(fileInfo.filepath);
      fileUrl = `/uploads/images/${fileName}`;
      fileSize = fileInfo.size;
      mimeType = fileInfo.mimetype;
      uploadedFiles.push(fileInfo.filepath);
    } else if (type === "video") {
      const videoFile = files.video || files.file;

      if (videoFile) {
        const fileInfo = Array.isArray(videoFile) ? videoFile[0] : videoFile;

        // Validar tipo
        const allowedVideoTypes = [
          "video/mp4",
          "video/webm",
          "video/quicktime",
        ];

        if (!allowedVideoTypes.includes(fileInfo.mimetype || "")) {
          await unlink(fileInfo.filepath).catch(() => {});
          return NextResponse.json(
            {
              success: false,
              error: "Invalid video format. Allowed: MP4, WebM, MOV",
            },
            { status: 400 },
          );
        }

        // Mover archivo a VIDEOS_DIR
        const videoFileName = path.basename(fileInfo.filepath);
        const videoNewPath = path.join(VIDEOS_DIR, videoFileName);

        // Renombrar/mover el archivo
        const { rename } = require("fs/promises");
        await rename(fileInfo.filepath, videoNewPath);

        fileUrl = `/uploads/videos/${videoFileName}`;
        fileSize = fileInfo.size;
        mimeType = fileInfo.mimetype;
        uploadedFiles.push(videoNewPath);

        // Procesar thumbnail si existe
        const thumbnailFile = files.thumbnail;
        if (thumbnailFile) {
          const thumbInfo = Array.isArray(thumbnailFile)
            ? thumbnailFile[0]
            : thumbnailFile;

          const allowedThumbnailTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
          ];

          if (allowedThumbnailTypes.includes(thumbInfo.mimetype || "")) {
            const thumbFileName = `thumb-${Date.now()}-${path.basename(thumbInfo.originalFilename || "thumb")}`;
            const thumbNewPath = path.join(THUMBNAILS_DIR, thumbFileName);

            await rename(thumbInfo.filepath, thumbNewPath);
            thumbnailUrl = `/uploads/thumbnails/${thumbFileName}`;
            uploadedFiles.push(thumbNewPath);
          } else {
            await unlink(thumbInfo.filepath).catch(() => {});
          }
        }
      } else if (videoUrl) {
        try {
          new URL(videoUrl);
          fileUrl = videoUrl;
          mimeType = "video/url";
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
      size: fileSize || null,
      mimeType: mimeType || null,
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
      message: "Media uploaded successfully",
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
        size: fileSize ? `${(fileSize / (1024 * 1024)).toFixed(1)} MB` : "N/A",
        views: 0,
        downloads: 0,
        uploadedBy: authResult.user?.name || "Admin",
      },
    });
  } catch (error) {
    console.error("[GALLERY API] Error uploading media:", error);

    // Limpiar archivos temporales en caso de error
    for (const filePath of uploadedFiles) {
      try {
        await unlink(filePath);
      } catch (cleanupError) {
        console.error("Error cleaning up file:", cleanupError);
      }
    }

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
