import { Badge, type BadgeProps } from "@/components/ui/badge";

type Variant = NonNullable<BadgeProps["variant"]>;

export function PageHeader({
  title,
  description,
  badge,
  actions,
}: {
  title: string;
  description?: string;
  badge?: { label: string; variant?: Variant };
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-2 min-w-0">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-prism-text">
            {title}
          </h1>
          {badge && <Badge variant={badge.variant ?? "default"}>{badge.label}</Badge>}
        </div>
        {description && <p className="max-w-2xl text-sm text-prism-text-secondary">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
