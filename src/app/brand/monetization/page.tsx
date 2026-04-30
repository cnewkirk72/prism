import { requireUserId } from "@/lib/session";
import { listAffiliates, listActionItems } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { AffiliatesTable } from "./affiliates-table";
import { ActionItemsRail } from "./action-items-rail";

export const metadata = { title: "Monetization" };

export default async function MonetizationPage() {
  const userId = await requireUserId();
  const [affiliates, items] = await Promise.all([
    listAffiliates(userId),
    listActionItems(userId),
  ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Monetization"
        description="Track every affiliate program and brand deal in one place, with a side-rail of pending business action items."
        badge={{ label: "Brand", variant: "pink" }}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,320px]">
        <AffiliatesTable
          rows={affiliates.map((a) => ({
            id: a.id, brand: a.brand, programName: a.programName,
            commissionBps: a.commissionBps, commissionNote: a.commissionNote,
            status: a.status, link: a.link,
          }))}
        />
        <ActionItemsRail items={items.map((i) => ({ id: i.id, title: i.title, done: i.done }))} />
      </div>
    </div>
  );
}
