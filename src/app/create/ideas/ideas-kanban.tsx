"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  DndContext, DragOverlay, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent, type DragStartEvent,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext, useSortable, verticalListSortingStrategy, sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createIdea, deleteIdea, moveIdea } from "@/server/actions/ideas";
import { cn } from "@/lib/utils";

type Idea = {
  id: string; title: string; description: string | null;
  status: "SPARK" | "DRAFTED" | "READY" | "FILMED" | "POSTED";
  categoryTags: string | null;
  position: number;
};

const COLUMNS: Idea["status"][] = ["SPARK", "DRAFTED", "READY", "FILMED", "POSTED"];
const COLUMN_LABEL: Record<Idea["status"], string> = {
  SPARK: "Spark", DRAFTED: "Drafted", READY: "Ready", FILMED: "Filmed", POSTED: "Posted",
};

export function IdeasKanban({ initial, autoOpenNew }: { initial: Idea[]; autoOpenNew?: boolean }) {
  const [ideas, setIdeas] = useState(initial);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState(!!autoOpenNew);

  useEffect(() => { setIdeas(initial); }, [initial]);

  const grouped = useMemo(() => {
    const m: Record<Idea["status"], Idea[]> = { SPARK: [], DRAFTED: [], READY: [], FILMED: [], POSTED: [] };
    for (const i of [...ideas].sort((a, b) => a.position - b.position)) m[i.status].push(i);
    return m;
  }, [ideas]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  async function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const activeIdea = ideas.find((i) => i.id === active.id);
    if (!activeIdea) return;

    // The over.id can be either an idea id or a column id
    const overIdea = ideas.find((i) => i.id === over.id);
    const targetStatus = (overIdea?.status ?? (COLUMNS.includes(over.id as Idea["status"]) ? (over.id as Idea["status"]) : activeIdea.status));
    const overItems = ideas.filter((i) => i.status === targetStatus).sort((a, b) => a.position - b.position);
    const overIndex = overIdea ? overItems.findIndex((i) => i.id === overIdea.id) : overItems.length;

    let nextIdeas = ideas.map((i) => ({ ...i }));
    nextIdeas = nextIdeas.filter((i) => i.id !== activeIdea.id);
    const moved: Idea = { ...activeIdea, status: targetStatus };
    const colItems = nextIdeas.filter((i) => i.status === targetStatus).sort((a, b) => a.position - b.position);
    colItems.splice(overIndex, 0, moved);
    // Re-position
    const repositioned = colItems.map((i, idx) => ({ ...i, position: idx }));
    nextIdeas = [...nextIdeas.filter((i) => i.status !== targetStatus), ...repositioned];
    setIdeas(nextIdeas);

    try {
      await moveIdea(activeIdea.id, targetStatus, overIndex);
    } catch {
      toast.error("Couldn't save move");
      setIdeas(ideas); // revert
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-prism-text-muted">{ideas.length} ideas</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4" />New idea</Button>
          </DialogTrigger>
          <NewIdeaDialog onClose={() => setOpen(false)} />
        </Dialog>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {COLUMNS.map((col) => (
            <Column key={col} status={col} items={grouped[col]} />
          ))}
        </div>
        <DragOverlay>
          {activeId ? <IdeaCard idea={ideas.find((i) => i.id === activeId)!} dragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function Column({ status, items }: { status: Idea["status"]; items: Idea[] }) {
  return (
    <div className="flex flex-col rounded-xl border border-prism-border bg-prism-surface/60 p-3">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-prism-text">{COLUMN_LABEL[status]}</h3>
        <span className="rounded-full bg-prism-surface-2 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-prism-text-muted">{items.length}</span>
      </div>
      <SortableContext id={status} items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className="flex min-h-[80px] flex-col gap-2" data-column={status}>
          {items.map((i) => <SortableIdea key={i.id} idea={i} />)}
        </ul>
      </SortableContext>
    </div>
  );
}

function SortableIdea({ idea }: { idea: Idea }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: idea.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0 : 1 };
  return (
    <li ref={setNodeRef} style={style}>
      <IdeaCard idea={idea} dragHandle={{ ...attributes, ...listeners }} />
    </li>
  );
}

function IdeaCard({ idea, dragHandle, dragging }: { idea: Idea; dragHandle?: Record<string, unknown>; dragging?: boolean }) {
  const [pending, start] = useTransition();
  const tags = idea.categoryTags?.split(",").map((t) => t.trim()).filter(Boolean) ?? [];
  return (
    <div
      className={cn(
        "group relative rounded-lg border border-yellow-300/30 p-3 text-[13px] text-prism-text",
        "bg-[linear-gradient(180deg,_rgba(253,224,71,0.10)_0%,_rgba(253,224,71,0.06)_100%)]",
        dragging && "shadow-cta",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium leading-snug">{idea.title}</p>
        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100">
          <button
            {...dragHandle}
            className="grid h-6 w-6 place-items-center rounded text-prism-text-muted hover:text-prism-text cursor-grab active:cursor-grabbing"
            aria-label="Drag"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!confirm("Delete this idea?")) return;
              start(async () => {
                try { await deleteIdea(idea.id); toast.success("Idea deleted"); }
                catch { toast.error("Couldn't delete"); }
              });
            }}
            className="grid h-6 w-6 place-items-center rounded text-prism-text-muted hover:text-prism-danger"
            aria-label="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {idea.description && <p className="mt-1.5 text-[12px] text-prism-text-secondary line-clamp-3">{idea.description}</p>}
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {tags.map((t) => (
            <span key={t} className="rounded-full bg-prism-surface-2 px-2 py-0.5 text-[10px] text-prism-text-muted">{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function NewIdeaDialog({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      try {
        await createIdea({
          title, description: description || null,
          categoryTags: tags || null, status: "SPARK",
        });
        toast.success("Idea added to Spark");
        onClose();
      } catch (err) { toast.error(err instanceof Error ? err.message : "Couldn't save"); }
    });
  }

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>New idea</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-prism-text-secondary">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Pink-to-blue hair reveal" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-prism-text-secondary">Description</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="The setup, the hook, what makes it sing." />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-prism-text-secondary">Category tags (comma-separated)</label>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Hair, Transition" />
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save idea"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
