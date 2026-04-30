"use client";

import { useRef, useState } from "react";
import { Download, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TikTokIcon, InstagramIcon } from "@/components/icons/PlatformIcon";
import { fmtCompact, fmtPercent } from "@/lib/utils";

type Stats = {
  tiktok: { followers: number | null; posts: number; totalViews: number; medianViews: number; engagement: number };
  instagram: { followers: number | null; posts: number; totalViews: number; medianViews: number; engagement: number };
};

type Theme = {
  name: string;
  color: string;
  top: { id: string; thumbnailUrl: string; views: number; platform: "TIKTOK" | "INSTAGRAM" }[];
  totalViews: number;
};

export function MediaKit({
  profile, stats, themes,
}: {
  profile: { name: string; handle: string; bio: string; image: string | null; email: string | null | undefined };
  stats: Stats;
  themes: Theme[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  async function exportPdf() {
    if (!ref.current) return;
    setExporting(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(ref.current, {
        backgroundColor: "#07040E",
        scale: 2,
        useCORS: true,
      });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width, canvas.height] });
      pdf.addImage(img, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${profile.name.replace(/\s+/g, "_")}_media_kit.pdf`);
      toast.success("Media kit exported");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't export");
    } finally {
      setExporting(false);
    }
  }

  const totalFollowers = (stats.tiktok.followers ?? 0) + (stats.instagram.followers ?? 0);
  const totalPosts = stats.tiktok.posts + stats.instagram.posts;
  const totalViews = stats.tiktok.totalViews + stats.instagram.totalViews;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2">
        <Button onClick={exportPdf} disabled={exporting}>
          <Download className="h-4 w-4" />
          {exporting ? "Exporting…" : "Export PDF"}
        </Button>
      </div>

      <div ref={ref} className="prism-card p-10 flex flex-col gap-10 bg-prism-surface">
        <header className="flex flex-wrap items-center gap-6 border-b border-prism-border pb-8">
          {profile.image ? (
            <img src={profile.image} alt="" className="h-24 w-24 rounded-2xl object-cover" />
          ) : (
            <div className="h-24 w-24 rounded-2xl bg-prism-gradient grid place-items-center text-3xl font-display text-white font-semibold">
              {profile.name[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-4xl font-semibold tracking-tight prism-gradient-text">{profile.name}</h1>
            {profile.handle && <p className="mt-1 text-prism-purple-bright">{profile.handle}</p>}
            <p className="mt-3 max-w-xl text-sm text-prism-text-secondary">{profile.bio}</p>
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="mt-3 inline-flex items-center gap-1.5 text-xs text-prism-text-muted hover:text-prism-purple-bright">
                <Mail className="h-3 w-3" />{profile.email}
              </a>
            )}
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Headline label="Total followers" value={fmtCompact(totalFollowers)} hint={totalFollowers ? "Combined across platforms" : "Connect to populate"} />
          <Headline label="Total posts" value={fmtCompact(totalPosts)} />
          <Headline label="Total views" value={fmtCompact(totalViews)} />
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <PlatformBlock
            icon={<TikTokIcon size={18} className="text-[hsl(var(--prism-tiktok))]" />}
            name="TikTok"
            stats={stats.tiktok}
          />
          <PlatformBlock
            icon={<InstagramIcon size={18} className="text-prism-pink" />}
            name="Instagram"
            stats={stats.instagram}
          />
        </section>

        {themes.length > 0 && (
          <section>
            <h2 className="font-display text-xl font-semibold mb-4">Top videos by creative theme</h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {themes.map((t) => (
                <article key={t.name} className="rounded-xl border border-prism-border bg-prism-surface-2 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.color }} />
                      <h3 className="font-medium">{t.name}</h3>
                    </div>
                    <span className="text-xs text-prism-text-muted tabular-nums">{fmtCompact(t.totalViews)} total views</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {t.top.map((p) => (
                      <div key={p.id} className="relative aspect-[3/4] overflow-hidden rounded-lg bg-prism-surface-3">
                        <img src={p.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                          <span className="text-[10px] font-medium text-white tabular-nums">{fmtCompact(p.views)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <footer className="border-t border-prism-border pt-4 text-center text-[11px] text-prism-text-muted">
          Generated with Prism · {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </footer>
      </div>
    </div>
  );
}

function Headline({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-prism-border bg-prism-surface-2 p-5">
      <div className="text-[11px] font-medium uppercase tracking-wider text-prism-text-muted">{label}</div>
      <div className="mt-1.5 font-display text-3xl font-semibold tabular-nums prism-gradient-text">{value}</div>
      {hint && <div className="mt-1 text-[11px] text-prism-text-muted">{hint}</div>}
    </div>
  );
}

function PlatformBlock({
  icon, name, stats,
}: { icon: React.ReactNode; name: string; stats: Stats["tiktok"] }) {
  return (
    <div className="rounded-xl border border-prism-border bg-prism-surface-2 p-5">
      <div className="flex items-center gap-2">
        {icon}<h3 className="font-medium">{name}</h3>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <Row label="Followers" value={stats.followers != null ? fmtCompact(stats.followers) : "—"} />
        <Row label="Posts" value={fmtCompact(stats.posts)} />
        <Row label="Total views" value={fmtCompact(stats.totalViews)} />
        <Row label="Typical post" value={fmtCompact(stats.medianViews)} />
        <Row label="Engagement" value={fmtPercent(stats.engagement, 2)} />
      </dl>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-prism-text-muted text-xs uppercase tracking-wider">{label}</dt>
      <dd className="tabular-nums font-medium">{value}</dd>
    </div>
  );
}
