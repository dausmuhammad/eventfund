import "dotenv/config";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { assertTestDatabase } from "./test-database.js";
const origin = "http://127.0.0.1:3100";
const env = {
  ...process.env,
  DATABASE_URL: assertTestDatabase(
    process.env.TEST_DATABASE_URL,
    process.env.DATABASE_URL,
  ),
  AUTH_SECRET: randomBytes(32).toString("hex"),
  AUTH_URL: origin,
  NEXTAUTH_URL: origin,
  APP_ORIGIN: origin,
};
for (const args of [
  ["node_modules/prisma/build/index.js", "migrate", "deploy"],
  ...(process.env.PLAYWRIGHT_PRODUCTION === "true"
    ? [["node_modules/next/dist/bin/next", "build", "--webpack"]]
    : []),
  ["node_modules/@playwright/test/cli.js", "test"],
]) {
  const result = spawnSync(process.execPath, args, { env, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
