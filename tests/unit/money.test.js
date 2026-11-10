import { describe, it, expect } from "vitest";
import {
  money,
  quantity,
  subtotal,
  totalMoney,
  serialize,
  normalizeLocalDecimal,
} from "../../src/lib/money/index.js";
import { assertTestDatabase } from "../../scripts/test-database.js";
describe("batas nominal dan pembulatan", () => {
  it("serializer mempertahankan tiga desimal quantity", () =>
    expect(
      serialize({ quantity: quantity("1.125"), amount: money("0.01") }),
    ).toEqual({ quantity: "1.125", amount: "0.01" }));
  it.each([
    "1e3",
    "NaN",
    "Infinity",
    "-1",
    "1.001",
    "10000000000000000",
    "1,00",
    "",
    " 1",
    10,
  ])("menolak %s", (value) => expect(() => money(value)).toThrow());
  it("menghitung expected subtotal independen", () => {
    expect(subtotal("1.125", "10.10").toFixed(2)).toBe("11.36");
    expect(subtotal("0.005", "1").toFixed(2)).toBe("0.01");
    expect(
      totalMoney([subtotal("0.005", "1"), subtotal("0.005", "1")]).toFixed(2),
    ).toBe("0.02");
  });
  it("menjaga sen dan serializer", () => {
    expect(serialize({ amount: money("9999999999999999.99") })).toEqual({
      amount: "9999999999999999.99",
    });
    expect(money("0").toFixed(2)).toBe("0.00");
  });
  it.each(["0", "-1", "1.0001", "100000000000"])(
    "menolak quantity %s",
    (value) => expect(() => quantity(value)).toThrow(),
  );
  it("menolak overflow subtotal dan total", () => {
    expect(() => subtotal("2", "9999999999999999.99")).toThrow();
    expect(() =>
      totalMoney([money("9999999999999999.99"), money("0.01")]),
    ).toThrow();
  });
  it("normalisasi lokal eksplisit", () => {
    expect(normalizeLocalDecimal("310.000,50")).toBe("310000.50");
    expect(() => normalizeLocalDecimal("31.00,50")).toThrow();
  });
});
describe("pengaman database test", () => {
  it("menolak database dev meskipun username/query berbeda", () => {
    expect(() =>
      assertTestDatabase(
        "postgres://b@localhost:5432/app_test?schema=a",
        "postgres://a@localhost:5432/app_test?schema=b",
      ),
    ).toThrow();
  });
  it("menolak database tanpa _test", () =>
    expect(() =>
      assertTestDatabase(
        "postgres://a@localhost/app",
        "postgres://a@localhost/dev",
      ),
    ).toThrow());
  it("menerima DB terpisah", () =>
    expect(
      assertTestDatabase(
        "postgres://a@localhost/app_test",
        "postgres://a@localhost/app",
      ),
    ).toContain("app_test"));
});
