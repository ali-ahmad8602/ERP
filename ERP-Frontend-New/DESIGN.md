# Design System Specification: The Luminous Workspace

This document defines the visual language and implementation standards for a high-end ERP environment. It moves beyond standard dashboard utility to create an immersive, editorial-grade workspace that feels professional yet technologically advanced.

## 1. Overview & Creative North Star: "The Digital Obsidian"

The Creative North Star for this system is **"The Digital Obsidian."** Much like a polished gemstone, the interface should feel deep, layered, and multi-dimensional. We are breaking the "SaaS template" look by rejecting rigid borders and flat containers in favor of **Atmospheric Depth**. 

Instead of a 2D grid, think of the UI as a series of floating, frosted glass panes suspended in a deep-space environment. We use intentional asymmetry and high-contrast typography scales to guide the eye, ensuring that "Professional" doesn't mean "Boring," and "Modern" doesn't mean "Cold."

---

## 2. Typography: Editorial Authority

We pair the technical precision of **Inter** with the high-end editorial feel of **Manrope**.

| Role | Font | Size | Intent |
| :--- | :--- | :--- | :--- |
| **Display-LG** | Manrope | 3.5rem | High-impact data hero numbers. |
| **Headline-MD** | Manrope | 1.75rem | Section headers; bold and authoritative. |
| **Title-MD** | Inter | 1.125rem | Standard card titles and navigation. |
| **Body-LG** | Inter | 1rem | Primary reading experience; high readability. |
| **Label-SM** | Inter | 0.6875rem | Micro-copy and metadata. |

**Hierarchy Note:** Use `on-surface` (#dae2fd) for primary text to ensure high contrast against the dark base. Use `on-surface-variant` (#c1c6d7) for secondary "whisper" text to create a clear information hierarchy.

---

## 3. Colors & Surface Philosophy

The palette is rooted in a deep navy base, punctuated by high-energy electric accents.

### Core Token Colors
- **Background**: `#0b1326`
- **Primary**: `#b8c3ff` (Container: `#6d88ff`)
- **Secondary**: `#d2bbff` (Container: `#6001d1`)
- **Tertiary**: `#3cd7ff` (Container: `#009ebe`)
- **Error**: `#ffb4ab` (Container: `#93000a`)

### Surface Hierarchy & Nesting
Depth is achieved through the physical stacking of tiers. 
- **Level 0 (Base):** `surface` (#0b1326) - The infinite background.
- **Level 1 (Sections):** `surface-container-low` (#131b2e) - Large layout areas.
- **Level 2 (Cards):** `surface-container` (#171f33) - Standard interactive modules.
- **Level 3 (Popovers/Modals):** `surface-container-highest` (#2d3449) - Elements closest to the user.

---

## 4. Elevation & Depth: Tonal Layering

We do not use structural lines. We use light and opacity.

### The "No-Line" Rule
**Explicit Instruction:** Traditional 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined solely through background color shifts or tonal transitions. To separate a sidebar from a main content area, place a `surface-container-low` section against the `surface` background. 

### The Glass & Layering Tactics
- **The Layering Principle:** Place a `surface-container-lowest` (#060e20) card inside a `surface-container` (#171f33) area to create an "inset" feel. This "Negative Depth" is cleaner than traditional shadows.
- **Ambient Shadows:** When an element must float (e.g., a primary action button), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4)`. The shadow should feel like an ambient occlusion, not a hard drop-shadow.
- **The Ghost Border:** If accessibility requires a stroke, use `outline-variant` (#414754) at **15% opacity**. This creates a "glint" on the edge of the glass without boxing in the content.
- **Large Radii:** All interactive containers must use the `lg` (2rem) or `xl` (3rem) rounding scale.

---

## 5. Components: Modular Implementation

### Buttons
- **Primary:** Gradient fill (`primary` (#b8c3ff) to `primary-container` (#6d88ff)), `rounded-full`, white text.
- **Secondary:** Transparent background, "Ghost Border" (15% opacity `outline-variant`), `on-surface` text.
- **State:** On hover, increase `backdrop-blur` or slightly shift the gradient luminosity.

### Glass Cards
- **Construction:** `bg-surface-container/60` + `backdrop-blur-xl`.
- **Constraint:** Never use dividers inside cards. Use the **Spacing Scale** (specifically `spacing-8` or `spacing-10`) to create "Active Negative Space" between header and content.

### Input Fields
- **Style:** `bg-surface-container-lowest` background, `rounded-md` (1.5rem).
- **Focus:** Transition to a `primary` ghost border. Do not use a solid 1px line; use a `ring` effect with 30% opacity.

### Navigation Sidebar
- **Layout:** Asymmetrical. The sidebar should not span the full height; it should be a floating glass pane (`surface-container-low`) with a `m-4` gap from the screen edge.

---

## 6. Spacing & Rhythm

Avoid the "tight" feel of traditional ERPs. 
*   **Standard Grid:** Use a 4px (0.25rem) base unit.
*   **Breathing Room:** Standard page padding should be `spacing-12` (3rem) to allow the glass elements to "float" without touching the bezel.
*   **Content Grouping:** Use `spacing-4` (1rem) for related items; `spacing-10` (2.5rem) for unrelated sections.
