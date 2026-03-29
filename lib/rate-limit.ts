// Simple in-memory sliding window rate limiter
// Note: Memory is cleared on server restart. For distributed deployments, use Redis.

type RateLimitInfo = {
  count: number;
  resetTime: number;
};

const store = new Map<string, RateLimitInfo>();

export const rateLimit = (
  identifier: string,
  limit: number = 5,
  windowMs: number = 60000 // 1 minute
): { success: boolean; resetTime: number } => {
  const now = Date.now();
  const record = store.get(identifier);

  // Clean up expired record
  if (record && now > record.resetTime) {
    store.delete(identifier);
  }

  const currentRecord = store.get(identifier);

  if (!currentRecord) {
    store.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, resetTime: now + windowMs };
  }

  if (currentRecord.count >= limit) {
    return { success: false, resetTime: currentRecord.resetTime };
  }

  store.set(identifier, {
    count: currentRecord.count + 1,
    resetTime: currentRecord.resetTime,
  });

  return { success: true, resetTime: currentRecord.resetTime };
};

// Helper utility to get client IP in Next.js App Router (Server Actions / API Routes)
import { headers } from "next/headers";

export const getClientIp = async (): Promise<string> => {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }
    const realIp = headersList.get("x-real-ip");
    if (realIp) {
      return realIp;
    }
  } catch {
    // ignore
  }
  return "anon-ip";
};
