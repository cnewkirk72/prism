import { requireUserId } from "@/lib/session";
import { listIdeas } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { IdeasKanban } from "./ideas-kanban";

export const metadata = { title: "Ideas" };

export default async function IdeasPage({ searchParams }: { searchParams: { new?: string } }) {
  const userId = await requireUserId();
  const ideas = await listIdeas(userId);
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Ideas"
        description="Sticky-note Kanban board. Capture every spark, then move it through your pipeline."
        badge={{ label: "Create", variant: "purple" }}
      />
      <IdeasKanban
        initial={ideas.map((i) => ({
          id: i.id, title: i.title, description: i.description,
          status: i.status, categoryTags: i.categoryTags, position: i.position,
        }))}
        autoOpenNew={searchParams.new === "1"}
      />
    </div>
  );
}
