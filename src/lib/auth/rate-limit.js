import "server-only";
import { createHash } from "node:crypto";
import { db } from "../db/client.js";
import { AppError } from "../validation/errors.js";
export const bucketHash = (value) =>
  createHash("sha256").update(value).digest("hex");
export function clientIp() {
  // Local development has one trusted loopback ingress; do not trust client forwarding headers.
  return "local-loopback";
}
export async function consumeBucket(label, identity, limit, seconds) {
  const now = Date.now();
  const start = new Date(Math.floor(now / (seconds * 1000)) * seconds * 1000);
  const expires = new Date(start.getTime() + seconds * 1000);
  const key = bucketHash(`${label}:${identity}`);
  const rows =
    await db.$queryRaw`INSERT INTO auth_rate_limits(bucket_key,window_started_at,window_seconds,attempt_count,expires_at)
    VALUES (${key},${start},${seconds},1,${expires})
    ON CONFLICT(bucket_key,window_started_at,window_seconds) DO UPDATE SET attempt_count=auth_rate_limits.attempt_count+1,updated_at=now()
    RETURNING attempt_count`;
  if (rows[0].attempt_count > limit)
    throw new AppError(
      429,
      "RATE_LIMITED",
      "Terlalu banyak percobaan. Tunggu sebelum mencoba lagi.",
      { retryAfter: Math.max(1, Math.ceil((expires.getTime() - now) / 1000)) },
    );
  return key;
}
