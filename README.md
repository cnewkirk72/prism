# Prism

A creator analytics + planning workspace for TikTok and Instagram. Strict dark mode, neon purple + hot pink. Built with Next.js 14 (App Router), Prisma, Tailwind, Recharts, and NextAuth.

## What's in this repo

- **Next.js app at the root** — full Phase 2 build. Auth, real OAuth handlers for TikTok and Instagram (Login Kit + Meta Graph), encrypted token storage, 14 fully-built pages.
- **`public/standalone.html`** — single-file static demo of the same UI, persisted via `localStorage`. No backend; just open in a browser.

## Quick start (Next.js app)

```bash
pnpm install
cp .env.example .env
# generate secrets in .env:
#   AUTH_SECRET=$(openssl rand -base64 32)
#   PRISM_TOKEN_KEY=$(openssl rand -hex 32)
pnpm db:reset   # SQLite + seeded demo workspace
pnpm dev
```

→ http://localhost:3000 — sign in with `demo@prism.app` / `demo1234`.

## Quick start (standalone)

Open `public/standalone.html` directly in a browser. State persists in `localStorage`.

## Connecting real TikTok / Instagram

OAuth code is wired and ready. Register apps in each developer portal and drop credentials into `.env`. Walkthrough: [`CONNECTIONS.md`](./CONNECTIONS.md).

## Deploying

The Next.js app deploys to Vercel after switching from SQLite to a hosted Postgres (Vercel Postgres / Neon / Supabase) and setting env vars. The standalone HTML deploys instantly as a static asset.
