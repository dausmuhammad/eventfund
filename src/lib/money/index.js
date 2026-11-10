import { Prisma } from "@prisma/client";
const Decimal = Prisma.Decimal.clone({
  precision: 48,
  rounding: Prisma.Decimal.ROUND_HALF_UP,
});
const MONEY_MAX = new Decimal("9999999999999999.99");
export function parseDecimal(
  value,
  { scale = 2, positive = false, max = MONEY_MAX } = {},
) {
  if (
    typeof value !== "string" ||
    !new RegExp(`^\\d+(?:\\.\\d{1,${scale}})?$`).test(value) ||
    value.length > 64
  )
    throw new Error("Nominal tidak valid.");
  const decimal = new Decimal(value);
  if (decimal.gt(max) || (positive && decimal.lte(0)))
    throw new Error("Nominal di luar batas.");
  return decimal;
}
export const money = (value) => parseDecimal(value);
export const quantity = (value) =>
  parseDecimal(value, {
    scale: 3,
    positive: true,
    max: new Decimal("99999999999.999"),
  });
export function subtotal(qty, price) {
  const value = quantity(qty)
    .mul(money(price))
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  if (value.gt(MONEY_MAX)) throw new Error("Total melebihi batas.");
  return value;
}
export function totalMoney(values) {
  const total = values.reduce((sum, value) => sum.plus(value), new Decimal(0));
  if (total.gt(MONEY_MAX) || total.lt(0))
    throw new Error("Total di luar batas.");
  return total;
}
export function normalizeLocalDecimal(value, scale = 2) {
  if (
    typeof value !== "string" ||
    !/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d+)?$/.test(value)
  )
    throw new Error("Gunakan format Indonesia, misalnya 310000,50.");
  const canonical = value.replaceAll(".", "").replace(",", ".");
  return parseDecimal(canonical, { scale }).toFixed(scale);
}
export function serialize(value) {
  if (Decimal.isDecimal(value)) return value.toFixed();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, serialize(entry)]),
    );
  return value;
}
