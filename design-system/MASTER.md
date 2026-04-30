# Prism — Design System (MASTER)

> Source of truth for every page in Prism. Page-specific overrides live in `design-system/pages/<page>.md`.
> Generated via UI/UX Pro Max methodology (priority 1→10 quality rules).

---

## 1. Product context

| Field | Value |
|---|---|
| Product type | Creator analytics + planning tool (hybrid: dashboard + productivity + content management) |
| Audience | Solo content creators on TikTok / Instagram, age 18–35, mobile-first habits but desktop-first for planning |
| Style keywords | Dark, neon, vibrant accents, content-dense, dashboard-clean, glow without noise |
| Stack | Next.js 14 App Router · React · Tailwind · Recharts · Prisma + SQLite |

## 2. Pattern

**Persistent left sidebar + sticky top header + scrollable main**. Dashboard pattern. Sidebar groups nav by surface (TikTok / Instagram / Create / Brand). Sidebar collapses to icon-only at < 1024px. No bottom nav (desktop-first product).

## 3. Color tokens

All colors expressed as HSL CSS variables in `globals.css` so dark mode and future light mode share the same component code.

### Surfaces (deepest → highest)

| Token | Hex | Use |
|---|---|---|
| `--prism-bg` | `#07040E` | App background, deepest layer |
| `--prism-surface` | `#100822` | Cards, sidebar, header |
| `--prism-surface-2` | `#1A0F33` | Raised surface (hover, active row, modal) |
| `--prism-surface-3` | `#241646` | Elevated overlay (popover, tooltip) |
| `--prism-border` | `#2A1B47` | Default 1px borders |
| `--prism-border-strong` | `#3D2861` | Focused inputs, dividers w/ emphasis |

### Brand accents (the prism)

| Token | Hex | Use |
|---|---|---|
| `--prism-purple` | `#A855F7` | Primary accent, links, active nav |
| `--prism-purple-bright` | `#C084FC` | Hover on purple |
| `--prism-pink` | `#EC4899` | Secondary accent, KPIs, highlights |
| `--prism-pink-bright` | `#F472B6` | Hover on pink |
| `--prism-gradient` | `linear-gradient(135deg, #A855F7 0%, #EC4899 100%)` | Logo, primary CTA, emphasized stats |
| `--prism-glow-purple` | `0 0 24px rgba(168,85,247,0.35)` | Active nav indicator, focus ring |
| `--prism-glow-pink` | `0 0 24px rgba(236,72,153,0.30)` | Selected state on pink-coded items |

### Text

| Token | Hex | Use |
|---|---|---|
| `--prism-text` | `#F5F3FF` | Primary text (contrast 16.8:1 on bg) |
| `--prism-text-secondary` | `#B4ABCC` | Secondary text, descriptions (contrast 7.4:1) |
| `--prism-text-muted` | `#7C7299` | Captions, meta, disabled labels (contrast 4.6:1 — meets WCAG AA) |
| `--prism-text-on-accent` | `#FFFFFF` | Text on purple/pink fills |

### Semantic

| Token | Hex | Use |
|---|---|---|
| `--prism-success` | `#10B981` | Approved status, positive deltas |
| `--prism-warning` | `#F59E0B` | Pending status |
| `--prism-danger` | `#EF4444` | Errors, destructive actions, negative deltas |
| `--prism-info` | `#06B6D4` | Neutral notifications |

### Platform

| Token | Hex | Use |
|---|---|---|
| `--prism-tiktok` | `#FF0050` | TikTok pill, icon background |
| `--prism-instagram` | `linear-gradient(135deg, #F58529, #DD2A7B, #8134AF, #515BD4)` | IG pill, icon background |

## 4. Typography

| Role | Font | Weight | Size | Use |
|---|---|---|---|---|
| Display | Geist Sans (fallback Inter) | 700 | 32–48px | Page titles, hero numbers |
| Heading 1 | Geist Sans | 600 | 24px | Section headers |
| Heading 2 | Geist Sans | 600 | 18px | Card titles |
| Body | Inter | 400 | 14–16px | Default body |
| Label | Inter | 500 | 12–13px (uppercase tracking 0.05em) | KPI labels, table headers |
| Numeric | Inter `tabular-nums` | 600 | 28–48px | Stat values — tabular for column alignment |
| Mono | JetBrains Mono | 400 | 12–13px | IDs, hashtags, timestamps |

Line-heights: 1.5 body, 1.2 display, 1.4 heading.

## 5. Spacing & radius

- Spacing scale: `4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64` (Tailwind default).
- Section gap: `24px` between cards in a grid, `32px` between major sections.
- Border radius: `rounded-xl` (12px) cards, `rounded-2xl` (16px) hero cards, `rounded-lg` (8px) buttons/inputs, `rounded-full` pills.

## 6. Effects

- **Card**: `bg-prism-surface border border-prism-border rounded-xl`. No drop shadow by default — depth comes from surface tone, not blur.
- **Card hover**: `border-prism-border-strong` + subtle 1px inner glow `shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]`.
- **Active nav item**: Left border 2px `--prism-purple` + `bg-prism-surface-2` + glow `--prism-glow-purple`.
- **Primary CTA**: `bg-prism-gradient text-white rounded-lg shadow-[0_8px_24px_-8px_rgba(168,85,247,0.6)]`.
- **Focus ring**: `ring-2 ring-prism-purple ring-offset-2 ring-offset-prism-bg`.
- **Glassmorphism**: reserved for modals only — `backdrop-blur-xl bg-prism-surface/80 border border-white/10`.

## 7. Iconography

- Library: **Lucide React** (consistent stroke 1.5px).
- Sizes: `16` inline, `20` nav, `24` headers. Never emoji.
- Brand icons (TikTok, Instagram) come from a custom SVG set, never Lucide's brand icons.

## 8. Charts (Recharts)

- Default series colors in order: `#A855F7`, `#EC4899`, `#06B6D4`, `#F59E0B`, `#10B981`.
- Grid lines: `--prism-border` at 50% opacity.
- Axis labels: `--prism-text-muted` 12px.
- Tooltip: `--prism-surface-3` background, `--prism-border-strong` border, 8px radius, 12px padding.
- All charts must respect `prefers-reduced-motion` (disable entrance animation).

## 9. Anti-patterns to avoid

- ❌ Solid neon backgrounds for cards (use neon as accent only — borders, indicators, gradients, glows).
- ❌ Drop shadows on flat dark surfaces (use surface tone instead).
- ❌ Mixing filled and outline icons in the same nav.
- ❌ Pie/donut for >5 categories (use horizontal bar).
- ❌ Color-only encoding for status (always pair with icon or label).
- ❌ Auto-playing animations longer than 300ms.
- ❌ Sidebar items deeper than 2 levels (use a sub-nav inside the page instead).

## 10. Quality checklist (apply before merging any page)

- [ ] Touch targets ≥ 44×44 on every interactive element.
- [ ] Body text ≥ 14px, primary contrast ≥ 4.5:1.
- [ ] Focus visible on all interactive elements with the standard purple ring.
- [ ] Loading skeletons for any async data > 300ms.
- [ ] Empty state designed for every list/grid/chart.
- [ ] Numbers use `tabular-nums` everywhere they sit in columns.
- [ ] No layout shift on data load (reserve heights).
- [ ] Charts have legend + tooltip + accessible text alternative.
