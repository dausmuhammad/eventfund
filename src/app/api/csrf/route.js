import { issueCsrf, csrfIdentity } from "@/lib/auth/csrf";
import { errorResponse } from "@/lib/validation/errors";
export async function GET() {
  try {
    const identity = await csrfIdentity();
    return Response.json(
      { data: { token: await issueCsrf(identity) } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
