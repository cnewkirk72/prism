import {
  LayoutDashboard,
  Compass,
  Type,
  Hash,
  Image as ImageIcon,
  Sparkles,
  Music2,
  Lightbulb,
  CalendarCheck,
  Palette,
  Target,
  IdCard,
  DollarSign,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavSection = {
  /** Group label shown above items in the sidebar */
  label: string;
  /** Optional accent for the group header (e.g. "tiktok", "instagram") */
  accent?: "tiktok" | "instagram" | "purple" | "pink";
  items: NavItem[];
};

export const NAV: NavSection[] = [
  {
    label: "TikTok",
    accent: "tiktok",
    items: [
      { label: "Overview", href: "/tiktok/overview", icon: LayoutDashboard },
      { label: "Post Explorer", href: "/tiktok/post-explorer", icon: Compass },
      { label: "Captions", href: "/tiktok/captions", icon: Type },
      { label: "Hashtags & Sounds", href: "/tiktok/hashtags", icon: Hash },
    ],
  },
  {
    label: "Instagram",
    accent: "instagram",
    items: [
      { label: "Overview", href: "/instagram/overview", icon: LayoutDashboard },
      { label: "Posts", href: "/instagram/posts", icon: ImageIcon },
    ],
  },
  {
    label: "Create",
    accent: "purple",
    items: [
      { label: "Inspiration", href: "/create/inspiration", icon: Sparkles },
      { label: "Sounds", href: "/create/sounds", icon: Music2 },
      { label: "Ideas", href: "/create/ideas", icon: Lightbulb },
      { label: "Content Plan", href: "/create/content-plan", icon: CalendarCheck },
      { label: "Color Plan", href: "/create/color-plan", icon: Palette },
      { label: "Goals", href: "/create/goals", icon: Target },
    ],
  },
  {
    label: "Brand",
    accent: "pink",
    items: [
      { label: "Media Kit", href: "/brand/media-kit", icon: IdCard },
      { label: "Monetization", href: "/brand/monetization", icon: DollarSign },
    ],
  },
];

/** Flatten for breadcrumb / page-title lookups */
export const NAV_FLAT: NavItem[] = NAV.flatMap((s) => s.items);
