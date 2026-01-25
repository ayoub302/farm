// app/api/calendar/route.js - CORREGIDA
import { NextResponse } from "next/server";
const prisma = require("@/lib/prisma");

export async function GET(request) {
  try {
    console.log("[PUBLIC CALENDAR API] Fetching calendar data...");

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const today = new Date();
    const targetMonth = month ? parseInt(month) : today.getMonth() + 1;
    const targetYear = year ? parseInt(year) : today.getFullYear();

    const dateFrom = new Date(targetYear, targetMonth - 1, 1);
    const dateTo = new Date(targetYear, targetMonth, 0);
    dateTo.setHours(23, 59, 59, 999);

    console.log("[PUBLIC CALENDAR API] Fetching for:", {
      targetMonth,
      targetYear,
      dateFrom,
      dateTo,
    });

    // Obtener actividades
    const activities = await prisma.activity.findMany({
      where: {
        date: {
          gte: dateFrom,
          lte: dateTo,
        },
        status: {
          in: ["upcoming", "active"],
        },
      },
      select: {
        id: true,
        titleFr: true,
        titleAr: true,
        descriptionFr: true,
        descriptionAr: true,
        date: true,
        endDate: true,
        duration: true,
        category: true,
        location: true,
        maxCapacity: true,
        status: true,
        imageUrl: true,
        bookings: {
          where: {
            status: "confirmed",
          },
          select: {
            numPeople: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Obtener eventos de calendario públicos
    const calendarEvents = await prisma.calendarEvent.findMany({
      where: {
        startDate: {
          gte: dateFrom,
          lte: dateTo,
        },
        isPublic: true,
      },
      select: {
        id: true,
        titleFr: true,
        titleAr: true,
        descriptionFr: true,
        descriptionAr: true,
        startDate: true,
        endDate: true,
        type: true,
        location: true,
      },
      orderBy: {
        startDate: "asc",
      },
    });

    console.log(
      `[PUBLIC CALENDAR API] Found ${activities.length} activities, ${calendarEvents.length} public events`,
    );

    // Función para extraer hora de DateTime
    const extractTimeFromDateTime = (dateTime) => {
      if (!dateTime) return "09:00";
      const date = new Date(dateTime);
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    };

    // Formatear actividades
    const formattedActivities = activities.map((activity) => {
      const currentParticipants = activity.bookings.reduce(
        (sum, booking) => sum + (booking.numPeople || 0),
        0,
      );

      const getActivityType = (category) => {
        const categoryMap = {
          harvest: "cosecha",
          workshop: "taller",
          visit: "visita",
          tasting: "degustacion",
          educational: "educacion",
          family: "familial",
          seasonal: "estacional",
        };
        return categoryMap[category] || "activity";
      };

      // Extraer horas de date y endDate
      const horaInicio = extractTimeFromDateTime(activity.date);
      const horaFin = extractTimeFromDateTime(activity.endDate);

      return {
        id: `activity-${activity.id}`,
        titulo: {
          fr: activity.titleFr,
          ar: activity.titleAr,
        },
        descripcion: {
          fr: activity.descriptionFr,
          ar: activity.descriptionAr,
        },
        fecha: activity.date.toISOString().split("T")[0],
        horaInicio: horaInicio,
        horaFin: horaFin,
        horario: `${horaInicio} - ${horaFin}`,
        tipo: getActivityType(activity.category),
        color: getActivityColor(activity.category),
        ubicacion: activity.location,
        cuposDisponibles: activity.maxCapacity - currentParticipants,
        capacidadTotal: activity.maxCapacity,
        imagen: activity.imageUrl,
        estado: activity.status,
        lleno: currentParticipants >= activity.maxCapacity,
        enlace: `/reservation?activity=${activity.id}`,
      };
    });

    // Formatear eventos de calendario
    const formattedEvents = calendarEvents.map((event) => ({
      id: `event-${event.id}`,
      titulo: {
        fr: event.titleFr,
        ar: event.titleAr,
      },
      descripcion: {
        fr: event.descriptionFr,
        ar: event.descriptionAr,
      },
      fecha: event.startDate.toISOString().split("T")[0],
      fechaFin: event.endDate
        ? event.endDate.toISOString().split("T")[0]
        : null,
      tipo: event.type || "evento",
      color: "#8b5cf6",
      ubicacion: event.location,
      enlace: "/events",
    }));

    const calendarData = [...formattedActivities, ...formattedEvents];
    const activitiesByDate = {};

    calendarData.forEach((item) => {
      const date = item.fecha;
      if (!activitiesByDate[date]) {
        activitiesByDate[date] = [];
      }
      activitiesByDate[date].push(item);
    });

    // Obtener cosechas programadas
    let harvestSchedule = [];
    try {
      const harvests = await prisma.harvest.findMany({
        where: {
          nextHarvest: {
            gte: dateFrom,
            lte: dateTo,
          },
          isActive: true,
        },
        select: {
          id: true,
          productFr: true,
          productAr: true,
          nextHarvest: true,
          statusFr: true,
          isActive: true,
        },
        orderBy: {
          nextHarvest: "asc",
        },
      });

      harvestSchedule = harvests.map((harvest) => {
        return {
          id: `harvest-${harvest.id}`,
          titulo: {
            fr: `Récolte: ${harvest.productFr}`,
            ar: `حصاد: ${harvest.productAr}`,
          },
          descripcion: {
            fr: "Récolte saisonnière",
            ar: "حصاد موسمي",
          },
          fecha: harvest.nextHarvest.toISOString().split("T")[0],
          tipo: "cosecha",
          color: "#10b981",
          producto: {
            fr: harvest.productFr,
            ar: harvest.productAr,
          },
          disponible: harvest.isActive || true,
          estado: harvest.statusFr || "Disponible",
          enlace: "/harvests",
        };
      });
    } catch (error) {
      console.log("[PUBLIC CALENDAR API] Error fetching harvests:", error);
      // Continuar sin cosechas si hay error
    }

    // Agregar cosechas al calendario
    harvestSchedule.forEach((harvest) => {
      const date = harvest.fecha;
      if (!activitiesByDate[date]) {
        activitiesByDate[date] = [];
      }
      activitiesByDate[date].push(harvest);
    });

    // Resumen del mes
    const monthSummary = {
      totalActivities: activities.length,
      totalPublicEvents: calendarEvents.length,
      totalHarvests: harvestSchedule.length,
      activitiesByType: {
        cosecha: activities.filter((a) => a.category === "harvest").length,
        taller: activities.filter((a) => a.category === "workshop").length,
        visita: activities.filter((a) => a.category === "visit").length,
        degustacion: activities.filter((a) => a.category === "tasting").length,
        educacion: activities.filter((a) => a.category === "educational")
          .length,
        familiar: activities.filter((a) => a.category === "family").length,
      },
    };

    // Construir respuesta
    const response = {
      success: true,
      month: targetMonth,
      year: targetYear,
      monthName: getMonthName(targetMonth),
      activitiesByDate,
      summary: monthSummary,
      statistics: {
        totalItems: calendarData.length + harvestSchedule.length,
        datesWithActivities: Object.keys(activitiesByDate).length,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[PUBLIC CALENDAR API ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch calendar data",
        message: error.message,
      },
      { status: 500 },
    );
  }
}

// Función auxiliar para obtener color según categoría
function getActivityColor(category) {
  const colors = {
    harvest: "#10b981", // verde
    workshop: "#f59e0b", // amarillo
    visit: "#3b82f6", // azul
    tasting: "#8b5cf6", // violeta
    educational: "#ec4899", // rosa
    family: "#f97316", // naranja
    seasonal: "#06b6d4", // cian
  };
  return colors[category] || "#6b7280"; // gris por defecto
}

// Función auxiliar para obtener nombre del mes
function getMonthName(monthNumber) {
  const months = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];
  return months[monthNumber - 1] || "";
}
