import { Music2, Hash } from "lucide-react";
import { requireUserId } from "@/lib/session";
import { getHashtagStats, getSoundStats } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { fmtCompact } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TikTokIcon, InstagramIcon } from "@/components/icons/PlatformIcon";

export const metadata = { title: "Hashtags & Sounds" };

export default async function HashtagsPage() {
  const userId = await requireUserId();
  const [hashtags, sounds] = await Promise.all([
    getHashtagStats(userId, "TIKTOK"),
    getSoundStats(userId),
  ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Hashtags & Sounds"
        description="Performance breakdown of every hashtag and audio you've used."
        badge={{ label: "TikTok", variant: "tiktok" }}
      />

      <Tabs defaultValue="hashtags">
        <TabsList>
          <TabsTrigger value="hashtags"><Hash className="h-3.5 w-3.5 mr-1.5" />Hashtags</TabsTrigger>
          <TabsTrigger value="sounds"><Music2 className="h-3.5 w-3.5 mr-1.5" />Sounds</TabsTrigger>
        </TabsList>

        <TabsContent value="hashtags">
          <Card>
            <CardHeader>
              <CardTitle>Hashtag performance</CardTitle>
              <CardDescription>Usage count, total views, and best post per tag</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-prism-border text-[11px] uppercase tracking-wider text-prism-text-muted">
                    <th className="px-5 py-3 text-left font-medium">Hashtag</th>
                    <th className="px-5 py-3 text-right font-medium">Uses</th>
                    <th className="px-5 py-3 text-right font-medium">Total views</th>
                    <th className="px-5 py-3 text-right font-medium">Avg views / post</th>
                    <th className="px-5 py-3 text-right font-medium">Top post</th>
                  </tr>
                </thead>
                <tbody>
                  {hashtags.map((h) => (
                    <tr key={h.tag} className="border-b border-prism-border/60 last:border-none hover:bg-prism-surface-2">
                      <td className="px-5 py-3 font-mono text-prism-purple-bright">#{h.tag}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{h.count}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{fmtCompact(h.totalViews)}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{fmtCompact(Math.round(h.totalViews / Math.max(h.count, 1)))}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{fmtCompact(h.topViews)}</td>
                    </tr>
                  ))}
                  {!hashtags.length && (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-prism-text-muted">Use some hashtags to see them here.</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sounds">
          <Card>
            <CardHeader>
              <CardTitle>Saved sounds</CardTitle>
              <CardDescription>Trending audio in your library and how they've performed</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {sounds.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 rounded-xl border border-prism-border bg-prism-surface-2 p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.thumbnailUrl} alt="" className="h-14 w-14 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {s.platform === "TIKTOK" ? <TikTokIcon size={12} className="text-[hsl(var(--prism-tiktok))]" /> : <InstagramIcon size={12} className="text-prism-pink" />}
                        <p className="truncate font-medium text-prism-text">{s.title}</p>
                      </div>
                      <p className="truncate text-xs text-prism-text-muted">{s.artist ?? "Unknown artist"}</p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-prism-text-muted">
                        <span>Used in {s.usageCount} {s.usageCount === 1 ? "post" : "posts"}</span>
                        <Badge variant={s.status === "TO_FILM" ? "warning" : s.status === "USED" ? "success" : "default"}>
                          {s.status.replace("_", " ").toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                  </li>
                ))}
                {!sounds.length && (
                  <li className="col-span-full rounded-xl border border-prism-border bg-prism-surface-2 px-6 py-10 text-center text-sm text-prism-text-muted">
                    No sounds saved yet.
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
