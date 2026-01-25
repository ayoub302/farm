import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { action, userId, email, details } = await request.json();

    console.log("=".repeat(50));
    console.log("[ADMIN ACTION LOG]");
    console.log(`Action: ${action}`);
    console.log(`User ID: ${userId}`);
    console.log(`Email: ${email}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);

    if (details) {
      console.log("Details:", JSON.stringify(details, null, 2));
    }

    console.log("=".repeat(50));

    return NextResponse.json({
      success: true,
      message: "Action logged",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[ADMIN LOG ERROR]", error);
    return NextResponse.json(
      { error: "Error logging action" },
      { status: 500 }
    );
  }
}
