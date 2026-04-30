import { requireUserId } from "@/lib/session";
import { getSoundStats } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { SoundsBoard } from "./sounds-board";

export const metadata = { title: "Sounds & Trends" };

export default async function SoundsPage() {
  const userId = await requireUserId();
  const sounds = await getSoundStats(userId);
  const serial = sounds.map((s) => ({
    id: s.id,
    title: s.title,
    artist: s.artist,
    platform: s.platform,
    thumbnailUrl: s.thumbnailUrl,
    status: s.status,
    savedAt: s.savedAt.toISOString(),
    usageCount: s.usageCount,
    topPostId: s.topPost?.id ?? null,
    topPostThumb: s.topPost?.thumbnailUrl ?? null,
  }));

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Sounds & Trends"
        description="Saved trending audio with the example video that's using each sound."
        badge={{ label: "Create", variant: "purple" }}
      />
      <SoundsBoard sounds={serial} />
    </div>
  );
}
