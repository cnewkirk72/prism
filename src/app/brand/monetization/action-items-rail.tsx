"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createActionItem, deleteActionItem, toggleActionItem } from "@/server/actions/action-items";
import { cn } from "@/lib/utils";

type Item = { id: string; title: string; done: boolean };

export function ActionItemsRail({ items }: { items: Item[] }) {
  const [draft, setDraft] = useState("");
  const [pending, start] = useTransition();

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    start(async () => {
      try {
        await createActionItem({ title: draft });
        setDraft("");
        toast.success("Action added");
      } catch { toast.error("Couldn't add"); }
    });
  }

  const open = items.filter((i) => !i.done);
  const done = items.filter((i) => i.done);

  return (
    <Card className="lg:sticky lg:top-20 self-start">
      <CardHeader>
        <CardTitle>Action items</CardTitle>
        <CardDescription>Pending business tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-1">
          {open.map((item) => <Row key={item.id} item={item} />)}
          {open.length === 0 && (
            <li className="rounded-lg border border-dashed border-prism-border px-3 py-4 text-center text-xs text-prism-text-muted">
              All caught up.
            </li>
          )}
        </ul>

        <form onSubmit={add} className="mt-3 flex gap-2">
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add an action…" className="h-9" />
          <Button type="submit" size="sm" disabled={pending || !draft.trim()}><Plus className="h-3.5 w-3.5" /></Button>
        </form>

        {done.length > 0 && (
          <details className="mt-4">
            <summary className="cursor-pointer text-[11px] uppercase tracking-wider text-prism-text-muted hover:text-prism-text">
              Completed ({done.length})
            </summary>
            <ul className="mt-2 flex flex-col gap-1">
              {done.map((item) => <Row key={item.id} item={item} />)}
            </ul>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

function Row({ item }: { item: Item }) {
  const [pending, start] = useTransition();
  return (
    <li className={cn(
      "group flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-prism-surface-2",
      item.done && "opacity-60",
    )}>
      <Checkbox
        checked={item.done}
        onCheckedChange={(v) => start(async () => {
          try { await toggleActionItem(item.id, !!v); }
          catch { toast.error("Couldn't update"); }
        })}
      />
      <span className={cn("flex-1 leading-snug", item.done && "line-through text-prism-text-muted")}>{item.title}</span>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => {
          try { await deleteActionItem(item.id); }
          catch { toast.error("Couldn't delete"); }
        })}
        aria-label="Delete"
        className="grid h-6 w-6 place-items-center rounded text-prism-text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-prism-danger"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </li>
  );
}
