import { requireUserId } from "@/lib/session";
import { getPostsByPlatform } from "@/lib/queries";
import { topNGrams } from "@/lib/stats";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CaptionsTable } from "./captions-table";

export const metadata = { title: "Captions" };

export default async function CaptionsPage() {
  const userId = await requireUserId();
  const posts = await getPostsByPlatform(userId, "TIKTOK");

  const captions = posts.map((p) => p.caption);
  const bigrams = topNGrams(captions, 2, 12);
  const trigrams = topNGrams(captions, 3, 8);

  const rows = posts.map((p) => ({
    id: p.id,
    caption: p.caption,
    views: p.views,
    likes: p.likes,
    comments: p.comments,
    shares: p.shares,
    saves: p.saves,
    postedAt: p.postedAt.toISOString(),
  }));

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Captions"
        description="Browse the full caption library, see which phrases drive the most engagement, and reuse winners."
        badge={{ label: "TikTok", variant: "tiktok" }}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Caption library</CardTitle>
            <CardDescription>Sortable. Click any caption to copy.</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <CaptionsTable rows={rows} />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top phrases (2-word)</CardTitle>
              <CardDescription>Most-used hooks across your captions</CardDescription>
            </CardHeader>
            <CardContent>
              <PhraseList items={bigrams} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Top phrases (3-word)</CardTitle>
            </CardHeader>
            <CardContent>
              <PhraseList items={trigrams} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PhraseList({ items }: { items: { phrase: string; count: number }[] }) {
  const max = items[0]?.count ?? 1;
  if (!items.length) return <p className="text-sm text-prism-text-muted">Need a few more captions to extract patterns.</p>;
  return (
    <ul className="flex flex-col gap-2">
      {items.map((it) => (
        <li key={it.phrase} className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate text-prism-text">{it.phrase}</span>
              <span className="tabular-nums text-prism-text-muted text-xs">{it.count}×</span>
            </div>
            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-prism-surface-3">
              <div className="h-full bg-prism-gradient" style={{ width: `${(it.count / max) * 100}%` }} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
