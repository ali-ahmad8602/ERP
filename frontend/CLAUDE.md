# CLAUDE.md: InvoiceMate ERP Frontend

Welcome, Engineer. This document provides the architectural blueprint, design system rules, and CLI workflows for the **InvoiceMate ERP Frontend**.  

## 1. Project Overview
**InvoiceMate ERP** is a premium SaaS platform for high-performance invoice financing and credit management. This repository handles the **React Frontend**, connecting to a pre-built Node.js/Express backend via REST and WebSockets.

- **Primary Goal**: Provide a fast, secure, and beautiful interface for managing loans, invoices, and credit departments.
- **Backend Status**: Already operational on port 5000.
- **Tech Stack**: React 18+, Vite, Tailwind CSS v4, Framer Motion, Zustand (State), Axios (API).

---

## 2. Design System: "Luminous Obsidian"
Interface follows a **Glassmorphic Dark Theme** with a premium SaaS feel.

### Foundational Tokens
- **Colors**:
  - `bg-base`: `#0A0A0A`
  - `bg-surface`: `#121212`
  - `primary`: `#0454FC`
  - `accent`: `#00E5A0`
  - `danger`: `#FF3B3B`
- **Typography**: 
  - `font-heading`: **Manrope**
  - `font-body`: **Inter**
- **Glassmorphism**: 
  - Cards/overlays: `bg-surface/60 backdrop-blur-xl`
  - Ghost borders: `border-[#1E1E1E]`

### Animations (Framer Motion)
- **Modals**: Fade-in + scale-up from `0.95`.
- **Kanban Cards**: Hover scale `1.02` with lift shadow.
- **Page Transitions**: Smooth horizontal slides or opacity fades.
- **Scroll**: Staggered entrance for table rows, lists, and cards.
- **Component Generation Commands**: 
```text
/ui create a hero section with gradient background
/ui build a pricing section with 3 tiers and toggle monthly/annual
/ui create a dashboard table with staggered scroll animation
3. Core UI Components
Navigation: Persistent Sidebar with nested Department routing.
Top Bar: Search-driven breadcrumbs, Notification Bell (Socket-driven), User Profile.
Kanban Boards: Dynamic drag-and-drop columns.
Dynamic Forms: Auto-rendered fields based on schema (text, number, date, logic).
Responsiveness: Mobile-first grids; horizontal overflow for Kanban on small screens.
4. Search & CLI Workflow

Use these patterns for consistent design guidance:

# General Search
npx antigravity search --domain [DOMAIN] --stack [STACK] --query "[QUERY]"
Domains: product, style, typography, color, landing, chart, ux, kanban.
Stacks: react, vite-react, tailwind-v4, zustand.
5. Directory Architecture
/
├── src/
│   ├── components/
│   ├── store/
│   ├── api/
│   ├── hooks/
│   ├── scripts/
│   ├── data/
│   └── main.jsx
├── templates/
├── cli/
└── .claude/
6. Sync & Expansion Rules
Edit Scripts/Data in src/scripts or src/data.
Apply Sync: npm run sync to propagate schema/UI changes.
Reactive state: Lift shared state into useAppStore.js.
Commit CLAUDE.md to Git so the team shares the same design system instructions.
7. Prerequisites
Node 18+
npm/yarn
Key Modules: framer-motion, lucide-react, axios, zustand
8. Git Workflow
Branch: feat/[feature-name] or fix/[issue-number].
Commit: Use descriptive prefixes: style:, feat:, fix:, refactor:.
Push: Ensure npm run lint passes.
Merge: PR to main.