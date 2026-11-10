import "dotenv/config";
import { spawnSync } from "node:child_process";
import { assertTestDatabase } from "./test-database.js";
const env = {
  ...process.env,
  DATABASE_URL: assertTestDatabase(
    process.env.TEST_DATABASE_URL,
    process.env.DATABASE_URL,
  ),
};
for (const args of [
  ["node_modules/prisma/build/index.js", "migrate", "deploy"],
  ["node_modules/vitest/vitest.mjs", "run", "tests/integration"],
]) {
  const result = spawnSync(process.execPath, args, { env, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
