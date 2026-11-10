export function GET() {
  return Response.json(
    { data: { status: "ok", phase: "foundation" } },
    { headers: { "Cache-Control": "no-store" } },
  );
}
