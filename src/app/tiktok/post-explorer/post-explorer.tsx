"use client";

import { useMemo, useState } from "react";
import { Search, ExternalLink, Eye, Heart, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TikTokIcon, InstagramIcon } from "@/components/icons/PlatformIcon";
import { fmtCompact } from "@/lib/utils";
import { cn } from "@/lib/utils";

type ExplorerPost = {
  id: string;
  platform: "TIKTOK" | "INSTAGRAM";
  caption: string;
  thumbnailUrl: string;
  permalink: string | null;
  postedAt: string;
  durationSec: number | null;
  igFormat: "REEL" | "CAROUSEL" | "PHOTO" | "STORY" | null;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  category: { id: string; name: string; color: string } | null;
};

type SortKey = "views-desc" | "views-asc" | "recent" | "engagement";

export function PostExplorer({
  posts,
  categories,
}: {
  posts: ExplorerPost[];
  categories: { id: string; name: string; color: string }[];
}) {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<"all" | "TIKTOK" | "INSTAGRAM">("all");
  const [sort, setSort] = useState<SortKey>("views-desc");
  const [activeCats, setActiveCats] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = posts.filter((p) => {
      if (platform !== "all" && p.platform !== platform) return false;
      if (activeCats.size && (!p.category || !activeCats.has(p.category.id))) return false;
      if (q && !p.caption.toLowerCase().includes(q)) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "views-asc": return a.views - b.views;
        case "views-desc": return b.views - a.views;
        case "recent": return +new Date(b.postedAt) - +new Date(a.postedAt);
        case "engagement":
          return (b.likes + b.comments + b.shares + b.saves) / Math.max(b.views, 1)
               - (a.likes + a.comments + a.shares + a.saves) / Math.max(a.views, 1);
      }
    });
    return list;
  }, [posts, query, platform, sort, activeCats]);

  function toggleCat(id: string) {
    setActiveCats((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-prism-text-muted" />
          <Input
            placeholder="Search captions…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs value={platform} onValueChange={(v) => setPlatform(v as typeof platform)}>
          <TabsList className="h-9">
            <TabsTrigger value="all" className="px-3 py-1 text-xs">All</TabsTrigger>
            <TabsTrigger value="TIKTOK" className="px-3 py-1 text-xs">TikTok</TabsTrigger>
            <TabsTrigger value="INSTAGRAM" className="px-3 py-1 text-xs">Instagram</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <TabsList className="h-9">
            <TabsTrigger value="views-desc" className="px-3 py-1 text-xs">Views ↓</TabsTrigger>
            <TabsTrigger value="views-asc" className="px-3 py-1 text-xs">Views ↑</TabsTrigger>
            <TabsTrigger value="recent" className="px-3 py-1 text-xs">Recent</TabsTrigger>
            <TabsTrigger value="engagement" className="px-3 py-1 text-xs">Engagement</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="ml-auto text-xs text-prism-text-muted">
          {filtered.length} of {posts.length} posts
        </div>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => {
          const active = activeCats.has(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleCat(c.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
                active
                  ? "border-prism-purple bg-prism-purple/15 text-prism-purple-bright"
                  : "border-prism-border bg-prism-surface-2 text-prism-text-secondary hover:text-prism-text",
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
              {c.name}
            </button>
          );
        })}
        {activeCats.size > 0 && (
          <button
            type="button"
            onClick={() => setActiveCats(new Set())}
            className="rounded-full px-3 py-1 text-xs text-prism-text-muted underline-offset-2 hover:text-prism-text hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="prism-card grid place-items-center px-6 py-16 text-center">
          <p className="text-sm text-prism-text-muted">No posts match these filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      )}
    </div>
  );
}

function PostCard({ post }: { post: ExplorerPost }) {
  const Icon = post.platform === "TIKTOK" ? TikTokIcon : InstagramIcon;
  const totalEng = post.likes + post.comments + post.shares + post.saves;

  return (
    <a
      href={post.permalink ?? "#"}
      target={post.permalink ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="group prism-card prism-card-hover overflow-hidden flex flex-col"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-prism-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.thumbnailUrl}
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-white">
            <Eye className="h-3 w-3" />
            <span className="tabular-nums">{fmtCompact(post.views)}</span>
          </div>
        </div>
        <div className="absolute right-2 top-2">
          <span className={cn(
            "grid h-6 w-6 place-items-center rounded-md backdrop-blur",
            post.platform === "TIKTOK" ? "bg-black/60 text-white" : "bg-white/15 text-white",
          )}>
            <Icon size={12} />
          </span>
        </div>
        {post.permalink && (
          <span className="pointer-events-none absolute left-2 top-2 grid h-6 w-6 place-items-center rounded-md bg-black/40 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
            <ExternalLink className="h-3 w-3" />
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1.5 p-2.5">
        <p className="line-clamp-2 text-xs text-prism-text-secondary leading-snug">
          {post.caption}
        </p>
        <div className="flex items-center justify-between gap-2 text-[10px] text-prism-text-muted">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" />{fmtCompact(post.likes)}</span>
            <span className="flex items-center gap-0.5"><MessageCircle className="h-3 w-3" />{fmtCompact(post.comments)}</span>
          </div>
          {post.category && (
            <Badge variant="default" className="!px-1.5 !py-0.5 !text-[9px]">{post.category.name}</Badge>
          )}
        </div>
        <div className="text-[10px] text-prism-text-muted">{format(new Date(post.postedAt), "MMM d")}</div>
      </div>
    </a>
  );
}
