"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bell, Search, Plus, LogOut, Settings as SettingsIcon, User as UserIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { NAV_FLAT } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
};

export function Header({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const current = NAV_FLAT.find(
    (item) => pathname === item.href || pathname?.startsWith(item.href + "/"),
  );
  const title = current?.label ?? "Prism";

  const initials = (user.name ?? user.email ?? "P")
    .split(/\s+|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-prism-border bg-prism-bg/80 px-6 backdrop-blur-xl">
      <div className="flex min-w-0 flex-col">
        <h1 className="font-display text-[15px] font-semibold leading-tight text-prism-text">
          {title}
        </h1>
        <p className="text-[11px] leading-tight text-prism-text-muted">{pathname}</p>
      </div>

      <div className="ml-6 hidden max-w-md flex-1 lg:block">
        <label htmlFor="global-search" className="sr-only">Search</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-prism-text-muted" />
          <input
            id="global-search"
            type="search"
            placeholder="Search posts, sounds, ideas…"
            className={cn(
              "h-9 w-full rounded-lg border border-prism-border bg-prism-surface-2 pl-9 pr-12 text-sm text-prism-text placeholder:text-prism-text-muted",
              "focus:border-prism-purple focus:outline-none",
            )}
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-prism-border bg-prism-surface px-1.5 py-0.5 font-mono text-[10px] text-prism-text-muted">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          className="h-9 px-3.5"
          onClick={() => router.push("/create/ideas?new=1")}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New idea</span>
        </Button>

        <button
          type="button"
          aria-label="Notifications"
          className="relative grid h-9 w-9 place-items-center rounded-lg border border-prism-border bg-prism-surface-2 text-prism-text-secondary hover:text-prism-text"
        >
          <Bell className="h-4 w-4" />
          <span aria-hidden className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-prism-pink shadow-glow-pink" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="Account menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center rounded-full bg-prism-gradient text-xs font-semibold text-white"
          >
            {user.image ? (
              <img src={user.image} alt="" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              initials || "P"
            )}
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-11 w-56 rounded-xl border border-prism-border-strong bg-prism-surface-3 p-1.5 shadow-2xl">
              <div className="px-3 py-2 border-b border-prism-border">
                <div className="text-sm font-medium text-prism-text truncate">{user.name ?? "Creator"}</div>
                <div className="text-xs text-prism-text-muted truncate">{user.email}</div>
              </div>
              <button
                onClick={() => { setMenuOpen(false); router.push("/settings"); }}
                className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-prism-text-secondary hover:bg-prism-surface-2 hover:text-prism-text"
              >
                <UserIcon className="h-4 w-4" />Profile
              </button>
              <button
                onClick={() => { setMenuOpen(false); router.push("/settings#connections"); }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-prism-text-secondary hover:bg-prism-surface-2 hover:text-prism-text"
              >
                <SettingsIcon className="h-4 w-4" />Connections & settings
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/sign-in" })}
                className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-prism-danger hover:bg-prism-danger/10"
              >
                <LogOut className="h-4 w-4" />Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
