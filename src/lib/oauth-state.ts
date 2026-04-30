import { cookies } from "next/headers";
import { randomBytes, createHash } from "node:crypto";

/**
 * Tiny CSRF state-cookie helper for OAuth flows.
 * - Generates a random state value stored in an httpOnly cookie.
 * - Pairs it with a PKCE code_verifier where the platform supports it.
 *
 * Cookie names are scoped per platform so two flows can be in flight at once.
 */

export type OAuthState = { state: string; codeVerifier: string; codeChallenge: string };

export function generateOAuthState(): OAuthState {
  const state = randomBytes(24).toString("base64url");
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
  return { state, codeVerifier, codeChallenge };
}

export function setOAuthCookies(platform: "tiktok" | "instagram", s: OAuthState) {
  const c = cookies();
  c.set(`prism_oauth_${platform}_state`, s.state, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 600 });
  c.set(`prism_oauth_${platform}_verifier`, s.codeVerifier, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 600 });
}

export function readAndClearOAuthCookies(platform: "tiktok" | "instagram") {
  const c = cookies();
  const state = c.get(`prism_oauth_${platform}_state`)?.value ?? null;
  const verifier = c.get(`prism_oauth_${platform}_verifier`)?.value ?? null;
  c.delete(`prism_oauth_${platform}_state`);
  c.delete(`prism_oauth_${platform}_verifier`);
  return { state, verifier };
}
