import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Construction } from "lucide-react";

type Props = {
  title: string;
  description: string;
  /** A short bulleted list of what's coming on this page */
  upcoming?: string[];
  /** A pill displayed at top right of the page header */
  badge?: { label: string; variant?: "purple" | "pink" | "tiktok" | "instagram" | "default" };
};

export function PagePlaceholder({ title, description, upcoming, badge }: Props) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-prism-text">
            {title}
          </h1>
          <p className="max-w-2xl text-sm text-prism-text-secondary">{description}</p>
        </div>
        {badge && <Badge variant={badge.variant ?? "default"}>{badge.label}</Badge>}
      </div>

      {/* Coming-soon card */}
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-prism-gradient-soft border border-prism-purple/30">
            <Construction className="h-5 w-5 text-prism-purple-bright" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-lg font-semibold text-prism-text">
              Scaffolded — implementation coming next
            </h2>
            <p className="max-w-md text-sm text-prism-text-muted">
              The route, layout, and design system are wired up. The full feature lands in the next pass.
            </p>
          </div>

          {upcoming && upcoming.length > 0 && (
            <ul className="mt-2 grid w-full max-w-md gap-2 text-left">
              {upcoming.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-2 rounded-lg border border-prism-border bg-prism-surface-2 px-3 py-2 text-sm text-prism-text-secondary"
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-prism-purple"
                    aria-hidden
                  />
                  {line}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
