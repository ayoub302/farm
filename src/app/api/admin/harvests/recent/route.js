// /api/admin/harvests/recent/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    console.log("[RECENT_HARVESTS] Fetching recent harvests...");
    // Obtener cosechas recientes (últimas 5)
    const harvests = await prisma.harvest.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        productAr: true,
        productFr: true,
        icon: true,
        season: true,
        year: true,
        nextHarvest: true,
        isActive: true,
        createdAt: true,
      },
    });

    console.log(`[RECENT_HARVESTS] Found ${harvests.length} harvests`);

    return NextResponse.json({ harvests });
  } catch (error) {
    console.error("[RECENT_HARVESTS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch recent harvests" },
      { status: 500 },
    );
  }
}
