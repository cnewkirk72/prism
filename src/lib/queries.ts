import "server-only";
import { prisma } from "@/lib/prisma";
import type { Platform } from "@prisma/client";

/* ── Posts ──────────────────────────────────────────────────────────── */

export async function getPostsByPlatform(userId: string, platform: Platform) {
  return prisma.post.findMany({
    where: { userId, platform },
    include: { category: true, sound: true, hashtags: { include: { hashtag: true } } },
    orderBy: { postedAt: "desc" },
  });
}

export async function getAllPosts(userId: string) {
  return prisma.post.findMany({
    where: { userId },
    include: { category: true, sound: true, hashtags: { include: { hashtag: true } } },
    orderBy: { postedAt: "desc" },
  });
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getHashtagStats(userId: string, platform?: Platform) {
  const posts = await prisma.post.findMany({
    where: { userId, ...(platform ? { platform } : {}) },
    include: { hashtags: { include: { hashtag: true } } },
  });
  const map = new Map<string, { tag: string; count: number; totalViews: number; topPostId: string; topViews: number }>();
  for (const p of posts) {
    for (const ph of p.hashtags) {
      const k = ph.hashtag.tag;
      const cur = map.get(k) ?? { tag: k, count: 0, totalViews: 0, topPostId: p.id, topViews: 0 };
      cur.count += 1;
      cur.totalViews += p.views;
      if (p.views > cur.topViews) {
        cur.topPostId = p.id;
        cur.topViews = p.views;
      }
      map.set(k, cur);
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export async function getSoundStats(userId: string) {
  const sounds = await prisma.sound.findMany({
    where: { userId },
    include: { posts: { orderBy: { views: "desc" }, take: 1 } },
    orderBy: { savedAt: "desc" },
  });
  return sounds.map((s) => ({
    ...s,
    topPost: s.posts[0] ?? null,
    usageCount: s.posts.length,
  }));
}

/* ── Inspiration ────────────────────────────────────────────────────── */

export async function listInspiration(userId: string) {
  return prisma.inspiration.findMany({
    where: { userId },
    include: { tags: true },
    orderBy: { savedAt: "desc" },
  });
}

export async function listInspirationTags() {
  return prisma.inspirationTag.findMany({ orderBy: { name: "asc" } });
}

/* ── Ideas ──────────────────────────────────────────────────────────── */

export async function listIdeas(userId: string) {
  return prisma.idea.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { position: "asc" }],
  });
}

/* ── Content plan ───────────────────────────────────────────────────── */

export async function listContentPlans(userId: string) {
  return prisma.contentPlan.findMany({
    where: { userId },
    include: {
      items: {
        include: { sounds: { include: { sound: true } }, inspirations: { include: { inspiration: true } } },
        orderBy: [{ phase: "asc" }, { position: "asc" }],
      },
    },
    orderBy: { shootDate: "desc" },
  });
}

/* ── Color plan ─────────────────────────────────────────────────────── */

export async function listColorPalettes(userId: string) {
  return prisma.colorPalette.findMany({
    where: { userId },
    include: { swatches: { orderBy: { position: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}

/* ── Brand ──────────────────────────────────────────────────────────── */

export async function listAffiliates(userId: string) {
  return prisma.affiliateProgram.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { brand: "asc" }],
  });
}

export async function listActionItems(userId: string) {
  return prisma.actionItem.findMany({
    where: { userId },
    orderBy: [{ done: "asc" }, { position: "asc" }],
  });
}

export async function listGoals(userId: string) {
  return prisma.goal.findMany({ where: { userId } });
}

/* ── Connections ────────────────────────────────────────────────────── */

export async function listConnections(userId: string) {
  return prisma.platformConnection.findMany({
    where: { userId },
    select: {
      id: true, platform: true, externalId: true, externalHandle: true,
      externalName: true, externalAvatar: true, scope: true,
      followerCount: true, postCount: true, expiresAt: true,
      connectedAt: true, lastSyncedAt: true, syncError: true,
    },
  });
}
