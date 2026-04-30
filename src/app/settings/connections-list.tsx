"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RefreshCw, Unlink } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TikTokIcon, InstagramIcon } from "@/components/icons/PlatformIcon";
import { fmtCompact } from "@/lib/utils";

type Connection = {
  id: string;
  platform: "TIKTOK" | "INSTAGRAM";
  externalHandle: string | null;
  externalName: string | null;
  externalAvatar: string | null;
  scope: string | null;
  followerCount: number | null;
  postCount: number | null;
  expiresAt: number | null;
  connectedAt: Date;
  lastSyncedAt: Date | null;
  syncError: string | null;
};

const PLATFORM_META = {
  TIKTOK: {
    name: "TikTok",
    Icon: TikTokIcon,
    accent: "tiktok" as const,
    description: "Pull video metadata, view counts, and engagement stats.",
    startUrl: "/api/connect/tiktok/start",
  },
  INSTAGRAM: {
    name: "Instagram",
    Icon: InstagramIcon,
    accent: "instagram" as const,
    description: "Sync reels, posts, reach, and saves from Instagram for Business.",
    startUrl: "/api/connect/instagram/start",
  },
};

export function ConnectionsList({ connections }: { connections: Connection[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const byPlatform = new Map(connections.map((c) => [c.platform, c]));

  async function disconnect(platform: "TIKTOK" | "INSTAGRAM") {
    if (!confirm(`Disconnect ${PLATFORM_META[platform].name}? Local data is kept; only the OAuth token is removed.`)) return;
    setBusy(platform);
    try {
      const res = await fetch("/api/connect/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
      if (!res.ok) throw new Error("Couldn't disconnect");
      toast.success(`${PLATFORM_META[platform].name} disconnected`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Disconnect failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {(["TIKTOK", "INSTAGRAM"] as const).map((platform) => {
        const meta = PLATFORM_META[platform];
        const conn = byPlatform.get(platform);
        const Icon = meta.Icon;
        const expired = conn?.expiresAt ? conn.expiresAt * 1000 < Date.now() : false;

        return (
          <div
            key={platform}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-prism-border bg-prism-surface-2 p-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className={`grid h-10 w-10 place-items-center rounded-lg ${platform === "TIKTOK" ? "bg-prism-tiktok/15 text-[hsl(var(--prism-tiktok))]" : "bg-prism-pink/15 text-prism-pink-bright"}`}>
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-prism-text">{meta.name}</span>
                  {conn ? (
                    expired ? (
                      <Badge variant="warning">Token expired</Badge>
                    ) : (
                      <Badge variant="success">
                        <CheckCircle2 className="h-3 w-3" /> Connected
                      </Badge>
                    )
                  ) : (
                    <Badge variant="default">Not connected</Badge>
                  )}
                </div>
                {conn ? (
                  <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-prism-text-muted">
                    <span>{conn.externalHandle ?? conn.externalName ?? conn.externalName}</span>
                    {conn.followerCount != null && <span>{fmtCompact(conn.followerCount)} followers</span>}
                    {conn.postCount != null && <span>{fmtCompact(conn.postCount)} posts</span>}
                    {conn.lastSyncedAt && <span>Synced {format(conn.lastSyncedAt, "MMM d 'at' p")}</span>}
                  </div>
                ) : (
                  <div className="mt-0.5 text-xs text-prism-text-muted">{meta.description}</div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {conn ? (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push(meta.startUrl)}
                    disabled={busy === platform}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Re-auth
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => disconnect(platform)}
                    disabled={busy === platform}
                  >
                    <Unlink className="h-3.5 w-3.5" />
                    Disconnect
                  </Button>
                </>
              ) : (
                <a href={meta.startUrl}>
                  <Button size="sm">Connect {meta.name}</Button>
                </a>
              )}
            </div>
          </div>
        );
      })}

      <p className="mt-2 text-[12px] text-prism-text-muted">
        Connecting requires app credentials in <code className="font-mono">.env</code>. See{" "}
        <code className="font-mono">CONNECTIONS.md</code> for the TikTok and Meta setup walkthroughs.
      </p>
    </div>
  );
}
