import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { db } from "../../lib/db/client.js";
import { AppError } from "../../lib/validation/errors.js";
import {
  eventSchema,
  editSchema,
  commandSchema,
  metadataData,
  idSchema,
  keySchema,
} from "./schemas.js";
import { assertWritable, transition } from "./lifecycle.js";
import { findCloseBlockers } from "./close-blockers.js";
const missing = () =>
  new AppError(404, "EVENT_NOT_FOUND", "Event tidak ditemukan.");
export function serializeEvent(event) {
  return JSON.parse(JSON.stringify(event));
}
export async function listEvents(user, archived = false, client = db) {
  return client.event.findMany({
    where: { ownerId: user.id, archivedAt: archived ? { not: null } : null },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
  });
}
export async function readEvent(user, id, client = db) {
  if (!idSchema.safeParse(id).success) throw missing();
  const event = await client.event.findFirst({
    where: { id, ownerId: user.id },
  });
  if (!event) throw missing();
  return event;
}
export async function lockEvent(tx, user, id) {
  if (!idSchema.safeParse(id).success) throw missing();
  await tx.$queryRaw`SELECT id FROM events WHERE id=${id}::uuid AND owner_id=${user.id}::uuid FOR UPDATE`;
  const event = await readEvent(user, id, tx);
  await assertActor(tx, user);
  return event;
}
async function assertActor(tx, user) {
  const current = await tx.user.findUnique({
    where: { id: user.id },
    select: { isActive: true, sessionVersion: true },
  });
  if (!current?.isActive || current.sessionVersion !== user.sessionVersion)
    throw new AppError(
      401,
      "SESSION_REVOKED",
      "Sesi berakhir. Silakan masuk kembali.",
    );
}
function stale(event, expectedVersion) {
  if (event.version !== expectedVersion)
    throw new AppError(
      409,
      "STALE_VERSION",
      "Event telah berubah. Muat ulang halaman sebelum menyimpan.",
    );
}
async function audit(tx, user, event, action, before, reason, requestId) {
  await tx.auditLog.create({
    data: {
      eventId: event.id,
      actorId: user.id,
      entityType: "event",
      entityId: event.id,
      action,
      ...(before ? { beforeJson: serializeEvent(before) } : {}),
      afterJson: serializeEvent(event),
      reason: reason || null,
      requestId,
    },
  });
}
async function insertEvent(tx, user, input, requestId, settings, sources = []) {
  await assertActor(tx, user);
  const event = await tx.event.create({
    data: { ...metadataData(input), ownerId: user.id },
  });
  await tx.eventContributionSettings.create({
    data: {
      eventId: event.id,
      updatedBy: user.id,
      defaultAmount: settings?.defaultAmount ?? "0",
      defaultDueDate: settings?.defaultDueDate ?? null,
    },
  });
  await tx.incomeSource.createMany({
    data: [
      { eventId: event.id, name: "Iuran peserta", kind: "CONTRIBUTION" },
      ...sources.map((source) => ({
        eventId: event.id,
        name: source.name,
        kind: "GENERAL",
      })),
    ],
  });
  await audit(tx, user, event, "EVENT_CREATED", null, null, requestId);
  return event;
}
export async function createEvent(
  user,
  raw,
  requestId = randomUUID(),
  client = db,
) {
  const input = eventSchema.parse(raw);
  return client.$transaction((tx) => insertEvent(tx, user, input, requestId));
}
export async function editEvent(
  user,
  id,
  raw,
  requestId = randomUUID(),
  client = db,
) {
  return client.$transaction(async (tx) => {
    const before = await lockEvent(tx, user, id);
    const input = editSchema.parse(raw);
    assertWritable(before);
    stale(before, input.expectedVersion);
    const event = await tx.event.update({
      where: { id },
      data: { ...metadataData(input), version: { increment: 1 } },
    });
    await audit(
      tx,
      user,
      event,
      "EVENT_METADATA_UPDATED",
      before,
      null,
      requestId,
    );
    return event;
  });
}
export async function eventCommand(
  user,
  id,
  raw,
  key,
  requestId = randomUUID(),
  client = db,
) {
  return client.$transaction(async (tx) => {
    const before = await lockEvent(tx, user, id);
    const input = commandSchema.parse(raw);
    keySchema.parse(key);
    const requestHash = createHash("sha256")
      .update(JSON.stringify(input))
      .digest("hex");
    const previous = await tx.idempotencyRecord.findUnique({
      where: { eventId_actorId_key: { eventId: id, actorId: user.id, key } },
    });
    if (previous) {
      if (previous.requestHash !== requestHash)
        throw new AppError(
          409,
          "IDEMPOTENCY_CONFLICT",
          "Kunci sudah digunakan untuk permintaan berbeda.",
        );
      return previous.responseJson;
    }
    stale(before, input.expectedVersion);
    if (["cancel", "complete"].includes(input.command)) {
      const blockers = await findCloseBlockers(tx, before);
      if (blockers.length)
        throw new AppError(
          409,
          "OPEN_WORK",
          "Selesaikan pekerjaan terbuka terlebih dahulu.",
          { blockers },
        );
    }
    const data = transition(before, input);
    const event = await tx.event.update({
      where: { id },
      data: { ...data, version: { increment: 1 } },
    });
    await audit(
      tx,
      user,
      event,
      `EVENT_${input.command.toUpperCase()}`,
      before,
      input.reason,
      requestId,
    );
    const result = serializeEvent(event);
    await tx.idempotencyRecord.create({
      data: {
        eventId: id,
        actorId: user.id,
        key,
        operation: input.command,
        requestHash,
        httpStatus: 200,
        responseJson: result,
      },
    });
    return result;
  });
}
export async function duplicateEvent(
  user,
  id,
  raw,
  requestId = randomUUID(),
  client = db,
) {
  return client.$transaction(async (tx) => {
    await lockEvent(tx, user, id);
    const input = eventSchema.parse(raw);
    const settings = await tx.eventContributionSettings.findUniqueOrThrow({
      where: { eventId: id },
    });
    const sources = await tx.incomeSource.findMany({
      where: { eventId: id, kind: "GENERAL", archivedAt: null },
    });
    return insertEvent(tx, user, input, requestId, settings, sources);
  });
}
