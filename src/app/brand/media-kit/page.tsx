import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getAllPosts, listConnections } from "@/lib/queries";
import { platformStats } from "@/lib/stats";
import { PageHeader } from "@/components/ui/page-header";
import { MediaKit } from "./media-kit";

export const metadata = { title: "Media Kit" };

export default async function MediaKitPage() {
  const userId = await requireUserId();
  const [user, posts, connections] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    getAllPosts(userId),
    listConnections(userId),
  ]);

  const tt = posts.filter((p) => p.platform === "TIKTOK");
  const ig = posts.filter((p) => p.platform === "INSTAGRAM");
  const ttStats = platformStats(tt);
  const igStats = platformStats(ig);

  const tiktokConn = connections.find((c) => c.platform === "TIKTOK");
  const igConn = connections.find((c) => c.platform === "INSTAGRAM");

  // Top videos grouped by category as "Creative Theme"
  const themeMap = new Map<string, { name: string; color: string; posts: typeof posts }>();
  for (const p of posts) {
    if (!p.category) continue;
    const cur = themeMap.get(p.category.id) ?? { name: p.category.name, color: p.category.color, posts: [] as typeof posts };
    cur.posts.push(p);
    themeMap.set(p.category.id, cur);
  }
  const themes = [...themeMap.values()]
    .map((t) => ({
      name: t.name,
      color: t.color,
      top: [...t.posts].sort((a, b) => b.views - a.views).slice(0, 3).map((p) => ({
        id: p.id,
        thumbnailUrl: p.thumbnailUrl,
        views: p.views,
        platform: p.platform,
      })),
      totalViews: t.posts.reduce((s, p) => s + p.views, 0),
    }))
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, 4);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Media Kit"
        description="Auto-generated, brand-ready. Export to PDF and send to partners."
        badge={{ label: "Brand", variant: "pink" }}
      />
      <MediaKit
        profile={{
          name: user.name ?? "Creator",
          handle: user.handle ?? "",
          bio: user.bio ?? "Creator working across TikTok and Instagram.",
          image: user.image ?? null,
          email: user.email,
        }}
        stats={{
          tiktok: {
            followers: tiktokConn?.followerCount ?? null,
            posts: ttStats.posts,
            totalViews: ttStats.totalViews,
            medianViews: ttStats.medianViews,
            engagement: ttStats.engagement,
          },
          instagram: {
            followers: igConn?.followerCount ?? null,
            posts: igStats.posts,
            totalViews: igStats.totalViews,
            medianViews: igStats.medianViews,
            engagement: igStats.engagement,
          },
        }}
        themes={themes}
      />
    </div>
  );
}
