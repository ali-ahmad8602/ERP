# InvoiceMate ERP — UI/UX Design Specification

> Upgrade from developer-dashboard aesthetic to enterprise-grade ERP.
> Visual refinement only — no new features, no logic changes, no new API calls.

---

## 1. Design Principles

1. **Information density over whitespace** — Enterprise users scan, they don't browse. Reduce padding, tighten spacing, show more data per screen.
2. **Quiet confidence** — No flashy gradients or neon. Muted tones, subtle depth, clear hierarchy.
3. **Layered surfaces** — Use background tiers (base < surface < elevated) to create spatial hierarchy without heavy borders.
4. **Instant readability** — Every element should communicate its purpose within 200ms. Clear labels, consistent patterns, obvious affordances.
5. **Predictable motion** — 150ms transitions. No bounces, no spring physics. Ease-out only.

---

## 2. Color System

### 2.1 Light Mode (unchanged — already clean)

```
bg-base:     #F5F5F7     (window/page background)
bg-surface:  #FFFFFF     (cards, panels)
bg-elevated: #FFFFFF     (modals, dropdowns)
border:      #E5E5EA
text:        #1D1D1F / #86868B / #98989D
```

No changes needed for light mode.

### 2.2 Dark Mode (CURRENT — problems)

```
bg-base:     #000000     ← Pure black — too harsh, feels like a terminal
bg-surface:  #1C1C1E     ← Jumps too far from base
bg-elevated: #2C2C2E
border:      #38383A     ← Low contrast against surface
```

### 2.3 Dark Mode (PROPOSED — "Dim" enterprise palette)

```css
/* Replace pure black with deep charcoal/navy */
--color-bg-base:      #0F1117;    /* Deep navy-black — not pure black */
--color-bg-surface:   #171B24;    /* Card/panel background — warm charcoal */
--color-bg-elevated:  #1E2330;    /* Modals, dropdowns, hover states */
--color-bg-overlay:   rgba(23, 27, 36, 0.80);  /* Backdrop blur base */

/* Warmer, more visible borders */
--color-border:        #2A2F3D;   /* Visible but not harsh */
--color-border-subtle: #1E2330;   /* Dividers within surfaces */

/* Text — slightly warmer whites */
--color-text-primary:   #E8EAED;  /* Not pure white — reduces eye strain */
--color-text-secondary: #8B919E;  /* Mid-tone, readable on all surfaces */
--color-text-muted:     #535B6B;  /* De-emphasized labels */

/* Shadows — gentler, navy-tinted */
--shadow-card:       0 1px 3px rgba(0, 0, 0, 0.24), 0 0 0 1px rgba(255,255,255,0.03);
--shadow-card-hover: 0 4px 16px rgba(0, 0, 0, 0.32), 0 0 0 1px rgba(255,255,255,0.05);
--shadow-modal:      0 16px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.06);
```

### 2.4 Accent Colors (both modes — keep existing)

```
primary:  #0071E3 (light) / #0A84FF (dark)  — system blue, no change
accent:   #5E5CE6  — indigo, no change
danger:   #FF3B30 / #FF453A
warning:  #FF9500 / #FF9F0A
success:  #34C759 / #30D158  (rename from "info" for clarity)
```

**Rename `--color-info` to `--color-success`** across the codebase. "Info" is ambiguous — green is universally "success" in ERP context. This is a token rename, not a value change.

---

## 3. Typography Scale

### 3.1 Current Problems

- Display text (`2.5rem` / 40px) is too large for data-dense pages
- Body text at `14px` is good, but labels at `10px` are straining
- Inconsistent use of arbitrary sizes (`text-[28px]`, `text-[42px]`, `text-[18px]`)

### 3.2 Proposed Scale (7 steps)

```css
--text-display:    1.75rem;    /* 28px — page titles: "Dashboard", "Reports" */
--text-heading:    1.25rem;    /* 20px — section headers: "Departments Overview" */
--text-subheading: 0.9375rem;  /* 15px — card titles, drawer titles */
--text-body:       0.8125rem;  /* 13px — primary content text */
--text-small:      0.75rem;    /* 12px — metadata, timestamps, sublabels */
--text-caption:    0.6875rem;  /* 11px — badges, section labels, footnotes */
--text-micro:      0.625rem;   /* 10px — ONLY for uppercase tracking-wider labels */
```

### 3.3 Application Rules

| Element | Current | Proposed | Tailwind |
|---|---|---|---|
| Page title ("Good morning, X") | `text-heading` (24px) | `text-display` (28px) | `text-[28px]` |
| Section header ("Departments Overview") | `text-subheading` (18px) | `text-heading` (20px) | `text-[20px]` |
| Card title / Board name | varies (14-18px) | `text-subheading` (15px) | `text-[15px]` |
| Body text / descriptions | `text-body` (14px) | `text-body` (13px) | `text-[13px]` |
| Timestamps, metadata | `text-[11px]`-`text-[13px]` | `text-small` (12px) | `text-[12px]` |
| Badges, section labels | `text-[10px]` | `text-caption` (11px) | `text-[11px]` |
| Micro labels (only uppercase) | `text-[10px]` | `text-micro` (10px) | `text-[10px]` |

### 3.4 Weight Rules

- **Bold (700)**: Page titles only
- **Semibold (600)**: Section headers, card titles, nav labels, form labels
- **Medium (500)**: Body text with emphasis, table cells, badge text
- **Normal (400)**: Descriptions, placeholder text, helper text

---

## 4. Spacing System

### 4.1 Current Problems

- Page padding is `p-8 lg:p-10` (32-40px) — wastes space on data pages
- Cards use `p-6` (24px) — too generous for dense lists
- Gaps between sections are inconsistent (`gap-5`, `gap-8`, `gap-10`, `mb-10`)

### 4.2 Proposed Spacing

| Context | Current | Proposed | Tailwind |
|---|---|---|---|
| Page padding | `p-8 lg:p-10` | `p-6 lg:p-8` | `p-6 lg:p-8` |
| Section gap (between card groups) | `gap-8 mb-10` | `gap-6 mb-8` | `gap-6 mb-8` |
| Card internal padding | `p-6` | `p-5` | `p-5` |
| Card internal padding (compact) | `p-4` | `p-3.5` | `p-3.5` |
| KPI card grid gap | `gap-5` | `gap-4` | `gap-4` |
| List item vertical padding | `py-4` | `py-3` | `py-3` |
| Form field gap | `gap-5` | `gap-4` | `gap-4` |
| Input padding | `px-4 py-3.5` | `px-3.5 py-2.5` | `px-3.5 py-2.5` |

### 4.3 Border Radius

| Element | Current | Proposed | Reason |
|---|---|---|---|
| Cards | `rounded-[20px]` | `rounded-2xl` (16px) | 20px feels bubbly/consumer; 16px is crisp |
| Inputs | `rounded-[12px]` | `rounded-xl` (12px) | Keep as-is |
| Buttons | `rounded-xl` (12px) | `rounded-lg` (8px) | Enterprise buttons are crisper |
| Badges | `rounded-[6px]` | `rounded-md` (6px) | Keep as-is |
| Modals | `rounded-2xl` (16px) | `rounded-xl` (12px) | Slightly tighter |

---

## 5. Component-Level Changes

### 5.1 Sidebar

**Before:** 240px wide, basic flat links, large department sections with expand/collapse.

**After:**

- Width: keep 240px
- Background: `bg-bg-surface` with a subtle right border
- Active item: Replace current `bg-primary-ghost text-primary` with a **left-edge indicator** (3px bar, `bg-primary`) + `bg-bg-elevated` fill. Text stays `text-primary` only for the active item.
- Hover: `bg-bg-elevated` (not `bg-black/5` — use semantic tokens)
- Department icons: Reduce from `w-6 h-6` to `w-5 h-5` — tighter
- Member count badge: Use `text-caption` size, reduce padding
- Profile section: Reduce padding from `p-3` to `p-2.5`
- Add a 1px top border on the profile section for separation

**Tailwind implementation notes:**
- Replace `hover:bg-black/5 dark:hover:bg-white/5` with `hover:bg-bg-elevated` throughout sidebar
- This ensures the hover color adapts properly to the new dark theme

### 5.2 Topbar

**Before:** 56px height (`h-14`), search bar is a pill-shaped button, badges float next to title.

**After:**

- Height: reduce to 48px (`h-12`) — reclaim vertical space
- Search bar: keep pill shape but reduce max-width to `max-w-[360px]`
- Remove the `Quick Action` button text label — just show the Zap icon in a circle button (saves ~100px horizontal space)
- Breadcrumb: use `text-small` (12px) for department name, `text-body` (13px) **semibold** for board name
- Notification bell: keep as-is
- Theme toggle: keep as-is
- User avatar: keep as-is

### 5.3 KPI Cards (Dashboard + Reports)

**Before:** Large cards with big display numbers, trend badges, generous padding.

**After:**

- Reduce number size from `text-display` (40px) to `text-[28px]`
- Icon: reduce from 18px to 16px
- Label: keep uppercase `text-micro` but use `font-semibold` (not `font-bold`)
- Trend badge: keep, but reduce font from `text-[12px]` to `text-caption` (11px)
- Card padding: `p-6` to `p-5`
- Add a subtle top-border accent (2px) matching the KPI's semantic color:
  - Total tasks → `border-t-2 border-primary`
  - Overdue → `border-t-2 border-danger`
  - Approvals → `border-t-2 border-warning`
  - Compliance → `border-t-2 border-success`
- This makes cards scannable at a glance without reading labels

### 5.4 Dashboard Activity Feed

**Before:** Simple rows with avatar + text + timestamp. No grouping. Hard to scan.

**After:**

- Add subtle date group headers when the day changes ("Today", "Yesterday", "Apr 24")
  - Implementation: compare adjacent `createdAt` dates during render, insert divider
  - No new API calls — just client-side grouping of existing data
- Reduce row padding from `px-5 py-4` to `px-4 py-3`
- Action text: make the action verb (`created`, `moved`, `approved`) use `text-text-muted` instead of `text-text-secondary` — de-emphasize the verb, emphasize the entity
- Department badge: reduce from `text-[10px]` to keep, but add `shrink-0` to prevent wrapping

### 5.5 Kanban Cards

**Before:** White/surface cards with priority badge, labels, title, footer with avatars/metadata. `rounded-xl`, shadow.

**After:**

- Reduce card width from `w-[280px]` to `w-[272px]` (fits more columns without horizontal scroll)
- Reduce internal padding from `p-3` to `p-2.5`
- Title: `text-[14px]` → `text-[13px] font-medium` — tighter, still readable
- Priority badge: shrink from `text-[10px] px-2 py-0.5` to `text-[10px] px-1.5 py-px` — smaller footprint
- Labels: keep `text-[10px]`, reduce gap from `gap-1` to `gap-0.5`
- Footer metadata (comments, attachments, due date): keep `text-[11px]`, add `opacity-70` default → `group-hover:opacity-100` on card hover — reduces visual noise at rest
- **Drag feedback**: Currently `opacity-40` on drag — change to `opacity-50 scale-[1.02] rotate-[1deg]` for a more physical feel
- Column header: reduce `mb-3` to `mb-2`
- Column background: `bg-black/[0.02]` → `bg-bg-elevated/30` in dark mode for better contrast

### 5.6 Kanban Columns

**Before:** 280px wide columns with count badges.

**After:**

- Width: `w-[272px]` (matches card width change)
- Column header count badge: keep styling
- "Add Task" button at column bottom: reduce from `mt-2 py-2` to `mt-1.5 py-1.5`
- Empty column placeholder: keep dashed border, reduce padding from `py-6` to `py-4`

### 5.7 Card Detail Drawer

**Before:** 480px wide right drawer with tabs, full card details, comment input.

**After:**

- Width: keep 480px
- Header padding: reduce from `px-5 pt-5 pb-4` to `px-5 pt-4 pb-3`
- Priority color strip: keep, it's effective
- Task ID (`ERP-XXXX`): use `font-mono text-small` — make it clearly a reference code
- Tab buttons: reduce from `py-2.5` to `py-2`
- Body section gaps: reduce from `gap-6` to `gap-5`
- Assignee pills: reduce from `px-3 py-1.5` to `px-2.5 py-1`
- **Audit trail timeline**: Add alternating subtle background on entries (`even:bg-bg-elevated/20`) for scannability
- Comment input: keep current styling

### 5.8 ListView / Table

**Before:** Grid layout with headers, collapsible column groups.

**After:**

- Header row: add `bg-bg-elevated/30` background + `sticky top-0` — keeps headers visible on scroll
- Row hover: current `hover:bg-black/[0.03]` is fine for light mode — ensure dark mode uses `hover:bg-bg-elevated/40`
- Priority badge in table: keep inline, no changes
- Due date column: add color coding to the text (already exists — confirm red for overdue, amber for today)

### 5.9 Forms & Inputs

**Before:** Inputs have `py-3.5` (14px vertical padding), `text-[15px]` — feels like a mobile app.

**After:**

- Input height: reduce from `py-3.5` to `py-2.5` — standard enterprise height (~38px total)
- Input font: reduce from `text-[15px]` to `text-[13px]` — matches body text
- Input label: reduce from `text-[15px] font-semibold` to `text-[13px] font-semibold`
- Input border-radius: keep `rounded-xl` (12px)
- Focus ring: keep `ring-primary/20` — it's clean
- Error state: keep red border + message — add `shake` animation (single 200ms CSS keyframe)

**Error animation (add to globals.css):**
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
.animate-shake { animation: shake 0.2s ease-in-out; }
```

### 5.10 Buttons

**Before:** `rounded-xl` (12px), generous padding, primary uses gradient-like blue.

**After:**

- Border radius: `rounded-xl` → `rounded-lg` (8px) — crisper for enterprise
- Primary: keep solid blue, add subtle `shadow-sm` on hover (not at rest)
- Secondary: keep current `bg-black/[0.04]` — clean
- Ghost: keep current
- Size `sm`: reduce from `px-3.5 py-1.5` to `px-3 py-1.5` — slight tightening
- Size `lg`: reduce from `px-6 py-3.5` to `px-5 py-3` — less padded for forms

### 5.11 Modals

**Before:** `rounded-2xl` (16px), centered or right-drawer.

**After:**

- Border radius: `rounded-2xl` → `rounded-xl` (12px)
- Backdrop: keep `bg-black/65 backdrop-blur-sm` — it's good
- Add `shadow-modal` to the modal container
- Drawer: keep right-slide animation

### 5.12 Reports Charts

**Before:** SVG donut + bar charts with inline legends.

**After:**

- Donut chart center text: reduce from `text-[28px]` to `text-[24px]`
- Legend items: reduce gap from `gap-2.5` to `gap-2`
- Bar chart: add rounded corners on bar ends (`rx="4"` on SVG rects or keep `rounded-lg` on divs)
- Overdue breakdown: keep vertical bars, add value label above each bar
- **Empty states**: Replace plain text with centered icon + two lines:
  - Line 1: bold, `text-body` — what's empty ("No overdue items")
  - Line 2: muted, `text-small` — why it's good ("All tasks are on track")
- **Loading states**: Replace spinners with skeleton placeholders:
  - KPI cards: `h-[100px]` gray pulsing blocks
  - Charts: `h-[200px]` gray pulsing blocks with rounded corners
  - Pattern: `bg-bg-elevated animate-pulse rounded-xl`

### 5.13 Settings Pages

**Before:** `max-w-2xl`, cards with `p-6`, standard form layout.

**After:**

- Max width: keep `max-w-2xl` — appropriate for forms
- Card padding: `p-6` → `p-5`
- Section headers in cards: keep icon + title pattern, reduce title from `text-[16px]` to `text-[15px]`
- Profile avatar section: keep layout, add a subtle `border border-border-subtle rounded-2xl p-4` wrapper around the avatar + name block
- Role badge: keep uppercase + primary color
- Department membership list: keep current layout
- Organization settings: keep current layout

### 5.14 Notification Panel

**Before:** Dropdown panel, basic list.

**After:**

- Add unread indicator: left-edge 3px blue bar on unread notifications
- Reduce item padding from `p-3` to `p-2.5`
- Timestamp: use `text-caption` with `font-mono`
- Type icon: add small colored dot before notification title matching type (blue for task, green for approval, etc.)

---

## 6. Loading & Empty States

### 6.1 Skeleton Pattern (replace spinners)

Use on: Dashboard KPIs, department cards, board loading, reports charts.

```tsx
// Skeleton component pattern
<div className="animate-pulse rounded-xl bg-bg-elevated h-[var] w-full" />
```

Keep spinners only for: button loading states, inline operations (save, upload, search).

### 6.2 Empty States

Every empty state should have:
1. A muted icon (24px, `opacity-40`)
2. A bold headline (`text-body font-semibold text-text-primary`)
3. A description (`text-small text-text-muted`)
4. An action button if applicable

---

## 7. Transition & Motion

### 7.1 Timing

| Interaction | Duration | Easing |
|---|---|---|
| Hover states | 150ms | `ease-out` |
| Focus rings | 200ms | `ease-out` |
| Sidebar expand/collapse | 150ms | `ease-out` |
| Modal open | 180ms | `cubic-bezier(0.16, 1, 0.3, 1)` (keep) |
| Toast appear | 200ms | `cubic-bezier(0.16, 1, 0.3, 1)` (keep) |
| Card drag overlay | 180ms | `cubic-bezier(0.16, 1, 0.3, 1)` (keep) |
| Page content fade | none | No page transitions — instant |

### 7.2 Rules

- No `transition-all` on complex components (cards, list rows) — specify exact properties
- Use `transition-colors duration-150` for hover states
- Use `transition-shadow duration-150` for focus/shadow changes
- Never animate layout properties (`width`, `height`, `padding`)

---

## 8. Implementation Order

Implement in this order to minimize visual disruption:

1. **globals.css** — Update dark mode color tokens. This propagates everywhere instantly.
2. **Typography scale** — Update `@theme` tokens. Then do a find/replace pass for arbitrary text sizes.
3. **Spacing** — Tighten padding/gaps in: page layouts, cards, inputs, buttons.
4. **Card.tsx, Button.tsx, Input.tsx** — Update border-radius, padding, font sizes.
5. **Sidebar.tsx** — Hover states, sizing, active indicators.
6. **Topbar.tsx** — Height reduction, Quick Action icon-only.
7. **KanbanCard.tsx + KanbanBoard.tsx** — Card sizing, column width, drag feedback.
8. **Dashboard page** — KPI card borders, activity feed grouping, spacing.
9. **Reports page** — Chart sizing, skeleton loaders, empty states.
10. **CardDetailDrawer.tsx** — Spacing, audit trail alternating rows.
11. **ListView.tsx** — Sticky headers, hover consistency.
12. **Settings pages** — Form spacing, input sizing.
13. **Toast, Modal, NotificationPanel** — Minor spacing/radius tweaks.

---

## 9. What NOT to Change

- Color meaning (red = danger, blue = primary, green = success)
- Icon library (Lucide React)
- Font family (Inter)
- Component architecture or file structure
- Any API calls or data flow
- Authentication flow or RBAC logic
- Drag-and-drop library or behavior
- Route structure

---

## 10. Success Criteria

After implementation:

- Dark mode feels warm and professional, not harsh/terminal
- Information density is noticeably higher (more visible without scrolling)
- All interactive elements have clear hover/focus states
- Typography is consistent (no arbitrary pixel sizes outside the 7-step scale)
- No visual regressions in light mode
- Loading states use skeletons instead of spinners (except inline operations)
- The app looks like it belongs next to SAP, NetSuite, or Monday.com — not a crypto dashboard
