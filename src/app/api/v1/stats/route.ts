import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserStats, getUserCredits } from "@/services/tracking-server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch stats and credits using server-side admin functions (No 403 error)
    const [stats, credits] = await Promise.all([
      getUserStats(userId),
      getUserCredits(userId)
    ]);

    return NextResponse.json({
      userId,
      stats,
      credits
    });
  } catch (error: any) {
    console.error("[Stats API] Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats", details: error.message }, { status: 500 });
  }
}
