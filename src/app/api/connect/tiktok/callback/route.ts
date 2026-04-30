import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { encryptToken } from "@/lib/crypto";
import { readAndClearOAuthCookies } from "@/lib/oauth-state";

/**
 * Handle TikTok Login Kit redirect.
 * Exchanges `code` for an access/refresh token, fetches the user's profile,
 * and upserts a PlatformConnection row.
 */
export async function GET(req: NextRequest) {
  const base = new URL(process.env.AUTH_URL ?? "http://localhost:3000");
  const session = await auth();
  if (!session?.user?.id) return NextResponse.redirect(new URL("/sign-in", base));

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error") ?? url.searchParams.get("error_description");

  if (errorParam) {
    return NextResponse.redirect(new URL(`/settings?connect_error=${encodeURIComponent(errorParam)}`, base));
  }
  if (!code || !state) {
    return NextResponse.redirect(new URL("/settings?connect_error=missing_code", base));
  }
  const cookies = readAndClearOAuthCookies("tiktok");
  if (cookies.state !== state || !cookies.verifier) {
    return NextResponse.redirect(new URL("/settings?connect_error=state_mismatch", base));
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY!;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET!;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI!;

  // Exchange code → token
  const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code_verifier: cookies.verifier,
    }),
  });
  const tokenJson = (await tokenRes.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    open_id?: string;
    scope?: string;
    error?: string;
    error_description?: string;
  };
  if (!tokenJson.access_token || !tokenJson.open_id) {
    return NextResponse.redirect(
      new URL(`/settings?connect_error=${encodeURIComponent(tokenJson.error_description ?? "token_exchange_failed")}`, base),
    );
  }

  // Fetch profile + stats
  const profileRes = await fetch(
    "https://open.tiktokapis.com/v2/user/info/?fields=open_id,username,display_name,avatar_url,follower_count,video_count",
    { headers: { Authorization: `Bearer ${tokenJson.access_token}` } },
  );
  const profile = (await profileRes.json()) as {
    data?: { user?: { open_id: string; username?: string; display_name?: string; avatar_url?: string; follower_count?: number; video_count?: number } };
  };
  const u = profile.data?.user;

  await prisma.platformConnection.upsert({
    where: { userId_platform: { userId: session.user.id, platform: "TIKTOK" } },
    update: {
      externalId: tokenJson.open_id,
      externalHandle: u?.username ?? null,
      externalName: u?.display_name ?? null,
      externalAvatar: u?.avatar_url ?? null,
      accessToken: encryptToken(tokenJson.access_token),
      refreshToken: tokenJson.refresh_token ? encryptToken(tokenJson.refresh_token) : null,
      expiresAt: tokenJson.expires_in ? Math.floor(Date.now() / 1000) + tokenJson.expires_in : null,
      scope: tokenJson.scope ?? null,
      followerCount: u?.follower_count ?? null,
      postCount: u?.video_count ?? null,
      lastSyncedAt: new Date(),
      syncError: null,
    },
    create: {
      userId: session.user.id,
      platform: "TIKTOK",
      externalId: tokenJson.open_id,
      externalHandle: u?.username ?? null,
      externalName: u?.display_name ?? null,
      externalAvatar: u?.avatar_url ?? null,
      accessToken: encryptToken(tokenJson.access_token),
      refreshToken: tokenJson.refresh_token ? encryptToken(tokenJson.refresh_token) : null,
      expiresAt: tokenJson.expires_in ? Math.floor(Date.now() / 1000) + tokenJson.expires_in : null,
      scope: tokenJson.scope ?? null,
      followerCount: u?.follower_count ?? null,
      postCount: u?.video_count ?? null,
      lastSyncedAt: new Date(),
    },
  });

  return NextResponse.redirect(new URL("/settings?connected=tiktok#connections", base));
}
