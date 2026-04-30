import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { encryptToken } from "@/lib/crypto";
import { readAndClearOAuthCookies } from "@/lib/oauth-state";

/**
 * Handle Instagram OAuth redirect.
 * Steps:
 *   1. Exchange short-lived code → short-lived access token (~1h)
 *   2. Exchange short-lived → long-lived token (~60d)
 *   3. Fetch the IG business account profile
 */
export async function GET(req: NextRequest) {
  const base = new URL(process.env.AUTH_URL ?? "http://localhost:3000");
  const session = await auth();
  if (!session?.user?.id) return NextResponse.redirect(new URL("/sign-in", base));

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error_description") ?? url.searchParams.get("error");
  if (errorParam) return NextResponse.redirect(new URL(`/settings?connect_error=${encodeURIComponent(errorParam)}`, base));
  if (!code || !state) return NextResponse.redirect(new URL("/settings?connect_error=missing_code", base));

  const cookies = readAndClearOAuthCookies("instagram");
  if (cookies.state !== state) return NextResponse.redirect(new URL("/settings?connect_error=state_mismatch", base));

  const appId = process.env.META_APP_ID!;
  const appSecret = process.env.META_APP_SECRET!;
  const redirectUri = process.env.META_REDIRECT_URI!;

  // 1. short-lived token
  const shortRes = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    }),
  });
  const shortJson = (await shortRes.json()) as { access_token?: string; user_id?: string | number; error_message?: string };
  if (!shortJson.access_token || !shortJson.user_id) {
    return NextResponse.redirect(
      new URL(`/settings?connect_error=${encodeURIComponent(shortJson.error_message ?? "ig_token_failed")}`, base),
    );
  }

  // 2. long-lived token
  const longRes = await fetch(
    `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortJson.access_token}`,
  );
  const longJson = (await longRes.json()) as { access_token?: string; expires_in?: number };
  const accessToken = longJson.access_token ?? shortJson.access_token;
  const expiresIn = longJson.expires_in ?? 3600;

  // 3. profile
  const profileRes = await fetch(
    `https://graph.instagram.com/v21.0/me?fields=id,username,name,profile_picture_url,followers_count,media_count&access_token=${accessToken}`,
  );
  const profile = (await profileRes.json()) as {
    id?: string; username?: string; name?: string;
    profile_picture_url?: string; followers_count?: number; media_count?: number;
  };

  await prisma.platformConnection.upsert({
    where: { userId_platform: { userId: session.user.id, platform: "INSTAGRAM" } },
    update: {
      externalId: profile.id ?? String(shortJson.user_id),
      externalHandle: profile.username ?? null,
      externalName: profile.name ?? null,
      externalAvatar: profile.profile_picture_url ?? null,
      accessToken: encryptToken(accessToken),
      expiresAt: Math.floor(Date.now() / 1000) + expiresIn,
      followerCount: profile.followers_count ?? null,
      postCount: profile.media_count ?? null,
      lastSyncedAt: new Date(),
      syncError: null,
    },
    create: {
      userId: session.user.id,
      platform: "INSTAGRAM",
      externalId: profile.id ?? String(shortJson.user_id),
      externalHandle: profile.username ?? null,
      externalName: profile.name ?? null,
      externalAvatar: profile.profile_picture_url ?? null,
      accessToken: encryptToken(accessToken),
      expiresAt: Math.floor(Date.now() / 1000) + expiresIn,
      followerCount: profile.followers_count ?? null,
      postCount: profile.media_count ?? null,
      lastSyncedAt: new Date(),
    },
  });

  return NextResponse.redirect(new URL("/settings?connected=instagram#connections", base));
}
