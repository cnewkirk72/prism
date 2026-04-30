import { Eye, Heart, Image as ImageIcon, Bookmark } from "lucide-react";
import { requireUserId } from "@/lib/session";
import { getPostsByPlatform } from "@/lib/queries";
import { platformStats, postingHeatmap } from "@/lib/stats";
import { fmtCompact, fmtNumber, fmtPercent } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormatBreakdown } from "@/components/charts/overview-charts";
import { Heatmap } from "./heatmap";

export const metadata = { title: "Instagram Overview" };

const FORMAT_COLORS: Record<string, string> = {
  REEL: "#A855F7",
  CAROUSEL: "#EC4899",
  PHOTO: "#06B6D4",
  STORY: "#F59E0B",
};

export default async function InstagramOverviewPage() {
  const userId = await requireUserId();
  const posts = await getPostsByPlatform(userId, "INSTAGRAM");
  const stats = platformStats(posts);
  const totalSaves = posts.reduce((s, p) => s + p.saves, 0);

  const formatCounts = (["REEL", "CAROUSEL", "PHOTO", "STORY"] as const).map((f) => ({
    name: f.charAt(0) + f.slice(1).toLowerCase(),
    value: posts.filter((p) => p.igFormat === f).length,
    color: FORMAT_COLORS[f],
  })).filter((d) => d.value > 0);

  const { avg, max } = postingHeatmap(posts);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Instagram Overview"
        description="Reels, carousels, and posts performance summary."
        badge={{ label: "Instagram", variant: "instagram" }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total reach" value={fmtCompact(stats.totalViews)} icon={Eye} />
        <StatCard label="Total saves" value={fmtCompact(totalSaves)} icon={Bookmark} />
        <StatCard label="Engagement rate" value={fmtPercent(stats.engagement, 2)} icon={Heart} />
        <StatCard label="Total posts" value={fmtNumber(stats.posts)} icon={ImageIcon} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,1.4fr]">
        <Card>
          <CardHeader>
            <CardTitle>Format breakdown</CardTitle>
            <CardDescription>Reels vs. carousels vs. photos</CardDescription>
          </CardHeader>
          <CardContent>
            {formatCounts.length ? (
              <FormatBreakdown data={formatCounts} />
            ) : (
              <p className="text-sm text-prism-text-muted py-12 text-center">No Instagram posts yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Best time to post</CardTitle>
            <CardDescription>Average reach per hour-of-week (lighter = better)</CardDescription>
          </CardHeader>
          <CardContent>
            <Heatmap grid={avg} max={max} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
