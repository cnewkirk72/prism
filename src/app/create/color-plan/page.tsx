import { requireUserId } from "@/lib/session";
import { listColorPalettes } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { ColorPlanBoard } from "./color-plan-board";

export const metadata = { title: "Color Plan" };

export default async function ColorPlanPage() {
  const userId = await requireUserId();
  const palettes = await listColorPalettes(userId);
  const serial = palettes.map((p) => ({
    id: p.id,
    name: p.name,
    tag: p.tag,
    referenceUrl: p.referenceUrl,
    swatches: p.swatches.map((s) => ({ id: s.id, hex: s.hex, role: s.role, position: s.position })),
  }));
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Color Plan"
        description="Plan visual palettes per shoot — outfit, set, lighting, grade. Reference swatches and source images."
        badge={{ label: "Create", variant: "purple" }}
      />
      <ColorPlanBoard palettes={serial} />
    </div>
  );
}
