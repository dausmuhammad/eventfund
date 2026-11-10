import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";
import { assertTestDatabase } from "../../scripts/test-database.js";
assertTestDatabase(process.env.DATABASE_URL);
async function enterDate(page, label, value) {
  const trigger = page.getByRole("button", { name: label, exact: true });
  if ((await trigger.getAttribute("aria-expanded")) !== "true")
    await trigger.click();
  const panel = page.getByRole("dialog", {
    name: `Kalender ${label.toLowerCase()}`,
    exact: true,
  });
  await panel
    .getByRole("button", { name: "Ketik tanggal", exact: true })
    .click();
  await panel
    .getByRole("textbox", { name: `Ketik ${label.toLowerCase()}`, exact: true })
    .fill(value);
  await panel.getByRole("button", { name: "Selesai", exact: true }).click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(panel).toHaveCount(0);
}
test("event create, edit, switcher, duplicate, archive, ownership and CSRF", async ({
  page,
}) => {
  const db = new PrismaClient();
  const password = randomUUID();
  const email = `event-browser-${randomUUID()}@example.com`;
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await db.authRateLimit.deleteMany();
    const owner = await db.user.create({
      data: {
        email,
        name: "Bendahara event",
        passwordHash: await hash(password, { type: 2 }),
      },
    });
    const outsider = await db.user.create({
      data: {
        email: `${randomUUID()}@example.com`,
        name: "Lain",
        passwordHash: "fixture",
      },
    });
    const other = await db.$transaction(async (tx) => {
      const event = await tx.event.create({
        data: { name: "Rahasia", ownerId: outsider.id },
      });
      await tx.eventContributionSettings.create({
        data: { eventId: event.id, updatedBy: outsider.id },
      });
      await tx.incomeSource.create({
        data: {
          eventId: event.id,
          name: "Iuran peserta",
          kind: "CONTRIBUTION",
        },
      });
      return event;
    });
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Kata sandi", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Masuk", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Event saya", exact: true }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Buat event", exact: true }).click();
    await page.getByRole("button", { name: "Buat event", exact: true }).click();
    await expect(
      page.getByLabel("Nama event", { exact: true }),
    ).toHaveAttribute("aria-invalid", "true");
    expect(
      await page
        .getByLabel("Nama event", { exact: true })
        .evaluate((input) =>
          input.labels[0].parentElement
            .querySelector(".text-danger")
            ?.textContent.trim(),
        ),
    ).toBe("*");
    await page.getByLabel("Nama event").fill("Rapat panitia");
    await page.getByRole("link", { name: "Kembali", exact: true }).click();
    await expect(page.getByRole("alertdialog")).toContainText(
      "Tinggalkan perubahan?",
    );
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Kembali", exact: true })
      .click();
    await expect(page.getByRole("alertdialog")).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "Kembali", exact: true }),
    ).toBeFocused();
    await expect(page.getByLabel("Nama event", { exact: true })).toHaveValue(
      "Rapat panitia",
    );
    await page.getByLabel("Nama event").focus();
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Deskripsi")).toBeFocused();
    await enterDate(page, "Tanggal mulai", "2026-11-12");
    await enterDate(page, "Tanggal selesai", "2026-11-11");
    await page.getByRole("button", { name: "Buat event", exact: true }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: "Tanggal selesai" }),
    ).toBeVisible();
    await enterDate(page, "Tanggal selesai", "2026-11-13");
    await page
      .getByRole("button", { name: "Tanggal mulai", exact: true })
      .click({ position: { x: 12, y: 20 } });
    const calendar = page.getByRole("dialog", {
      name: "Kalender tanggal mulai",
      exact: true,
    });
    await expect(calendar).toBeVisible();
    await calendar
      .getByRole("button", { name: "Ketik tanggal", exact: true })
      .click();
    await expect(
      calendar.getByRole("textbox", {
        name: "Ketik tanggal mulai",
        exact: true,
      }),
    ).toBeVisible();
    await calendar
      .getByRole("button", { name: "Lihat kalender", exact: true })
      .click();
    await calendar.getByRole("button", { name: "Bulan berikutnya" }).click();
    await calendar.getByRole("button", { name: "Bulan sebelumnya" }).click();
    await calendar
      .locator(".rdp-day_button")
      .filter({ hasText: /^14$/ })
      .click();
    await expect(
      page.getByRole("button", { name: "Tanggal mulai", exact: true }),
    ).toContainText("14 November 2026");
    await enterDate(page, "Tanggal mulai", "2026-11-12");
    const locationTopBefore = await page
      .getByLabel("Lokasi")
      .evaluate((input) => input.getBoundingClientRect().top + window.scrollY);
    await page
      .getByRole("button", { name: "Tanggal mulai", exact: true })
      .click();
    const panelBounds = await calendar.boundingBox();
    const locationTopAfter = await page
      .getByLabel("Lokasi")
      .evaluate((input) => input.getBoundingClientRect().top + window.scrollY);
    expect(locationTopAfter).toBeCloseTo(locationTopBefore, 0);
    expect(
      await calendar.evaluate((panel) => panel.closest("form") === null),
    ).toBe(true);
    if (test.info().project.name === "mobile") {
      await expect(calendar).toHaveAttribute("data-surface", "drawer");
      await expect
        .poll(async () => {
          const bounds = await calendar.boundingBox();
          return Math.round(bounds.y + bounds.height);
        })
        .toBe(page.viewportSize().height);
    } else {
      await expect(calendar).toHaveAttribute("data-surface", "popover");
      expect(panelBounds.width).toBeLessThanOrEqual(300);
      const triggerBounds = await page
        .getByRole("button", { name: "Tanggal mulai", exact: true })
        .boundingBox();
      expect(Math.abs(panelBounds.x - triggerBounds.x)).toBeLessThanOrEqual(12);
      expect(
        panelBounds.y >= triggerBounds.y + triggerBounds.height ||
          panelBounds.y + panelBounds.height <= triggerBounds.y,
      ).toBe(true);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const originalViewport = page.viewportSize();
    for (const width of [360, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        JSON.stringify(
          await page.evaluate(() =>
            [...document.querySelectorAll("body *")]
              .filter(
                (element) =>
                  element.getBoundingClientRect().right > innerWidth + 1,
              )
              .slice(0, 12)
              .map((element) => ({
                tag: element.tagName,
                className: element.getAttribute("class"),
                width: element.getBoundingClientRect().width,
                right: element.getBoundingClientRect().right,
              })),
          ),
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
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "";
      });
    }
    await page.setViewportSize(originalViewport);
    await expect(calendar).toHaveAttribute("data-surface", test.info().project.name === "mobile" ? "drawer" : "popover");
    await page.screenshot({
      path: `test-results/calendar-${test.info().project.name}.png`,
      fullPage: false,
      animations: "disabled",
    });
    await calendar
      .getByRole("button", { name: "Tutup kalender", exact: true })
      .click();
    await expect(calendar).toHaveCount(0);
    await page
      .getByRole("button", { name: "Tanggal mulai", exact: true })
      .click();
    await calendar
      .getByRole("button", { name: "Tutup kalender", exact: true })
      .focus();
    await page.keyboard.press("Escape");
    await expect(calendar).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Tanggal mulai", exact: true }),
    ).toBeFocused();
    await page
      .getByRole("button", { name: "Tanggal mulai", exact: true })
      .click();
    await calendar
      .getByRole("button", { name: "Kosongkan", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Tanggal mulai", exact: true }),
    ).toContainText("Pilih tanggal");
    await enterDate(page, "Tanggal mulai", "2026-11-12");
    await page
      .getByRole("button", { name: "Tanggal mulai", exact: true })
      .click();
    await calendar
      .getByRole("button", { name: "Hari ini", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Tanggal mulai", exact: true }),
    ).not.toContainText("Pilih tanggal");
    await enterDate(page, "Tanggal mulai", "2026-11-12");
    await page.getByLabel("Lokasi").fill("Aula");
    await expect(
      page.getByRole("button", { name: "Tanggal selesai", exact: true }),
    ).toHaveAttribute("aria-invalid", "false");
    await page.getByLabel("Deskripsi").fill("Persiapan kegiatan bersama.");
    await expect(
      page
        .getByRole("alert")
        .filter({ hasText: "Ada isian yang perlu diperbaiki." }),
    ).toHaveCount(0);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: `test-results/event-form-${test.info().project.name}.png`,
      fullPage: true,
      animations: "disabled",
    });
    await page.route("**/api/events", async (route) => {
      if (route.request().method() === "POST") await route.abort("failed");
      else await route.continue();
    });
    await page.getByRole("button", { name: "Buat event", exact: true }).click();
    await expect(
      page
        .getByRole("alert")
        .filter({ hasText: "Koneksi terputus. Isian Anda tetap tersedia." }),
    ).toBeVisible();
    await expect(page.getByLabel("Nama event")).toHaveValue("Rapat panitia");
    await expect(
      page.getByRole("button", { name: "Tanggal mulai", exact: true }),
    ).toContainText("12 November 2026");
    await page.unroute("**/api/events");
    await page.getByRole("button", { name: "Buat event", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Rapat panitia", exact: true }),
    ).toBeVisible();
    const eventId = new URL(page.url()).pathname.split("/").at(-1);
    expect(
      await db.event.count({ where: { id: eventId, ownerId: owner.id } }),
    ).toBe(1);
    await page.getByRole("link", { name: "Pengaturan event" }).click();
    await page.getByLabel("Nama event").fill("Rapat panitia utama");
    await page.screenshot({
      path: `test-results/settings-${test.info().project.name}.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: "Simpan perubahan" }).click();
    await expect(
      page.getByRole("heading", { name: "Rapat panitia utama", exact: true }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Duplikasi event" }).click();
    await expect(
      page.getByRole("heading", { name: "Duplikasi event", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Buat salinan event", exact: true }),
    ).toBeEnabled();
    await page.screenshot({
      path: `test-results/duplicate-${test.info().project.name}.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: "Buat salinan event" }).click();
    await expect(
      page.getByRole("heading", {
        name: "Rapat panitia utama (salinan)",
        exact: true,
      }),
    ).toBeVisible();
    await page.getByText("Ganti event", { exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("dialog", { name: "Ganti event", exact: true }),
    ).toBeVisible();
    await page.screenshot({
      path: `test-results/switcher-${test.info().project.name}.png`,
      fullPage: false,
    });
    await page
      .getByRole("link", { name: "Rapat panitia utama", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Rapat panitia utama", exact: true }),
    ).toBeVisible();
    await page.screenshot({
      path: `test-results/events-${test.info().project.name}.png`,
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const csrf = (await (await page.request.get("/api/csrf")).json()).data
      .token;
    const headers = { Origin: "http://127.0.0.1:3100", "X-CSRF-Token": csrf };
    expect((await page.request.get(`/api/events/${other.id}`)).status()).toBe(
      404,
    );
    for (const suffix of ["", "/commands", "/duplicate"]) {
      const response = await page.request.fetch(
        `/api/events/${other.id}${suffix}`,
        {
          method: suffix ? "POST" : "PATCH",
          headers,
          data: { name: "Attack", eventId, expectedVersion: 1 },
        },
      );
      expect(response.status()).toBe(404);
    }
    expect(
      (
        await page.request.post(`/api/events/${eventId}/commands`, {
          headers: { ...headers, Origin: "http://evil.invalid" },
          data: {},
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await page.request.patch(`/api/events/${eventId}`, {
          headers,
          data: { name: "Stale", expectedVersion: 1 },
        })
      ).status(),
    ).toBe(409);
    const fullDescription = await page.request.patch(`/api/events/${eventId}`, {
      headers,
      data: {
        name: "Rapat panitia utama",
        expectedVersion: 2,
        description: "x".repeat(4000),
      },
    });
    expect(fullDescription.status()).toBe(200);
    const invalidDescription = await page.request.patch(
      `/api/events/${eventId}`,
      {
        headers,
        data: {
          name: "Rapat panitia utama",
          expectedVersion: 3,
          description: "x".repeat(4001),
        },
      },
    );
    expect(invalidDescription.status()).toBe(422);
    const restored = await page.request.patch(`/api/events/${eventId}`, {
      headers,
      data: {
        name: "Rapat panitia utama",
        expectedVersion: 3,
        description: "Persiapan kegiatan bersama.",
        location: "Aula",
        startDate: "2026-11-12",
        endDate: "2026-11-13",
      },
    });
    expect(restored.status()).toBe(200);
    await page.getByRole("link", { name: "Pengaturan event" }).click();
    await page
      .getByLabel("Alasan pembatalan")
      .fill("Kegiatan dibatalkan panitia");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Terapkan tindakan" }).click();
    await page.screenshot({
      path: `test-results/lifecycle-${test.info().project.name}.png`,
      fullPage: false,
    });
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Kembali", exact: true })
      .click();
    expect(
      (await db.event.findUniqueOrThrow({ where: { id: eventId } })).status,
    ).toBe("DRAFT");
    await page.getByRole("button", { name: "Terapkan tindakan" }).click();
    await page.getByRole("button", { name: "Ya, batalkan event" }).click();
    await expect(
      page.getByText("Metadata event ini hanya dapat dibaca."),
    ).toBeVisible();
    await page.getByRole("combobox", { name: "Tindakan", exact: true }).click();
    await page
      .getByRole("option", { name: "Arsipkan event", exact: true })
      .click();
    await page.getByRole("button", { name: "Terapkan tindakan" }).click();
    await page
      .getByRole("button", { name: "Konfirmasi tindakan", exact: true })
      .click();
    await expect(
      page.getByRole("combobox", { name: "Tindakan", exact: true }),
    ).toContainText("Keluarkan dari arsip");
    await page.goto("/events?archived=true");
    await page
      .getByRole("link", { name: "Rapat panitia utama", exact: true })
      .click();
    await page.getByRole("link", { name: "Pengaturan event" }).click();
    await page.getByRole("button", { name: "Terapkan tindakan" }).click();
    await page
      .getByRole("button", { name: "Konfirmasi tindakan", exact: true })
      .click();
    await expect(
      page.getByRole("combobox", { name: "Tindakan", exact: true }),
    ).toContainText("Arsipkan event");
    await page.goto("/events");
    await page
      .getByLabel("Cari event", { exact: true })
      .fill("tidak-ada-event-ini");
    await expect(
      page.getByRole("heading", { name: "Event tidak ditemukan" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Hapus filter" }).click();
    await page.screenshot({
      path: `test-results/event-list-all-${test.info().project.name}.png`,
      fullPage: true,
    });
    await expect(
      page.getByRole("link", { name: "Rapat panitia utama", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("combobox", { name: "Status event", exact: true })
      .click();
    if (test.info().project.name === "mobile") {
      const drawer = page.getByRole("dialog", {
        name: "Status event",
        exact: true,
      });
      await expect(drawer).toHaveAttribute("data-surface", "drawer");
      await expect
        .poll(async () => {
          const bounds = await drawer.boundingBox();
          return Math.round(bounds.y + bounds.height);
        })
        .toBe(page.viewportSize().height);
      await drawer
        .getByRole("option", { name: "Semua status", exact: true })
        .focus();
      await page.keyboard.press("ArrowDown");
      await expect(
        drawer.getByRole("option", { name: "Draft", exact: true }),
      ).toBeFocused();
      await page.screenshot({
        path: "test-results/select-drawer-mobile.png",
        fullPage: false,
      });
    }
    await page.getByRole("option", { name: "Dibatalkan", exact: true }).click();
    await expect(
      page.getByRole("link", {
        name: "Rapat panitia utama (salinan)",
        exact: true,
      }),
    ).toHaveCount(0);
    await page.screenshot({
      path: `test-results/event-list-${test.info().project.name}.png`,
      fullPage: true,
    });
    if (test.info().project.name === "mobile") {
      await page.getByRole("button", { name: "Buka navigasi" }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(
        page.getByRole("button", { name: "Buka navigasi" }),
      ).toBeFocused();
    }
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "";
    });
    expect(errors).toEqual([]);
  } finally {
    await db.$disconnect();
  }
});
