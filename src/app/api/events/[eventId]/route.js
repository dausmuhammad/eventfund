import { eventApi } from "@/features/events/api";
import { readEvent, editEvent } from "@/features/events/service";
export async function GET(request, { params }) {
  const { eventId } = await params;
  return eventApi(request, (user) => readEvent(user, eventId));
}
export async function PATCH(request, { params }) {
  const { eventId } = await params;
  return eventApi(request, (user, input, requestId) =>
    editEvent(user, eventId, input, requestId),
  );
}
