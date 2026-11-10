import { it, expect } from "vitest";
import { eventSchema } from "../../src/features/events/schemas.js";
import {
  transition,
  assertWritable,
} from "../../src/features/events/lifecycle.js";
it("validates calendar dates, lengths and ordering", () => {
  for (const value of [
    { name: " " },
    { name: "a", startDate: "2026-02-30" },
    { name: "a", startDate: "2026-11-12", endDate: "2026-11-11" },
    { name: "x".repeat(201) },
  ])
    expect(eventSchema.safeParse(value).success).toBe(false);
  expect(eventSchema.parse({ name: " Acara ", ownerId: "ignored" })).toEqual({
    name: "Acara",
  });
});
it("enforces lifecycle matrix including baseline bypass and terminal states", () => {
  const states = ["DRAFT", "PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"];
  for (const status of states) {
    const event = { status, archivedAt: null };
    for (const command of [
      "activate",
      "reopen",
      "archive",
      "cancel",
      "complete",
      "planned",
    ]) {
      const input = { command, reason: "Alasan lengkap", acknowledged: true };
      const allowed =
        (command === "activate" && status === "PLANNED") ||
        (command === "reopen" && status === "COMPLETED") ||
        (command === "archive" &&
          ["COMPLETED", "CANCELLED"].includes(status)) ||
        (command === "cancel" &&
          ["DRAFT", "PLANNED", "ACTIVE"].includes(status));
      if (allowed) expect(transition(event, input)).toBeTruthy();
      else expect(() => transition(event, input)).toThrow();
    }
    expect(() =>
      assertWritable({ ...event, archivedAt: new Date() }),
    ).toThrow();
  }
  expect(
    transition(
      { status: "COMPLETED", archivedAt: new Date() },
      { command: "unarchive" },
    ),
  ).toEqual({ archivedAt: null });
});
