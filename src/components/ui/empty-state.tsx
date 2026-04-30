import { type LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-prism-gradient-soft border border-prism-purple/30 text-prism-purple-bright">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-base font-semibold">{title}</h3>
        <p className="max-w-sm text-sm text-prism-text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
