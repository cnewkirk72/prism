"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group/toast !rounded-xl !border !border-prism-border-strong !bg-prism-surface-3 !text-prism-text",
          description: "!text-prism-text-muted",
          actionButton: "!bg-prism-purple !text-white",
        },
      }}
    />
  );
}
