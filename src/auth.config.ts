import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe slice of the auth config (callbacks only).
 * The Prisma adapter and Node-only providers live in `src/auth.ts`.
 *
 * Session strategy is JWT because the Credentials provider can only write
 * JWT sessions — DB sessions and Credentials are mutually exclusive in
 * Auth.js v5. The token still encodes the user's DB id so we can scope
 * every query by it.
 */
export const authConfig = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
    verifyRequest: "/sign-in?verify=1",
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const isPublic =
        pathname.startsWith("/sign-in") ||
        pathname.startsWith("/sign-up") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/_next") ||
        pathname === "/favicon.ico";
      if (isPublic) return true;
      return isLoggedIn;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.email = (token.email as string) ?? session.user.email;
        session.user.name = (token.name as string | null | undefined) ?? session.user.name;
        session.user.image = (token.picture as string | null | undefined) ?? session.user.image;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
