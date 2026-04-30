"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { upsertGoal, deleteGoal } from "@/server/actions/goals";
import { fmtCompact, fmtCurrency } from "@/lib/utils";

type GoalKind = "FOLLOWERS_TIKTOK" | "FOLLOWERS_INSTAGRAM" | "VIEWS_MONTHLY" | "REVENUE_MONTHLY";
type Goal = { id: string; kind: GoalKind; target: number; current: number; targetDate: string | null; notes: string | null };

const KIND_META: Record<GoalKind, { label: string; suffix: string; format: (n: number) => string }> = {
  FOLLOWERS_TIKTOK: { label: "TikTok followers", suffix: "followers", format: fmtCompact },
  FOLLOWERS_INSTAGRAM: { label: "Instagram followers", suffix: "followers", format: fmtCompact },
  VIEWS_MONTHLY: { label: "Monthly views", suffix: "views / mo", format: fmtCompact },
  REVENUE_MONTHLY: { label: "Monthly revenue", suffix: "/ mo", format: (n) => fmtCurrency(n) },
};

export function GoalsBoard({ goals }: { goals: Goal[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-prism-text-muted">{goals.length} active goals</p>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4" />New goal</Button>
          </DialogTrigger>
          <GoalDialog initial={editing} onClose={() => { setOpen(false); setEditing(null); }} />
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <div className="prism-card grid place-items-center px-6 py-16 text-center">
          <p className="text-sm text-prism-text-muted">Set a goal to make your work countable.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {goals.map((g) => <GoalCard key={g.id} goal={g} onEdit={() => { setEditing(g); setOpen(true); }} />)}
        </ul>
      )}
    </div>
  );
}

function GoalCard({ goal, onEdit }: { goal: Goal; onEdit: () => void }) {
  const meta = KIND_META[goal.kind];
  const pct = Math.min(100, Math.round((goal.current / Math.max(goal.target, 1)) * 100));
  const C = 56; const r = 26; const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const [pending, start] = useTransition();

  return (
    <li className="prism-card flex items-center gap-4 p-5">
      <svg width={C} height={C} viewBox={`0 0 ${C} ${C}`}>
        <circle cx={C / 2} cy={C / 2} r={r} stroke="hsl(var(--prism-surface-3))" strokeWidth={4} fill="none" />
        <circle
          cx={C / 2} cy={C / 2} r={r}
          stroke="url(#goal-grad)"
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${C / 2} ${C / 2})`}
        />
        <defs>
          <linearGradient id="goal-grad" x1="0" y1="0" x2={C} y2={C} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
        <text x="50%" y="52%" textAnchor="middle" fontSize="13" fontWeight={600} fill="currentColor" className="font-display tabular-nums">{pct}%</text>
      </svg>
      <div className="min-w-0 flex-1">
        <h3 className="font-medium">{meta.label}</h3>
        <p className="mt-0.5 text-xs text-prism-text-muted tabular-nums">
          {meta.format(goal.current)} of {meta.format(goal.target)} {meta.suffix}
        </p>
        {goal.targetDate && <p className="text-[11px] text-prism-text-muted">By {format(new Date(goal.targetDate), "MMM d, yyyy")}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <Button size="sm" variant="ghost" onClick={onEdit}>Edit</Button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!confirm("Delete this goal?")) return;
            start(async () => {
              try { await deleteGoal(goal.id); toast.success("Goal deleted"); }
              catch { toast.error("Couldn't delete"); }
            });
          }}
          aria-label="Delete"
          className="grid h-8 w-8 place-items-center rounded-md text-prism-text-muted hover:bg-prism-surface-2 hover:text-prism-danger"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}

function GoalDialog({ initial, onClose }: { initial: Goal | null; onClose: () => void }) {
  const [kind, setKind] = useState<GoalKind>(initial?.kind ?? "FOLLOWERS_TIKTOK");
  const [target, setTarget] = useState(initial?.target?.toString() ?? "100000");
  const [current, setCurrent] = useState(initial?.current?.toString() ?? "0");
  const [targetDate, setTargetDate] = useState(initial?.targetDate ? initial.targetDate.slice(0, 10) : "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      try {
        await upsertGoal({
          id: initial?.id, kind,
          target: Number(target), current: Number(current),
          targetDate: targetDate || null,
          notes: notes || null,
        });
        toast.success("Goal saved");
        onClose();
      } catch (err) { toast.error(err instanceof Error ? err.message : "Couldn't save"); }
    });
  }

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>{initial ? "Edit goal" : "New goal"}</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-prism-text-secondary">Type</label>
          <Select value={kind} onValueChange={(v) => setKind(v as GoalKind)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(KIND_META).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-prism-text-secondary">Target</label>
            <Input type="number" min={1} value={target} onChange={(e) => setTarget(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-prism-text-secondary">Current</label>
            <Input type="number" min={0} value={current} onChange={(e) => setCurrent(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-prism-text-secondary">Target date</label>
          <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-prism-text-secondary">Notes</label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save goal"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
