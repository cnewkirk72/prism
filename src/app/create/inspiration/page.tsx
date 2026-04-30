import { requireUserId } from "@/lib/session";
import { listInspiration, listInspirationTags } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { InspirationBoard } from "./inspiration-board";

export const metadata = { title: "Inspiration" };

export default async function InspirationPage() {
  const userId = await requireUserId();
  const [items, tags] = await Promise.all([listInspiration(userId), listInspirationTags()]);
  const serial = items.map((i) => ({
    id: i.id,
    sourceUrl: i.sourceUrl,
    platform: i.platform,
    thumbnailUrl: i.thumbnailUrl,
    note: i.note,
    savedAt: i.savedAt.toISOString(),
    tags: i.tags.map((t) => ({ id: t.id, name: t.name })),
  }));

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Inspiration"
        description="A visual board of saved IG and TikTok references. Tag and filter by trend, transition, vibe."
        badge={{ label: "Create", variant: "purple" }}
      />
      <InspirationBoard items={serial} allTags={tags.map((t) => ({ id: t.id, name: t.name }))} />
    </div>
  );
}
