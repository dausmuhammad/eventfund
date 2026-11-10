import { randomUUID } from "node:crypto";
import { assertCsrf, csrfIdentity } from "@/lib/auth/csrf";
import { registerAccount } from "@/lib/auth/service";
import { errorResponse } from "@/lib/validation/errors";
import { readJson } from "@/lib/validation/json";
export async function POST(request) {
  const requestId = randomUUID();
  try {
    await assertCsrf(request, await csrfIdentity());
    const input = await readJson(request);
    const data = await registerAccount(input);
    return Response.json(
      { data, meta: { requestId } },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error, requestId);
  }
}
