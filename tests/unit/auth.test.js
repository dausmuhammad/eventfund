import { expect, it } from "vitest";
import { registrationSchema } from "../../src/lib/auth/schemas.js";
import { readJson } from "../../src/lib/validation/json.js";
it("menolak body berlebih sebelum parsing dan JSON invalid", async () => {
  await expect(
    readJson(
      new Request("http://localhost", {
        method: "POST",
        body: "x".repeat(4097),
      }),
    ),
  ).rejects.toMatchObject({ status: 413 });
  await expect(
    readJson(new Request("http://localhost", { method: "POST", body: "{" })),
  ).rejects.toMatchObject({ status: 400 });
});
it("menormalisasi email dan menjaga spasi password", () => {
  const parsed = registrationSchema.parse({
    name: " Nama ",
    email: " USER@example.com ",
    password: "  password-aman  ",
  });
  expect(parsed.email).toBe("user@example.com");
  expect(parsed.name).toBe("Nama");
  expect(parsed.password).toBe("  password-aman  ");
});
it("menolak field tambahan dan password pendek", () => {
  expect(
    registrationSchema.safeParse({
      name: "Nama",
      email: "a@b.com",
      password: "short",
    }).success,
  ).toBe(false);
  expect(
    registrationSchema.safeParse({
      name: "Nama",
      email: "a@b.com",
      password: "password-panjang",
      ownerId: "fake",
    }).success,
  ).toBe(false);
});
