import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { RateLimitService } from "@/services/rate-limit";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const usage = await RateLimitService.getUsage(userId);
    return NextResponse.json({
      userId,
      rpm: {
        usage: usage.rpm,
        limit: 20,
        remaining: Math.max(0, 20 - usage.rpm),
      },
      rpd: {
        usage: usage.rpd,
        limit: 500,
        remaining: Math.max(0, 500 - usage.rpd),
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch rate limit stats" }, { status: 500 });
  }
}
