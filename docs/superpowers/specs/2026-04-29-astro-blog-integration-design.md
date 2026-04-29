# astro-blog Integration — Design Spec

**Date:** 2026-04-29
**Status:** Draft, awaiting user review before plan
**Author:** Kyan (with Claude)

## 1. Goal

Build an Astro integration named `astro-blog`. After installing it and adding a few lines to `astro.config.mjs` and `src/content/config.ts`, an empty Astro project becomes a working multi-page blog with sensible defaults.

The integration ships with one bundled theme named `default`. Additional themes are added later as contributions to the same repository, dropped into `packages/astro-blog/src/themes/`. Theme selection is **build-time only** via the integration's `theme` option — there is no runtime theme switching.

The blog content lives in standard Astro content collections; the integration provides no custom storage layer, only routing, layout, and a content schema.

## 2. Scope

### In scope (v1)

- Astro integration package, distributed via npm as `astro-blog`
- One bundled `default` theme
- Build-time theme selection via the integration's `theme` option
- Configurable site metadata: title, description, author, language, url, social links
- Auto-injected routes: `/`, `/blog`, `/blog/[...page]` (paginated list), `/blog/[slug]`, `/tags/[tag]`, `/rss.xml`
- Automatic `@astrojs/sitemap` integration
- Exported `blogSchema` (zod) for the user's `content/config.ts`
- Draft support: `draft: true` posts visible in `astro dev`, excluded from `astro build`
- `<SEO />` component themes can place in `<head>`
- Pagination on the list page (configurable `postsPerPage`, default 10)
- Tag archive pages (auto-generated for tags that have at least one published post)
- Monorepo with an `examples/blog-site/` Astro project for development and demonstration
- Vitest unit tests for `lib/` and `options.ts`
- A minimal CI workflow that builds, tests, and verifies the example site builds

### Out of scope (v1, can revisit later)

- Runtime theme switching (light/dark, alternate layouts)
- Multiple bundled themes — only `default` ships in v1
- User customization of the default theme (no CSS variable overrides, no component shadowing). Users wanting changes write a new theme.
- `themeOptions` (per-theme configuration block)
- Navigation menu configuration
- Auto-generated OG images per post
- Reading time / word count
- Custom syntax-highlighting configuration (Astro's default Shiki applies)
- Scheduled publishing (future `pubDate` is published immediately)
- Public exports of internal `lib/` helpers — kept internal in v1
- Browser end-to-end tests (Playwright)
- Code coverage thresholds

## 3. Architecture

### 3.1 Core mechanism: virtual module aliases for theme dispatch

Astro's `injectRoute` requires a static file path; it cannot accept a "dynamically chosen component." To let static route templates render different themes based on user config, the integration uses Vite virtual module aliases (the same pattern used by Starlight):

- `astro-blog:current-theme` → resolves to `packages/astro-blog/src/themes/<theme-name>/index.ts`
- `astro-blog:config` → a generated virtual module exposing the validated user config (site, social, blog blocks)

Both aliases are registered in the integration's `astro:config:setup` hook via `updateConfig({ vite: { resolve: { alias: ... } } })` (the `astro-blog:config` virtual is generated as an inline string and resolved through a tiny Vite plugin that returns the source).

### 3.2 Lifecycle: what happens during `astro:config:setup`

```
user astro.config.mjs
        │
        ▼
astro-blog integration factory(options)
        │
        ▼
astro:config:setup hook fires
        │
        ├─→ validate options with zod (options.ts)
        ├─→ resolve theme name → absolute path; verify it exists and exports { Home, List, Post }
        ├─→ register Vite alias `astro-blog:current-theme` → resolved theme path
        ├─→ register Vite virtual module `astro-blog:config` with serialized user config
        ├─→ injectRoute({ pattern: '/',                  entrypoint: <pkg>/routes/home.astro })
        ├─→ injectRoute({ pattern: '/blog/[...page]',    entrypoint: <pkg>/routes/list.astro })
        ├─→ injectRoute({ pattern: '/blog/[slug]',       entrypoint: <pkg>/routes/post.astro })
        ├─→ injectRoute({ pattern: '/tags/[tag]',        entrypoint: <pkg>/routes/tag.astro })
        ├─→ injectRoute({ pattern: '/rss.xml',           entrypoint: <pkg>/routes/rss.xml.ts })
        └─→ install @astrojs/sitemap (with `site` from user config)
```

Route entrypoints resolve to absolute file paths inside the integration package via `new URL('./routes/<file>', import.meta.url)` (the `<pkg>` shorthand above). This avoids depending on the package's `exports` map for route resolution and keeps the routes private implementation, not public API.

### 3.3 Build-time data flow for a single route (e.g., `/blog/<slug>`)

```
Astro build resolves /blog/[slug] → packages/astro-blog/src/routes/post.astro
                                            │
                                            ├─ import { Post } from 'astro-blog:current-theme'
                                            │       └─ Vite alias → src/themes/default/index.ts
                                            │           └─ re-exports Post.astro
                                            │
                                            ├─ import config from 'astro-blog:config'
                                            │       └─ virtual module returns { site, social, blog }
                                            │
                                            └─ import { getPostBySlug } from '../lib/posts'
                                                    └─ uses astro:content getCollection('blog')

                            Renders <Post post={post} site={config.site} />
                                            │
                                            ▼
                                  Default theme's Post.astro HTML
```

The route templates are static and never change between themes. Switching `theme: "default"` to `theme: "magazine"` (when such a theme exists) only changes which file `astro-blog:current-theme` resolves to.

## 4. Repository and package structure

```
astro-blog/                                  # repo root
├── pnpm-workspace.yaml
├── package.json                             # workspace root
├── tsconfig.json                            # shared base ts config
├── README.md
├── .github/
│   └── workflows/
│       └── ci.yml                           # build + test + example-site build
│
├── packages/
│   └── astro-blog/                          # the npm package
│       ├── package.json
│       ├── tsconfig.json
│       ├── README.md
│       └── src/
│           ├── index.ts                     # default export: integration factory
│           ├── options.ts                   # zod schema, types, defaults merge
│           ├── content.ts                   # exports blogSchema
│           ├── virtual.ts                   # generates `astro-blog:config` source
│           ├── lib/
│           │   ├── posts.ts                 # getAllPosts, paginate, filterDraft, getByTag, getBySlug
│           │   └── seo.ts                   # build SEO meta data
│           ├── components/
│           │   └── SEO.astro                # head meta component for themes
│           ├── routes/
│           │   ├── home.astro               # → theme.Home
│           │   ├── list.astro               # → theme.List (paginated)
│           │   ├── post.astro               # → theme.Post
│           │   ├── tag.astro                # → theme.List (filtered by tag)
│           │   └── rss.xml.ts               # @astrojs/rss endpoint
│           └── themes/
│               └── default/
│                   ├── index.ts             # exports { Home, List, Post } and theme metadata
│                   ├── Home.astro
│                   ├── List.astro
│                   ├── Post.astro
│                   └── styles.css           # imported by the theme's components
│
└── examples/
    └── blog-site/                           # dev test bed and example for users
        ├── package.json                     # workspace:* dependency on astro-blog
        ├── astro.config.mjs
        ├── tsconfig.json
        └── src/
            ├── env.d.ts
            └── content/
                ├── config.ts                # demonstrates use of blogSchema
                └── blog/
                    ├── hello-world.md
                    ├── another-post.md
                    └── draft-post.md        # draft: true to demo draft handling
```

### Module responsibilities (one job each)

| Module | Responsibility | Depends on |
|---|---|---|
| `index.ts` | Integration factory; registers hooks; orchestrates other modules | options, virtual |
| `options.ts` | zod schema, TS types, defaults merge | zod |
| `content.ts` | Exports `blogSchema` for users to use in `content/config.ts` | astro:content (zod) |
| `virtual.ts` | Serializes user config into `astro-blog:config` virtual-module source | — |
| `lib/posts.ts` | Content queries: getAll, getBySlug, getByTag, paginate, filterDraft | astro:content |
| `lib/seo.ts` | SEO meta-tag data assembly | — |
| `components/SEO.astro` | Renders head meta from `lib/seo` data and current config | lib/seo, virtual config |
| `routes/*.astro` | Combine lib + current theme + config to render a page | astro-blog:current-theme, lib/posts, virtual config |
| `themes/default/*.astro` | Visual rendering for the default theme | (no internal deps) |

Dependency direction: `routes` and `themes` are leaves and do not depend on each other; `lib` and `virtual.ts` form the middle layer; `index.ts` composes everything. Swapping themes means swapping leaves; the logic layer never changes.

## 5. User-facing interface

### 5.1 Install

```bash
pnpm add astro-blog
```

(Sitemap and RSS dependencies — `@astrojs/sitemap`, `@astrojs/rss` — are declared as direct dependencies of `astro-blog`, so users install them transitively.)

### 5.2 `astro.config.mjs`

```js
import { defineConfig } from "astro/config";
import blog from "astro-blog";

export default defineConfig({
  site: "https://example.com",
  integrations: [
    blog({
      theme: "default",
      site: {
        title: "Kyan's Blog",
        description: "Notes on building things",
        author: "Kyan",
        language: "zh-CN",
        url: "https://example.com",
      },
      social: {
        github: "https://github.com/kyan",
        twitter: "https://twitter.com/kyan",
        email: "kun.yan@icloud.com",
      },
      blog: {
        postsPerPage: 10,
        contentDir: "src/content/blog",
      },
    }),
  ],
});
```

All fields except `site.title` and `site.url` have sensible defaults; the integration validates the merged config and fails fast on missing required fields.

### 5.3 `src/content/config.ts`

Required one-line setup. The integration does not auto-create this file — it is owned by the user's project.

```ts
import { defineCollection } from "astro:content";
import { blogSchema } from "astro-blog/content";

export const collections = {
  blog: defineCollection({ type: "content", schema: blogSchema }),
};
```

Users wanting custom frontmatter fields use `blogSchema.extend({ ... })`.

### 5.4 Content files: `src/content/blog/<slug>.md`

```md
---
title: "Hello World"
description: "First post"
pubDate: 2026-04-29
tags: ["intro", "meta"]
draft: false
cover: "./cover.jpg"
coverAlt: "Cover image alt text"
---

Markdown body...
```

### 5.5 `blogSchema` field definitions

```ts
{
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  cover: image().optional(),       // Astro image()
  coverAlt: z.string().optional(),
}
```

### 5.6 Routes the user gets for free

| Path | Content |
|---|---|
| `/` | Home page — theme decides between latest-posts list, hero + recent, or other |
| `/blog` | Post list (page 1) |
| `/blog/2`, `/blog/3`, ... | List pagination |
| `/blog/<slug>` | Single post |
| `/tags/<tag>` | Tag archive |
| `/rss.xml` | RSS feed |
| `/sitemap-index.xml` | Provided by `@astrojs/sitemap` |

### 5.7 Theme contract

A theme is a directory in `packages/astro-blog/src/themes/<name>/` with at minimum:

```
themes/<name>/
  index.ts           # export { Home, List, Post } (and optionally a `meta` object)
  Home.astro         # props: { posts, site, social }
  List.astro         # props: { posts, page, site, social, tag? }
  Post.astro         # props: { post, site, social }
  styles.css         # optional; imported by the theme's components if used
```

Theme authors are free to break their components into smaller partials (`Header.astro`, `PostCard.astro`, etc.) — those are private to the theme. Themes import their own CSS; the integration does not auto-inject styles.

#### Component prop contracts

- `Home.astro`: `{ posts: CollectionEntry<'blog'>[] /* latest postsPerPage, draft excluded */, site, social }`
- `List.astro`: `{ posts: CollectionEntry<'blog'>[], page: { current: number, total: number, hasPrev: boolean, hasNext: boolean }, site, social, tag?: string }` (`tag` set when rendered for `/tags/[tag]`)
- `Post.astro`: `{ post: CollectionEntry<'blog'>, site, social }`. The route template renders `<Content />` from `post.render()` as a slot or as a child; exact convention finalized in implementation.

## 6. Error handling

| Situation | Behavior |
|---|---|
| User options fail zod validation | `astro:config:setup` throws with formatted zod errors; Astro startup fails |
| `theme: "xxx"` directory does not exist | Throw with the list of available themes (v1: `["default"]`) and how to fix |
| Theme directory exists but `index.ts` is missing required exports | Throw naming the missing export(s) |
| User did not define a `blog` collection in `content/config.ts` | Astro's own collection resolution surfaces the error; README documents this required step |
| A markdown file's frontmatter fails `blogSchema` validation | Astro content collections' standard error path; integration adds nothing |

## 7. Edge cases

- **Empty blog (no posts):** `/blog` renders `List.astro` with `{ posts: [], page: { total: 0, ... } }`. Theme decides empty-state UI. `/rss.xml` emits an empty channel.
- **Tag with only drafts:** at build time, the tag has zero published posts, so no `/tags/<tag>` route is generated.
- **Future `pubDate`:** treated as published normally (no scheduled-publishing logic).
- **Duplicate slugs:** Astro content collections error directly.
- **Cover images:** typed as Astro `image()`, so optimization runs automatically.
- **Pagination out of range** (e.g., `/blog/999`): `getStaticPaths` only emits real page numbers, so out-of-range yields a normal 404.
- **Drafts:** included in `astro dev` (`import.meta.env.DEV`), excluded from `astro build` everywhere — list, single page, tag pages, RSS, sitemap.

## 8. Testing strategy

| Layer | Tool | Subject |
|---|---|---|
| Unit | Vitest, in `packages/astro-blog/` | `options.ts` schema, `lib/posts.ts` pure helpers (paginate, filterDraft, getByTag), `lib/seo.ts` |
| Integration | `examples/blog-site/` build | `astro build` succeeds; output `dist/` contains expected paths (`/blog/index.html`, `/blog/hello-world/index.html`, `/tags/<tag>/index.html`, `/rss.xml`); a small Node script asserts these in CI |
| Manual | Browser on `examples/blog-site` dev server | Visual confirmation of default theme |

No browser end-to-end tests in v1. No coverage threshold.

## 9. CI

A single GitHub Actions workflow runs on PRs:

```
pnpm install --frozen-lockfile
pnpm -r build              # builds every package
pnpm -r test               # runs Vitest in every package
pnpm --filter blog-site exec astro build
node scripts/verify-example-build.mjs   # asserts expected files in examples/blog-site/dist
```

PR is red if any step fails. The example-site build acts as the integration smoke test.

## 10. Open questions deferred to implementation

- **npm package name availability.** First-choice name is `astro-blog`. If taken, fall back to a scoped name. Resolved at first publish, not now.
- **`Post.astro` rendering convention.** Whether the post body is passed as a slot (`<slot />` from `<Content />`) or via a `Content` prop. Both work; pick whichever reads cleaner during implementation.
- **Exact set of `<SEO />` meta tags.** OG, Twitter card, canonical URL, JSON-LD. Final list is a small detail; cover the common ones and iterate.

These are not architectural choices — they are local decisions made while writing code.
