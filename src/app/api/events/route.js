import { eventApi } from "@/features/events/api";
import { createEvent, listEvents } from "@/features/events/service";
export async function GET(request) {
  return eventApi(request, (user) =>
    listEvents(
      user,
      new URL(request.url).searchParams.get("archived") === "true",
    ),
  );
}
export async function POST(request) {
  return eventApi(
    request,
    (user, input, requestId) => createEvent(user, input, requestId),
    201,
  );
}
