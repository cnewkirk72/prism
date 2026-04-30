import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateOAuthState, setOAuthCookies } from "@/lib/oauth-state";

/**
 * Begin TikTok Login Kit OAuth.
 * Docs: https://developers.tiktok.com/doc/login-kit-web
 *
 * Required env: TIKTOK_CLIENT_KEY, TIKTOK_REDIRECT_URI
 * The redirect URI MUST match a redirect URI registered with your TikTok app
 * in https://developers.tiktok.com/apps. See CONNECTIONS.md.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.redirect(new URL("/sign-in", process.env.AUTH_URL));

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;
  if (!clientKey || !redirectUri) {
    return NextResponse.redirect(
      new URL("/settings?connect_error=tiktok_not_configured", process.env.AUTH_URL),
    );
  }

  const oauth = generateOAuthState();
  setOAuthCookies("tiktok", oauth);

  // Scopes for read-only Display API access. Adjust to your needs.
  const scopes = ["user.info.basic", "user.info.profile", "user.info.stats", "video.list"].join(",");

  const url = new URL("https://www.tiktok.com/v2/auth/authorize/");
  url.searchParams.set("client_key", clientKey);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", scopes);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", oauth.state);
  // PKCE
  url.searchParams.set("code_challenge", oauth.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");

  return NextResponse.redirect(url);
}
