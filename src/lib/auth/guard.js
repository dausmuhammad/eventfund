import "server-only";
import { getServerSession } from "next-auth";
import { db } from "../db/client.js";
import { authOptions } from "./options.js";
import { AppError } from "../validation/errors.js";
export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    throw new AppError(
      401,
      "UNAUTHENTICATED",
      "Silakan masuk terlebih dahulu.",
    );
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      sessionVersion: true,
    },
  });
  if (
    !user?.isActive ||
    user.sessionVersion !== session.sessionVersion ||
    !session.issuedAt ||
    Date.now() - session.issuedAt > 8 * 60 * 60 * 1000
  )
    throw new AppError(
      401,
      "SESSION_REVOKED",
      "Sesi berakhir. Silakan masuk kembali.",
    );
  return user;
}
