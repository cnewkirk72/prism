import type { Platform, Post } from "@prisma/client";

export type PostLite = Pick<
  Post,
  "id" | "platform" | "views" | "likes" | "comments" | "shares" | "saves" | "durationSec" | "categoryId" | "postedAt" | "caption"
>;

export type Tier = "Top 10M+" | "High 100K+" | "Mid 10K+" | "Low" | "Bottom";
export const TIER_ORDER: Tier[] = ["Top 10M+", "High 100K+", "Mid 10K+", "Low", "Bottom"];
export function tierOf(views: number): Tier {
  if (views >= 10_000_000) return "Top 10M+";
  if (views >= 100_000) return "High 100K+";
  if (views >= 10_000) return "Mid 10K+";
  if (views >= 1_000) return "Low";
  return "Bottom";
}

export type DurationBucket = "Under 15s" | "15–30s" | "30–60s" | "Over 60s";
export const DURATION_ORDER: DurationBucket[] = ["Under 15s", "15–30s", "30–60s", "Over 60s"];
export function durationBucket(sec: number | null | undefined): DurationBucket | null {
  if (sec == null) return null;
  if (sec < 15) return "Under 15s";
  if (sec < 30) return "15–30s";
  if (sec < 60) return "30–60s";
  return "Over 60s";
}

export function median(values: number[]): number {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

export function platformStats<T extends PostLite>(posts: T[]) {
  const totalViews = posts.reduce((s, p) => s + p.views, 0);
  const totalEng = posts.reduce((s, p) => s + p.likes + p.comments + p.shares + p.saves, 0);
  const med = median(posts.map((p) => p.views));
  return {
    posts: posts.length,
    totalViews,
    medianViews: med,
    engagement: posts.length ? totalEng / Math.max(totalViews, 1) : 0,
  };
}

export function tierBreakdown<T extends PostLite>(posts: T[]) {
  return TIER_ORDER.map((tier) => ({
    tier,
    count: posts.filter((p) => tierOf(p.views) === tier).length,
  }));
}

export function durationBreakdown<T extends PostLite>(posts: T[]) {
  const items = posts.filter((p) => p.durationSec != null);
  return DURATION_ORDER.map((bucket) => {
    const inBucket = items.filter((p) => durationBucket(p.durationSec) === bucket);
    const avg = inBucket.length
      ? Math.round(inBucket.reduce((s, p) => s + p.views, 0) / inBucket.length)
      : 0;
    return { bucket, count: inBucket.length, avgViews: avg };
  });
}

export type ViewBucket = { label: string; min: number; max: number };
export const VIEW_BUCKETS: ViewBucket[] = [
  { label: "0–1K", min: 0, max: 999 },
  { label: "1K–10K", min: 1_000, max: 9_999 },
  { label: "10K–100K", min: 10_000, max: 99_999 },
  { label: "100K–1M", min: 100_000, max: 999_999 },
  { label: "1M–10M", min: 1_000_000, max: 9_999_999 },
  { label: "10M+", min: 10_000_000, max: Number.POSITIVE_INFINITY },
];
export function histogram<T extends PostLite>(posts: T[]) {
  return VIEW_BUCKETS.map((b) => ({
    label: b.label,
    count: posts.filter((p) => p.views >= b.min && p.views <= b.max).length,
  }));
}

/** Splits a list of posts in half by recency so we can compute "vs. last period" deltas */
export function periodDelta<T extends PostLite>(posts: T[], pick: (p: T) => number) {
  const sorted = [...posts].sort((a, b) => +new Date(a.postedAt) - +new Date(b.postedAt));
  const mid = Math.floor(sorted.length / 2);
  if (mid === 0) return null;
  const prev = sorted.slice(0, mid).map(pick);
  const recent = sorted.slice(mid).map(pick);
  const prevMed = median(prev);
  const recentMed = median(recent);
  if (!prevMed) return null;
  return (recentMed - prevMed) / prevMed;
}

/** Top n-grams from captions (1-3 word phrases, lowercased, filter trivial words). */
const STOPWORDS = new Set([
  "a","an","the","and","or","but","if","in","on","at","to","of","for","with","my","me","i","is","it","this","that","be","you","your","we","our","so","just","got","like","one","when","what","how","do","did",
]);
export function topNGrams(captions: string[], n: 1 | 2 | 3 = 2, top = 12) {
  const counts = new Map<string, number>();
  for (const cap of captions) {
    const words = cap
      .toLowerCase()
      .replace(/#[\w-]+/g, "")
      .replace(/[^\p{L}\p{N}\s']/gu, "")
      .split(/\s+/)
      .filter(Boolean);
    for (let i = 0; i <= words.length - n; i++) {
      const slice = words.slice(i, i + n);
      if (slice.some((w) => STOPWORDS.has(w))) continue;
      if (slice.some((w) => w.length < 3)) continue;
      const phrase = slice.join(" ");
      counts.set(phrase, (counts.get(phrase) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([phrase, count]) => ({ phrase, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, top);
}

/** Best time to post heatmap — IG focused, 7×24 grid */
export function postingHeatmap<T extends PostLite>(posts: T[]) {
  const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  const counts: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (const p of posts) {
    const d = new Date(p.postedAt);
    const dow = d.getDay();
    const hr = d.getHours();
    grid[dow][hr] += p.views;
    counts[dow][hr] += 1;
  }
  // Average views per hour-of-week
  const avg: number[][] = grid.map((row, i) => row.map((v, j) => (counts[i][j] ? Math.round(v / counts[i][j]) : 0)));
  let max = 0;
  for (const row of avg) for (const v of row) if (v > max) max = v;
  return { avg, max };
}

export function asPlatformPosts<T extends PostLite>(posts: T[], platform: Platform) {
  return posts.filter((p) => p.platform === platform);
}
