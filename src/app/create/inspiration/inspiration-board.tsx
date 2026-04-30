"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, ExternalLink, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TikTokIcon, InstagramIcon } from "@/components/icons/PlatformIcon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { saveInspiration, deleteInspiration } from "@/server/actions/inspiration";

type Item = {
  id: string;
  sourceUrl: string;
  platform: "TIKTOK" | "INSTAGRAM";
  thumbnailUrl: string;
  note: string | null;
  savedAt: string;
  tags: { id: string; name: string }[];
};

export function InspirationBoard({ items, allTags }: { items: Item[]; allTags: { id: string; name: string }[] }) {
  const [active, setActive] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!active.size) return items;
    return items.filter((it) => it.tags.some((t) => active.has(t.name)));
  }, [items, active]);

  function toggleTag(name: string) {
    setActive((cur) => {
      const next = new Set(cur);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {allTags.map((t) => {
            const isActive = active.has(t.name);
            return (
              <button
                key={t.id}
                onClick={() => toggleTag(t.name)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  isActive
                    ? "border-prism-purple bg-prism-purple/15 text-prism-purple-bright"
                    : "border-prism-border bg-prism-surface-2 text-prism-text-secondary hover:text-prism-text",
                )}
              >
                #{t.name}
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {active.size > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setActive(new Set())}>Clear filters</Button>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4" />Save inspiration</Button>
            </DialogTrigger>
            <SaveInspirationDialog allTags={allTags} onClose={() => setOpen(false)} />
          </Dialog>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="prism-card grid place-items-center px-6 py-16 text-center">
          <p className="text-sm text-prism-text-muted">{items.length === 0 ? "Save your first reference to start the board." : "Nothing tagged with this combo."}</p>
        </div>
      ) : (
        <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 xl:columns-5">
          {filtered.map((it) => <Pin key={it.id} item={it} />)}
        </div>
      )}
    </div>
  );
}

function Pin({ item }: { item: Item }) {
  const Icon = item.platform === "TIKTOK" ? TikTokIcon : InstagramIcon;
  const [pending, start] = useTransition();
  return (
    <div className="group mb-4 break-inside-avoid prism-card prism-card-hover overflow-hidden">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.thumbnailUrl} alt="" className="w-full" loading="lazy" />
        <div className="absolute right-2 top-2 flex gap-1">
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-7 w-7 place-items-center rounded-md bg-black/60 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
            aria-label="Open source"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button
            type="button"
            onClick={() => {
              if (!confirm("Remove this pin?")) return;
              start(async () => {
                try {
                  await deleteInspiration(item.id);
                  toast.success("Pin removed");
                } catch { toast.error("Couldn't remove"); }
              });
            }}
            disabled={pending}
            className="grid h-7 w-7 place-items-center rounded-md bg-black/60 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 hover:text-prism-danger"
            aria-label="Delete pin"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <span className="absolute left-2 top-2 grid h-6 w-6 place-items-center rounded-md bg-black/60 text-white backdrop-blur">
          <Icon size={11} />
        </span>
      </div>
      <div className="p-2.5">
        {item.note && <p className="line-clamp-2 text-xs text-prism-text-secondary">{item.note}</p>}
        {item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.tags.map((t) => (
              <span key={t.id} className="rounded-full bg-prism-surface-3 px-2 py-0.5 text-[10px] text-prism-text-muted">
                #{t.name}
              </span>
            ))}
          </div>
        )}
        <div className="mt-2 text-[10px] text-prism-text-muted">{format(new Date(item.savedAt), "MMM d")}</div>
      </div>
    </div>
  );
}

function SaveInspirationDialog({ allTags, onClose }: { allTags: { name: string }[]; onClose: () => void }) {
  const [sourceUrl, setSourceUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [note, setNote] = useState("");
  const [platform, setPlatform] = useState<"TIKTOK" | "INSTAGRAM">("TIKTOK");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [pending, start] = useTransition();

  function addTag(name: string) {
    const trimmed = name.trim().toLowerCase().replace(/^#/, "");
    if (!trimmed) return;
    setTags((cur) => (cur.includes(trimmed) ? cur : [...cur, trimmed]));
    setTagInput("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      try {
        await saveInspiration({ sourceUrl, platform, thumbnailUrl, note: note || null, tagNames: tags });
        toast.success("Pin saved");
        onClose();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Couldn't save");
      }
    });
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Save inspiration</DialogTitle>
        <DialogDescription>Drop a TikTok or IG link plus a thumbnail.</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-prism-text-secondary">Platform</label>
          <Select value={platform} onValueChange={(v) => setPlatform(v as "TIKTOK" | "INSTAGRAM")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="TIKTOK">TikTok</SelectItem>
              <SelectItem value="INSTAGRAM">Instagram</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-prism-text-secondary">Source URL</label>
          <Input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} required placeholder="https://www.tiktok.com/@…" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-prism-text-secondary">Thumbnail URL</label>
          <Input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} required placeholder="https://… (paste a frame screenshot)" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-prism-text-secondary">Note (optional)</label>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Why this caught your eye" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-prism-text-secondary">Tags</label>
          <div className="flex flex-wrap gap-1.5 rounded-lg border border-prism-border bg-prism-surface-2 p-2 min-h-[40px]">
            {tags.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setTags((cur) => cur.filter((x) => x !== t))}
                className="rounded-full border border-prism-purple/40 bg-prism-purple/10 px-2 py-0.5 text-xs text-prism-purple-bright"
              >
                #{t} ×
              </button>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); }
              }}
              placeholder="Press Enter to add"
              className="flex-1 min-w-[120px] bg-transparent text-sm placeholder:text-prism-text-muted focus:outline-none"
            />
          </div>
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {allTags.slice(0, 8).map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => addTag(t.name)}
                  className="rounded-full bg-prism-surface-3 px-2 py-0.5 text-[10px] text-prism-text-muted hover:text-prism-text"
                >+#{t.name}</button>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save pin"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
