import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export const ratelimit = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 requests per minute
	analytics: true,
});

export async function checkRateLimit(key: string) {
	try {
		return await ratelimit.limit(key);
	} catch (error) {
		console.error("[rateLimit] Redis connection failed:", error);
		// If rate limiting fails, allow the request to proceed
		// This prevents the entire API from breaking when Redis is down
		return { success: true, limit: 5, remaining: 4, reset: Date.now() + 60000 };
	}
}
