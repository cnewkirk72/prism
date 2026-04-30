import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-24 text-center">
      <span className="font-display text-7xl font-semibold prism-gradient-text">404</span>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-xl font-semibold text-prism-text">
          Lost in the spectrum
        </h1>
        <p className="text-sm text-prism-text-muted">
          This page doesn&apos;t exist yet. Check the sidebar for available routes.
        </p>
      </div>
      <Link href="/tiktok/overview">
        <Button>Back to overview</Button>
      </Link>
    </div>
  );
}
