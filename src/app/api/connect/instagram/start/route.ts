import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateOAuthState, setOAuthCookies } from "@/lib/oauth-state";

/**
 * Begin Instagram (Meta Graph) OAuth via "Login for Business" / "Instagram with Facebook Login".
 * Docs: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login
 *
 * Required env: META_APP_ID, META_REDIRECT_URI
 * Your Instagram account must be a Business or Creator account, linked to a
 * Facebook Page, and your Meta App must include the "instagram_business_basic"
 * (and ideally "instagram_business_manage_insights") permissions. See CONNECTIONS.md.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.redirect(new URL("/sign-in", process.env.AUTH_URL));

  const appId = process.env.META_APP_ID;
  const redirectUri = process.env.META_REDIRECT_URI;
  if (!appId || !redirectUri) {
    return NextResponse.redirect(
      new URL("/settings?connect_error=instagram_not_configured", process.env.AUTH_URL),
    );
  }

  const oauth = generateOAuthState();
  setOAuthCookies("instagram", oauth);

  const scopes = [
    "instagram_business_basic",
    "instagram_business_manage_insights",
    "instagram_business_content_publish",
  ].join(",");

  const url = new URL("https://www.instagram.com/oauth/authorize");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", scopes);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", oauth.state);

  return NextResponse.redirect(url);
}
