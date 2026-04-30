"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createPalette, deletePalette } from "@/server/actions/color-plan";

type Swatch = { id?: string; hex: string; role: string; position?: number };
type Palette = {
  id: string; name: string; tag: string | null; referenceUrl: string | null;
  swatches: Swatch[];
};

const ROLES = ["outfit", "set", "accent", "grade", "hair", "other"] as const;

export function ColorPlanBoard({ palettes }: { palettes: Palette[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-prism-text-muted">{palettes.length} palettes</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4" />New palette</Button></DialogTrigger>
          <PaletteDialog onClose={() => setOpen(false)} />
        </Dialog>
      </div>

      {palettes.length === 0 ? (
        <div className="prism-card grid place-items-center px-6 py-16 text-center">
          <p className="text-sm text-prism-text-muted">No palettes yet. Build your first to color-coordinate a shoot.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {palettes.map((p) => <PaletteCard key={p.id} palette={p} />)}
        </div>
      )}
    </div>
  );
}

function PaletteCard({ palette }: { palette: Palette }) {
  const [pending, start] = useTransition();
  return (
    <article className="prism-card overflow-hidden">
      {palette.referenceUrl ? (
        <img src={palette.referenceUrl} alt="" className="aspect-[4/3] w-full object-cover" />
      ) : (
        <div className="grid aspect-[4/3] place-items-center bg-prism-surface-2">
          <span className="text-xs text-prism-text-muted">No reference image</span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-semibold">{palette.name}</h3>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!confirm("Delete this palette?")) return;
              start(async () => {
                try { await deletePalette(palette.id); toast.success("Palette deleted"); }
                catch { toast.error("Couldn't delete"); }
              });
            }}
            aria-label="Delete palette"
            className="grid h-7 w-7 place-items-center rounded-md text-prism-text-muted hover:bg-prism-surface-2 hover:text-prism-danger"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        {palette.tag && <p className="text-[11px] uppercase tracking-wider text-prism-text-muted">{palette.tag}</p>}
        <div className="mt-3 flex gap-1">
          {palette.swatches.map((s, i) => (
            <button
              key={s.id ?? i}
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(s.hex).then(() => toast.success(`${s.hex} copied`));
              }}
              className="group relative flex flex-1 flex-col items-center gap-1 rounded-md p-1 hover:bg-prism-surface-2"
              title={`${s.role}: ${s.hex} — click to copy`}
            >
              <span className="block h-12 w-full rounded-md" style={{ background: s.hex }} />
              <span className="font-mono text-[9px] text-prism-text-muted">{s.hex.toUpperCase()}</span>
              <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <Copy className="h-3 w-3" />
              </span>
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {palette.swatches.map((s, i) => (
            <span key={s.id ?? i} className="rounded-full bg-prism-surface-2 px-2 py-0.5 text-[10px] text-prism-text-muted">
              {s.role}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function PaletteDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [refUrl, setRefUrl] = useState("");
  const [swatches, setSwatches] = useState<Swatch[]>([
    { hex: "#A855F7", role: "accent" },
    { hex: "#EC4899", role: "outfit" },
    { hex: "#0F172A", role: "set" },
  ]);
  const [pending, start] = useTransition();

  function update(i: number, patch: Partial<Swatch>) {
    setSwatches((cur) => cur.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }
  function add() {
    if (swatches.length >= 8) return;
    setSwatches((cur) => [...cur, { hex: "#FFFFFF", role: "accent" }]);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      try {
        await createPalette({
          name, tag: tag || null,
          referenceUrl: refUrl || null,
          swatches: swatches.map((s) => ({ hex: s.hex, role: s.role as typeof ROLES[number] })),
        });
        toast.success("Palette saved");
        onClose();
      } catch (err) { toast.error(err instanceof Error ? err.message : "Couldn't save"); }
    });
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader><DialogTitle>New color palette</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-prism-text-secondary">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Coachella W2" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-prism-text-secondary">Tag</label>
            <Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="festival, golden hour…" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-prism-text-secondary">Reference image URL</label>
          <Input value={refUrl} onChange={(e) => setRefUrl(e.target.value)} placeholder="https://…" />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-prism-text-secondary">Swatches</label>
            <Button type="button" size="sm" variant="ghost" onClick={add} disabled={swatches.length >= 8}>+ Add swatch</Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {swatches.map((s, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-prism-border bg-prism-surface-2 p-2">
                <input
                  type="color"
                  value={s.hex}
                  onChange={(e) => update(i, { hex: e.target.value })}
                  className="h-9 w-12 cursor-pointer rounded border border-prism-border bg-transparent"
                />
                <Input value={s.hex} onChange={(e) => update(i, { hex: e.target.value })} className="font-mono uppercase" maxLength={7} />
                <Select value={s.role} onValueChange={(v) => update(i, { role: v })}>
                  <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={() => setSwatches((cur) => cur.filter((_, x) => x !== i))}
                  disabled={swatches.length <= 1}
                  className="grid h-8 w-8 place-items-center rounded-md text-prism-text-muted hover:bg-prism-surface-3 hover:text-prism-danger"
                  aria-label="Remove swatch"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save palette"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
