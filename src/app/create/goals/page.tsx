import { requireUserId } from "@/lib/session";
import { listGoals } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { GoalsBoard } from "./goals-board";

export const metadata = { title: "Goals" };

export default async function GoalsPage() {
  const userId = await requireUserId();
  const goals = await listGoals(userId);
  const serial = goals.map((g) => ({
    id: g.id, kind: g.kind, target: g.target, current: g.current,
    targetDate: g.targetDate?.toISOString() ?? null, notes: g.notes,
  }));
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        title="Goals"
        description="Track follower, view, and revenue goals across both platforms."
        badge={{ label: "Create", variant: "purple" }}
      />
      <GoalsBoard goals={serial} />
    </div>
  );
}
