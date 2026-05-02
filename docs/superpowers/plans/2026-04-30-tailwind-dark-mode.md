# Tailwind CSS v4 Theme with Dark Mode — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `default-tailwind` seed theme using Tailwind CSS v4, `@tailwindcss/typography`, and class-based dark mode with a toggle button.

**Architecture:** A new seed theme directory `themes/default-tailwind/` with 7 files (styles.css, Nav.astro, Home.astro, List.astro, Post.astro, Page.astro, index.ts). The integration factory auto-configures `@tailwindcss/vite` when the theme name contains "tailwind". Tailwind packages are optional peer dependencies.

**Tech Stack:** Tailwind CSS v4, @tailwindcss/vite, @tailwindcss/typography, Astro 5

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `packages/astro-blog/package.json` | Add optional peer deps for Tailwind |
| Modify | `packages/astro-blog/src/index.ts` | Auto-configure @tailwindcss/vite when theme contains "tailwind" |
| Create | `packages/astro-blog/src/themes/default-tailwind/styles.css` | Tailwind v4 entry point + CSS variables for light/dark |
| Create | `packages/astro-blog/src/themes/default-tailwind/Nav.astro` | Header with nav, social, dark mode toggle, hamburger |
| Create | `packages/astro-blog/src/themes/default-tailwind/Home.astro` | Homepage layout |
| Create | `packages/astro-blog/src/themes/default-tailwind/List.astro` | Post list + pagination |
| Create | `packages/astro-blog/src/themes/default-tailwind/Post.astro` | Single post with prose typography |
| Create | `packages/astro-blog/src/themes/default-tailwind/Page.astro` | Static page with prose typography |
| Create | `packages/astro-blog/src/themes/default-tailwind/index.ts` | Barrel export |
| Modify | `examples/blog-site/package.json` | Add tailwind dev deps for testing |
| Modify | `examples/blog-site/astro.config.mjs` | Switch to `theme: "default-tailwind"` |

---

### Task 1: Add optional Tailwind peer dependencies to package.json

**Files:**
- Modify: `packages/astro-blog/package.json`

- [ ] **Step 1: Add peer dependencies**

Add `peerDependencies` and `peerDependenciesMeta` to `packages/astro-blog/package.json`. Insert after the existing `"peerDependencies"` block (which currently has only `astro`):

```json
{
  "peerDependencies": {
    "astro": "^4.0.0 || ^5.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "@tailwindcss/typography": "^0.5.0"
  },
  "peerDependenciesMeta": {
    "tailwindcss": { "optional": true },
    "@tailwindcss/vite": { "optional": true },
    "@tailwindcss/typography": { "optional": true }
  }
}
```

- [ ] **Step 2: Verify package.json is valid JSON**

Run: `node -e "require('./packages/astro-blog/package.json')"`
Expected: no output (success)

- [ ] **Step 3: Commit**

```bash
git add packages/astro-blog/package.json
git commit -m "feat: add optional Tailwind CSS peer dependencies"
```

---

### Task 2: Auto-configure @tailwindcss/vite in integration factory

**Files:**
- Modify: `packages/astro-blog/src/index.ts`

The `astro:config:setup` hook callback must become `async` to support `await import(...)`.

- [ ] **Step 1: Make the hook async and add Tailwind auto-config**

In `packages/astro-blog/src/index.ts`, change the hook from:

```ts
"astro:config:setup": ({ config: astroConfig, updateConfig, injectRoute, logger }) => {
```

to:

```ts
"astro:config:setup": async ({ config: astroConfig, updateConfig, injectRoute, logger }) => {
```

Then, after the theme seed-copy block (after the `if (!existsSync(userThemeIndex))` block ends, around line 49) and before the `const configSource = ...` line, add:

```ts
        if (config.theme.includes("tailwind")) {
          try {
            const tailwindPlugin = await import("@tailwindcss/vite");
            updateConfig({
              vite: {
                plugins: [tailwindPlugin.default()],
              },
            });
            logger.info("Tailwind CSS v4 plugin configured automatically.");
          } catch {
            throw new Error(
              `[astro-blog] Theme "${config.theme}" requires Tailwind CSS v4.\n` +
              `Run: pnpm add tailwindcss @tailwindcss/vite @tailwindcss/typography`
            );
          }
        }
```

- [ ] **Step 2: Verify existing tests still pass**

Run: `pnpm --filter astro-blog test`
Expected: all 33 tests pass (the integration factory itself isn't unit-tested — tests cover options, posts, seo, virtual)

- [ ] **Step 3: Commit**

```bash
git add packages/astro-blog/src/index.ts
git commit -m "feat: auto-configure @tailwindcss/vite for tailwind themes"
```

---

### Task 3: Create Tailwind theme — styles.css

**Files:**
- Create: `packages/astro-blog/src/themes/default-tailwind/styles.css`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p packages/astro-blog/src/themes/default-tailwind
```

- [ ] **Step 2: Write styles.css**

Create `packages/astro-blog/src/themes/default-tailwind/styles.css`:

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

- [ ] **Step 3: Commit**

```bash
git add packages/astro-blog/src/themes/default-tailwind/styles.css
git commit -m "feat: add Tailwind v4 styles.css with dark mode variables"
```

---

### Task 4: Create Tailwind theme — index.ts

**Files:**
- Create: `packages/astro-blog/src/themes/default-tailwind/index.ts`

- [ ] **Step 1: Write index.ts**

Create `packages/astro-blog/src/themes/default-tailwind/index.ts`:

```ts
export { default as Home } from "./Home.astro";
export { default as List } from "./List.astro";
export { default as Post } from "./Post.astro";
export { default as Page } from "./Page.astro";

export const meta = {
  name: "default-tailwind",
  description: "Default theme with Tailwind CSS v4 and dark mode.",
};
```

- [ ] **Step 2: Commit**

```bash
git add packages/astro-blog/src/themes/default-tailwind/index.ts
git commit -m "feat: add default-tailwind theme barrel export"
```

---

### Task 5: Create Tailwind theme — Nav.astro

**Files:**
- Create: `packages/astro-blog/src/themes/default-tailwind/Nav.astro`

This is the most complex component. It renders:
1. Sticky header bar with three sections: logo (left), nav (center), social + dark toggle (right)
2. Mobile hamburger menu
3. Dark mode init script (inline, runs before paint)
4. Dark mode toggle + hamburger toggle script

- [ ] **Step 1: Write Nav.astro**

Create `packages/astro-blog/src/themes/default-tailwind/Nav.astro`:

```astro
---
import config from "astro-blog:config";

type NavLeaf = { name: string; path: string };
type NavGroup = { name: string; children: NavItem[] };
type NavItem = NavLeaf | NavGroup;

function isLeaf(item: NavItem): item is NavLeaf {
  return "path" in item;
}

const items: NavItem[] = config.nav ?? [];
const social = config.social ?? {};
---
<script is:inline>
  (function() {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  })();
</script>

<header class="sticky top-0 z-50 bg-[var(--paper)] border-b border-[var(--border)] transition-colors">
  <div class="max-w-4xl mx-auto h-14 flex items-center justify-between px-6 gap-6">
    <a href="/" class="text-lg font-semibold text-[var(--ink)] no-underline whitespace-nowrap shrink-0 hover:opacity-70 transition-opacity">
      {config.site.title}
    </a>

    <nav class="hidden md:flex items-center gap-0.5" id="site-nav">
      <a href="/" class="text-sm text-[var(--text)] no-underline px-2.5 py-1.5 rounded hover:bg-[var(--border-light)] transition-colors">Home</a>
      {items.map((item) =>
        isLeaf(item) ? (
          <a href={item.path} class="text-sm text-[var(--text)] no-underline px-2.5 py-1.5 rounded hover:bg-[var(--border-light)] transition-colors">{item.name}</a>
        ) : (
          <div class="relative group">
            <span class="text-sm text-[var(--text)] px-2.5 py-1.5 rounded cursor-default inline-flex items-center gap-1 hover:bg-[var(--border-light)] transition-colors">
              {item.name}
              <svg class="w-3 h-3 opacity-50" viewBox="0 0 12 12" fill="currentColor"><path d="M2 4l4 4 4-4"/></svg>
            </span>
            <div class="hidden group-hover:flex flex-col absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-[var(--paper)] border border-[var(--border)] rounded-lg p-1 min-w-[140px] shadow-lg">
              {item.children.map((child) =>
                isLeaf(child) ? (
                  <a href={child.path} class="text-sm text-[var(--text)] no-underline px-2.5 py-1.5 rounded hover:bg-[var(--border-light)] transition-colors">{child.name}</a>
                ) : null
              )}
            </div>
          </div>
        )
      )}
      <a href="/posts" class="text-sm text-[var(--text)] no-underline px-2.5 py-1.5 rounded hover:bg-[var(--border-light)] transition-colors">Posts</a>
      <a href="/rss.xml" class="text-sm text-[var(--text)] no-underline px-2.5 py-1.5 rounded hover:bg-[var(--border-light)] transition-colors">RSS</a>
    </nav>

    <div class="flex items-center gap-2 shrink-0">
      {social.github && (
        <a href={social.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" class="text-[var(--muted)] hover:text-[var(--ink)] transition-colors flex">
          <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
        </a>
      )}
      {social.twitter && (
        <a href={social.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" class="text-[var(--muted)] hover:text-[var(--ink)] transition-colors flex">
          <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
      )}
      {social.email && (
        <a href={`mailto:${social.email}`} aria-label="Email" class="text-[var(--muted)] hover:text-[var(--ink)] transition-colors flex">
          <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        </a>
      )}

      <button id="theme-toggle" aria-label="Toggle dark mode" class="text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer bg-transparent border-none p-1 rounded hover:bg-[var(--border-light)] transition-colors flex">
        <svg id="icon-sun" class="w-[18px] h-[18px] hidden dark:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        <svg id="icon-moon" class="w-[18px] h-[18px] block dark:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      </button>

      <button id="menu-toggle" aria-label="Toggle menu" class="hidden max-md:flex bg-transparent border-none text-[var(--text)] cursor-pointer p-1 rounded hover:bg-[var(--border-light)] transition-colors">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
    </div>
  </div>

  <nav class="hidden flex-col px-4 pb-4 pt-2 border-t border-[var(--border-light)] md:!hidden" id="mobile-nav">
    <a href="/" class="text-sm text-[var(--text)] no-underline px-2.5 py-2 rounded hover:bg-[var(--border-light)] transition-colors">Home</a>
    {items.map((item) =>
      isLeaf(item) ? (
        <a href={item.path} class="text-sm text-[var(--text)] no-underline px-2.5 py-2 rounded hover:bg-[var(--border-light)] transition-colors">{item.name}</a>
      ) : (
        <div>
          <span class="text-sm text-[var(--text)] px-2.5 py-2 block">{item.name}</span>
          {item.children.map((child) =>
            isLeaf(child) ? (
              <a href={child.path} class="text-sm text-[var(--text)] no-underline px-2.5 py-2 pl-6 rounded hover:bg-[var(--border-light)] transition-colors block">{child.name}</a>
            ) : null
          )}
        </div>
      )
    )}
    <a href="/posts" class="text-sm text-[var(--text)] no-underline px-2.5 py-2 rounded hover:bg-[var(--border-light)] transition-colors">Posts</a>
    <a href="/rss.xml" class="text-sm text-[var(--text)] no-underline px-2.5 py-2 rounded hover:bg-[var(--border-light)] transition-colors">RSS</a>
  </nav>
</header>

<script>
  document.getElementById('menu-toggle')?.addEventListener('click', () => {
    const nav = document.getElementById('mobile-nav');
    if (nav) {
      nav.classList.toggle('hidden');
      nav.classList.toggle('flex');
    }
  });

  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
</script>
```

- [ ] **Step 2: Commit**

```bash
git add packages/astro-blog/src/themes/default-tailwind/Nav.astro
git commit -m "feat: add default-tailwind Nav.astro with dark mode toggle"
```

---

### Task 6: Create Tailwind theme — Home.astro

**Files:**
- Create: `packages/astro-blog/src/themes/default-tailwind/Home.astro`

- [ ] **Step 1: Write Home.astro**

Create `packages/astro-blog/src/themes/default-tailwind/Home.astro`:

```astro
---
import "./styles.css";
import config from "astro-blog:config";
import SEO from "astro-blog/components/SEO";
import Nav from "./Nav.astro";
import type { CollectionEntry } from "astro:content";

interface Props {
  posts: CollectionEntry<"posts">[];
}

const { posts } = Astro.props;
---
<html lang={config.site.language}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <SEO />
  </head>
  <body class="bg-[var(--paper)] text-[var(--text)] font-sans text-base leading-relaxed transition-colors">
    <Nav />
    <main class="max-w-[720px] mx-auto px-6 pt-10 pb-16 min-h-[calc(100vh-56px-60px)]">
      <h1 class="text-3xl font-semibold text-[var(--ink)] mb-1">{config.site.title}</h1>
      {config.site.description && <p class="text-base text-[var(--muted)] mb-10">{config.site.description}</p>}
      {posts.length === 0 && <p class="text-center py-12 text-[var(--muted)]">No posts yet.</p>}
      {posts.map((p) => (
        <article class="py-5 border-b border-[var(--border-light)] first:pt-0 last:border-b-0">
          <h2 class="text-xl font-semibold mb-0.5">
            <a href={`/posts/${p.slug}`} class="text-[var(--ink)] no-underline hover:text-[var(--accent-hover)] transition-colors">{p.data.title}</a>
          </h2>
          <p class="text-xs text-[var(--muted)]">{p.data.pubDate.toISOString().slice(0, 10)}</p>
          {p.data.description && <p class="mt-1 text-sm text-[var(--muted)] leading-normal">{p.data.description}</p>}
        </article>
      ))}
    </main>
    <footer class="border-t border-[var(--border-light)] py-5 px-6 text-center text-xs text-[var(--muted)]">
      &copy; {new Date().getFullYear()} {config.site.author || config.site.title}
    </footer>
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add packages/astro-blog/src/themes/default-tailwind/Home.astro
git commit -m "feat: add default-tailwind Home.astro"
```

---

### Task 7: Create Tailwind theme — List.astro

**Files:**
- Create: `packages/astro-blog/src/themes/default-tailwind/List.astro`

- [ ] **Step 1: Write List.astro**

Create `packages/astro-blog/src/themes/default-tailwind/List.astro`:

```astro
---
import "./styles.css";
import config from "astro-blog:config";
import SEO from "astro-blog/components/SEO";
import Nav from "./Nav.astro";
import type { CollectionEntry } from "astro:content";
import type { PageInfo } from "astro-blog/lib/posts";

interface Props {
  posts: CollectionEntry<"posts">[];
  page: PageInfo;
  tag?: string;
}

const { posts, page, tag } = Astro.props;
const heading = tag ? `Posts tagged "${tag}"` : "All posts";

function pageUrl(n: number): string {
  if (tag) return `/tags/${tag}`;
  return n === 1 ? "/posts" : `/posts/page/${n}`;
}
---
<html lang={config.site.language}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <SEO title={`${heading} · ${config.site.title}`} />
  </head>
  <body class="bg-[var(--paper)] text-[var(--text)] font-sans text-base leading-relaxed transition-colors">
    <Nav />
    <main class="max-w-[720px] mx-auto px-6 pt-10 pb-16 min-h-[calc(100vh-56px-60px)]">
      <h1 class="text-2xl font-semibold mb-5 pb-2 border-b border-[var(--border)] text-[var(--ink)]">{heading}</h1>
      {posts.length === 0 && <p class="text-center py-12 text-[var(--muted)]">No posts yet.</p>}
      {posts.map((p) => (
        <article class="py-5 border-b border-[var(--border-light)] first:pt-0 last:border-b-0">
          <h3 class="text-xl font-semibold mb-0.5">
            <a href={`/posts/${p.slug}`} class="text-[var(--ink)] no-underline hover:text-[var(--accent-hover)] transition-colors">{p.data.title}</a>
          </h3>
          <p class="text-xs text-[var(--muted)]">{p.data.pubDate.toISOString().slice(0, 10)}</p>
          {p.data.description && <p class="mt-1 text-sm text-[var(--muted)] leading-normal">{p.data.description}</p>}
        </article>
      ))}
      {!tag && page.total > 1 && (
        <nav class="flex items-center justify-center gap-4 mt-10 pt-5 border-t border-[var(--border-light)]">
          {page.hasPrev && <a href={pageUrl(page.current - 1)} class="text-sm no-underline px-3.5 py-1.5 border border-[var(--border)] rounded text-[var(--accent)] hover:bg-[var(--border-light)] transition-colors">&larr; Newer</a>}
          <span class="text-sm text-[var(--muted)]">Page {page.current} / {page.total}</span>
          {page.hasNext && <a href={pageUrl(page.current + 1)} class="text-sm no-underline px-3.5 py-1.5 border border-[var(--border)] rounded text-[var(--accent)] hover:bg-[var(--border-light)] transition-colors">Older &rarr;</a>}
        </nav>
      )}
    </main>
    <footer class="border-t border-[var(--border-light)] py-5 px-6 text-center text-xs text-[var(--muted)]">
      &copy; {new Date().getFullYear()} {config.site.author || config.site.title}
    </footer>
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add packages/astro-blog/src/themes/default-tailwind/List.astro
git commit -m "feat: add default-tailwind List.astro"
```

---

### Task 8: Create Tailwind theme — Post.astro

**Files:**
- Create: `packages/astro-blog/src/themes/default-tailwind/Post.astro`

- [ ] **Step 1: Write Post.astro**

Create `packages/astro-blog/src/themes/default-tailwind/Post.astro`:

```astro
---
import "./styles.css";
import config from "astro-blog:config";
import SEO from "astro-blog/components/SEO";
import Nav from "./Nav.astro";
import type { CollectionEntry } from "astro:content";

interface Props {
  post: CollectionEntry<"posts">;
}

const { post } = Astro.props;
const { Content } = await post.render();
---
<html lang={config.site.language}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <SEO
      title={`${post.data.title} · ${config.site.title}`}
      description={post.data.description}
      type="article"
    />
  </head>
  <body class="bg-[var(--paper)] text-[var(--text)] font-sans text-base leading-relaxed transition-colors">
    <Nav />
    <main class="max-w-[720px] mx-auto px-6 pt-10 pb-16 min-h-[calc(100vh-56px-60px)]">
      <article>
        <header class="mb-8 pb-5 border-b border-[var(--border-light)]">
          <p class="text-xs text-[var(--muted)] mb-2">
            {post.data.pubDate.toISOString().slice(0, 10)}
            {post.data.updatedDate && (
              <> · updated {post.data.updatedDate.toISOString().slice(0, 10)}</>
            )}
          </p>
          <h1 class="text-3xl font-semibold text-[var(--ink)]">{post.data.title}</h1>
          {post.data.tags.length > 0 && (
            <div class="mt-2.5 flex flex-wrap gap-1.5">
              {post.data.tags.map((t) => (
                <a href={`/tags/${t}`} class="text-xs text-[var(--muted)] border border-[var(--border)] px-2 py-0.5 rounded no-underline hover:text-[var(--ink)] hover:border-[var(--ink)] transition-colors">#{t}</a>
              ))}
            </div>
          )}
        </header>
        <div class="prose dark:prose-invert max-w-none">
          <Content />
        </div>
      </article>
    </main>
    <footer class="border-t border-[var(--border-light)] py-5 px-6 text-center text-xs text-[var(--muted)]">
      &copy; {new Date().getFullYear()} {config.site.author || config.site.title}
    </footer>
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add packages/astro-blog/src/themes/default-tailwind/Post.astro
git commit -m "feat: add default-tailwind Post.astro with prose typography"
```

---

### Task 9: Create Tailwind theme — Page.astro

**Files:**
- Create: `packages/astro-blog/src/themes/default-tailwind/Page.astro`

- [ ] **Step 1: Write Page.astro**

Create `packages/astro-blog/src/themes/default-tailwind/Page.astro`:

```astro
---
import "./styles.css";
import config from "astro-blog:config";
import SEO from "astro-blog/components/SEO";
import Nav from "./Nav.astro";
import type { CollectionEntry } from "astro:content";

interface Props {
  page: CollectionEntry<"pages">;
}

const { page } = Astro.props;
const { Content } = await page.render();
---
<html lang={config.site.language}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <SEO
      title={`${page.data.title} · ${config.site.title}`}
      description={page.data.description}
    />
  </head>
  <body class="bg-[var(--paper)] text-[var(--text)] font-sans text-base leading-relaxed transition-colors">
    <Nav />
    <main class="max-w-[720px] mx-auto px-6 pt-10 pb-16 min-h-[calc(100vh-56px-60px)]">
      <article>
        <header class="mb-8 pb-5 border-b border-[var(--border-light)]">
          <h1 class="text-3xl font-semibold text-[var(--ink)]">{page.data.title}</h1>
        </header>
        <div class="prose dark:prose-invert max-w-none">
          <Content />
        </div>
      </article>
    </main>
    <footer class="border-t border-[var(--border-light)] py-5 px-6 text-center text-xs text-[var(--muted)]">
      &copy; {new Date().getFullYear()} {config.site.author || config.site.title}
    </footer>
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add packages/astro-blog/src/themes/default-tailwind/Page.astro
git commit -m "feat: add default-tailwind Page.astro with prose typography"
```

---

### Task 10: Wire up example site to use default-tailwind theme

**Files:**
- Modify: `examples/blog-site/package.json`
- Modify: `examples/blog-site/astro.config.mjs`

- [ ] **Step 1: Add Tailwind dependencies to example site**

Add `tailwindcss`, `@tailwindcss/vite`, and `@tailwindcss/typography` as devDependencies in `examples/blog-site/package.json`:

```json
{
  "name": "blog-site",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "astro-blog": "workspace:*"
  },
  "devDependencies": {
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "@tailwindcss/typography": "^0.5.0"
  }
}
```

- [ ] **Step 2: Switch example site to default-tailwind theme**

In `examples/blog-site/astro.config.mjs`, change `theme: "default"` to `theme: "default-tailwind"`:

```js
import { defineConfig } from "astro/config";
import blog from "astro-blog";

export default defineConfig({
  site: "https://example.com",
  integrations: [
    blog({
      theme: "default-tailwind",
      site: {
        title: "Example Blog",
        description: "A demo of astro-blog.",
        author: "Kun Yan",
        language: "en",
        url: "https://example.com",
      },
      social: {
        github: "https://github.com/kunyan",
      },
      posts: {
        perPage: 2,
        contentDir: "src/content/posts",
      },
      nav: [
        { name: "About", path: "/about" },
      ],
    }),
  ],
});
```

- [ ] **Step 3: Install dependencies**

Run: `pnpm install`
Expected: installs Tailwind packages into the example site

- [ ] **Step 4: Delete old theme files so seed copy runs**

The example site currently has `src/themes/default/` copied from the seed. Since we're switching to `default-tailwind`, the seed copy mechanism will look for `src/themes/default-tailwind/`. It doesn't exist yet, so the integration will auto-copy it.

No need to delete the old `src/themes/default/` — it's unused when `theme: "default-tailwind"` is set. But keeping it is harmless.

- [ ] **Step 5: Build the example site**

Run: `pnpm --filter blog-site build`
Expected: build succeeds, all pages generated, Tailwind CSS v4 plugin configured automatically

- [ ] **Step 6: Run verification script**

Run: `node scripts/verify-example-build.mjs`
Expected: all checks pass

- [ ] **Step 7: Spot-check the output**

Run: `head -50 examples/blog-site/dist/index.html`
Expected: see Tailwind utility classes in the HTML, dark mode toggle button, CSS variables in the stylesheet

- [ ] **Step 8: Commit**

```bash
git add examples/blog-site/package.json examples/blog-site/astro.config.mjs
git commit -m "feat: switch example site to default-tailwind theme"
```

---

### Task 11: Run full test suite and verify

**Files:** None (verification only)

- [ ] **Step 1: Run unit tests**

Run: `pnpm --filter astro-blog test`
Expected: all 33 tests pass

- [ ] **Step 2: Build example site clean**

Run: `rm -rf examples/blog-site/dist examples/blog-site/src/themes/default-tailwind && pnpm --filter blog-site build`
Expected: build succeeds — integration auto-copies seed theme, configures Tailwind, generates all pages

- [ ] **Step 3: Run verification script**

Run: `node scripts/verify-example-build.mjs`
Expected: all checks pass

- [ ] **Step 4: Spot-check dark mode toggle in output**

Run: `grep -c 'theme-toggle' examples/blog-site/dist/index.html`
Expected: output shows `1` (the toggle button exists)

Run: `grep -c 'prose dark:prose-invert' examples/blog-site/dist/posts/hello-world/index.html`
Expected: output shows `1` (typography plugin applied)

- [ ] **Step 5: Commit all remaining files**

```bash
git add -A
git commit -m "feat: complete default-tailwind theme with dark mode"
```
