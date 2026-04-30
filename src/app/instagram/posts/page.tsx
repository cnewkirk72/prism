import { requireUserId } from "@/lib/session";
import { getPostsByPlatform } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { PostExplorer } from "@/app/tiktok/post-explorer/post-explorer";
import { getCategories } from "@/lib/queries";

export const metadata = { title: "Instagram Posts" };

export default async function InstagramPostsPage() {
  const userId = await requireUserId();
  const [posts, categories] = await Promise.all([
    getPostsByPlatform(userId, "INSTAGRAM"),
    getCategories(),
  ]);

  const serializable = posts.map((p) => ({
    id: p.id,
    platform: p.platform,
    caption: p.caption,
    thumbnailUrl: p.thumbnailUrl,
    permalink: p.permalink,
    postedAt: p.postedAt.toISOString(),
    durationSec: p.durationSec,
    igFormat: p.igFormat,
    views: p.views,
    likes: p.likes,
    comments: p.comments,
    shares: p.shares,
    saves: p.saves,
    category: p.category ? { id: p.category.id, name: p.category.name, color: p.category.color } : null,
  }));

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Instagram Posts"
        description="Every reel, carousel, and post in one filterable grid."
        badge={{ label: "Instagram", variant: "instagram" }}
      />
      <PostExplorer posts={serializable} categories={categories.map((c) => ({ id: c.id, name: c.name, color: c.color }))} />
    </div>
  );
}
