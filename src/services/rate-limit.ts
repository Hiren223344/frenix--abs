import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export class RateLimitService {
  static async checkLimit(userId: string, rpmLimit: number = 20, rpdLimit: number = 500): Promise<{
    allowed: boolean;
    reason?: "rpm" | "rpd";
    currentRpm: number;
    currentRpd: number;
    retryAfter: number;
  }> {
    const now = new Date();
    const minuteKey = `ratelimit:${userId}:rpm:${now.getMinutes()}`;
    const dailyKey = `ratelimit:${userId}:rpd:${now.toISOString().split('T')[0]}`;

    try {
      // Run both increments in parallel
      const [rpmCount, rpdCount] = await Promise.all([
        redis.incr(minuteKey),
        redis.incr(dailyKey)
      ]);
      
      // Set expiry for new keys
      if (rpmCount === 1) await redis.expire(minuteKey, 60);
      if (rpdCount === 1) await redis.expire(dailyKey, 86400); // 24 hours

      if (rpdCount > rpdLimit) {
        return {
          allowed: false,
          reason: "rpd",
          currentRpm: rpmCount,
          currentRpd: rpdCount,
          retryAfter: 86400 - (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()),
        };
      }

      if (rpmCount > rpmLimit) {
        return {
          allowed: false,
          reason: "rpm",
          currentRpm: rpmCount,
          currentRpd: rpdCount,
          retryAfter: 60 - now.getSeconds(),
        };
      }

      return {
        allowed: true,
        currentRpm: rpmCount,
        currentRpd: rpdCount,
        retryAfter: 0,
      };
    } catch (error) {
      console.error("[RateLimit] Redis error:", error);
      return { allowed: true, currentRpm: 0, currentRpd: 0, retryAfter: 0 };
    }
  }

  static async getUsage(userId: string): Promise<{ rpm: number; rpd: number }> {
    const now = new Date();
    const minuteKey = `ratelimit:${userId}:rpm:${now.getMinutes()}`;
    const dailyKey = `ratelimit:${userId}:rpd:${now.toISOString().split('T')[0]}`;
    
    const [rpmVal, rpdVal] = await Promise.all([
      redis.get(minuteKey),
      redis.get(dailyKey)
    ]);

    return {
      rpm: parseInt((rpmVal as string) || "0", 10),
      rpd: parseInt((rpdVal as string) || "0", 10),
    };
  }
}
