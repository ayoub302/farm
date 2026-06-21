import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Obtener todas las cosechas activas
    const harvests = await prisma.harvest.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        productAr: true,
        productFr: true,
        icon: true,
        statusAr: true,
        statusFr: true,
        availabilityAr: true,
        availabilityFr: true,
        nextHarvest: true,
        unit: true,
        season: true,
        year: true,
        descriptionAr: true,
        descriptionFr: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        nextHarvest: "asc",
      },
    });

    // Asegurarse de que todos los campos tengan valores por defecto
    const safeHarvests = harvests.map((harvest) => ({
      ...harvest,
      statusAr: harvest.statusAr || "متوفر",
      statusFr: harvest.statusFr || "Disponible",
      availabilityAr: harvest.availabilityAr || "متاح للحصاد",
      availabilityFr: harvest.availabilityFr || "Disponible pour récolte",
      unit: harvest.unit || "kg",
      icon: harvest.icon || "🌱",
      season: harvest.season || "Spring",
      year: harvest.year || new Date().getFullYear(),
      descriptionAr: harvest.descriptionAr || "",
      descriptionFr: harvest.descriptionFr || "",
      // Asegurar que nextHarvest sea una fecha válida
      nextHarvest: harvest.nextHarvest || new Date(),
    }));

    console.log(`[HARVESTS_API] Returning ${safeHarvests.length} harvests`);

    return NextResponse.json({
      success: true,
      harvests: safeHarvests,
    });
  } catch (error) {
    console.error("[PUBLIC_HARVESTS_API_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch harvests",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
