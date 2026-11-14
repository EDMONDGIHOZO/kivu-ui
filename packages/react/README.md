# @kivu-ui/react

A lightweight React component library that plays nicely with Tailwind CSS.

- **Tiny**: ~6 KB JS + ~5 KB CSS (gzipped) for the whole library, zero runtime dependencies.
- **No CSS-in-JS**: plain CSS + CSS variables. Works with Next.js App Router / RSC (components ship as `"use client"`).
- **Tailwind-friendly**: component styles live in `@layer components`, so any utility you pass via `className` wins. No `tailwind-merge` needed.
- **Accessible**: keyboard-navigable Tabs, ARIA-wired Accordion and form fields, native `<dialog>` Modal.
- **Themeable**: override `--kivu-*` CSS variables; dark mode via `.dark` or `[data-theme="dark"]`.

## Install

```bash
npm install @kivu-ui/react
```

React 18 or 19 is required.

## Setup

### With Tailwind CSS v4 (recommended)

```css
/* app.css */
@import "tailwindcss";
@import "@kivu-ui/react/styles.css";
@import "@kivu-ui/react/tailwind.css"; /* optional: Kivu UI tokens as Tailwind utilities */
```

The optional preset gives you utilities that follow the theme, such as `bg-primary-600`, `text-ink-800`, `text-fg-muted`, `border-line`, `bg-surface`, `font-display`, `rounded-kivu-lg`, and `shadow-kivu-md`. It also makes the `dark:` variant follow the same `.dark` / `data-theme` switch.

### Without Tailwind

```ts
import "@kivu-ui/react/styles.css";
```

### Fonts

The library does not load fonts. The default is `Martel Sans` (display and body), on Google Fonts, with system fallbacks. Load them yourself, or set your own:

```css
:root {
  --kivu-font-display: "Your Display", sans-serif;
  --kivu-font-body: "Your Body", sans-serif;
}
```

## Usage

```tsx
import { Button, Input, SectionHeader, Tabs, TabsList, TabsTrigger, TabsPanel } from "@kivu-ui/react";

export function Hero() {
  return (
    <>
      <SectionHeader
        icon={<BoardIcon />}
        title="Plan every project on one board"
        actions={
          <>
            <Button>Try timelines</Button>
            <Button variant="soft">Watch the demo</Button>
          </>
        }
      />

      {/* Tailwind classes override component styles */}
      <Button className="rounded-full bg-emerald-600 px-10 hover:bg-emerald-700">Custom</Button>

      {/* Render as your router's Link */}
      <Button asChild variant="outline">
        <a href="/projects/new">New project</a>
      </Button>

      <Input label="Hourly rate" rightSection="USD/h" />
    </>
  );
}
```

## Components

| Component | Notes |
|---|---|
| `Button` | `variant`: solid · soft · outline · ghost · glass · link. `tone`: primary · accent · danger. `size`: sm · md · lg. `loading`, `fullWidth`, `leftSection`/`rightSection`, `asChild` |
| `IconButton` | Requires `aria-label`. `variant` adds `white`. `shape`: circle · square |
| `Badge` | `variant`: solid · soft · outline. `tone`: primary · accent · neutral · success · danger. `caps` for eyebrow style |
| `Input`, `Textarea`, `Select` | `label` (inside the box by default, `labelPosition="outside"` to move it), `description`, `error`, `leftSection`/`rightSection`. `variant`: default · filled · glass |
| `Checkbox`, `Switch` | Native inputs with `label`/`description`; Checkbox supports `indeterminate` |
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsPanel` | Controlled or uncontrolled. Arrow / Home / End keys. `variant`: underline · pills. `grow` on the list |
| `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` | `multiple`, controlled or uncontrolled, animated height, `variant`: card · plain |
| `Card` | `variant`: elevated · outline · subtle · glass · brand. `padding`, `radius`, `interactive`, `asChild` |
| `Avatar`, `AvatarGroup` | Image with an initials fallback; overlapping group with `max` |
| `SectionHeader`, `IconTile`, `Highlight` | Section intro: icon tile, display heading, actions |
| `Banner` | Dismissible announcement bar with an optional `action` |
| `Modal` | Native `<dialog>`: focus trap, Escape, and backdrop click built in |
| `Container`, `Divider`, `Spinner` | Layout helpers |
| `cx`, `Slot` | Utilities for building your own components |

## Theming

All colours, radii, shadows and fonts are CSS variables. Override them in your own CSS; unlayered CSS beats the library's layer:

```css
:root {
  --kivu-primary-600: #7c3aed; /* brand */
  --kivu-primary: var(--kivu-primary-600);
  --kivu-radius-md: 10px;
}
```

Dark mode: add `class="dark"` or `data-theme="dark"` on `<html>` or any wrapper.

## License

MIT
