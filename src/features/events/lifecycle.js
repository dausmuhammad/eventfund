import { AppError } from "../../lib/validation/errors.js";
export function assertWritable(event) {
  if (event.archivedAt || ["COMPLETED", "CANCELLED"].includes(event.status))
    throw new AppError(
      409,
      "EVENT_READ_ONLY",
      "Event sudah ditutup atau diarsipkan.",
    );
}
export function transition(event, input) {
  const fail = () => {
    throw new AppError(
      409,
      "INVALID_TRANSITION",
      "Perubahan status tidak tersedia untuk kondisi event ini.",
    );
  };
  const { command, reason, acknowledged } = input;
  if (command === "unarchive") {
    if (!event.archivedAt) fail();
    return { archivedAt: null };
  }
  if (event.archivedAt) fail();
  if (command === "archive") {
    if (!["COMPLETED", "CANCELLED"].includes(event.status)) fail();
    return { archivedAt: new Date() };
  }
  if (command === "reopen") {
    if (event.status !== "COMPLETED") fail();
    if (reason.length < 5)
      throw new AppError(
        422,
        "REASON_REQUIRED",
        "Isi alasan minimal 5 karakter.",
      );
    return { status: "ACTIVE", completedAt: null };
  }
  assertWritable(event);
  if (command === "activate" && event.status === "PLANNED")
    return { status: "ACTIVE" };
  if (command === "complete") {
    if (!["PLANNED", "ACTIVE"].includes(event.status)) fail();
    throw new AppError(
      409,
      "CLOSE_NOT_AVAILABLE",
      "Penutupan event tersedia setelah pemeriksaan kas dan tagihan pada Phase 05.",
    );
  }
  if (command === "cancel") {
    if (reason.length < 5 || !acknowledged)
      throw new AppError(
        422,
        "CONFIRMATION_REQUIRED",
        "Isi alasan minimal 5 karakter dan konfirmasi penyimpanan histori.",
      );
    return { status: "CANCELLED", cancelledAt: new Date() };
  }
  fail();
}
