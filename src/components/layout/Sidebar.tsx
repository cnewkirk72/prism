"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, Settings } from "lucide-react";
import { useState } from "react";
import { NAV, type NavSection } from "@/lib/nav";
import { PrismLogo } from "@/components/icons/PrismLogo";
import { TikTokIcon, InstagramIcon } from "@/components/icons/PlatformIcon";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "group/sidebar relative flex h-screen flex-col border-r border-prism-border bg-prism-surface transition-[width] duration-200",
        collapsed ? "w-[72px]" : "w-[260px]",
      )}
      aria-label="Primary navigation"
    >
      {/* Brand */}
      <div className="flex h-16 items-center justify-between gap-2 border-b border-prism-border px-4">
        <Link href="/tiktok/overview" className="flex items-center gap-2.5 outline-none">
          <PrismLogo size={28} />
          {!collapsed && (
            <span className="font-display text-[17px] font-semibold tracking-tight prism-gradient-text">
              Prism
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="grid h-8 w-8 place-items-center rounded-md text-prism-text-muted hover:bg-prism-surface-2 hover:text-prism-text"
        >
          <ChevronsLeft
            className={cn("h-4 w-4 transition-transform duration-200", collapsed && "rotate-180")}
          />
        </button>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-5">
          {NAV.map((section) => (
            <SidebarSection
              key={section.label}
              section={section}
              pathname={pathname ?? ""}
              collapsed={collapsed}
            />
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-prism-border p-3">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-prism-text-secondary hover:bg-prism-surface-2 hover:text-prism-text",
          )}
        >
          <Settings className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>
    </aside>
  );
}

function SidebarSection({
  section,
  pathname,
  collapsed,
}: {
  section: NavSection;
  pathname: string;
  collapsed: boolean;
}) {
  return (
    <li>
      {!collapsed && (
        <div className="mb-1.5 flex items-center gap-2 px-3">
          {section.label === "TikTok" && (
            <TikTokIcon size={12} className="text-[hsl(var(--prism-tiktok))]" />
          )}
          {section.label === "Instagram" && <InstagramIcon size={12} className="text-prism-pink" />}
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-prism-text-muted">
            {section.label}
          </span>
        </div>
      )}
      {collapsed && (
        <div className="mx-auto mb-1.5 h-px w-6 bg-prism-border" aria-hidden />
      )}
      <ul className="flex flex-col gap-0.5">
        {section.items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group/item relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-prism-surface-2 text-prism-text"
                    : "text-prism-text-secondary hover:bg-prism-surface-2 hover:text-prism-text",
                  collapsed && "justify-center px-0",
                )}
              >
                {/* Active indicator bar */}
                {active && (
                  <span
                    className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r bg-prism-gradient shadow-glow-purple"
                    aria-hidden
                  />
                )}
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0",
                    active && "text-prism-purple-bright",
                  )}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </li>
  );
}
