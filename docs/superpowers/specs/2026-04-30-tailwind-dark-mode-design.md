# Tailwind CSS v4 Theme with Dark Mode

## Overview

Add a `default-tailwind` seed theme that uses Tailwind CSS v4, `@tailwindcss/typography`, and class-based dark mode with a toggle. Users select it via `theme: "default-tailwind"` in their astro-blog options.

## Theme Structure

A new seed theme directory alongside the existing plain CSS theme:

```
packages/astro-blog/src/themes/
├── default/              # existing plain CSS theme (unchanged)
└── default-tailwind/     # new Tailwind v4 theme
    ├── styles.css        # Tailwind v4 entry point
    ├── Nav.astro
    ├── Home.astro
    ├── List.astro
    ├── Post.astro
    ├── Page.astro
    └── index.ts
```

The existing seed-copy mechanism in `index.ts` already handles copying any theme directory to the user's `src/themes/<name>/`. No changes needed to the copy logic.

User configuration:

```js
blog({
  theme: "default-tailwind",
  // ... other options
})
```

## Auto-Configuration

When the integration detects `theme` contains `"tailwind"`, it:

1. Dynamically imports `@tailwindcss/vite` and adds the plugin to the Vite config via `updateConfig`
2. If the import fails, throws a descriptive error telling the user what to install

Error message on missing dependency:

```
[astro-blog] Theme "default-tailwind" requires Tailwind CSS v4.
Run: pnpm add tailwindcss @tailwindcss/vite @tailwindcss/typography
```

### Dependencies

Added to `packages/astro-blog/package.json`:

```json
"peerDependencies": {
  "tailwindcss": "^4.0.0",
  "@tailwindcss/vite": "^4.0.0",
  "@tailwindcss/typography": "^0.5.0"
},
"peerDependenciesMeta": {
  "tailwindcss": { "optional": true },
  "@tailwindcss/vite": { "optional": true },
  "@tailwindcss/typography": { "optional": true }
}
```

These are optional peer dependencies — only required when using a Tailwind-based theme.

## Tailwind v4 CSS Entry Point

`default-tailwind/styles.css`:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
@custom-variant dark (&:where(.dark, .dark *));

:root {
  --ink: #111;
  --paper: #fff;
  --text: #333;
  --muted: #666;
  --accent: #111;
  --accent-hover: #555;
  --border: #e5e5e5;
  --border-light: #f5f5f5;
}

.dark {
  --ink: #f5f5f5;
  --paper: #0a0a0a;
  --text: #d4d4d4;
  --muted: #a3a3a3;
  --accent: #f5f5f5;
  --accent-hover: #a3a3a3;
  --border: #262626;
  --border-light: #171717;
}
```

No `tailwind.config.js` — Tailwind v4 is CSS-first configuration.

## Dark Mode

### Mechanism

Class-based dark mode using `<html class="dark">`.

### Initialization (no flash)

An inline script in `Nav.astro` runs before paint:

```js
const stored = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (stored === 'dark' || (!stored && prefersDark)) {
  document.documentElement.classList.add('dark');
}
```

This is placed as an inline `<script is:inline>` in the `<header>` to ensure it runs synchronously before the page renders, preventing a flash of wrong theme.

### Toggle

A sun/moon icon button in the header bar (inside `.site-social` or adjacent). On click:

1. Toggles `dark` class on `<html>`
2. Saves `'light'` or `'dark'` to `localStorage.theme`
3. Swaps the icon between sun and moon

### Tailwind Configuration

The `@custom-variant dark (&:where(.dark, .dark *));` directive makes all `dark:` utility variants use the class strategy instead of media query.

## Component Design

All five `.astro` files share the same props interface and data flow as the plain CSS `default/` theme. Only the presentation differs.

### Nav.astro

Three-column header layout using Tailwind utilities:
- Logo left: `font-semibold text-[var(--ink)]`
- Nav center: `flex items-center gap-1`, links with hover states
- Right: social icons + dark mode toggle button
- Mobile: hamburger menu toggle, responsive nav dropdown
- Inline script for dark mode init + toggle + hamburger

### Home.astro

- Page title + subtitle + post card list
- Post cards with border separators, date meta, description
- All colors reference CSS variables via `text-[var(--text)]` etc.

### List.astro

- Section heading + post card list + pagination
- Same post card style as Home
- Pagination with bordered link buttons

### Post.astro

- Article header with date, title, tag cloud
- Post body wrapped in `<div class="prose dark:prose-invert max-w-none">` for typography plugin
- Tags as small bordered pills

### Page.astro

- Article header with title
- Content wrapped in `prose dark:prose-invert`
- Simplest of the layouts (no tags, no date)

### index.ts

Same barrel export pattern:

```ts
export { default as Home } from "./Home.astro";
export { default as List } from "./List.astro";
export { default as Post } from "./Post.astro";
export { default as Page } from "./Page.astro";
export const meta = { name: "default-tailwind", description: "Default theme with Tailwind CSS v4 and dark mode." };
```

## Integration Factory Changes

In `packages/astro-blog/src/index.ts`, add Tailwind auto-configuration after theme seed copy:

```ts
if (config.theme.includes("tailwind")) {
  try {
    const tailwindPlugin = await import("@tailwindcss/vite");
    updateConfig({
      vite: {
        plugins: [tailwindPlugin.default()],
      },
    });
  } catch {
    throw new Error(
      `[astro-blog] Theme "${config.theme}" requires Tailwind CSS v4.\n` +
      `Run: pnpm add tailwindcss @tailwindcss/vite @tailwindcss/typography`
    );
  }
}
```

The `astro:config:setup` hook must become `async` to support the dynamic import.

## Example Site

No changes to the existing example site (it uses `theme: "default"`). The Tailwind theme is validated by:

1. Unit tests for the auto-config logic
2. Optionally, a second example site or a build test that sets `theme: "default-tailwind"`

## Visual Style

The Tailwind theme maintains the same clean, minimal aesthetic as the plain CSS default theme — same layout structure, same proportions, same whitespace. The key additions are:

- Dark mode support (system default + manual toggle)
- Typography plugin for rich post content styling
- Tailwind utility classes for maintainability

## Scope Boundaries

**In scope:**
- New `default-tailwind/` seed theme with all 6 files
- Auto-configuration of `@tailwindcss/vite` in integration factory
- Dark mode with toggle + system preference fallback
- Optional peer dependencies for Tailwind packages

**Out of scope:**
- Modifying the existing `default/` plain CSS theme
- Adding dark mode to the plain CSS theme
- Custom Tailwind themes beyond `default-tailwind`
- Color scheme customization options in the blog config
