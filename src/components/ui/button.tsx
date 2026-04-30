import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-prism-gradient text-white shadow-cta hover:brightness-110 active:brightness-95",
        secondary:
          "bg-prism-surface-2 text-prism-text border border-prism-border hover:border-prism-border-strong hover:bg-prism-surface-3",
        ghost: "text-prism-text-secondary hover:text-prism-text hover:bg-prism-surface-2",
        outline:
          "border border-prism-border-strong text-prism-text hover:border-prism-purple hover:text-prism-purple-bright",
        danger: "bg-prism-danger/10 text-prism-danger border border-prism-danger/30 hover:bg-prism-danger/20",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
