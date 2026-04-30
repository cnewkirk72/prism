"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { upsertAffiliate, deleteAffiliate, setAffiliateStatus } from "@/server/actions/affiliates";
import { fmtPercent, cn } from "@/lib/utils";

type Status = "TO_APPLY" | "APPLIED" | "APPROVED" | "REJECTED" | "ACTIVE" | "PAUSED";

type Row = {
  id: string;
  brand: string;
  programName: string;
  commissionBps: number | null;
  commissionNote: string | null;
  status: Status;
  link: string | null;
};

export function AffiliatesTable({ rows }: { rows: Row[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Affiliate programs</CardTitle>
          <CardDescription>{rows.length} tracked</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4" />Add program</Button>
          </DialogTrigger>
          <AffiliateDialog initial={editing} onClose={() => { setOpen(false); setEditing(null); }} />
        </Dialog>
      </CardHeader>
      <CardContent className="px-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-prism-border text-[11px] uppercase tracking-wider text-prism-text-muted">
              <th className="px-5 py-3 text-left font-medium">Brand</th>
              <th className="px-5 py-3 text-left font-medium">Program</th>
              <th className="px-5 py-3 text-left font-medium">Commission</th>
              <th className="px-5 py-3 text-left font-medium">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => <AffiliateRow key={r.id} row={r} onEdit={() => { setEditing(r); setOpen(true); }} />)}
            {!rows.length && (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-prism-text-muted">No programs yet. Add your first to start tracking.</td></tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function AffiliateRow({ row, onEdit }: { row: Row; onEdit: () => void }) {
  const [pending, start] = useTransition();
  const commission = row.commissionBps != null ? fmtPercent(row.commissionBps / 10_000, 1) : (row.commissionNote ?? "—");

  return (
    <tr className="border-b border-prism-border/60 last:border-none hover:bg-prism-surface-2">
      <td className="px-5 py-3 font-medium">{row.brand}</td>
      <td className="px-5 py-3 text-prism-text-secondary">{row.programName}</td>
      <td className="px-5 py-3 tabular-nums">{commission}</td>
      <td className="px-5 py-3">
        <Select
          value={row.status}
          onValueChange={(v) => start(async () => {
            try { await setAffiliateStatus(row.id, v as Status); toast.success("Status updated"); }
            catch { toast.error("Couldn't update"); }
          })}
        >
          <SelectTrigger className={cn("h-7 w-auto px-2 text-[11px] uppercase tracking-wide gap-1.5",
            row.status === "ACTIVE" || row.status === "APPROVED" ? "border-prism-success/40 text-prism-success" :
            row.status === "APPLIED" ? "border-prism-warning/40 text-prism-warning" :
            row.status === "REJECTED" ? "border-prism-danger/40 text-prism-danger" :
            "border-prism-border text-prism-text-secondary",
          )}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["TO_APPLY","APPLIED","APPROVED","ACTIVE","PAUSED","REJECTED"] as Status[]).map((s) => (
              <SelectItem key={s} value={s}>{s.replace("_", " ").toLowerCase()}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="px-5 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          {row.link && (
            <a href={row.link} target="_blank" rel="noopener noreferrer" className="grid h-7 w-7 place-items-center rounded-md text-prism-text-muted hover:bg-prism-surface-3 hover:text-prism-text" aria-label="Open link">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <button onClick={onEdit} className="rounded-md px-2 py-1 text-xs text-prism-text-muted hover:bg-prism-surface-3 hover:text-prism-text">Edit</button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!confirm("Delete this program?")) return;
              start(async () => {
                try { await deleteAffiliate(row.id); toast.success("Program deleted"); }
                catch { toast.error("Couldn't delete"); }
              });
            }}
            aria-label="Delete"
            className="grid h-7 w-7 place-items-center rounded-md text-prism-text-muted hover:bg-prism-surface-3 hover:text-prism-danger"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function AffiliateDialog({ initial, onClose }: { initial: Row | null; onClose: () => void }) {
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [programName, setProgramName] = useState(initial?.programName ?? "");
  const [commission, setCommission] = useState(initial?.commissionBps != null ? (initial.commissionBps / 100).toString() : "");
  const [commissionNote, setCommissionNote] = useState(initial?.commissionNote ?? "");
  const [link, setLink] = useState(initial?.link ?? "");
  const [status, setStatus] = useState<Status>(initial?.status ?? "TO_APPLY");
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      try {
        await upsertAffiliate({
          id: initial?.id, brand, programName,
          commissionBps: commission ? Math.round(Number(commission) * 100) : null,
          commissionNote: commissionNote || null,
          status, link: link || null,
        });
        toast.success("Program saved");
        onClose();
      } catch (err) { toast.error(err instanceof Error ? err.message : "Couldn't save"); }
    });
  }

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>{initial ? "Edit program" : "New program"}</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-prism-text-secondary">Brand</label>
            <Input value={brand} onChange={(e) => setBrand(e.target.value)} required placeholder="Glossier" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-prism-text-secondary">Program name</label>
            <Input value={programName} onChange={(e) => setProgramName(e.target.value)} required placeholder="Creator" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-prism-text-secondary">Commission %</label>
            <Input type="number" min={0} max={100} step={0.1} value={commission} onChange={(e) => setCommission(e.target.value)} placeholder="10" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-prism-text-secondary">Or note</label>
            <Input value={commissionNote} onChange={(e) => setCommissionNote(e.target.value)} placeholder="Variable 1–10%" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-prism-text-secondary">Affiliate link</label>
          <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-prism-text-secondary">Status</label>
          <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(["TO_APPLY","APPLIED","APPROVED","ACTIVE","PAUSED","REJECTED"] as Status[]).map((s) => (
                <SelectItem key={s} value={s}>{s.replace("_", " ").toLowerCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save program"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
