"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Copy } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { fmtCompact, fmtPercent, cn } from "@/lib/utils";

type Row = {
  id: string;
  caption: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  postedAt: string;
};

type SortKey = "views" | "engagement" | "recent";

export function CaptionsTable({ rows }: { rows: Row[] }) {
  const [sort, setSort] = useState<SortKey>("views");
  const [dir, setDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const sign = dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      switch (sort) {
        case "views": return sign * (a.views - b.views);
        case "recent": return sign * (+new Date(a.postedAt) - +new Date(b.postedAt));
        case "engagement": {
          const ea = (a.likes + a.comments + a.shares + a.saves) / Math.max(a.views, 1);
          const eb = (b.likes + b.comments + b.shares + b.saves) / Math.max(b.views, 1);
          return sign * (ea - eb);
        }
      }
    });
  }, [rows, sort, dir]);

  function header(label: string, key: SortKey) {
    const active = sort === key;
    return (
      <button
        onClick={() => {
          if (active) setDir((d) => (d === "asc" ? "desc" : "asc"));
          else { setSort(key); setDir("desc"); }
        }}
        className={cn(
          "inline-flex items-center gap-1 text-[11px] uppercase tracking-wider hover:text-prism-text",
          active ? "text-prism-text" : "text-prism-text-muted",
        )}
      >
        {label}
        {active && (dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
      </button>
    );
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Caption copied");
    } catch { toast.error("Couldn't copy"); }
  }

  return (
    <div className="max-h-[640px] overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-prism-surface z-10 border-b border-prism-border">
          <tr>
            <th className="px-5 py-3 text-left">Caption</th>
            <th className="px-3 py-3 text-right">{header("Views", "views")}</th>
            <th className="px-3 py-3 text-right">{header("Eng", "engagement")}</th>
            <th className="px-3 py-3 text-right">{header("Posted", "recent")}</th>
            <th className="px-5 py-3 text-right" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => {
            const eng = (r.likes + r.comments + r.shares + r.saves) / Math.max(r.views, 1);
            return (
              <tr key={r.id} className="border-b border-prism-border/60 last:border-none hover:bg-prism-surface-2">
                <td className="px-5 py-3 max-w-md">
                  <p className="line-clamp-2 text-prism-text">{r.caption}</p>
                </td>
                <td className="px-3 py-3 text-right tabular-nums">{fmtCompact(r.views)}</td>
                <td className="px-3 py-3 text-right tabular-nums text-prism-text-secondary">{fmtPercent(eng, 1)}</td>
                <td className="px-3 py-3 text-right text-xs text-prism-text-muted">{format(new Date(r.postedAt), "MMM d")}</td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => copy(r.caption)}
                    className="grid h-7 w-7 place-items-center rounded-md text-prism-text-muted hover:bg-prism-surface-3 hover:text-prism-text"
                    aria-label="Copy caption"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            );
          })}
          {!sorted.length && (
            <tr><td colSpan={5} className="px-5 py-12 text-center text-prism-text-muted">No captions yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
