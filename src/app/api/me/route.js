import { requireUser } from "@/lib/auth/guard";
import { errorResponse } from "@/lib/validation/errors";
export async function GET() {
  try {
    const user = await requireUser();
    return Response.json(
      { data: { id: user.id, name: user.name, email: user.email } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
