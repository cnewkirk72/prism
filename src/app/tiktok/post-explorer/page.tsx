import { requireUserId } from "@/lib/session";
import { getAllPosts, getCategories } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { PostExplorer } from "./post-explorer";

export const metadata = { title: "Post Explorer" };

export default async function PostExplorerPage() {
  const userId = await requireUserId();
  const [posts, categories] = await Promise.all([getAllPosts(userId), getCategories()]);

  // Strip Date types for client serialization
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
        title="Post Explorer"
        description="Aggregated grid of every TikTok and Instagram video. Filter by views, category, and search across captions."
        badge={{ label: "Aggregated", variant: "purple" }}
      />
      <PostExplorer posts={serializable} categories={categories.map((c) => ({ id: c.id, name: c.name, color: c.color }))} />
    </div>
  );
}
