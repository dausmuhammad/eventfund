import { randomUUID } from "node:crypto";
import { requireUser } from "../../lib/auth/guard.js";
import { assertCsrf, csrfIdentity } from "../../lib/auth/csrf.js";
import { readJson } from "../../lib/validation/json.js";
import { errorResponse } from "../../lib/validation/errors.js";
export async function eventApi(request, action, status = 200) {
  const requestId = randomUUID();
  try {
    const user = await requireUser();
    if (request.method !== "GET")
      await assertCsrf(request, await csrfIdentity());
    const input =
      request.method === "GET" ? null : await readJson(request, 32768);
    return Response.json(
      { data: await action(user, input, requestId), meta: { requestId } },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error, requestId);
  }
}
