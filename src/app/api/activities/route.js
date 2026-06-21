// app/api/activities/route.js - CORREGIDA
import { NextResponse } from "next/server";
const prisma = require("@/lib/prisma");

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "20");
    const featured = searchParams.get("featured") === "true";

    const where = {
      status: {
        in: ["upcoming", "active"],
      },
      date: {
        gte: new Date(),
      },
    };

    if (category && category !== "all") {
      where.category = category;
    }

    if (featured) {
      where.featured = true;
    }

    const activities = await prisma.activity.findMany({
      where,
      take: limit,
      orderBy: [{ featured: "desc" }, { date: "asc" }],
      include: {
        bookings: {
          where: {
            status: "confirmed",
          },
          select: {
            numPeople: true,
          },
        },
      },
    });

    // Función para obtener imagen segura
    const getSafeImageUrl = (imageUrl, category) => {
      const incorrectPaths = [
        "/images/jardin.jpg",
        "/images/calabazas.jpg",
        "/images/activities/family.jpg",
        "/images/activities/tour.jpg",
        "/images/activities/workshop.jpg",
        "/images/activities/education.jpg",
        "/images/activities/harvest.jpg",
        "/images/activities/tasting.jpg",
        "/images/activities/seasonal.jpg",
      ];

      const isIncorrectPath = incorrectPaths.some(
        (path) => imageUrl && imageUrl.includes(path),
      );

      if (
        !imageUrl ||
        isIncorrectPath ||
        imageUrl === "" ||
        imageUrl === null
      ) {
        const defaultImages = {
          family: "/familia.png",
          visit: "/visita.png",
          educational: "/educacion.png",
          workshop: "/martillo.png",
          harvest: "/manzana.png",
          tasting: "/mandarina.png",
          seasonal: "/calabaza.png",
        };

        return defaultImages[category] || "/familia.png";
      }

      return imageUrl;
    };

    // Función para extraer hora de DateTime
    const extractTimeFromDateTime = (dateTime) => {
      if (!dateTime) return "09:00";
      const date = new Date(dateTime);
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    };

    // Funciones auxiliares
    const formatDateLocal = (date, language) => {
      const d = new Date(date);
      const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      };

      if (language === "ar") {
        return d.toLocaleDateString("ar-MA", options);
      } else {
        return d.toLocaleDateString("fr-FR", options);
      }
    };

    const getDifficultyLevelLocal = (cat) => {
      const levels = {
        family: { ar: "عائلي", fr: "Familial" },
        visit: { ar: "جميع الأعمار", fr: "Tous âges" },
        educational: { ar: "متوسط", fr: "Moyen" },
        workshop: { ar: "متقدم", fr: "Avancé" },
        harvest: { ar: "متوسط", fr: "Moyen" },
        tasting: { ar: "جميع الأعمار", fr: "Tous âges" },
        seasonal: { ar: "عائلي", fr: "Familial" },
      };
      return levels[cat] || { ar: "جميع الأعمار", fr: "Tous âges" };
    };

    // Transformar datos
    const formattedActivities = activities.map((activity) => {
      const currentParticipants = activity.bookings.reduce(
        (sum, booking) => sum + (booking.numPeople || 0),
        0,
      );

      // Extraer horas de date y endDate
      const horaInicio = extractTimeFromDateTime(activity.date);
      const horaFin = extractTimeFromDateTime(activity.endDate);

      // Usar campos startTime y endTime si existen, de lo contrario usar las horas extraídas
      const horaInicioFinal = activity.startTime || horaInicio;
      const horaFinFinal = activity.endTime || horaFin;

      const horarioCompletoAr = `${horaInicioFinal} - ${horaFinFinal}`;
      const horarioCompletoFr = `${horaInicioFinal} - ${horaFinFinal}`;

      return {
        id: activity.id,
        titulo: {
          ar: activity.titleAr,
          fr: activity.titleFr,
        },
        fecha: {
          ar: formatDateLocal(activity.date, "ar"),
          fr: formatDateLocal(activity.date, "fr"),
        },
        // HORARIOS: primero intentar usar los campos específicos, luego extraer de DateTime
        horaInicio: horaInicioFinal,
        horaFin: horaFinFinal,
        horarioCompleto: {
          ar: horarioCompletoAr,
          fr: horarioCompletoFr,
        },
        descripcion: {
          ar: activity.descriptionAr?.substring(0, 150) + "..." || "",
          fr: activity.descriptionFr?.substring(0, 150) + "..." || "",
        },
        imagen: getSafeImageUrl(activity.imageUrl, activity.category),
        cuposDisponibles: activity.maxCapacity - currentParticipants,
        maxCapacity: activity.maxCapacity,
        currentParticipants,
        duracion: {
          ar: `${activity.duration} ساعات`,
          fr: `${activity.duration} heures`,
        },
        nivel: getDifficultyLevelLocal(activity.category),
        categoria: activity.category,
        location: activity.location,
        featured: activity.featured,
        status: activity.status,
      };
    });

    return NextResponse.json({ actividades: formattedActivities });
  } catch (error) {
    console.error("[ACTIVITIES API PUBLIC ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 },
    );
  }
}
