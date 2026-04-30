# Prism

A creator analytics + planning workspace for TikTok and Instagram. Strict dark mode, neon purple + hot pink. Built with Next.js 14 (App Router), Prisma + Postgres, Tailwind, Recharts, and NextAuth.

## What's in this repo

- **Next.js app at the root** — full Phase 2 build. Auth (email+password, Google, magic link), real OAuth handlers for TikTok and Instagram (Login Kit + Meta Graph), encrypted token storage, 14 fully-built pages, drag-and-drop Kanban, PDF media-kit export.
- **`public/standalone.html`** — single-file static demo of the same UI, persisted via `localStorage`. No backend; just open in a browser. Useful for quick previews without setting up the database.

## Quick start (Next.js app)

You need a Postgres database. Pick one:

- **Local Docker:** `docker run --name prism-pg -p 5432:5432 -e POSTGRES_PASSWORD=prism -d postgres:16`
- **Neon (free):** create a database at https://neon.tech and copy the connection string
- **Vercel Postgres:** add it to your Vercel project (the connection string is auto-injected)

Then:

```bash
pnpm install
cp .env.example .env
# Edit .env:
#   DATABASE_URL=postgresql://...        (your Postgres URL)
#   AUTH_SECRET=$(openssl rand -base64 32)
#   PRISM_TOKEN_KEY=$(openssl rand -hex 32)
pnpm db:reset   # creates schema + seeds the demo workspace (80 posts, etc.)
pnpm dev
```

Visit http://localhost:3000 — you'll be sent to `/sign-in`.

**Demo account:** `demo@prism.app` / `demo1234`

After signing in, you land on `/tiktok/overview` with a fully populated dashboard (real charts off the seeded ~80 posts).

## Quick start (standalone)

Open `public/standalone.html` directly in a browser. State persists in `localStorage`. No database, no env vars.

## Connecting real TikTok / Instagram

OAuth code is wired and ready. Register apps on each platform's developer portal and drop credentials into `.env`. Full walkthrough: [`CONNECTIONS.md`](./CONNECTIONS.md).

Short version:

```env
TIKTOK_CLIENT_KEY="…"
TIKTOK_CLIENT_SECRET="…"
TIKTOK_REDIRECT_URI="http://localhost:3000/api/connect/tiktok/callback"

META_APP_ID="…"
META_APP_SECRET="…"
META_REDIRECT_URI="http://localhost:3000/api/connect/instagram/callback"
```

Restart `next dev` after editing `.env`. The Connect buttons in Settings now go all the way through to a real `PlatformConnection` row with an encrypted access token.

## Deploying to Vercel

1. Push the repo to GitHub (already done).
2. Visit https://vercel.com/new → import `cnewkirk72/prism`. Vercel auto-detects Next.js.
3. **Storage tab → Create Database → Neon** (or Postgres). It auto-injects `DATABASE_URL` for all environments.
4. **Settings → Environment Variables**, add:
   ```
   AUTH_SECRET        = <openssl rand -base64 32>
   AUTH_TRUST_HOST    = true
   PRISM_TOKEN_KEY    = <openssl rand -hex 32>
   ```
   Optionally also add `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, `EMAIL_SERVER` / `EMAIL_FROM`, `TIKTOK_*`, `META_*` (with production callback URLs registered in each provider's dashboard).
5. Deploy. After the first build, run the seed once locally pointing at the production DB:
   ```bash
   DATABASE_URL="<vercel-prod-url>" pnpm db:push && pnpm db:seed
   ```

`build` and `postinstall` both run `prisma generate` so the Prisma client is fresh on every Vercel build.

The standalone HTML at `public/standalone.html` is also served as a static asset — accessible at `/standalone.html` on the deployed site, no backend or auth needed.

## Optional providers

```env
GOOGLE_CLIENT_ID="…"
GOOGLE_CLIENT_SECRET="…"

EMAIL_SERVER="smtp://user:pass@smtp.example.com:587"
EMAIL_FROM="Prism <hello@prism.app>"
```

## Project tree (highlights)

```
prism/
├── design-system/MASTER.md            # Token reference + quality rules
├── prisma/schema.prisma               # User-scoped Postgres schema
├── prisma/seed.ts                     # Demo user + 80 posts + everything else
├── public/standalone.html             # Single-file static demo
└── src/
    ├── auth.ts / auth.config.ts       # NextAuth v5 setup
    ├── middleware.ts                  # Route guard
    ├── app/
    │   ├── sign-in/  sign-up/         # Public auth pages
    │   ├── api/auth/[...nextauth]     # NextAuth handlers
    │   ├── api/connect/{tiktok,instagram}/{start,callback}  # OAuth
    │   ├── tiktok/{overview,post-explorer,captions,hashtags}/page.tsx
    │   ├── instagram/{overview,posts}/page.tsx
    │   ├── create/{inspiration,sounds,ideas,content-plan,color-plan,goals}/page.tsx
    │   ├── brand/{media-kit,monetization}/page.tsx
    │   └── settings/                  # Profile + connections manager
    ├── components/{layout,charts,icons,ui}
    ├── lib/                           # prisma, session, crypto, oauth-state, stats, queries, utils
    └── server/actions/                # All CRUD server actions
```

## Auth model

- Session strategy: **JWT** (required because the Credentials provider can't write DB sessions in Auth.js v5).
- The JWT carries `user.id`, which is what every server action and query uses to scope data.
- All routes except `/sign-in`, `/sign-up`, `/api/auth/*`, and the static standalone HTML are guarded by `middleware.ts` AND a server-side check inside each section's layout — defence in depth.

## What's NOT in this pass

Deliberate later workstreams:

- Background sync from TikTok/Instagram into your local `Post` table (the schema is ready; you need a cron / queue).
- Real-time webhooks (TikTok video.published, IG webhooks).
- Multi-workspace / team features.
- Stripe billing.
- Analytics CSV import (the schema accepts it; UI not built).
- Rate-limit handling and exponential-backoff retry on platform calls.
