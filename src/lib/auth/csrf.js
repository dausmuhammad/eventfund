import "server-only";
import { randomBytes, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { AppError } from "../validation/errors.js";
import { getServerSession } from "next-auth";
import { authOptions } from "./options.js";
const cookieName = "eventfund-csrf";
export async function csrfIdentity() {
  const session = await getServerSession(authOptions);
  return session?.user?.id
    ? `${session.user.id}:${session.sessionVersion}`
    : "anonymous";
}
function signature(nonce, identity) {
  return createHmac("sha256", process.env.AUTH_SECRET)
    .update(`${nonce}:${identity}`)
    .digest("hex");
}
export async function issueCsrf(identity) {
  const nonce = randomBytes(32).toString("hex");
  const token = `${nonce}.${signature(nonce, identity)}`;
  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: new URL(process.env.APP_ORIGIN).protocol === "https:",
    path: "/",
    maxAge: 3600,
  });
  return token;
}
export async function assertCsrf(request, identity) {
  const token = request.headers.get("x-csrf-token") ?? "";
  const cookie = (await cookies()).get(cookieName)?.value;
  const [nonce, hash] = token.split(".");
  const expected = nonce ? signature(nonce, identity) : "";
  if (
    !/^[a-f0-9]{64}\.[a-f0-9]{64}$/.test(token) ||
    request.headers.get("origin") !== process.env.APP_ORIGIN ||
    !cookie ||
    token !== cookie ||
    !hash ||
    hash.length !== expected.length ||
    !timingSafeEqual(Buffer.from(hash), Buffer.from(expected))
  )
    throw new AppError(
      403,
      "CSRF_FAILED",
      "Muat ulang halaman sebelum mencoba lagi.",
    );
}
