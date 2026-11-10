import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { assertTestDatabase } from "../../scripts/test-database.js";
assertTestDatabase(process.env.DATABASE_URL);
test.beforeEach(async () => {
  const db = new PrismaClient();
  try {
    await db.authRateLimit.deleteMany();
  } finally {
    await db.$disconnect();
  }
});
test("register, login, guard, revocation, logout, responsif", async ({
  page,
}) => {
  const db = new PrismaClient();
  const email = `browser-${randomUUID()}@example.com`;
  const password = randomUUID();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    expect((await page.request.get("/api/me")).status()).toBe(401);
    const csrf = (await (await page.request.get("/api/csrf")).json()).data
      .token;
    const denied = await page.request.post("/api/register", {
      headers: { Origin: "http://evil.invalid", "X-CSRF-Token": csrf },
      data: { name: "Tes", email, password },
    });
    expect(denied.status()).toBe(403);
    await page.goto("http://localhost:3100/events");
    await expect(page).toHaveURL("http://127.0.0.1:3100/login");
    await expect(page).toHaveURL(/\/login/);
    await page.getByRole("link", { name: "Buat akun", exact: true }).click();
    await page.getByLabel("Nama", { exact: true }).fill("Bendahara tes");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Kata sandi", { exact: true }).fill(password);
    await page
      .getByLabel("Konfirmasi kata sandi", { exact: true })
      .fill("konfirmasi-belum-cocok");
    await page.getByRole("button", { name: "Buat akun", exact: true }).click();
    await expect(
      page.getByLabel("Konfirmasi kata sandi", { exact: true }),
    ).toHaveAttribute("aria-invalid", "true");
    expect(await db.user.count({ where: { email } })).toBe(0);
    await page
      .getByLabel("Konfirmasi kata sandi", { exact: true })
      .fill(password);
    await page
      .getByRole("button", { name: "Tampilkan kata sandi", exact: true })
      .click();
    await expect(
      page.getByLabel("Kata sandi", { exact: true }),
    ).toHaveAttribute("type", "text");
    await page
      .getByRole("button", { name: "Sembunyikan kata sandi", exact: true })
      .click();
    await page.getByRole("button", { name: "Buat akun", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(
      "Permintaan pendaftaran selesai",
    );
    await page.getByRole("link", { name: "Masuk", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Masuk ke akun" }),
    ).toBeVisible();
    await page.getByLabel("Email", { exact: true }).focus();
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Kata sandi", { exact: true })).toBeFocused();
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Kata sandi", { exact: true }).fill(randomUUID());
    await page.getByRole("button", { name: "Masuk", exact: true }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: "Email atau kata sandi" }),
    ).toContainText("Email atau kata sandi tidak sesuai");
    await page.getByLabel("Kata sandi", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Masuk", exact: true }).click();
    await expect(page).toHaveURL(/\/events/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Event saya",
    );
    expect((await page.request.get("/api/me")).status()).toBe(200);
    const sessionCsrf = (await (await page.request.get("/api/csrf")).json())
      .data.token;
    const sessionRegistration = await page.request.post("/api/register", {
      headers: { Origin: "http://127.0.0.1:3100", "X-CSRF-Token": sessionCsrf },
      data: { name: "Bendahara tes", email, password },
    });
    expect(sessionRegistration.status()).toBe(201);
    expect(await db.user.count({ where: { email } })).toBe(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/shell-${test.info().project.name}.png`,
      fullPage: true,
    });
    await db.user.update({ where: { email }, data: { isActive: false } });
    expect((await page.request.get("/api/me")).status()).toBe(401);
    await db.user.update({ where: { email }, data: { isActive: true } });
    await db.user.update({
      where: { email },
      data: { sessionVersion: { increment: 1 } },
    });
    expect((await page.request.get("/api/me")).status()).toBe(401);
    await page.getByRole("button", { name: "Keluar" }).click();
    await expect(page).toHaveURL(/\/login/);
    expect((await page.request.get("/api/me")).status()).toBe(401);
    await expect(
      page.getByRole("button", { name: "Masuk", exact: true }),
    ).toBeEnabled();
    await page.screenshot({
      path: `test-results/login-${test.info().project.name}.png`,
      fullPage: true,
    });
    expect(errors).toEqual([]);
  } finally {
    await db.user.deleteMany({ where: { email } });
    await db.$disconnect();
  }
});
test("Auth.js memberi 429 dan Retry-After; custom API menolak token salah", async ({
  page,
}) => {
  const identity = `limit-${randomUUID()}@example.com`;
  const authCsrf = (await (await page.request.get("/api/auth/csrf")).json())
    .csrfToken;
  let response;
  for (let attempt = 0; attempt < 6; attempt++) {
    response = await page.request.post("/api/auth/callback/credentials", {
      form: {
        email: identity,
        password: randomUUID(),
        csrfToken: authCsrf,
        callbackUrl: "http://127.0.0.1:3100/events",
        json: "true",
      },
    });
  }
  expect(response.status()).toBe(429);
  expect(response.headers()["retry-after"]).toBe("900");
  const denied = await page.request.post("/api/register", {
    headers: { Origin: "http://127.0.0.1:3100", "X-CSRF-Token": "wrong" },
    data: {},
  });
  expect(denied.status()).toBe(403);
});
test("form kosong ditolak dan layout tablet serta pembesaran teks tetap utuh", async ({
  page,
}) => {
  await page.goto("/login");
  await expect(
    page.getByRole("button", { name: "Masuk", exact: true }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  expect(
    await page
      .getByLabel("Email", { exact: true })
      .evaluate((input) => input.validity.valueMissing),
  ).toBe(true);
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByLabel("Kata sandi", { exact: true })
      .scrollIntoViewIfNeeded();
    await expect(page.getByLabel("Kata sandi", { exact: true })).toBeVisible();
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "";
    });
  }
});
