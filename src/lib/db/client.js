import "server-only";
import { PrismaClient } from "@prisma/client";
const globalDatabase = globalThis;
export const db = globalDatabase.eventfundDatabase ?? new PrismaClient();
if (process.env.NODE_ENV !== "production")
  globalDatabase.eventfundDatabase = db;
