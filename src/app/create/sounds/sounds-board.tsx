"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TikTokIcon, InstagramIcon } from "@/components/icons/PlatformIcon";
import { saveSound, updateSoundStatus, deleteSound } from "@/server/actions/sounds";
import { cn } from "@/lib/utils";

type Sound = {
  id: string;
  title: string;
  artist: string | null;
  platform: "TIKTOK" | "INSTAGRAM";
  thumbnailUrl: string;
  status: "SAVED" | "TO_FILM" | "USED" | "SKIPPED";
  savedAt: string;
  usageCount: number;
  topPostId: string | null;
  topPostThumb: string | null;
};

const STATUSES: Sound["status"][] = ["SAVED", "TO_FILM", "USED", "SKIPPED"];

export function SoundsBoard({ sounds }: { sounds: Sound[] }) {
  const [statusFilter, setStatusFilter] = useState<"all" | Sound["status"]>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);

  const months = useMemo(() => {
    const set = new Set<string>();
    for (const s of sounds) set.add(format(new Date(s.savedAt), "MMM yyyy"));
    return [...set].sort((a, b) => +new Date(b) - +new Date(a));
  }, [sounds]);

  const filtered = useMemo(() => {
    return sounds.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (monthFilter !== "all" && format(new Date(s.savedAt), "MMM yyyy") !== monthFilter) return false;
      return true;
    });
  }, [sounds, statusFilter, monthFilter]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {STATUSES.map((s) => (
              <TabsTrigger key={s} value={s}>{s.replace("_", " ").toLowerCase()}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All months</SelectItem>
            {months.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="ml-auto">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4" />Save sound</Button>
            </DialogTrigger>
            <SaveSoundDialog onClose={() => setOpen(false)} />
          </Dialog>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="prism-card grid place-items-center px-6 py-16 text-center">
          <p className="text-sm text-prism-text-muted">{sounds.length === 0 ? "Save your first trending sound to get started." : "No sounds match these filters."}</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => <SoundCard key={s.id} sound={s} />)}
        </ul>
      )}
    </div>
  );
}

function SoundCard({ sound }: { sound: Sound }) {
  const Icon = sound.platform === "TIKTOK" ? TikTokIcon : InstagramIcon;
  const [pending, start] = useTransition();
  return (
    <li className="prism-card prism-card-hover flex items-center gap-3 p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={sound.thumbnailUrl} alt="" className="h-20 w-20 shrink-0 rounded-lg object-cover" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Icon size={12} className={sound.platform === "TIKTOK" ? "text-[hsl(var(--prism-tiktok))]" : "text-prism-pink"} />
          <p className="truncate font-medium text-prism-text">{sound.title}</p>
        </div>
        <p className="truncate text-xs text-prism-text-muted">{sound.artist ?? "Unknown artist"}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <Select
            value={sound.status}
            onValueChange={(v) =>
              start(async () => {
                try { await updateSoundStatus(sound.id, v as Sound["status"]); toast.success(`Marked ${v.toLowerCase()}`); }
                catch { toast.error("Couldn't update"); }
              })
            }
          >
            <SelectTrigger className={cn("h-7 text-[11px] uppercase tracking-wide w-auto px-2", statusColor(sound.status))}><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ").toLowerCase()}</SelectItem>)}
            </SelectContent>
          </Select>
          {sound.usageCount > 0 && (
            <Badge variant="default">Used in {sound.usageCount}</Badge>
          )}
        </div>
      </div>
      {sound.topPostThumb && (
        <div className="hidden sm:block">
          <p className="mb-1 text-[10px] uppercase tracking-wider text-prism-text-muted">Top post</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sound.topPostThumb} alt="" className="h-20 w-14 rounded object-cover" />
        </div>
      )}
      <button
        type="button"
        onClick={() => {
          if (!confirm("Remove this sound?")) return;
          start(async () => {
            try { await deleteSound(sound.id); toast.success("Sound removed"); }
            catch { toast.error("Couldn't remove"); }
          });
        }}
        disabled={pending}
        aria-label="Delete sound"
        className="grid h-8 w-8 place-items-center rounded-md text-prism-text-muted hover:bg-prism-surface-3 hover:text-prism-danger"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}

function statusColor(s: Sound["status"]) {
  switch (s) {
    case "TO_FILM": return "border-prism-warning/40 text-prism-warning";
    case "USED": return "border-prism-success/40 text-prism-success";
    case "SKIPPED": return "border-prism-danger/40 text-prism-danger";
    default: return "border-prism-border text-prism-text-secondary";
  }
}

function SaveSoundDialog({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [platform, setPlatform] = useState<"TIKTOK" | "INSTAGRAM">("TIKTOK");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [exampleUrl, setExampleUrl] = useState("");
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      try {
        await saveSound({
          title, artist: artist || null, platform, thumbnailUrl,
          exampleUrl: exampleUrl || null, status: "SAVED",
        });
        toast.success("Sound saved");
        onClose();
      } catch (err) { toast.error(err instanceof Error ? err.message : "Couldn't save"); }
    });
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Save a sound</DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-prism-text-secondary">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="espresso (sped up)" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-prism-text-secondary">Artist</label>
          <Input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Sabrina Carpenter" />
        </div>
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
          <label className="text-xs font-medium text-prism-text-secondary">Example video URL</label>
          <Input value={exampleUrl} onChange={(e) => setExampleUrl(e.target.value)} placeholder="https://www.tiktok.com/@…" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-prism-text-secondary">Thumbnail URL</label>
          <Input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} required placeholder="https://…" />
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save sound"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
