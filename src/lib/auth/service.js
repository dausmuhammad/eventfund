import "server-only";
import argon2 from "argon2";
import { db } from "../db/client.js";
import { registrationSchema, loginSchema } from "./schemas.js";
import { consumeBucket, clientIp } from "./rate-limit.js";
let dummyHash;
export const passwordOptions = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};
export async function registerAccount(input) {
  await consumeBucket("register", clientIp(), 5, 3600);
  const data = registrationSchema.parse(input);
  const passwordHash = await argon2.hash(data.password, passwordOptions);
  try {
    await db.user.create({
      data: { name: data.name, email: data.email, passwordHash },
    });
  } catch (error) {
    if (error.code !== "P2002") throw error;
  }
  return {
    message:
      "Permintaan pendaftaran selesai. Silakan masuk dengan email dan kata sandi Anda.",
  };
}
export async function verifyCredentials(input) {
  const parsed = loginSchema.safeParse(input);
  const email = parsed.success ? parsed.data.email : "invalid";
  const ipBucket = await consumeBucket("login-ip", clientIp(), 30, 900);
  const bucketKey = await consumeBucket(
    "login-identity",
    `${email}:${clientIp()}`,
    5,
    900,
  );
  dummyHash ??= argon2.hash("dummy-verification-only", passwordOptions);
  const user = parsed.success
    ? await db.user.findUnique({ where: { email } })
    : null;
  const valid = await argon2.verify(
    user?.passwordHash ?? (await dummyHash),
    parsed.success ? parsed.data.password : "invalid",
  );
  if (!valid || !user?.isActive) return null;
  await db.authRateLimit.updateMany({
    where: { bucketKey: ipBucket, attemptCount: { gt: 0 } },
    data: { attemptCount: { decrement: 1 } },
  });
  await db.authRateLimit.deleteMany({ where: { bucketKey } });
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    sessionVersion: user.sessionVersion,
  };
}
export async function invalidateSessions(userId) {
  await db.user.update({
    where: { id: userId },
    data: { sessionVersion: { increment: 1 }, version: { increment: 1 } },
  });
}
