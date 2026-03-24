# Skill: Figma Design System Generator

## Description
Generates a Figma design system and pages for your existing project using the authenticated Figma MCP. 
This includes colors, typography, spacing, and components mapped from your code.

## Command
/figma-design

## Usage
Run this command from your project folder. Claude will:
1. Read all component files (React, Vue, HTML/CSS, Tailwind) in the current folder.
2. Extract design tokens:
   - Colors
   - Font families, sizes, weights
   - Spacing (padding/margin)
   - Border radius and shadows
3. Map components to Figma frames and pages.
4. Output a Figma file URL and summary of created frames/components.

## Implementation (Instructions to Claude)
- Use the authenticated Figma MCP.
- Preserve naming conventions from code (component names, classes, IDs).
- Use semantic layers: Buttons, Inputs, Cards, Modals, Forms, etc.
- Maintain consistent spacing, color palettes, and typography.
- Confirm actions at each step and provide the Figma link at the end.

## Example Prompts
- "Create Figma pages for the project in src/components and map all buttons, forms, and cards."
- "Update Figma design to match the latest src/components folder changes."
