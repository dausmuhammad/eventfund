export function assertTestDatabase(testUrl, developmentUrl) {
  if (!testUrl) throw new Error("TEST_DATABASE_URL wajib diisi.");
  const test = new URL(testUrl);
  const development = developmentUrl ? new URL(developmentUrl) : null;
  if (
    !["postgresql:", "postgres:"].includes(test.protocol) ||
    !decodeURIComponent(test.pathname).includes("_test")
  )
    throw new Error(
      "Database pengujian harus PostgreSQL dengan nama mengandung _test.",
    );
  if (
    development &&
    decodeURIComponent(test.pathname) ===
      decodeURIComponent(development.pathname)
  )
    throw new Error("Database dev dan test wajib berbeda.");
  return testUrl;
}
