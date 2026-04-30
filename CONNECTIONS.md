# Platform connections — TikTok & Instagram

Prism's connection flow uses the platforms' real OAuth APIs. Both require an approved developer app, which is a manual setup you do once. This guide walks you through it.

> Status: code is wired up, environment slots exist in `.env.example`. You'll get a "not configured" toast in Settings → Connections until the env vars are filled in.

---

## TikTok for Developers (Login Kit + Display API)

### 1. Create a TikTok app

Visit https://developers.tiktok.com/apps and click **Create an app**. Fill in:

- **App name**: Prism (or whatever)
- **Description**: "Personal content analytics dashboard for creators"
- **Category**: Tools

### 2. Add the products you need

In your app's dashboard, click **Add products** and add:

- **Login Kit** — the OAuth surface itself
- **Display API** — read-only access to user info and videos

### 3. Configure the redirect URI

Under **Login Kit → Configuration**, add the exact redirect URI:

```
http://localhost:3000/api/connect/tiktok/callback
```

When you deploy, add your production URL too — e.g. `https://prism.yourdomain.com/api/connect/tiktok/callback`.

### 4. Set scopes

Request these scopes (each must be approved by TikTok):

- `user.info.basic` — username, display name, avatar
- `user.info.profile` — bio, link
- `user.info.stats` — follower / following / video counts
- `video.list` — your own video metadata (views, likes, comments, shares)

### 5. Submit for review

Most scopes are gated. Click **Submit for review** with a clear description of how Prism uses each scope (it's analytics for the user's own content). Approval usually takes 1–4 weeks.

### 6. Copy your credentials

From the app's **Basic info** page:

```env
TIKTOK_CLIENT_KEY="awxxxxxxxxxxxxxx"
TIKTOK_CLIENT_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TIKTOK_REDIRECT_URI="http://localhost:3000/api/connect/tiktok/callback"
```

That's it — restart `next dev` and the TikTok button in Settings → Connections will work.

---

## Instagram (via Meta Developer Platform)

> Important: only **Instagram Business** and **Instagram Creator** accounts can use the Graph API. Personal accounts cannot read insights. The user must convert in the IG mobile app first.

### 1. Create a Meta app

Go to https://developers.facebook.com/apps and click **Create app**. Choose:

- **Use case**: "Other" → **Business**
- **App name**: Prism

### 2. Add the Instagram product

In the app dashboard, click **Add product** → **Instagram → API setup with Instagram Login**.

### 3. Configure the redirect URI

Under **Instagram → API setup with Instagram Login → Business login settings → OAuth Redirect URIs**, add:

```
http://localhost:3000/api/connect/instagram/callback
```

(Plus your production URL when you deploy.)

### 4. Permissions to request

```
instagram_business_basic
instagram_business_manage_insights
instagram_business_content_publish
```

### 5. App review

Like TikTok, public access requires Meta to review your app. While in **Development mode**, you can test with up to 25 invited users (you and a few testers added under **App Roles → Roles → Add People**). You only need full review if you want any IG account in the world to be able to connect.

### 6. Copy your credentials

From **App settings → Basic**:

```env
META_APP_ID="123456789012345"
META_APP_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
META_REDIRECT_URI="http://localhost:3000/api/connect/instagram/callback"
```

---

## Token storage

Both access and refresh tokens are encrypted at rest with AES-256-GCM, keyed by `PRISM_TOKEN_KEY` (a random 64-hex-char string in `.env`). Generate one with:

```bash
openssl rand -hex 32
```

If you rotate the key, every existing connection's token becomes undecryptable — users will need to re-auth (the UI marks them "Token expired").

## What happens during a connect

1. User clicks "Connect TikTok" / "Connect Instagram" in Settings.
2. We generate a random `state` + PKCE `code_verifier`, set them as httpOnly cookies, and redirect to the platform's authorize URL.
3. The user grants access on the platform's page; the platform redirects back to our `/callback` with `?code=…&state=…`.
4. We verify state matches the cookie, exchange the code for an access token (and a long-lived token in IG's case), fetch the user's profile, and `upsert` a `PlatformConnection` row.
5. Success → redirect to `/settings?connected=tiktok#connections`. Failure → `/settings?connect_error=…`.

## What happens on disconnect

`POST /api/connect/disconnect` deletes the `PlatformConnection` row. **Local data (posts, sounds, etc.) is preserved** — only the OAuth token is removed. Re-connect to start syncing again.

## Sync (next step)

This first pass stores tokens and basic profile metadata. Background sync of posts/insights from the platforms is the next workstream — the existing `Post` model is shaped to receive it directly. Stub a cron at `/api/sync/[platform]` that decrypts the token and pulls fresh data.
