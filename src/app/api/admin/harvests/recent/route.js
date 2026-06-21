// /api/admin/harvests/recent/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const session = request.cookies.get("admin_session");
    if (session?.value !== "authenticated") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

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
        unit: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ harvests });
  } catch (error) {
    console.error("[RECENT_HARVESTS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch recent harvests" },
      { status: 500 },
    );
  }
}
