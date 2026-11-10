import { eventApi } from "@/features/events/api";
import { duplicateEvent } from "@/features/events/service";
export async function POST(request, { params }) {
  const { eventId } = await params;
  return eventApi(
    request,
    (user, input, requestId) => duplicateEvent(user, eventId, input, requestId),
    201,
  );
}
