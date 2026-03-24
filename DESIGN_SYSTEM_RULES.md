# InvoiceMate ERP — Design System Rules

> For use with Figma MCP to translate designs into code consistent with this codebase.

---

## 1. Token Definitions

Design tokens are defined in **two locations** (kept in sync):

### CSS Custom Properties — `frontend/src/styles/globals.css`
```css
:root {
  --primary:        #0454FC;
  --primary-light:  #3B7BFF;
  --primary-ghost:  rgba(4, 84, 252, 0.12);
  --accent:         #00E5A0;
  --danger:         #FF4444;
  --warning:        #F5A623;

  --bg-base:        #050505;
  --bg-surface:     #0F0F0F;
  --bg-elevated:    #1A1A1A;
  --bg-overlay:     #242424;

  --border:         #2A2A2A;
  --border-subtle:  #1E1E1E;

  --text-primary:   #F3F3F3;
  --text-secondary: #888888;
  --text-muted:     #444444;

  --priority-urgent: #FF4444;
  --priority-high:   #F5A623;
  --priority-medium: #0454FC;
  --priority-low:    #555555;
}
```

### Tailwind v4 Theme — `frontend/src/app/globals.css`
```css
@theme {
  --color-primary:        #0454FC;
  --color-primary-light:  #3B7BFF;
  --color-accent:         #00E5A0;
  --color-danger:         #FF4444;
  --color-warning:        #F5A623;

  --color-bg-base:        #050505;
  --color-bg-surface:     #0F0F0F;
  --color-bg-elevated:    #1A1A1A;
  --color-bg-overlay:     #242424;

  --color-border:         #2A2A2A;
  --color-border-subtle:  #1E1E1E;

  --color-text-primary:   #F3F3F3;
  --color-text-secondary: #888888;
  --color-text-muted:     #444444;
}
```

**Usage**: In Tailwind classes, use `bg-primary`, `text-text-secondary`, `border-border`, etc.

---

## 2. Typography

| Role        | Size     | Tailwind Class      | Weight   |
|-------------|----------|---------------------|----------|
| Display     | 2rem     | `text-display`      | 700      |
| Heading     | 1.5rem   | `text-heading`      | 700      |
| Subheading  | 1.125rem | `text-subheading`   | 600      |
| Body        | 0.875rem | `text-body` (14px base) | 400   |
| Small       | 0.75rem  | `text-small`        | 400      |
| Caption     | 11px     | `text-[11px]`       | 500      |
| Section label | 9-10px | `text-[9.5px]`     | 700, uppercase, `tracking-[0.1em]` |

**Font stacks**:
- Sans: `"Inter", -apple-system, BlinkMacSystemFont, sans-serif` → `font-sans`
- Mono: `"JetBrains Mono", "Fira Code", monospace` → `font-mono`

**Inter** is loaded via `next/font/google` with `display: "swap"`.

---

## 3. Spacing & Layout

- Base unit: **4px** (Tailwind spacing scale)
- Sidebar width: **228px** fixed
- Topbar height: **56px**
- Content padding: typically `10px 8px` for nav, `14px 16px` for inputs
- Component gap: `8px` (nav items), `10-12px` (search/input rows)

---

## 4. Border Radius

| Element    | Radius | Token            |
|------------|--------|------------------|
| Card       | 12px   | `--radius-card`  |
| Button     | 8px    | `--radius-btn`   |
| Badge      | 6px    | `--radius-badge` |
| Modal      | 14px   | (inline)         |
| Nav item   | 8px    | (inline)         |
| Scrollbar  | 3-4px  | (inline)         |

---

## 5. Shadows

| Element     | Value                                                          | Token                |
|-------------|----------------------------------------------------------------|----------------------|
| Card        | `0 1px 2px rgba(0,0,0,0.5)`                                   | `--shadow-card`      |
| Card hover  | `0 0 0 1px rgba(4,84,252,0.35), 0 8px 24px rgba(0,0,0,0.5)`  | `--shadow-card-hover`|
| Modal       | `0 32px 64px rgba(0,0,0,0.9)`                                 | `--shadow-modal`     |
| Logo        | `0 2px 8px rgba(4,84,252,0.4)`                                | (inline)             |

---

## 6. Component Library

Components live in `frontend/src/components/`:

```
components/
├── ui/           # Primitives: Button, Badge, CommandPalette
├── layout/       # Sidebar, Topbar, NotificationBell, NotificationPanel
├── board/        # KanbanBoard, KanbanCard, BoardStatsBar, BoardConfigPanel, ListView
├── card/         # CardDetailDrawer
└── dept/         # AddDeptModal
```

### Key components:

**Button** (`components/ui/Button.tsx`)
- Variants: `primary | secondary | danger | ghost`
- Sizes: `sm | md | lg`
- Props: `loading`, `disabled`
- Uses `cn()` utility for class merging

**Badge** (`components/ui/Badge.tsx`)
- `PriorityBadge` — maps priority enum to color
- `Badge` — generic with `color` prop, renders `color` text on `${color}20` background

**CommandPalette** (`components/ui/CommandPalette.tsx`)
- Full-screen overlay with `backdrop-filter: blur(4px)`
- Mostly inline styles (not Tailwind classes)

### Styling approach (mixed):
- **Tailwind classes** in `Button`, `Badge`, layout root
- **Inline `style` objects** in `Sidebar`, `CommandPalette`, nav sub-components
- **CSS utility classes** (`.card-hover`, `.btn-ghost`, `.nav-item`, `.input-field`) in globals

---

## 7. Icon System

- **Library**: `lucide-react` (v0.577)
- **Default size**: `13-16px` depending on context
- **Color**: inherited or explicit via `color` prop
- **Import pattern**: Named imports
  ```tsx
  import { Search, LayoutGrid, Settings } from "lucide-react";
  <Search size={16} color="#555" />
  ```
- No custom SVG icon system — all icons from Lucide

---

## 8. Animation

| Name            | Duration | Easing                          | Token                       |
|-----------------|----------|---------------------------------|-----------------------------|
| slideInRight    | 0.22s    | `cubic-bezier(0.16,1,0.3,1)`   | `--animate-slide-in-right`  |
| fadeIn          | 0.15s    | `ease-out`                      | `--animate-fade-in`         |
| fadeUp          | 0.2s     | `cubic-bezier(0.16,1,0.3,1)`   | `--animate-fade-up`         |
| spin            | 0.8s     | `linear infinite`               | `--animate-spin`            |
| pulseDot        | 1.8s     | `ease-in-out infinite`          | `--animate-pulse-dot`       |

**Transitions**: `0.1s–0.15s` for hover states (`background`, `color`, `box-shadow`).

---

## 9. State Patterns

### Active nav item:
- Background: `#151515`
- Text: `#F3F3F3`
- Left accent bar: 3px wide, primary color, 20% inset from top/bottom

### Hover:
- Nav: `background: #1A1A1A`, `color: #F3F3F3`
- Card: `background: #141414`, blue ring + shadow, `translateY(-1px)`
- Danger hover: `background: rgba(255,68,68,0.06)`, `color: #FF4444`

### Focus:
- Input: `border-color: rgba(4,84,252,0.5)`, `box-shadow: 0 0 0 3px rgba(4,84,252,0.08)`

### Disabled:
- `opacity: 0.5`, `cursor: not-allowed`

---

## 10. Frameworks & Build

| Layer        | Technology                          |
|-------------|--------------------------------------|
| Framework   | Next.js 16.2 (App Router)           |
| React       | 19.2                                 |
| Styling     | Tailwind CSS v4 + inline styles     |
| State       | Zustand                              |
| DnD         | @dnd-kit                             |
| UI primitives | Radix UI (Dialog, DropdownMenu, Select, Tooltip) |
| HTTP        | Axios                                |
| Realtime    | Socket.IO client                     |
| Date        | date-fns                             |
| Icons       | Lucide React                         |

---

## 11. Dark-Only Theme

This app is **dark mode only**. There is no light theme or theme toggle. All colors are designed for dark backgrounds.

Background hierarchy: `#050505` → `#0F0F0F` → `#1A1A1A` → `#242424`

---

## 12. Figma → Code Mapping Rules

When converting Figma designs to code for this project:

1. **Map Figma colors** to the closest CSS variable / Tailwind token — never use raw hex values that aren't in the token set
2. **Use `cn()` utility** from `@/lib/utils` for conditional class merging
3. **Prefer Tailwind classes** over inline styles for new components
4. **Use existing Radix primitives** for Dialog, Dropdown, Select, Tooltip — don't rebuild
5. **Icons**: Use Lucide React, size 13-16px
6. **Border radius**: Follow the token scale (6/8/12/14px)
7. **Font sizes**: Use the defined scale; avoid arbitrary sizes
8. **Animations**: Use the defined keyframes; keep transitions under 0.2s
9. **Component file location**: `ui/` for primitives, `board/` for board-related, `layout/` for shell
10. **All components are `"use client"`** unless purely presentational with no hooks

---

## 13. Priority Color System

```typescript
const PRIORITY_CONFIG = {
  urgent: { color: "#FF4444", bg: "rgba(255,68,68,0.12)"  },
  high:   { color: "#F5A623", bg: "rgba(245,166,35,0.12)" },
  medium: { color: "#0454FC", bg: "rgba(4,84,252,0.12)"   },
  low:    { color: "#555555", bg: "rgba(85,85,85,0.12)"   },
  none:   { color: "#444444", bg: "transparent"            },
};
```

---

## 14. Asset Management

- Static assets in `frontend/public/` (SVGs only: file, window, vercel, globe, next)
- No CDN configured
- No image optimization pipeline
- Logo is rendered as a styled `<div>` with gradient, not an image file
