import { Eye, Percent, Video, Zap } from "lucide-react";
import { requireUserId } from "@/lib/session";
import { getPostsByPlatform } from "@/lib/queries";
import {
  durationBreakdown, histogram, median, periodDelta, platformStats, tierBreakdown,
} from "@/lib/stats";
import { fmtCompact, fmtNumber, fmtPercent } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TierBarChart, DurationDonut, AvgViewsByDurationChart, ViewsHistogram } from "@/components/charts/overview-charts";
import { TikTokIcon } from "@/components/icons/PlatformIcon";

export const metadata = { title: "TikTok Overview" };

export default async function TikTokOverviewPage() {
  const userId = await requireUserId();
  const posts = await getPostsByPlatform(userId, "TIKTOK");
  const stats = platformStats(posts);
  const tiers = tierBreakdown(posts);
  const durations = durationBreakdown(posts);
  const hist = histogram(posts);
  const medianDelta = periodDelta(posts, (p) => p.views);

  // Category breakdown table
  const categoryStats = (() => {
    const map = new Map<string, { name: string; color: string; views: number; count: number; saves: number; shares: number }>();
    for (const p of posts) {
      if (!p.category) continue;
      const cur = map.get(p.category.id) ?? {
        name: p.category.name, color: p.category.color,
        views: 0, count: 0, saves: 0, shares: 0,
      };
      cur.views += p.views;
      cur.count += 1;
      cur.saves += p.saves;
      cur.shares += p.shares;
      map.set(p.category.id, cur);
    }
    return [...map.values()]
      .map((c) => ({
        ...c,
        median: median(posts.filter((p) => p.category?.name === c.name).map((p) => p.views)),
        saveRate: c.views ? c.saves / c.views : 0,
        shareRate: c.views ? c.shares / c.views : 0,
      }))
      .sort((a, b) => b.median - a.median);
  })();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="TikTok Overview"
        description="High-level performance across your TikTok library — totals, tier distribution, category mix, and view histogram."
        badge={{ label: "TikTok", variant: "tiktok" }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total views" value={fmtCompact(stats.totalViews)} icon={Eye} />
        <StatCard
          label="Typical post"
          value={fmtCompact(stats.medianViews)}
          icon={Video}
          delta={medianDelta != null ? { value: medianDelta * 100, positive: medianDelta >= 0, suffix: "vs. prev" } : undefined}
          hint={medianDelta == null ? "Need more posts to compare" : undefined}
        />
        <StatCard label="Engagement rate" value={fmtPercent(stats.engagement, 2)} icon={Percent} />
        <StatCard label="Total posts" value={fmtNumber(stats.posts)} icon={Zap} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Tier distribution</CardTitle>
            <CardDescription>Posts grouped by view bucket</CardDescription>
          </CardHeader>
          <CardContent>
            <TierBarChart data={tiers} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Video duration</CardTitle>
            <CardDescription>Share of videos by length</CardDescription>
          </CardHeader>
          <CardContent>
            <DurationDonut data={durations.map((d) => ({ bucket: d.bucket, count: d.count }))} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Category performance</CardTitle>
            <CardDescription>Median views, save rate, and share rate by category</CardDescription>
          </div>
          <TikTokIcon size={18} className="text-[hsl(var(--prism-tiktok))]" />
        </CardHeader>
        <CardContent className="px-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-prism-border text-[11px] uppercase tracking-wider text-prism-text-muted">
                <th className="px-5 py-3 text-left font-medium">Category</th>
                <th className="px-5 py-3 text-right font-medium">Posts</th>
                <th className="px-5 py-3 text-right font-medium">Median views</th>
                <th className="px-5 py-3 text-right font-medium">Save rate</th>
                <th className="px-5 py-3 text-right font-medium">Share rate</th>
              </tr>
            </thead>
            <tbody>
              {categoryStats.map((c) => (
                <tr key={c.name} className="border-b border-prism-border/60 last:border-none hover:bg-prism-surface-2">
                  <td className="px-5 py-3 text-prism-text">
                    <span className="mr-2 inline-block h-2 w-2 rounded-full align-middle" style={{ background: c.color }} />
                    {c.name}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">{c.count}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{fmtCompact(c.median)}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{fmtPercent(c.saveRate, 2)}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{fmtPercent(c.shareRate, 2)}</td>
                </tr>
              ))}
              {!categoryStats.length && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-prism-text-muted">No category data yet.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Avg views by duration</CardTitle>
            <CardDescription>Which lengths actually perform</CardDescription>
          </CardHeader>
          <CardContent>
            <AvgViewsByDurationChart data={durations.map((d) => ({ bucket: d.bucket, avgViews: d.avgViews }))} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Views distribution</CardTitle>
            <CardDescription>How frequently each view count appears</CardDescription>
          </CardHeader>
          <CardContent>
            <ViewsHistogram data={hist} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
