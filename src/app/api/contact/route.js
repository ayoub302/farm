// src/app/api/contact/route.js
import { prisma } from "@/lib/prisma";
export async function POST(request) {
  try {
    const body = await request.json();
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    const referer = request.headers.get("referer") || "direct";
    const origin = request.headers.get("origin") || "unknown";

    console.log("📨 [CONTACT API] Recibiendo mensaje:", {
      name: body.name?.substring(0, 20) + "...",
      email: body.email,
      subject: body.subject?.substring(0, 30) + "...",
      source: body.source,
      ip: ip,
      timestamp: new Date().toISOString(),
    });

    // Validar campos requeridos
    const requiredFields = ["name", "email", "subject", "message"];
    const missingFields = requiredFields.filter(
      (field) => !body[field]?.trim(),
    );

    if (missingFields.length > 0) {
      console.log("❌ [CONTACT API] Campos faltantes:", missingFields);
      return Response.json(
        {
          error: "Campos requeridos faltantes",
          missingFields,
          message: `Por favor completa: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Validar longitud de campos
    const maxLengths = {
      name: 100,
      email: 100,
      phone: 20,
      subject: 200,
      message: 2000,
    };

    const validationErrors = [];
    for (const [field, maxLength] of Object.entries(maxLengths)) {
      if (body[field] && body[field].length > maxLength) {
        validationErrors.push(`${field} excede los ${maxLength} caracteres`);
      }
    }

    if (validationErrors.length > 0) {
      console.log("❌ [CONTACT API] Validación fallida:", validationErrors);
      return Response.json(
        { error: "Datos inválidos", details: validationErrors },
        { status: 400 },
      );
    }

    // Validar email con regex mejorado
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const email = body.email.trim().toLowerCase();

    if (!emailRegex.test(email)) {
      console.log("❌ [CONTACT API] Email inválido:", email);
      return Response.json(
        { error: "Formato de email inválido", received: email },
        { status: 400 },
      );
    }

    // Validar teléfono si está presente
    if (body.phone && body.phone.trim() !== "") {
      const phone = body.phone.trim();
      // Aceptar formatos internacionales comunes
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, "");

      if (!phoneRegex.test(cleanPhone)) {
        console.log("❌ [CONTACT API] Teléfono inválido:", phone);
        return Response.json(
          {
            error: "Formato de teléfono inválido",
            message: "Usa formato internacional: +212612345678 o 0612345678",
            received: phone,
          },
          { status: 400 },
        );
      }
    }

    // Verificar si es un mensaje duplicado reciente (protección contra spam)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const duplicateMessage = await prisma.message.findFirst({
      where: {
        OR: [
          {
            email: email,
            createdAt: { gte: fiveMinutesAgo },
          },
          {
            ipAddress: ip,
            createdAt: { gte: fiveMinutesAgo },
          },
        ],
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true },
    });

    if (duplicateMessage) {
      console.log("⚠️ [CONTACT API] Mensaje duplicado detectado:", {
        messageId: duplicateMessage.id,
        email,
        ip,
      });
      return Response.json(
        {
          error: "Mensaje duplicado",
          message: "Por favor espera unos minutos antes de enviar otro mensaje",
          cooldown: 300, // 5 minutos en segundos
        },
        { status: 429 },
      );
    }

    // Sanitizar y preparar datos - SOLO campos que existen en el modelo Message
    const messageData = {
      name: body.name.trim(),
      email: email,
      phone: body.phone ? body.phone.trim() : null,
      subject: body.subject.trim(),
      message: body.message.trim(),
      source: body.source || "contact_form",
      status: "unread",
      ipAddress: ip,
      userAgent: userAgent,
      // NOTA: Los siguientes campos NO existen en el modelo Message:
      // - referer: no existe
      // - origin: no existe
      // - metadata: no existe
    };

    console.log("📝 [CONTACT API] Datos preparados para guardar:", {
      name: messageData.name.substring(0, 20) + "...",
      email: messageData.email,
      subject: messageData.subject.substring(0, 30) + "...",
      source: messageData.source,
    });

    // Crear mensaje en DB
    const message = await prisma.message.create({
      data: messageData,
    });

    console.log("✅ [CONTACT API] Mensaje guardado exitosamente:", {
      id: message.id,
      name: message.name,
      email: message.email,
      subject: message.subject.substring(0, 50) + "...",
      createdAt: message.createdAt.toISOString(),
    });

    // Registrar en SystemLog para tracking
    try {
      await prisma.systemLog.create({
        data: {
          action: "contact_form_submit",
          module: "contact",
          userId: null,
          userEmail: email,
          details: {
            messageId: message.id,
            name: message.name,
            subject: message.subject,
            source: message.source,
            ip: ip,
            userAgent: userAgent,
            referer: referer,
            origin: origin,
            language: body.language || "es",
            formVersion: body.formVersion || "v1",
          },
          ipAddress: ip,
          userAgent: userAgent,
        },
      });
      console.log("📊 [CONTACT API] Registro en SystemLog creado");
    } catch (logError) {
      console.warn("⚠️ [CONTACT API] Error creando log:", logError.message);
      // No fallamos si el log falla
    }

    // Responder con éxito
    return Response.json(
      {
        success: true,
        message: "Mensaje recibido correctamente. Te responderemos pronto.",
        data: {
          id: message.id,
          name: message.name,
          email: message.email,
          subject: message.subject,
          createdAt: message.createdAt.toISOString(),
          reference: `MSG-${message.id.slice(0, 8).toUpperCase()}`,
        },
        nextSteps: [
          "Hemos recibido tu mensaje",
          "Te responderemos en menos de 24 horas",
          "Guarda este número de referencia por si necesitas seguimiento",
        ],
      },
      {
        status: 201,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "X-Message-ID": message.id,
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("❌ [CONTACT API] Error interno:", error);

    // Manejar errores específicos de Prisma
    if (error.code === "P2002") {
      return Response.json(
        {
          error: "Error de duplicado",
          message: "Ya existe un mensaje con estos datos",
          details:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        },
        { status: 409 },
      );
    }

    if (error.name === "PrismaClientInitializationError") {
      return Response.json(
        {
          error: "Error de base de datos",
          message:
            "Estamos experimentando problemas técnicos. Por favor intenta más tarde.",
        },
        { status: 503 },
      );
    }

    // Manejar error de validación de Prisma (campos que no existen)
    if (error.name === "PrismaClientValidationError") {
      return Response.json(
        {
          error: "Error de validación",
          message: "Error en los datos proporcionados",
          details:
            "Hay campos en la solicitud que no existen en la base de datos",
          hint: "Verifica los campos: referer, origin, metadata no son válidos",
        },
        { status: 400 },
      );
    }

    return Response.json(
      {
        error: "Error interno del servidor",
        message:
          "Lo sentimos, ha ocurrido un error. Por favor intenta nuevamente.",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

// Función auxiliar para enviar email de notificación
async function sendNotificationEmail(message) {
  // Esta función sería implementada con un servicio de email
  // Por ahora solo es un placeholder
  console.log(`📧 [EMAIL] Notificación para mensaje ${message.id} preparada`);
  return Promise.resolve();
}

// Método GET para verificar que la API está funcionando
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get("admin");

    if (admin === "true") {
      // Verificar si hay mensajes recientes (para debug admin)
      const recentMessages = await prisma.message.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24 horas
          },
        },
      });

      return Response.json({
        status: "ok",
        api: "contact",
        version: "1.0.0",
        uptime: process.uptime(),
        recentMessages,
        timestamp: new Date().toISOString(),
      });
    }

    return Response.json({
      status: "ok",
      api: "contact",
      version: "1.0.0",
      message: "API de contacto funcionando correctamente",
      documentation: "/api/docs/contact",
      methods: ["POST"],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      {
        status: "error",
        api: "contact",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
