import "server-only";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyCredentials } from "./service.js";
import { db } from "../db/client.js";
const Credentials = CredentialsProvider.default ?? CredentialsProvider;
export const authOptions = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    Credentials({
      name: "Email dan kata sandi",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        try {
          return await verifyCredentials({
            email: credentials?.email,
            password: credentials?.password,
          });
        } catch (error) {
          if (error.status === 429) throw new Error("RATE_LIMITED");
          throw new Error("AUTH_UNAVAILABLE");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.sessionVersion = user.sessionVersion;
        token.issuedAt = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      const current = token.userId
        ? await db.user.findUnique({
            where: { id: token.userId },
            select: { isActive: true, sessionVersion: true },
          })
        : null;
      if (
        !current?.isActive ||
        current.sessionVersion !== token.sessionVersion ||
        !token.issuedAt ||
        Date.now() - token.issuedAt > 8 * 60 * 60 * 1000
      )
        return null;
      session.user.id = token.userId;
      session.sessionVersion = token.sessionVersion;
      session.issuedAt = token.issuedAt;
      return session;
    },
  },
  logger: {
    error() {
      console.error("AUTH_ERROR");
    },
    warn() {},
    debug() {},
  },
};
