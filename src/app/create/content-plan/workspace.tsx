"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Music2, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  addChecklistItem, attachInspiration, attachSound, createContentPlan, deleteChecklistItem,
  deleteContentPlan, detachInspiration, detachSound, toggleChecklistItem,
} from "@/server/actions/content-plan";
import { cn } from "@/lib/utils";

type ItemRef = { id: string; title?: string; thumbnailUrl: string; sourceUrl?: string };

type Plan = {
  id: string;
  title: string;
  shootDate: string | null;
  notes: string | null;
  items: {
    id: string;
    phase: "BEFORE" | "DURING" | "AFTER";
    title: string;
    done: boolean;
    position: number;
    sounds: { id: string; title: string; thumbnailUrl: string }[];
    inspirations: { id: string; thumbnailUrl: string; sourceUrl: string }[];
  }[];
};

const PHASES: { key: Plan["items"][number]["phase"]; label: string }[] = [
  { key: "BEFORE", label: "Before" },
  { key: "DURING", label: "During" },
  { key: "AFTER", label: "After" },
];

export function ContentPlanWorkspace({
  plans, sounds, inspirations,
}: {
  plans: Plan[];
  sounds: { id: string; title: string; thumbnailUrl: string }[];
  inspirations: { id: string; thumbnailUrl: string; sourceUrl: string }[];
}) {
  const [activeId, setActiveId] = useState<string | null>(plans[0]?.id ?? null);
  const [openNew, setOpenNew] = useState(false);
  const active = plans.find((p) => p.id === activeId) ?? plans[0] ?? null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px,1fr]">
      <aside className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-prism-text-muted">Shoots</p>
          <Dialog open={openNew} onOpenChange={setOpenNew}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"><Plus className="h-3.5 w-3.5" />New</Button>
            </DialogTrigger>
            <NewPlanDialog onClose={(id) => { setOpenNew(false); if (id) setActiveId(id); }} />
          </Dialog>
        </div>
        <ul className="flex flex-col gap-1">
          {plans.map((p) => {
            const total = p.items.length;
            const done = p.items.filter((i) => i.done).length;
            const pct = total ? Math.round((done / total) * 100) : 0;
            return (
              <li key={p.id}>
                <button
                  onClick={() => setActiveId(p.id)}
                  className={cn(
                    "flex w-full flex-col gap-1.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
                    p.id === active?.id
                      ? "border-prism-purple/50 bg-prism-surface-2"
                      : "border-prism-border bg-prism-surface hover:bg-prism-surface-2",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-prism-text truncate">{p.title}</span>
                    <span className="text-[10px] text-prism-text-muted tabular-nums">{done}/{total}</span>
                  </div>
                  {p.shootDate && (
                    <span className="text-[11px] text-prism-text-muted">{format(new Date(p.shootDate), "MMM d, yyyy")}</span>
                  )}
                  <Progress value={pct} />
                </button>
              </li>
            );
          })}
          {!plans.length && (
            <li className="rounded-lg border border-dashed border-prism-border px-3 py-6 text-center text-xs text-prism-text-muted">
              No shoots yet. Create one →
            </li>
          )}
        </ul>
      </aside>

      <main>
        {active ? (
          <PlanDetail plan={active} sounds={sounds} inspirations={inspirations} />
        ) : (
          <div className="prism-card grid place-items-center px-6 py-20 text-center">
            <p className="text-sm text-prism-text-muted">Create a content plan to get started.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function PlanDetail({
  plan, sounds, inspirations,
}: {
  plan: Plan;
  sounds: { id: string; title: string; thumbnailUrl: string }[];
  inspirations: { id: string; thumbnailUrl: string; sourceUrl: string }[];
}) {
  const total = plan.items.length;
  const done = plan.items.filter((i) => i.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const [pending, start] = useTransition();

  return (
    <div className="prism-card">
      <div className="flex flex-wrap items-start justify-between gap-3 p-5 pb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-semibold text-prism-text">{plan.title}</h2>
            {plan.shootDate && <Badge variant="purple">{format(new Date(plan.shootDate), "MMM d")}</Badge>}
          </div>
          {plan.notes && <p className="mt-1 text-sm text-prism-text-muted">{plan.notes}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-xs text-prism-text-muted">{done} / {total}</span>
            <div className="w-32"><Progress value={pct} /></div>
          </div>
          <Button
            variant="danger"
            size="sm"
            disabled={pending}
            onClick={() => {
              if (!confirm("Delete this content plan?")) return;
              start(async () => {
                try { await deleteContentPlan(plan.id); toast.success("Plan deleted"); }
                catch { toast.error("Couldn't delete"); }
              });
            }}
          ><Trash2 className="h-3.5 w-3.5" />Delete</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-5 pt-2 lg:grid-cols-3">
        {PHASES.map(({ key, label }) => {
          const items = plan.items.filter((i) => i.phase === key);
          return (
            <PhaseColumn
              key={key}
              planId={plan.id}
              phase={key}
              label={label}
              items={items}
              allSounds={sounds}
              allInspirations={inspirations}
            />
          );
        })}
      </div>
    </div>
  );
}

function PhaseColumn({
  planId, phase, label, items, allSounds, allInspirations,
}: {
  planId: string;
  phase: Plan["items"][number]["phase"];
  label: string;
  items: Plan["items"];
  allSounds: { id: string; title: string; thumbnailUrl: string }[];
  allInspirations: { id: string; thumbnailUrl: string; sourceUrl: string }[];
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [pending, start] = useTransition();

  function add() {
    const value = draft.trim();
    if (!value) { setAdding(false); return; }
    start(async () => {
      try {
        await addChecklistItem({ contentPlanId: planId, phase, title: value });
        setDraft(""); setAdding(false);
      } catch { toast.error("Couldn't add"); }
    });
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-prism-border bg-prism-surface-2/40 p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-prism-text-muted">{label}</h3>
        <span className="rounded-full bg-prism-surface-3 px-2 py-0.5 text-[10px] text-prism-text-muted">{items.length}</span>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((it) => (
          <ChecklistRow
            key={it.id}
            item={it}
            allSounds={allSounds}
            allInspirations={allInspirations}
          />
        ))}
        {adding ? (
          <li>
            <Input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") add(); if (e.key === "Escape") { setAdding(false); setDraft(""); } }}
              onBlur={add}
              placeholder="Add a step…"
              disabled={pending}
            />
          </li>
        ) : (
          <li>
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex w-full items-center gap-2 rounded-lg border border-dashed border-prism-border px-3 py-2 text-xs text-prism-text-muted hover:border-prism-purple hover:text-prism-text"
            >
              <Plus className="h-3.5 w-3.5" />Add step
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}

function ChecklistRow({
  item, allSounds, allInspirations,
}: {
  item: Plan["items"][number];
  allSounds: { id: string; title: string; thumbnailUrl: string }[];
  allInspirations: { id: string; thumbnailUrl: string; sourceUrl: string }[];
}) {
  const [pending, start] = useTransition();

  return (
    <li className={cn(
      "rounded-lg border bg-prism-surface px-3 py-2.5 transition-colors",
      item.done ? "border-prism-success/30 opacity-70" : "border-prism-border",
    )}>
      <div className="flex items-start gap-2.5">
        <Checkbox
          checked={item.done}
          onCheckedChange={(checked) =>
            start(async () => {
              try { await toggleChecklistItem(item.id, !!checked); }
              catch { toast.error("Couldn't update"); }
            })
          }
          className="mt-0.5"
        />
        <div className="min-w-0 flex-1">
          <p className={cn("text-sm leading-snug", item.done ? "line-through text-prism-text-muted" : "text-prism-text")}>{item.title}</p>
          {(item.sounds.length > 0 || item.inspirations.length > 0) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {item.sounds.map((s) => (
                <span key={s.id} className="group/chip flex items-center gap-1.5 rounded-md bg-prism-surface-2 px-1.5 py-0.5 text-[10px]">
                  <img src={s.thumbnailUrl} alt="" className="h-4 w-4 rounded object-cover" />
                  <span className="truncate max-w-[120px]">{s.title}</span>
                  <button
                    type="button"
                    onClick={() => start(async () => { await detachSound(item.id, s.id); })}
                    className="opacity-0 group-hover/chip:opacity-100 text-prism-text-muted hover:text-prism-danger"
                    aria-label="Detach sound"
                  >×</button>
                </span>
              ))}
              {item.inspirations.map((i) => (
                <span key={i.id} className="group/chip flex items-center gap-1.5 rounded-md bg-prism-surface-2 px-1 py-0.5 text-[10px]">
                  <img src={i.thumbnailUrl} alt="" className="h-4 w-4 rounded object-cover" />
                  <button
                    type="button"
                    onClick={() => start(async () => { await detachInspiration(item.id, i.id); })}
                    className="opacity-0 group-hover/chip:opacity-100 text-prism-text-muted hover:text-prism-danger"
                    aria-label="Detach inspiration"
                  >×</button>
                </span>
              ))}
            </div>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="grid h-7 w-7 place-items-center rounded-md text-prism-text-muted hover:bg-prism-surface-2 hover:text-prism-text"
              aria-label="Attach"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-w-xs">
            {allSounds.length > 0 && (<>
              <DropdownMenuLabel><Music2 className="inline h-3 w-3 mr-1" />Link a sound</DropdownMenuLabel>
              <div className="max-h-40 overflow-y-auto">
                {allSounds.slice(0, 12).map((s) => (
                  <DropdownMenuItem key={s.id} onSelect={() => start(async () => {
                    try { await attachSound(item.id, s.id); toast.success("Sound linked"); }
                    catch { toast.error("Couldn't link"); }
                  })}>
                    <img src={s.thumbnailUrl} alt="" className="h-5 w-5 rounded object-cover" />
                    <span className="truncate">{s.title}</span>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
            </>)}
            {allInspirations.length > 0 && (<>
              <DropdownMenuLabel><Sparkles className="inline h-3 w-3 mr-1" />Link inspiration</DropdownMenuLabel>
              <div className="max-h-40 overflow-y-auto">
                {allInspirations.slice(0, 12).map((i) => (
                  <DropdownMenuItem key={i.id} onSelect={() => start(async () => {
                    try { await attachInspiration(item.id, i.id); toast.success("Inspiration linked"); }
                    catch { toast.error("Couldn't link"); }
                  })}>
                    <img src={i.thumbnailUrl} alt="" className="h-5 w-5 rounded object-cover" />
                    <span className="truncate">{i.sourceUrl.replace(/^https?:\/\//, "").slice(0, 32)}</span>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
            </>)}
            <DropdownMenuItem
              className="text-prism-danger"
              onSelect={() => {
                if (!confirm("Delete this step?")) return;
                start(async () => { await deleteChecklistItem(item.id); });
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />Delete step
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
}

function NewPlanDialog({ onClose }: { onClose: (id?: string) => void }) {
  const [title, setTitle] = useState("");
  const [shootDate, setShootDate] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      try {
        const id = await createContentPlan({ title, shootDate: shootDate || null, notes: notes || null });
        toast.success("Plan created with starter checklist");
        onClose(id);
      } catch (err) { toast.error(err instanceof Error ? err.message : "Couldn't create"); }
    });
  }

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>New content plan</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-prism-text-secondary">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Hair dye march 21" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-prism-text-secondary">Shoot date</label>
          <Input type="date" value={shootDate} onChange={(e) => setShootDate(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-prism-text-secondary">Notes</label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Pink wash → silver toner" />
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onClose()}>Cancel</Button>
          <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create plan"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
