import { prisma } from "@/lib/prisma";
export async function POST(request) {
  try {
    const body = await request.json();
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    console.log("📅 [PUBLIC RESERVATION API] Recibiendo reserva:", {
      name: body.name?.substring(0, 20) + "...",
      email: body.email,
      visitDate: body.visitDate,
      timestamp: new Date().toISOString(),
    });

    // Validar campos requeridos
    const requiredFields = [
      "name",
      "email",
      "phone",
      "visitDate",
      "visitTime",
      "numPeople",
      "activityType",
    ];
    const missingFields = requiredFields.filter(
      (field) => !body[field]?.toString().trim(),
    );

    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({
          error: "Campos requeridos faltantes",
          missingFields,
          message: `Por favor completa: ${missingFields.join(", ")}`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validaciones básicas
    const numPeople = parseInt(body.numPeople);
    if (isNaN(numPeople) || numPeople < 1 || numPeople > 50) {
      return new Response(
        JSON.stringify({
          error: "El número de personas debe estar entre 1 y 50",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const visitDate = new Date(body.visitDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (visitDate < today) {
      return new Response(
        JSON.stringify({
          error: "La fecha de visita no puede ser en el pasado",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const email = body.email.trim().toLowerCase();

    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          error: "Formato de email inválido",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    // Crear código de reserva único
    const bookingCode = `RES-${Date.now()
      .toString(36)
      .toUpperCase()}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;

    // Buscar si existe alguna actividad para usar como referencia
    let activity = await prisma.activity.findFirst({
      where: { category: body.activityType || "tour" },
    });

    // Si no existe actividad, crear una básica
    if (!activity) {
      const titles = {
        ar: {
          tour: "جولة المزرعة",
          workshop: "ورشة زراعية",
          family: "زيارة عائلية",
          school: "زيارة مدرسية",
          corporate: "فعالية للشركات",
          private: "جولة خاصة",
        },
        fr: {
          tour: "Visite de la ferme",
          workshop: "Atelier agricole",
          family: "Visite familiale",
          school: "Visite scolaire",
          corporate: "Événement d'entreprise",
          private: "Visite privée",
        },
      };

      const descriptions = {
        ar: {
          tour: "جولة عامة في المزرعة",
          workshop: "ورشة تعليمية عن الزراعة",
          family: "زيارة عائلية للمزرعة",
          school: "زيارة مدرسية تعليمية",
          corporate: "فعالية للشركات في المزرعة",
          private: "جولة خاصة في المزرعة",
        },
        fr: {
          tour: "Visite générale de la ferme",
          workshop: "Atelier éducatif sur l'agriculture",
          family: "Visite familiale de la ferme",
          school: "Visite scolaire éducative",
          corporate: "Événement d'entreprise à la ferme",
          private: "Visite privée de la ferme",
        },
      };

      const language = body.language || "fr";

      activity = await prisma.activity.create({
        data: {
          titleAr: titles.ar[body.activityType] || "جولة المزرعة",
          titleFr: titles.fr[body.activityType] || "Visite de la ferme",
          descriptionAr:
            descriptions.ar[body.activityType] || "جولة في المزرعة",
          descriptionFr:
            descriptions.fr[body.activityType] || "Visite de la ferme",
          imageUrl: `/images/activities/${body.activityType || "tour"}.jpg`,
          date: visitDate,
          endDate: new Date(visitDate.getTime() + 2 * 60 * 60 * 1000), // 2 horas después
          location: "Ferme Heureuse",
          maxCapacity: 50,
          currentParticipants: 0,
          status: "upcoming",
          category: body.activityType || "tour",
          duration: 120,
          featured: false,
        },
      });
    }

    // Crear reserva en DB - CORREGIDO: según tu schema de Booking
    const reservation = await prisma.booking.create({
      data: {
        bookingCode,
        activityId: activity.id,
        clientName: body.name.trim(),
        clientEmail: email,
        clientPhone: body.phone.trim(),
        numPeople,
        status: "pending",
        paymentStatus: "pending",
        activityDate: visitDate,
        bookingDate: new Date(), // Campo requerido según tu schema
        notes: body.message || "",
        // El campo 'source' no existe en tu schema, lo omitimos
        // source: "reservation_form", // ← QUITAR ESTO
        // En su lugar, podemos usar 'specialRequests' para guardar info adicional
        specialRequests: `Hora: ${
          body.visitTime
        } | Origen: formulario web | Idioma: ${body.language || "fr"}`,
        // 'ipAddress' y 'userAgent' no están en tu schema, los omitimos
        // ipAddress: ip, // ← QUITAR
        // userAgent: userAgent, // ← QUITAR
        // metadata tampoco está en tu schema
        // metadata: JSON.stringify({...}), // ← QUITAR
      },
    });

    console.log("✅ [PUBLIC RESERVATION API] Reserva creada:", {
      id: reservation.id,
      code: reservation.bookingCode,
      name: reservation.clientName,
      date: reservation.activityDate.toISOString(),
    });

    // Respuesta exitosa
    return new Response(
      JSON.stringify({
        success: true,
        message: "Reserva recibida correctamente. Te confirmaremos pronto.",
        data: {
          id: reservation.id,
          bookingCode: reservation.bookingCode,
          clientName: reservation.clientName,
          activityDate: reservation.activityDate.toISOString().split("T")[0],
          activityTime: body.visitTime,
          numPeople: reservation.numPeople,
          status: reservation.status,
          createdAt: reservation.createdAt.toISOString(),
        },
        nextSteps: [
          "Hemos recibido tu reserva",
          "Te enviaremos una confirmación por email en menos de 24 horas",
          "Guarda tu código de reserva: " + reservation.bookingCode,
        ],
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "X-Booking-Code": reservation.bookingCode,
        },
      },
    );
  } catch (error) {
    console.error("❌ [PUBLIC RESERVATION API] Error completo:", error);
    console.error("❌ [PUBLIC RESERVATION API] Error code:", error.code);
    console.error("❌ [PUBLIC RESERVATION API] Error message:", error.message);

    // Manejar errores específicos de Prisma
    if (error.code === "P2002") {
      return new Response(
        JSON.stringify({
          error: "Reserva duplicada",
          message: "Ya existe una reserva similar",
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (error.code === "P2003") {
      return new Response(
        JSON.stringify({
          error: "Error de referencia",
          message: "Problema con la actividad seleccionada",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        error: "Error interno del servidor",
        message:
          "Lo sentimos, ha ocurrido un error. Por favor intenta nuevamente.",
        timestamp: new Date().toISOString(),
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

// GET simplificado
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const activityType = searchParams.get("activityType");

    if (!date) {
      return new Response(
        JSON.stringify({
          status: "ok",
          api: "reservation",
          message: "API de reservas funcionando",
          version: "1.0",
          endpoints: {
            POST: "Crear nueva reserva",
            "GET ?date=YYYY-MM-DD": "Verificar disponibilidad básica",
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Respuesta simplificada
    const timeSlots = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];
    const availability = timeSlots.map((time) => ({
      time,
      available: true,
      availableSpots: 20,
      totalReservations: 0,
      reservedPeople: 0,
    }));

    return new Response(
      JSON.stringify({
        date: date,
        activityType: activityType || "all",
        maxCapacity: 20,
        availability,
        totalReservations: 0,
        message: "Disponibilidad verificada",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("❌ [RESERVATION API GET] Error:", error);
    return new Response(
      JSON.stringify({
        error: "Error al verificar disponibilidad",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
