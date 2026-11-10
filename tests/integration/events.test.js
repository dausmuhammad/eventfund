import { beforeAll, afterAll, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { db } from "../../src/lib/db/client.js";
import { assertTestDatabase } from "../../scripts/test-database.js";
import {
  createEvent,
  readEvent,
  listEvents,
  editEvent,
  duplicateEvent,
  eventCommand,
  lockEvent,
} from "../../src/features/events/service.js";
assertTestDatabase(process.env.DATABASE_URL);
let owner, outsider;
beforeAll(async () => {
  owner = await db.user.create({
    data: {
      email: `${randomUUID()}@example.com`,
      name: "Owner",
      passwordHash: "test-only",
    },
  });
  outsider = await db.user.create({
    data: {
      email: `${randomUUID()}@example.com`,
      name: "Other",
      passwordHash: "test-only",
    },
  });
});
afterAll(async () => {
  await db.$disconnect();
});
it("creates defaults atomically and refuses cross-owner reads and writes", async () => {
  const event = await createEvent(owner, {
    name: "Ownership",
    ownerId: outsider.id,
  });
  expect(event.ownerId).toBe(owner.id);
  expect(event.status).toBe("DRAFT");
  expect(
    (
      await db.eventContributionSettings.findUnique({
        where: { eventId: event.id },
      })
    ).defaultAmount.toFixed(2),
  ).toBe("0.00");
  expect(
    await db.incomeSource.count({
      where: { eventId: event.id, kind: "CONTRIBUTION" },
    }),
  ).toBe(1);
  expect(await listEvents(outsider)).toEqual([]);
  for (const operation of [
    () => readEvent(outsider, event.id),
    () => editEvent(outsider, event.id, {}),
    () => duplicateEvent(outsider, event.id, {}),
    () => eventCommand(outsider, event.id, {}, randomUUID()),
  ])
    await expect(operation()).rejects.toMatchObject({ status: 404 });
  const updated = await editEvent(owner, event.id, {
    name: "Updated",
    expectedVersion: 1,
    ownerId: outsider.id,
  });
  expect(updated.ownerId).toBe(owner.id);
  await expect(
    editEvent(owner, event.id, { name: "Stale", expectedVersion: 1 }),
  ).rejects.toMatchObject({ status: 409 });
  await expect(
    editEvent(owner, event.id, {
      name: "Bad dates",
      expectedVersion: 2,
      startDate: "2026-12-02",
      endDate: "2026-12-01",
    }),
  ).rejects.toThrow();
  const duplicate = await duplicateEvent(owner, event.id, { name: "Copy" });
  expect(duplicate.id).not.toBe(event.id);
  expect(duplicate.status).toBe("DRAFT");
  expect(
    await db.incomeSource.count({
      where: { eventId: duplicate.id, kind: "CONTRIBUTION" },
    }),
  ).toBe(1);
});
it("rolls back insert when failure occurs after event insert", async () => {
  const name = randomUUID();
  const failingClient = {
    $transaction: (callback) =>
      db.$transaction((tx) =>
        callback(
          new Proxy(tx, {
            get(target, property) {
              if (property === "eventContributionSettings")
                return {
                  create() {
                    throw new Error("Injected failure");
                  },
                };
              return target[property];
            },
          }),
        ),
      ),
  };
  await expect(
    createEvent(owner, { name }, undefined, failingClient),
  ).rejects.toThrow("Injected failure");
  expect(await db.event.count({ where: { name } })).toBe(0);
});
it("replays immutable response after archive and detects key conflicts", async () => {
  const event = await createEvent(owner, { name: "Lifecycle" });
  const input = {
    command: "cancel",
    reason: "Tidak jadi dilaksanakan",
    acknowledged: true,
    expectedVersion: 1,
  };
  const key = randomUUID();
  const [result, simultaneousReplay] = await Promise.all([
    eventCommand(owner, event.id, input, key),
    eventCommand(owner, event.id, input, key),
  ]);
  expect(simultaneousReplay).toEqual(result);
  await eventCommand(
    owner,
    event.id,
    { command: "archive", expectedVersion: 2 },
    randomUUID(),
  );
  expect(await eventCommand(owner, event.id, input, key)).toEqual(result);
  await expect(
    eventCommand(owner, event.id, { ...input, reason: "Alasan lain" }, key),
  ).rejects.toMatchObject({ status: 409 });
  expect(await db.auditLog.count({ where: { eventId: event.id } })).toBe(3);
  await expect(
    db.auditLog.updateMany({
      where: { eventId: event.id },
      data: { reason: "overwrite" },
    }),
  ).rejects.toThrow();
  await eventCommand(
    owner,
    event.id,
    { command: "unarchive", expectedVersion: 3 },
    randomUUID(),
  );
  await expect(
    eventCommand(
      owner,
      event.id,
      { command: "reopen", expectedVersion: 4, reason: "Mau dibuka" },
      randomUUID(),
    ),
  ).rejects.toMatchObject({ status: 409 });
});
it("serializes two overlapping transactions and reads committed version", async () => {
  const event = await createEvent(owner, { name: "Lock" });
  let release, entered;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const ready = new Promise((resolve) => {
    entered = resolve;
  });
  const first = db.$transaction(async (tx) => {
    await lockEvent(tx, owner, event.id);
    entered();
    await gate;
    await tx.event.update({
      where: { id: event.id },
      data: { version: { increment: 1 } },
    });
  });
  await ready;
  let secondEntered;
  const secondReady = new Promise((resolve) => {
    secondEntered = resolve;
  });
  const second = db.$transaction(async (tx) => {
    const [{ pid }] = await tx.$queryRaw`SELECT pg_backend_pid() AS pid`;
    secondEntered(pid);
    return lockEvent(tx, owner, event.id);
  });
  const pid = await secondReady;
  try {
    let waiting = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      const [state] =
        await db.$queryRaw`SELECT wait_event_type FROM pg_stat_activity WHERE pid=${pid}`;
      if (state?.wait_event_type === "Lock") {
        waiting = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    expect(waiting).toBe(true);
  } finally {
    release();
  }
  await first;
  expect((await second).version).toBe(2);
});
it("uses explicit planned/completed fixtures without a production baseline bypass", async () => {
  const event = await createEvent(owner, { name: "Lifecycle fixtures" });
  await db.event.update({
    where: { id: event.id },
    data: { status: "PLANNED", currentRevisionNo: 1 },
  });
  const active = await eventCommand(
    owner,
    event.id,
    { command: "activate", expectedVersion: 1 },
    randomUUID(),
  );
  expect(active.status).toBe("ACTIVE");
  await expect(
    eventCommand(
      owner,
      event.id,
      { command: "complete", expectedVersion: 2 },
      randomUUID(),
    ),
  ).rejects.toMatchObject({ code: "CLOSE_NOT_AVAILABLE" });
  await db.event.update({
    where: { id: event.id },
    data: { status: "COMPLETED", completedAt: new Date() },
  });
  await expect(
    eventCommand(
      owner,
      event.id,
      { command: "reopen", expectedVersion: 2 },
      randomUUID(),
    ),
  ).rejects.toThrow();
  const reopened = await eventCommand(
    owner,
    event.id,
    { command: "reopen", expectedVersion: 2, reason: "Koreksi administrasi" },
    randomUUID(),
  );
  expect(reopened.status).toBe("ACTIVE");
  expect(reopened.completedAt).toBeNull();
  await db.user.update({
    where: { id: owner.id },
    data: { sessionVersion: { increment: 1 } },
  });
  await expect(
    editEvent(owner, event.id, { name: "Revoked", expectedVersion: 3 }),
  ).rejects.toMatchObject({ status: 401 });
  await db.user.update({
    where: { id: owner.id },
    data: { sessionVersion: owner.sessionVersion },
  });
});
