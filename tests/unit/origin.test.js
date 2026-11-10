import { it, expect } from "vitest";
import { localOriginRedirects } from "../../src/lib/auth/origin.js";
it.each([
  ["http://localhost:3000", "127.0.0.1"],
  ["http://127.0.0.1:3100", "localhost"],
])("mengalihkan alias lokal ke alamat konfigurasi %s", (origin, alternate) => {
  const [rule] = localOriginRedirects(origin);
  expect(new RegExp(`^${rule.has[0].value}$`).test(alternate)).toBe(true);
  expect(
    new RegExp(`^${rule.has[0].value}$`).test(new URL(origin).hostname),
  ).toBe(false);
  expect(new RegExp(`^${rule.has[0].value}$`).test("127x0x0x1")).toBe(false);
  expect(rule.destination).toBe(`${origin}/:path*`);
  expect(rule.permanent).toBe(false);
});
it("tidak mengalihkan host selain loopback atau memakai host kiriman client", () => {
  expect(localOriginRedirects("https://example.com")).toEqual([]);
  expect(localOriginRedirects()).toEqual([]);
});
