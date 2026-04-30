import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  hint,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  delta?: { value: number; positive?: boolean; suffix?: string };
  hint?: string;
}) {
  return (
    <div className="prism-card relative overflow-hidden p-5">
      <div className="absolute inset-0 bg-prism-gradient-soft opacity-0 transition-opacity duration-200 hover:opacity-100" />
      <div className="relative flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-prism-text-muted">
          {Icon && <Icon className="h-3.5 w-3.5" />}
          <span>{label}</span>
        </div>
        <div className="prism-stat-number text-3xl text-prism-text mt-1">{value}</div>
        {delta && (
          <div
            className={cn(
              "mt-1 flex items-center gap-1 text-xs font-medium",
              delta.positive ? "text-prism-success" : "text-prism-danger",
            )}
          >
            {delta.positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            <span>{Math.abs(delta.value).toFixed(1)}%{delta.suffix ? ` ${delta.suffix}` : ""}</span>
          </div>
        )}
        {hint && !delta && <div className="mt-1 text-xs text-prism-text-muted">{hint}</div>}
      </div>
    </div>
  );
}
