import { z } from "zod";
const date = z
  .union([
    z.iso.date({ error: "Gunakan tanggal kalender yang valid." }),
    z.literal(""),
  ])
  .optional()
  .nullable();
export const eventSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Nama event wajib diisi.")
      .max(200, "Nama event maksimal 200 karakter."),
    description: z
      .string()
      .trim()
      .max(4000, "Deskripsi maksimal 4.000 karakter.")
      .optional()
      .nullable(),
    location: z
      .string()
      .trim()
      .max(250, "Lokasi maksimal 250 karakter.")
      .optional()
      .nullable(),
    startDate: date,
    endDate: date,
  })
  .refine(
    (value) =>
      !value.startDate || !value.endDate || value.endDate >= value.startDate,
    {
      path: ["endDate"],
      message: "Tanggal selesai tidak boleh sebelum tanggal mulai.",
    },
  );
export const editSchema = eventSchema.safeExtend({
  expectedVersion: z.number().int().positive(),
});
export const commandSchema = z
  .object({
    command: z.enum([
      "activate",
      "complete",
      "cancel",
      "reopen",
      "archive",
      "unarchive",
    ]),
    expectedVersion: z.number().int().positive(),
    reason: z
      .string()
      .trim()
      .max(1000, "Alasan maksimal 1.000 karakter.")
      .default(""),
    acknowledged: z.boolean().default(false),
  })
  .superRefine((value, context) => {
    if (["cancel", "reopen"].includes(value.command) && value.reason.length < 5)
      context.addIssue({
        code: "custom",
        path: ["reason"],
        message: "Isi alasan minimal 5 karakter.",
      });
    if (value.command === "cancel" && !value.acknowledged)
      context.addIssue({
        code: "custom",
        path: ["acknowledged"],
        message: "Konfirmasi bahwa histori event akan dipertahankan.",
      });
  });
export const idSchema = z.uuid();
export const keySchema = z.string().regex(/^[A-Za-z0-9_-]{8,100}$/);
export function metadataData(input) {
  return {
    name: input.name,
    description: input.description || null,
    location: input.location || null,
    startDate: input.startDate
      ? new Date(`${input.startDate}T00:00:00Z`)
      : null,
    endDate: input.endDate ? new Date(`${input.endDate}T00:00:00Z`) : null,
  };
}
