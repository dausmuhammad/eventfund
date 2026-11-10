import { z } from "zod";
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Gunakan alamat email yang valid.")
  .max(254, "Email maksimal 254 karakter.");
export const loginSchema = z
  .object({
    email: emailSchema,
    password: z
      .string()
      .min(12, "Kata sandi minimal 12 karakter.")
      .max(128, "Kata sandi maksimal 128 karakter."),
  })
  .strict();
export const registrationSchema = loginSchema
  .extend({
    name: z
      .string()
      .trim()
      .min(1, "Nama wajib diisi.")
      .max(120, "Nama maksimal 120 karakter."),
  })
  .strict();
export const registrationFormSchema = registrationSchema
  .safeExtend({ confirmPassword: registrationSchema.shape.password })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi kata sandi belum cocok.",
  });
