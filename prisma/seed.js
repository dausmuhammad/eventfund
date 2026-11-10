import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { registrationSchema } from "../src/lib/auth/schemas.js";
const db = new PrismaClient();
try {
  if (!process.env.SEED_DEMO_EMAIL || !process.env.SEED_DEMO_PASSWORD) throw new Error("Isi SEED_DEMO_EMAIL dan SEED_DEMO_PASSWORD sebelum seed.");
  const data = registrationSchema.parse({ name: "Pengguna demo", email: process.env.SEED_DEMO_EMAIL, password: process.env.SEED_DEMO_PASSWORD });
  if (!(await db.user.findUnique({ where: { email: data.email } }))) {
    const passwordHash = await argon2.hash(data.password, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
    await db.user.create({ data: { name: data.name, email: data.email, passwordHash } });
  }
  console.log("Seed selesai; akun existing tidak diubah.");
} catch { console.error("Seed gagal. Periksa konfigurasi dan koneksi database."); process.exitCode = 1; }
finally { await db.$disconnect(); }
