import { beforeAll, afterAll, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { db } from "../../src/lib/db/client.js";
import { assertTestDatabase } from "../../scripts/test-database.js";
assertTestDatabase(process.env.DATABASE_URL);
import {
  registerAccount,
  verifyCredentials,
  invalidateSessions,
} from "../../src/lib/auth/service.js";
import { consumeBucket } from "../../src/lib/auth/rate-limit.js";
const email = `test-${randomUUID()}@example.com`;
const password = randomUUID();
beforeAll(async () => {
  await db.authRateLimit.deleteMany();
  await db.$queryRaw`SELECT 1`;
});
afterAll(async () => {
  await db.user.deleteMany({ where: { email } });
  await db.$disconnect();
});
it("registre, hash Argon2id, login generik, session revocation", async () => {
  await registerAccount({ name: "Tes", email: email.toUpperCase(), password });
  const stored = await db.user.findUniqueOrThrow({ where: { email } });
  expect(stored.passwordHash).toMatch(/^\$argon2id\$/);
  expect(stored.passwordHash).not.toBe(password);
  const duplicate = await registerAccount({
    name: "Nama lain",
    email,
    password: randomUUID(),
  });
  expect(duplicate.message).toBe(
    "Permintaan pendaftaran selesai. Silakan masuk dengan email dan kata sandi Anda.",
  );
  expect(
    (await db.user.findUniqueOrThrow({ where: { email } })).passwordHash,
  ).toBe(stored.passwordHash);
  expect((await verifyCredentials({ email, password })).id).toBe(stored.id);
  expect(await verifyCredentials({ email, password: randomUUID() })).toBeNull();
  expect(
    await verifyCredentials({
      email: `unknown-${randomUUID()}@example.com`,
      password,
    }),
  ).toBeNull();
  await invalidateSessions(stored.id);
  expect((await db.user.findUnique({ where: { email } })).sessionVersion).toBe(
    2,
  );
  await db.user.update({ where: { email }, data: { isActive: false } });
  expect(await verifyCredentials({ email, password })).toBeNull();
  await expect(
    db.user.create({
      data: { name: "Duplikat", email, passwordHash: stored.passwordHash },
    }),
  ).rejects.toMatchObject({ code: "P2002" });
  await expect(
    db.$executeRaw`INSERT INTO users(name,email,password_hash) VALUES ('Tes',${email.toUpperCase()},'invalid')`,
  ).rejects.toThrow();
});
it("seed dapat diulang tanpa mengganti password akun existing", async () => {
  const seedEmail = `seed-${randomUUID()}@example.com`;
  const env = {
    ...process.env,
    SEED_DEMO_EMAIL: seedEmail,
    SEED_DEMO_PASSWORD: randomUUID(),
  };
  try {
    expect(
      spawnSync(process.execPath, ["prisma/seed.js"], { env }).status,
    ).toBe(0);
    const initial = await db.user.findUniqueOrThrow({
      where: { email: seedEmail },
    });
    expect(
      spawnSync(process.execPath, ["prisma/seed.js"], {
        env: { ...env, SEED_DEMO_PASSWORD: randomUUID() },
      }).status,
    ).toBe(0);
    const repeated = await db.user.findUniqueOrThrow({
      where: { email: seedEmail },
    });
    expect(repeated.id).toBe(initial.id);
    expect(repeated.passwordHash).toBe(initial.passwordHash);
    expect(await db.user.count({ where: { email: seedEmail } })).toBe(1);
  } finally {
    await db.user.deleteMany({ where: { email: seedEmail } });
  }
});
it("raw SQL interactive transaction commit dan rollback nyata", async () => {
  const id = randomUUID();
  await expect(
    db.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id,
          name: "Rollback",
          email: `${id}@example.com`,
          passwordHash: "test-only",
        },
      });
      await tx.$queryRaw`SELECT id FROM users WHERE id=${id}::uuid FOR UPDATE`;
      throw new Error("FAULT");
    }),
  ).rejects.toThrow("FAULT");
  expect(await db.user.findUnique({ where: { id } })).toBeNull();
  await db.$transaction(async (tx) => {
    await tx.user.create({
      data: {
        id,
        name: "Commit",
        email: `${id}@example.com`,
        passwordHash: "test-only",
      },
    });
    expect(
      (await tx.$queryRaw`SELECT id FROM users WHERE id=${id}::uuid`)[0].id,
    ).toBe(id);
  });
  expect(await db.user.findUnique({ where: { id } })).not.toBeNull();
  await db.user.delete({ where: { id } });
});
it("limiter UPSERT paralel tidak kehilangan increment dan memberi Retry-After", async () => {
  const identity = randomUUID();
  const results = await Promise.allSettled(
    Array.from({ length: 12 }, () =>
      consumeBucket("parallel-test", identity, 5, 900),
    ),
  );
  expect(
    results.filter((result) => result.status === "fulfilled"),
  ).toHaveLength(5);
  const rejected = results.filter((result) => result.status === "rejected");
  expect(rejected).toHaveLength(7);
  expect(
    rejected.every(
      (result) =>
        result.reason.status === 429 && result.reason.details.retryAfter > 0,
    ),
  ).toBe(true);
});
