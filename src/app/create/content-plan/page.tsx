import { requireUserId } from "@/lib/session";
import { listContentPlans, getSoundStats, listInspiration } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { ContentPlanWorkspace } from "./workspace";

export const metadata = { title: "Content Plan" };

export default async function ContentPlanPage() {
  const userId = await requireUserId();
  const [plans, sounds, insp] = await Promise.all([
    listContentPlans(userId),
    getSoundStats(userId),
    listInspiration(userId),
  ]);

  const serialPlans = plans.map((p) => ({
    id: p.id,
    title: p.title,
    shootDate: p.shootDate?.toISOString() ?? null,
    notes: p.notes,
    items: p.items.map((it) => ({
      id: it.id,
      phase: it.phase,
      title: it.title,
      done: it.done,
      position: it.position,
      sounds: it.sounds.map((s) => ({ id: s.sound.id, title: s.sound.title, thumbnailUrl: s.sound.thumbnailUrl })),
      inspirations: it.inspirations.map((i) => ({ id: i.inspiration.id, thumbnailUrl: i.inspiration.thumbnailUrl, sourceUrl: i.inspiration.sourceUrl })),
    })),
  }));

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Content Plan"
        description="Detailed checklist for every shoot, grouped Before / During / After. Link sounds and inspiration to specific steps."
        badge={{ label: "Create", variant: "purple" }}
      />
      <ContentPlanWorkspace
        plans={serialPlans}
        sounds={sounds.map((s) => ({ id: s.id, title: s.title, thumbnailUrl: s.thumbnailUrl }))}
        inspirations={insp.map((i) => ({ id: i.id, thumbnailUrl: i.thumbnailUrl, sourceUrl: i.sourceUrl }))}
      />
    </div>
  );
}
