export const closeChecksComplete = false;
export const closeBlockerChecks = [];
export async function findCloseBlockers(tx, event) {
  return (
    await Promise.all(closeBlockerChecks.map((check) => check(tx, event)))
  ).flat();
}
