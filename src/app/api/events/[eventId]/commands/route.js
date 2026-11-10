import { eventApi } from "@/features/events/api";
import { eventCommand } from "@/features/events/service";
export async function POST(request, { params }) {
  const { eventId } = await params;
  return eventApi(request, (user, input, requestId) =>
    eventCommand(
      user,
      eventId,
      input,
      request.headers.get("Idempotency-Key"),
      requestId,
    ),
  );
}
