import { AppError } from "./errors.js";
export async function readJson(request, limit = 4096) {
  const reader = request.body?.getReader();
  if (!reader)
    throw new AppError(400, "MALFORMED_REQUEST", "Isian wajib diisi.");
  const chunks = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw new AppError(413, "MALFORMED_REQUEST", "Isian terlalu besar.");
    }
    chunks.push(Buffer.from(value));
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new AppError(
      400,
      "MALFORMED_REQUEST",
      "Format permintaan tidak valid.",
    );
  }
}
