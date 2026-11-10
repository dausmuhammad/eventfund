import { randomUUID } from "node:crypto";
import { ZodError } from "zod";
export class AppError extends Error {
  constructor(status, code, message, details = {}) {
    super(message);
    Object.assign(this, { status, code, details });
  }
}
export function errorResponse(error, requestId = randomUUID()) {
  const validation = error instanceof ZodError;
  const status = validation
    ? 422
    : error instanceof AppError
      ? error.status
      : 500;
  const headers = { "Cache-Control": "no-store", "X-Request-Id": requestId };
  if (status === 429) headers["Retry-After"] = String(error.details.retryAfter);
  return Response.json(
    {
      error: {
        code: validation
          ? "VALIDATION_FAILED"
          : (error.code ?? "INTERNAL_ERROR"),
        message: validation
          ? "Periksa kembali isian Anda."
          : status === 500
            ? "Terjadi kendala. Coba lagi."
            : error.message,
        fields: validation ? error.flatten().fieldErrors : {},
        details: error instanceof AppError ? error.details : {},
      },
      requestId,
    },
    { status, headers },
  );
}
