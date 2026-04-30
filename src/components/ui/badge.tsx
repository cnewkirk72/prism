import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("prism-pill", {
  variants: {
    variant: {
      default: "bg-prism-surface-2 text-prism-text-secondary border border-prism-border",
      purple: "bg-prism-purple/15 text-prism-purple-bright border border-prism-purple/30",
      pink: "bg-prism-pink/15 text-prism-pink-bright border border-prism-pink/30",
      tiktok: "bg-prism-tiktok/15 text-[hsl(var(--prism-tiktok))] border border-prism-tiktok/30",
      instagram:
        "text-white border border-white/15 [background:linear-gradient(135deg,rgba(245,133,41,0.22),rgba(221,42,123,0.22),rgba(129,52,175,0.22),rgba(81,91,212,0.22))]",
      success: "bg-prism-success/15 text-prism-success border border-prism-success/30",
      warning: "bg-prism-warning/15 text-prism-warning border border-prism-warning/30",
      danger: "bg-prism-danger/15 text-prism-danger border border-prism-danger/30",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
