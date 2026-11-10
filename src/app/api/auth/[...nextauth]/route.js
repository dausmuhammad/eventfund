import NextAuthModule from "next-auth";
import { authOptions } from "@/lib/auth/options";
const NextAuth = NextAuthModule.default ?? NextAuthModule;
const handler = NextAuth(authOptions);
export { handler as GET };
export async function POST(request, context) {
  const response = await handler(request, context);
  if (response.headers.get("content-type")?.includes("application/json")) {
    const body = await response.clone().json();
    if (
      body.url &&
      new URL(body.url, process.env.APP_ORIGIN).searchParams.get("error") ===
        "RATE_LIMITED"
    ) {
      return Response.json(body, {
        status: 429,
        headers: { "Retry-After": "900", "Cache-Control": "no-store" },
      });
    }
  }
  return response;
}
