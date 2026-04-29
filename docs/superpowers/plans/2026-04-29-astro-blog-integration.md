# astro-blog Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `astro-blog` Astro integration: a single `pnpm add astro-blog` + a few config lines that turns an empty Astro project into a functioning, themed blog backed by Astro content collections.

**Architecture:** Monorepo (pnpm workspace) with `packages/astro-blog/` (the integration) and `examples/blog-site/` (dev test bed and build smoke test). Routes are injected via `injectRoute`; the active theme is dispatched at build time through a Vite virtual-module alias `astro-blog:current-theme`; user config is exposed to route templates and the `<SEO />` component through a generated virtual module `astro-blog:config`. v1 ships only the `default` theme; additional themes drop in under `packages/astro-blog/src/themes/<name>/` later.

**Tech Stack:** Astro 5.x (peer dep), TypeScript 5.x, zod 3.x, Vitest 2.x, pnpm 9+, `@astrojs/rss`, `@astrojs/sitemap`. Node ≥ 20.

**Spec:** `docs/superpowers/specs/2026-04-29-astro-blog-integration-design.md`

---

## File map (locked in before tasks start)

```
astro-blog/
├── pnpm-workspace.yaml                                — workspace config (Task 1)
├── package.json                                       — workspace root (Task 1)
├── tsconfig.json                                      — shared base TS config (Task 1)
├── .gitignore                                         — node_modules, dist, etc. (Task 1)
├── .npmrc                                             — pnpm settings (Task 1)
├── packages/
│   └── astro-blog/
│       ├── package.json                               — Task 2
│       ├── tsconfig.json                              — Task 2
│       ├── vitest.config.ts                           — Task 2
│       └── src/
│           ├── index.ts                               — integration factory (Tasks 10, 22)
│           ├── options.ts                             — zod schema, validateOptions (Task 4)
│           ├── content.ts                             — postSchema export (Task 5)
│           ├── virtual.ts                             — config virtual-module source (Task 9)
│           ├── lib/
│           │   ├── posts.ts                           — pure helpers + content access (Tasks 6, 7)
│           │   └── seo.ts                             — SEO meta builder (Task 8)
│           ├── components/
│           │   └── SEO.astro                          — Task 11
│           ├── routes/
│           │   ├── home.astro                         — Task 16
│           │   ├── list.astro                         — Task 17 (pattern /posts)
│           │   ├── list-page.astro                    — Task 18 (pattern /posts/page/[page])
│           │   ├── post.astro                         — Task 19
│           │   ├── tag.astro                          — Task 20
│           │   └── rss.xml.ts                         — Task 21
│           ├── themes/
│           │   └── default/
│           │       ├── index.ts                       — Task 15
│           │       ├── Home.astro                     — Task 12
│           │       ├── List.astro                     — Task 13
│           │       ├── Post.astro                     — Task 14
│           │       └── styles.css                     — Task 12
│           └── __tests__/                             — colocated test files
│               ├── options.test.ts                    — Task 4
│               ├── posts.test.ts                      — Tasks 6, 7
│               ├── seo.test.ts                        — Task 8
│               └── virtual.test.ts                    — Task 9
├── examples/
│   └── blog-site/
│       ├── package.json                               — Task 3
│       ├── astro.config.mjs                           — Tasks 3, 23
│       ├── tsconfig.json                              — Task 3
│       └── src/
│           ├── env.d.ts                               — Task 3
│           └── content/
│               ├── config.ts                          — Task 23
│               └── posts/
│                   ├── hello-world.md                 — Task 24
│                   ├── second-post.md                 — Task 24
│                   ├── third-post.md                  — Task 24
│                   └── draft-post.md                  — Task 24
├── scripts/
│   └── verify-example-build.mjs                       — Task 25
├── .github/
│   └── workflows/
│       └── ci.yml                                     — Task 27
└── README.md                                          — Task 29
```

**Module responsibilities** (from spec §4):

| File | Job |
|---|---|
| `options.ts` | zod schema, `AstroBlogOptions` (input), `ResolvedOptions` (output), `validateOptions()` |
| `content.ts` | exports `postSchema` factory (takes `SchemaContext`, returns zod object) |
| `virtual.ts` | `generateConfigSource(config)` returns the JS module source for `astro-blog:config` |
| `lib/posts.ts` | pure helpers: `paginate`, `filterDrafts`, `filterByTag`, `collectTags`, `sortByDateDesc`; content wrappers: `getPublishedPosts`, `getPostBySlug`, `getPostsByTag`, `getAllTags` |
| `lib/seo.ts` | `buildSEO({ title, description, url, image?, type })` returns array of meta-tag descriptors |
| `components/SEO.astro` | reads `astro-blog:config`, calls `buildSEO`, renders `<title>` + meta tags |
| `routes/*.astro` + `routes/rss.xml.ts` | pull data via `lib/posts`, render via `astro-blog:current-theme` components, with config from `astro-blog:config` |
| `themes/default/*.astro` | concrete UI for the default theme |
| `index.ts` | integration factory: validate options, register Vite plugin (virtual modules + theme alias), inject routes, addIntegration sitemap |

---

## Task 1: Initialize monorepo skeleton

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `.npmrc`

- [ ] **Step 1: Write `pnpm-workspace.yaml`**

```yaml
packages:
  - "packages/*"
  - "examples/*"
```

- [ ] **Step 2: Write root `package.json`**

```json
{
  "name": "astro-blog-monorepo",
  "private": true,
  "version": "0.0.0",
  "packageManager": "pnpm@9.12.0",
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "dev:example": "pnpm --filter blog-site dev",
    "build:example": "pnpm --filter blog-site build",
    "verify:example": "pnpm build:example && node scripts/verify-example-build.mjs"
  },
  "devDependencies": {
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 3: Write root `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": false,
    "forceConsistentCasingInFileNames": true,
    "noUncheckedIndexedAccess": true
  }
}
```

- [ ] **Step 4: Write `.gitignore`**

```
node_modules
dist
.astro
*.tsbuildinfo
.DS_Store
.vscode
.idea
```

- [ ] **Step 5: Write `.npmrc`**

```
auto-install-peers=true
strict-peer-dependencies=false
```

- [ ] **Step 6: Verify pnpm initializes the workspace**

Run: `pnpm install`
Expected: Completes without error. Creates `node_modules/.pnpm/` and `pnpm-lock.yaml`.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-workspace.yaml tsconfig.json .gitignore .npmrc pnpm-lock.yaml
git commit -m "chore: initialize pnpm monorepo skeleton"
```

---

## Task 2: Scaffold the `astro-blog` package

**Files:**
- Create: `packages/astro-blog/package.json`
- Create: `packages/astro-blog/tsconfig.json`
- Create: `packages/astro-blog/vitest.config.ts`
- Create: `packages/astro-blog/src/index.ts` (placeholder)
- Create: `packages/astro-blog/__tests__/.gitkeep` (so directory exists)

- [ ] **Step 1: Write `packages/astro-blog/package.json`**

```json
{
  "name": "astro-blog",
  "version": "0.0.0",
  "type": "module",
  "description": "An Astro integration that turns any Astro project into a multi-theme-capable blog.",
  "license": "MIT",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./content": "./src/content.ts"
  },
  "files": [
    "src",
    "README.md"
  ],
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "build": "tsc --noEmit"
  },
  "dependencies": {
    "@astrojs/rss": "^4.0.0",
    "@astrojs/sitemap": "^3.2.0",
    "zod": "^3.23.0"
  },
  "peerDependencies": {
    "astro": "^4.0.0 || ^5.0.0"
  },
  "devDependencies": {
    "astro": "^5.0.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Write `packages/astro-blog/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "noEmit": true,
    "types": ["astro/client"]
  },
  "include": ["src/**/*", "__tests__/**/*"]
}
```

- [ ] **Step 3: Write `packages/astro-blog/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Write placeholder `packages/astro-blog/src/index.ts`**

```ts
export default function blog() {
  throw new Error("[astro-blog] Not implemented yet");
}
```

- [ ] **Step 5: Touch `packages/astro-blog/__tests__/.gitkeep`** to ensure the dir is committed

- [ ] **Step 6: Install package deps**

Run: `pnpm install`
Expected: Resolves `astro`, `zod`, `vitest`, `@astrojs/rss`, `@astrojs/sitemap` into the workspace.

- [ ] **Step 7: Verify type check passes**

Run: `pnpm --filter astro-blog build`
Expected: `tsc --noEmit` exits 0.

- [ ] **Step 8: Verify vitest runs (zero tests)**

Run: `pnpm --filter astro-blog test`
Expected: Vitest reports "No test files found" or similar — exits 0 (configure `passWithNoTests` if needed). If it exits non-zero, add `passWithNoTests: true` to `vitest.config.ts`.

- [ ] **Step 9: Commit**

```bash
git add packages/astro-blog package.json pnpm-lock.yaml
git commit -m "chore: scaffold astro-blog package with vitest"
```

---

## Task 3: Scaffold the example site

**Files:**
- Create: `examples/blog-site/package.json`
- Create: `examples/blog-site/astro.config.mjs` (minimal)
- Create: `examples/blog-site/tsconfig.json`
- Create: `examples/blog-site/src/env.d.ts`
- Create: `examples/blog-site/src/pages/.gitkeep`

- [ ] **Step 1: Write `examples/blog-site/package.json`**

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
  }
}
```

- [ ] **Step 2: Write minimal `examples/blog-site/astro.config.mjs`** (will be expanded in Task 23)

```js
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://example.com",
});
```

- [ ] **Step 3: Write `examples/blog-site/tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 4: Write `examples/blog-site/src/env.d.ts`**

```ts
/// <reference path="../.astro/types.d.ts" />
```

- [ ] **Step 5: Add a placeholder page so Astro doesn't error**

Create `examples/blog-site/src/pages/index.astro`:

```astro
---
---
<html>
  <head>
    <title>Placeholder</title>
  </head>
  <body>
    <p>Placeholder until astro-blog injects routes.</p>
  </body>
</html>
```

- [ ] **Step 6: Install + verify the example site builds**

Run: `pnpm install`
Run: `pnpm --filter blog-site exec astro build`
Expected: Build succeeds; `examples/blog-site/dist/index.html` exists.

- [ ] **Step 7: Commit**

```bash
git add examples/blog-site package.json pnpm-lock.yaml
git commit -m "chore: scaffold example blog-site"
```

---

## Task 4: Implement options validation (TDD)

**Files:**
- Create: `packages/astro-blog/__tests__/options.test.ts`
- Create: `packages/astro-blog/src/options.ts`

- [ ] **Step 1: Write the failing tests** at `packages/astro-blog/__tests__/options.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { validateOptions } from "../src/options";

describe("validateOptions", () => {
  it("applies defaults when only required fields are given", () => {
    const result = validateOptions({
      site: { title: "Test", url: "https://example.com" },
    });
    expect(result.theme).toBe("default");
    expect(result.posts.perPage).toBe(10);
    expect(result.posts.contentDir).toBe("src/content/posts");
    expect(result.site.language).toBe("en");
    expect(result.site.description).toBe("");
    expect(result.site.author).toBe("");
    expect(result.social).toEqual({});
  });

  it("throws when site.title is missing", () => {
    expect(() =>
      // @ts-expect-error: deliberately missing title
      validateOptions({ site: { url: "https://example.com" } })
    ).toThrow(/site\.title/);
  });

  it("throws when site.url is not a URL", () => {
    expect(() =>
      validateOptions({ site: { title: "Test", url: "not-a-url" } })
    ).toThrow();
  });

  it("preserves user overrides over defaults", () => {
    const result = validateOptions({
      site: { title: "T", url: "https://example.com", language: "zh-CN" },
      theme: "magazine",
      posts: { perPage: 5 },
    });
    expect(result.theme).toBe("magazine");
    expect(result.posts.perPage).toBe(5);
    expect(result.posts.contentDir).toBe("src/content/posts");
    expect(result.site.language).toBe("zh-CN");
  });

  it("validates social URLs and email when provided", () => {
    expect(() =>
      validateOptions({
        site: { title: "T", url: "https://example.com" },
        social: { github: "not-a-url" },
      })
    ).toThrow();
    expect(() =>
      validateOptions({
        site: { title: "T", url: "https://example.com" },
        social: { email: "not-an-email" },
      })
    ).toThrow();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

Run: `pnpm --filter astro-blog test`
Expected: FAIL — `Cannot find module '../src/options'`.

- [ ] **Step 3: Implement `packages/astro-blog/src/options.ts`**

```ts
import { z } from "zod";

const siteSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  author: z.string().default(""),
  language: z.string().default("en"),
  url: z.string().url(),
});

const socialSchema = z
  .object({
    github: z.string().url().optional(),
    twitter: z.string().url().optional(),
    email: z.string().email().optional(),
  })
  .default({});

const postsSchema = z
  .object({
    perPage: z.number().int().positive().default(10),
    contentDir: z.string().default("src/content/posts"),
  })
  .default({});

export const optionsSchema = z.object({
  theme: z.string().default("default"),
  site: siteSchema,
  social: socialSchema,
  posts: postsSchema,
});

export type AstroBlogOptions = z.input<typeof optionsSchema>;
export type ResolvedOptions = z.output<typeof optionsSchema>;

export function validateOptions(input: AstroBlogOptions): ResolvedOptions {
  const result = optionsSchema.safeParse(input);
  if (!result.success) {
    const detail = result.error.errors
      .map((e) => `  - ${e.path.join(".") || "(root)"}: ${e.message}`)
      .join("\n");
    throw new Error(`[astro-blog] Invalid options:\n${detail}`);
  }
  return result.data;
}
```

- [ ] **Step 4: Run tests — all pass**

Run: `pnpm --filter astro-blog test`
Expected: PASS — 5/5.

- [ ] **Step 5: Type check**

Run: `pnpm --filter astro-blog build`
Expected: tsc exits 0.

- [ ] **Step 6: Commit**

```bash
git add packages/astro-blog/src/options.ts packages/astro-blog/__tests__/options.test.ts
git commit -m "feat(astro-blog): add options schema and validateOptions"
```

---

## Task 5: Implement content schema (`postSchema`)

**Files:**
- Create: `packages/astro-blog/src/content.ts`

There is no unit test here — `image()` requires Astro's runtime SchemaContext. The schema is exercised end-to-end via the example site build (Task 26).

- [ ] **Step 1: Implement `packages/astro-blog/src/content.ts`**

```ts
import { z, type SchemaContext } from "astro:content";

export const postSchema = ({ image }: SchemaContext) =>
  z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    cover: image().optional(),
    coverAlt: z.string().optional(),
  });

export type PostFrontmatter = z.infer<ReturnType<typeof postSchema>>;
```

- [ ] **Step 2: Type check passes**

Run: `pnpm --filter astro-blog build`
Expected: tsc exits 0. (`astro:content` is provided as ambient via `astro/client` in `tsconfig.types`.)

- [ ] **Step 3: Commit**

```bash
git add packages/astro-blog/src/content.ts
git commit -m "feat(astro-blog): export postSchema for user content/config.ts"
```

---

## Task 6: Implement posts library — pure helpers (TDD)

**Files:**
- Create: `packages/astro-blog/src/lib/posts.ts` (pure helpers only — content access wrappers come in Task 7)
- Create: `packages/astro-blog/__tests__/posts.test.ts`

- [ ] **Step 1: Write failing tests** at `packages/astro-blog/__tests__/posts.test.ts`

```ts
import { describe, it, expect } from "vitest";
import {
  paginate,
  filterDrafts,
  filterByTag,
  collectTags,
  sortByDateDesc,
} from "../src/lib/posts";

const post = (overrides: Record<string, unknown> = {}) =>
  ({
    slug: "x",
    data: {
      title: "x",
      description: "x",
      pubDate: new Date("2026-01-01"),
      tags: [],
      draft: false,
      ...overrides,
    },
  }) as never;

describe("paginate", () => {
  it("returns page 1 with first N items", () => {
    const r = paginate([1, 2, 3, 4, 5], 1, 2);
    expect(r.items).toEqual([1, 2]);
    expect(r.page.current).toBe(1);
    expect(r.page.total).toBe(3);
    expect(r.page.hasPrev).toBe(false);
    expect(r.page.hasNext).toBe(true);
  });

  it("returns last partial page", () => {
    const r = paginate([1, 2, 3, 4, 5], 3, 2);
    expect(r.items).toEqual([5]);
    expect(r.page.current).toBe(3);
    expect(r.page.total).toBe(3);
    expect(r.page.hasPrev).toBe(true);
    expect(r.page.hasNext).toBe(false);
  });

  it("empty list yields total=1, current=1", () => {
    const r = paginate([], 1, 10);
    expect(r.items).toEqual([]);
    expect(r.page.total).toBe(1);
    expect(r.page.current).toBe(1);
    expect(r.page.hasPrev).toBe(false);
    expect(r.page.hasNext).toBe(false);
  });

  it("clamps current to [1, total]", () => {
    const r1 = paginate([1, 2, 3], 99, 10);
    expect(r1.page.current).toBe(1);
    const r2 = paginate([1, 2, 3], -5, 10);
    expect(r2.page.current).toBe(1);
  });
});

describe("filterDrafts", () => {
  const posts = [
    post({ draft: false, title: "a" }),
    post({ draft: true, title: "b" }),
    post({ draft: false, title: "c" }),
  ];

  it("removes drafts when isDev is false", () => {
    const r = filterDrafts(posts, false);
    expect(r.length).toBe(2);
    expect(r.every((p) => !p.data.draft)).toBe(true);
  });

  it("keeps drafts when isDev is true", () => {
    expect(filterDrafts(posts, true).length).toBe(3);
  });
});

describe("filterByTag", () => {
  const posts = [
    post({ tags: ["foo", "bar"] }),
    post({ tags: ["baz"] }),
    post({ tags: ["foo"] }),
  ];

  it("returns only posts containing the tag", () => {
    expect(filterByTag(posts, "foo").length).toBe(2);
    expect(filterByTag(posts, "baz").length).toBe(1);
    expect(filterByTag(posts, "missing").length).toBe(0);
  });
});

describe("collectTags", () => {
  it("returns unique tags sorted alphabetically", () => {
    const posts = [post({ tags: ["b", "a"] }), post({ tags: ["c", "a"] })];
    expect(collectTags(posts)).toEqual(["a", "b", "c"]);
  });

  it("returns empty array when no posts", () => {
    expect(collectTags([])).toEqual([]);
  });
});

describe("sortByDateDesc", () => {
  it("sorts most-recent first", () => {
    const posts = [
      post({ pubDate: new Date("2026-01-01") }),
      post({ pubDate: new Date("2026-03-01") }),
      post({ pubDate: new Date("2026-02-01") }),
    ];
    const sorted = sortByDateDesc(posts);
    expect(sorted[0]!.data.pubDate.getMonth()).toBe(2);
    expect(sorted[1]!.data.pubDate.getMonth()).toBe(1);
    expect(sorted[2]!.data.pubDate.getMonth()).toBe(0);
  });

  it("does not mutate input", () => {
    const posts = [
      post({ pubDate: new Date("2026-01-01"), title: "a" }),
      post({ pubDate: new Date("2026-02-01"), title: "b" }),
    ];
    const original = [...posts];
    sortByDateDesc(posts);
    expect(posts).toEqual(original);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

Run: `pnpm --filter astro-blog test`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `packages/astro-blog/src/lib/posts.ts`** (pure helpers only — content wrappers added in Task 7)

```ts
import type { CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;

export interface PageInfo {
  current: number;
  total: number;
  hasPrev: boolean;
  hasNext: boolean;
}

export interface Paginated<T> {
  items: T[];
  page: PageInfo;
}

export function paginate<T>(items: T[], page: number, perPage: number): Paginated<T> {
  const total = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.max(1, Math.min(Math.floor(page) || 1, total));
  const start = (current - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    page: {
      current,
      total,
      hasPrev: current > 1,
      hasNext: current < total,
    },
  };
}

export function filterDrafts(posts: Post[], isDev: boolean): Post[] {
  return isDev ? posts : posts.filter((p) => !p.data.draft);
}

export function filterByTag(posts: Post[], tag: string): Post[] {
  return posts.filter((p) => p.data.tags.includes(tag));
}

export function collectTags(posts: Post[]): string[] {
  const set = new Set<string>();
  for (const p of posts) for (const t of p.data.tags) set.add(t);
  return [...set].sort();
}

export function sortByDateDesc(posts: Post[]): Post[] {
  return [...posts].sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
}
```

- [ ] **Step 4: Run tests — all pass**

Run: `pnpm --filter astro-blog test`
Expected: PASS — all paginate/filter/collect/sort tests green.

- [ ] **Step 5: Type check**

Run: `pnpm --filter astro-blog build`
Expected: tsc exits 0.

- [ ] **Step 6: Commit**

```bash
git add packages/astro-blog/src/lib/posts.ts packages/astro-blog/__tests__/posts.test.ts
git commit -m "feat(astro-blog): pure helpers for paginate/filter/sort posts"
```

---

## Task 7: Posts library — content access wrappers

**Files:**
- Modify: `packages/astro-blog/src/lib/posts.ts` (append four functions)
- Modify: `packages/astro-blog/__tests__/posts.test.ts` (add tests with mocked `astro:content`)

- [ ] **Step 1: Append failing tests** at the bottom of `packages/astro-blog/__tests__/posts.test.ts`

```ts
import { vi, beforeEach } from "vitest";

vi.mock("astro:content", () => ({
  getCollection: vi.fn(),
}));

import { getCollection } from "astro:content";
import {
  getPublishedPosts,
  getPostBySlug,
  getPostsByTag,
  getAllTags,
} from "../src/lib/posts";

const sample = [
  post({ slug: "old", pubDate: new Date("2026-01-01"), tags: ["a"] }),
  post({ slug: "draft", pubDate: new Date("2026-02-01"), draft: true, tags: ["a", "b"] }),
  post({ slug: "new", pubDate: new Date("2026-03-01"), tags: ["b"] }),
];

describe("getPublishedPosts", () => {
  beforeEach(() => {
    vi.mocked(getCollection).mockReset();
  });

  it("excludes drafts and sorts most-recent first when isDev=false", async () => {
    vi.mocked(getCollection).mockResolvedValue(sample);
    const result = await getPublishedPosts({ isDev: false });
    expect(result.map((p) => p.slug)).toEqual(["new", "old"]);
  });

  it("includes drafts when isDev=true, still sorted desc", async () => {
    vi.mocked(getCollection).mockResolvedValue(sample);
    const result = await getPublishedPosts({ isDev: true });
    expect(result.map((p) => p.slug)).toEqual(["new", "draft", "old"]);
  });
});

describe("getPostBySlug", () => {
  beforeEach(() => {
    vi.mocked(getCollection).mockReset();
    vi.mocked(getCollection).mockResolvedValue(sample);
  });

  it("returns the matching published post", async () => {
    const r = await getPostBySlug("new", { isDev: false });
    expect(r?.slug).toBe("new");
  });

  it("does not return a draft when isDev=false", async () => {
    const r = await getPostBySlug("draft", { isDev: false });
    expect(r).toBeUndefined();
  });

  it("returns a draft when isDev=true", async () => {
    const r = await getPostBySlug("draft", { isDev: true });
    expect(r?.slug).toBe("draft");
  });
});

describe("getPostsByTag", () => {
  beforeEach(() => {
    vi.mocked(getCollection).mockReset();
    vi.mocked(getCollection).mockResolvedValue(sample);
  });

  it("returns only published posts with that tag, sorted desc", async () => {
    const r = await getPostsByTag("b", { isDev: false });
    expect(r.map((p) => p.slug)).toEqual(["new"]);
  });
});

describe("getAllTags", () => {
  beforeEach(() => {
    vi.mocked(getCollection).mockReset();
    vi.mocked(getCollection).mockResolvedValue(sample);
  });

  it("returns unique sorted tags from published posts only", async () => {
    const r = await getAllTags({ isDev: false });
    expect(r).toEqual(["a", "b"]);
  });
});
```

- [ ] **Step 2: Run tests — confirm new ones fail**

Run: `pnpm --filter astro-blog test`
Expected: FAIL — `getPublishedPosts is not exported` (or similar).

- [ ] **Step 3: Append to `packages/astro-blog/src/lib/posts.ts`**

```ts
import { getCollection } from "astro:content";

export interface ContentOptions {
  isDev: boolean;
}

export async function getPublishedPosts(opts: ContentOptions): Promise<Post[]> {
  const all = await getCollection("posts");
  return sortByDateDesc(filterDrafts(all, opts.isDev));
}

export async function getPostBySlug(
  slug: string,
  opts: ContentOptions
): Promise<Post | undefined> {
  const all = await getPublishedPosts(opts);
  return all.find((p) => p.slug === slug);
}

export async function getPostsByTag(
  tag: string,
  opts: ContentOptions
): Promise<Post[]> {
  const all = await getPublishedPosts(opts);
  return filterByTag(all, tag);
}

export async function getAllTags(opts: ContentOptions): Promise<string[]> {
  const all = await getPublishedPosts(opts);
  return collectTags(all);
}
```

- [ ] **Step 4: Run tests — all pass**

Run: `pnpm --filter astro-blog test`
Expected: PASS — all original + new tests green.

- [ ] **Step 5: Commit**

```bash
git add packages/astro-blog/src/lib/posts.ts packages/astro-blog/__tests__/posts.test.ts
git commit -m "feat(astro-blog): add content access wrappers for posts collection"
```

---

## Task 8: Implement SEO meta builder (TDD)

**Files:**
- Create: `packages/astro-blog/__tests__/seo.test.ts`
- Create: `packages/astro-blog/src/lib/seo.ts`

- [ ] **Step 1: Write failing tests** at `packages/astro-blog/__tests__/seo.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { buildSEO } from "../src/lib/seo";

describe("buildSEO", () => {
  it("returns title and description in meta", () => {
    const meta = buildSEO({
      title: "Hello",
      description: "World",
      url: "https://example.com/posts/hello",
      siteTitle: "Site",
      type: "article",
    });
    const find = (name: string) => meta.find((m) => m.name === name || m.property === name);
    expect(find("description")?.content).toBe("World");
    expect(find("og:title")?.content).toBe("Hello");
    expect(find("og:description")?.content).toBe("World");
    expect(find("og:type")?.content).toBe("article");
    expect(find("og:url")?.content).toBe("https://example.com/posts/hello");
    expect(find("og:site_name")?.content).toBe("Site");
    expect(find("twitter:card")?.content).toBe("summary_large_image");
  });

  it("uses 'website' as default og:type when not specified", () => {
    const meta = buildSEO({
      title: "T",
      description: "D",
      url: "https://example.com",
      siteTitle: "S",
    });
    const ogType = meta.find((m) => m.property === "og:type");
    expect(ogType?.content).toBe("website");
  });

  it("includes og:image when image is provided", () => {
    const meta = buildSEO({
      title: "T",
      description: "D",
      url: "https://example.com",
      siteTitle: "S",
      image: "https://example.com/cover.jpg",
    });
    const img = meta.find((m) => m.property === "og:image");
    expect(img?.content).toBe("https://example.com/cover.jpg");
  });

  it("omits og:image when image is not provided", () => {
    const meta = buildSEO({
      title: "T",
      description: "D",
      url: "https://example.com",
      siteTitle: "S",
    });
    const img = meta.find((m) => m.property === "og:image");
    expect(img).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests — confirm they fail**

Run: `pnpm --filter astro-blog test`
Expected: FAIL — `buildSEO` not found.

- [ ] **Step 3: Implement `packages/astro-blog/src/lib/seo.ts`**

```ts
export interface SEOInput {
  title: string;
  description: string;
  url: string;
  siteTitle: string;
  image?: string;
  type?: "website" | "article";
}

export interface MetaTag {
  name?: string;
  property?: string;
  content: string;
}

export function buildSEO(input: SEOInput): MetaTag[] {
  const tags: MetaTag[] = [
    { name: "description", content: input.description },
    { property: "og:title", content: input.title },
    { property: "og:description", content: input.description },
    { property: "og:type", content: input.type ?? "website" },
    { property: "og:url", content: input.url },
    { property: "og:site_name", content: input.siteTitle },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: input.title },
    { name: "twitter:description", content: input.description },
  ];
  if (input.image) {
    tags.push({ property: "og:image", content: input.image });
    tags.push({ name: "twitter:image", content: input.image });
  }
  return tags;
}
```

- [ ] **Step 4: Run tests — all pass**

Run: `pnpm --filter astro-blog test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/astro-blog/src/lib/seo.ts packages/astro-blog/__tests__/seo.test.ts
git commit -m "feat(astro-blog): SEO meta-tag builder"
```

---

## Task 9: Implement virtual config source (TDD)

**Files:**
- Create: `packages/astro-blog/__tests__/virtual.test.ts`
- Create: `packages/astro-blog/src/virtual.ts`

- [ ] **Step 1: Write failing tests** at `packages/astro-blog/__tests__/virtual.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { generateConfigSource } from "../src/virtual";

const cfg = {
  theme: "default",
  site: {
    title: "T",
    description: "D",
    author: "A",
    language: "en",
    url: "https://example.com",
  },
  social: { github: "https://github.com/x" },
  posts: { perPage: 10, contentDir: "src/content/posts" },
};

describe("generateConfigSource", () => {
  it("returns valid JS that exports the config as default", async () => {
    const source = generateConfigSource(cfg as never);
    expect(source).toContain("export default");
    expect(source).toContain('"theme"');

    // Round-trip: import the data via dynamic eval (inline data URL)
    const dataUrl = "data:text/javascript;base64," + Buffer.from(source).toString("base64");
    const mod = await import(dataUrl);
    expect(mod.default).toEqual(cfg);
  });

  it("does not throw on values containing quotes/newlines", () => {
    const tricky = { ...cfg, site: { ...cfg.site, title: 'Title with "quotes"\nand newline' } };
    const source = generateConfigSource(tricky as never);
    expect(source).toContain("export default");
    // Ensure JSON.stringify escaped properly
    expect(() => JSON.parse(JSON.stringify(tricky))).not.toThrow();
  });
});
```

- [ ] **Step 2: Run tests — confirm they fail**

Run: `pnpm --filter astro-blog test`
Expected: FAIL — `generateConfigSource` not exported.

- [ ] **Step 3: Implement `packages/astro-blog/src/virtual.ts`**

```ts
import type { ResolvedOptions } from "./options.js";

export function generateConfigSource(config: ResolvedOptions): string {
  return `export default ${JSON.stringify(config)};\n`;
}
```

- [ ] **Step 4: Run tests — all pass**

Run: `pnpm --filter astro-blog test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/astro-blog/src/virtual.ts packages/astro-blog/__tests__/virtual.test.ts
git commit -m "feat(astro-blog): generateConfigSource for astro-blog:config virtual module"
```

---

## Task 10: Implement integration factory (validation + virtual modules + theme alias)

This task wires the core integration but does **not** inject routes yet — that comes in Task 22. After this task, you can already see the integration validate config and register virtual modules. Routes still 404.

**Files:**
- Modify: `packages/astro-blog/src/index.ts` (replace placeholder)

- [ ] **Step 1: Replace `packages/astro-blog/src/index.ts`** with:

```ts
import type { AstroIntegration } from "astro";
import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { validateOptions, type AstroBlogOptions } from "./options.js";
import { generateConfigSource } from "./virtual.js";

const VIRTUAL_CONFIG_ID = "astro-blog:config";
const RESOLVED_VIRTUAL_CONFIG_ID = "\0astro-blog:config";
const VIRTUAL_THEME_ID = "astro-blog:current-theme";

export type { AstroBlogOptions, ResolvedOptions } from "./options.js";

export default function blog(options: AstroBlogOptions): AstroIntegration {
  const config = validateOptions(options);

  return {
    name: "astro-blog",
    hooks: {
      "astro:config:setup": ({ updateConfig }) => {
        const themesDirUrl = new URL("./themes/", import.meta.url);
        const themesDir = fileURLToPath(themesDirUrl);
        const themeIndex = fileURLToPath(
          new URL(`./themes/${config.theme}/index.ts`, import.meta.url)
        );

        if (!existsSync(themeIndex)) {
          const available = readdirSync(themesDir, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name);
          throw new Error(
            `[astro-blog] Theme "${config.theme}" not found in ${themesDir}.\n` +
              `Available themes: ${available.length ? available.join(", ") : "(none)"}.`
          );
        }

        const configSource = generateConfigSource(config);

        updateConfig({
          vite: {
            plugins: [
              {
                name: "astro-blog:virtual",
                enforce: "pre",
                resolveId(id) {
                  if (id === VIRTUAL_CONFIG_ID) return RESOLVED_VIRTUAL_CONFIG_ID;
                  if (id === VIRTUAL_THEME_ID) return themeIndex;
                  return null;
                },
                load(id) {
                  if (id === RESOLVED_VIRTUAL_CONFIG_ID) return configSource;
                  return null;
                },
              },
            ],
          },
        });
      },
    },
  };
}
```

- [ ] **Step 2: Type check passes**

Run: `pnpm --filter astro-blog build`
Expected: tsc exits 0.

- [ ] **Step 3: Verify tests still pass**

Run: `pnpm --filter astro-blog test`
Expected: PASS — pure-logic tests still green.

- [ ] **Step 4: Commit**

```bash
git add packages/astro-blog/src/index.ts
git commit -m "feat(astro-blog): integration factory with virtual modules and theme alias"
```

---

## Task 11: Implement `<SEO />` component

**Files:**
- Create: `packages/astro-blog/src/components/SEO.astro`

- [ ] **Step 1: Implement `packages/astro-blog/src/components/SEO.astro`**

```astro
---
import config from "astro-blog:config";
import { buildSEO, type SEOInput } from "../lib/seo";

interface Props {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
}

const { title, description, image, type } = Astro.props;
const url = new URL(Astro.url.pathname, config.site.url).href;

const input: SEOInput = {
  title: title ?? config.site.title,
  description: description ?? config.site.description,
  siteTitle: config.site.title,
  url,
  image,
  type,
};

const meta = buildSEO(input);
---
<title>{input.title}</title>
{meta.map((m) => (
  m.name
    ? <meta name={m.name} content={m.content} />
    : <meta property={m.property} content={m.content} />
))}
<link rel="canonical" href={url} />
```

- [ ] **Step 2: No isolated test possible without Astro runtime; skip and rely on example-site build**

- [ ] **Step 3: Commit**

```bash
git add packages/astro-blog/src/components/SEO.astro
git commit -m "feat(astro-blog): SEO component reading from astro-blog:config"
```

---

## Task 12: Default theme — styles + Home component

**Files:**
- Create: `packages/astro-blog/src/themes/default/styles.css`
- Create: `packages/astro-blog/src/themes/default/Home.astro`

- [ ] **Step 1: Implement `packages/astro-blog/src/themes/default/styles.css`**

```css
:root {
  --blog-fg: #111;
  --blog-bg: #fff;
  --blog-muted: #666;
  --blog-link: #0366d6;
  --blog-border: #e1e4e8;
  --blog-max-width: 720px;
  --blog-font: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  background: var(--blog-bg);
  color: var(--blog-fg);
  font-family: var(--blog-font);
  line-height: 1.6;
}
.blog-shell {
  max-width: var(--blog-max-width);
  margin: 0 auto;
  padding: 2rem 1rem;
}
.blog-header { margin-bottom: 2rem; }
.blog-header h1 a { color: var(--blog-fg); text-decoration: none; }
.blog-footer { margin-top: 4rem; padding-top: 1rem; border-top: 1px solid var(--blog-border); color: var(--blog-muted); font-size: 0.9rem; }
a { color: var(--blog-link); }
.post-card { padding: 1rem 0; border-bottom: 1px solid var(--blog-border); }
.post-card h2 { margin: 0 0 0.25rem; font-size: 1.25rem; }
.post-card .meta { color: var(--blog-muted); font-size: 0.875rem; }
.post-card p { margin: 0.5rem 0 0; }
.pagination { display: flex; gap: 1rem; margin: 2rem 0; }
.tag-cloud a { margin-right: 0.5rem; }
.post-body img { max-width: 100%; height: auto; }
```

- [ ] **Step 2: Implement `packages/astro-blog/src/themes/default/Home.astro`**

```astro
---
import "./styles.css";
import config from "astro-blog:config";
import SEO from "../../components/SEO.astro";
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
  <body>
    <div class="blog-shell">
      <header class="blog-header">
        <h1><a href="/">{config.site.title}</a></h1>
        {config.site.description && <p>{config.site.description}</p>}
        <nav><a href="/posts">All posts</a> · <a href="/rss.xml">RSS</a></nav>
      </header>
      <main>
        {posts.length === 0 && <p>No posts yet.</p>}
        {posts.map((p) => (
          <article class="post-card">
            <h2><a href={`/posts/${p.slug}`}>{p.data.title}</a></h2>
            <p class="meta">{p.data.pubDate.toISOString().slice(0, 10)}</p>
            <p>{p.data.description}</p>
          </article>
        ))}
      </main>
      <footer class="blog-footer">
        © {new Date().getFullYear()} {config.site.author || config.site.title}
      </footer>
    </div>
  </body>
</html>
```

- [ ] **Step 3: Commit**

```bash
git add packages/astro-blog/src/themes/default/styles.css packages/astro-blog/src/themes/default/Home.astro
git commit -m "feat(astro-blog): default theme styles + Home component"
```

---

## Task 13: Default theme — List component

**Files:**
- Create: `packages/astro-blog/src/themes/default/List.astro`

- [ ] **Step 1: Implement `packages/astro-blog/src/themes/default/List.astro`**

```astro
---
import "./styles.css";
import config from "astro-blog:config";
import SEO from "../../components/SEO.astro";
import type { CollectionEntry } from "astro:content";
import type { PageInfo } from "../../lib/posts";

interface Props {
  posts: CollectionEntry<"posts">[];
  page: PageInfo;
  tag?: string;
}

const { posts, page, tag } = Astro.props;
const heading = tag ? `Posts tagged "${tag}"` : "All posts";
const baseUrl = tag ? `/tags/${tag}` : "/posts";

function pageUrl(n: number): string {
  if (tag) return baseUrl;            // tag pages are not paginated in v1
  return n === 1 ? "/posts" : `/posts/page/${n}`;
}
---
<html lang={config.site.language}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <SEO title={`${heading} · ${config.site.title}`} />
  </head>
  <body>
    <div class="blog-shell">
      <header class="blog-header">
        <h1><a href="/">{config.site.title}</a></h1>
        <nav><a href="/posts">All posts</a> · <a href="/rss.xml">RSS</a></nav>
      </header>
      <main>
        <h2>{heading}</h2>
        {posts.length === 0 && <p>No posts yet.</p>}
        {posts.map((p) => (
          <article class="post-card">
            <h3><a href={`/posts/${p.slug}`}>{p.data.title}</a></h3>
            <p class="meta">{p.data.pubDate.toISOString().slice(0, 10)}</p>
            <p>{p.data.description}</p>
          </article>
        ))}
        {!tag && page.total > 1 && (
          <nav class="pagination">
            {page.hasPrev && <a href={pageUrl(page.current - 1)}>← Newer</a>}
            <span>Page {page.current} / {page.total}</span>
            {page.hasNext && <a href={pageUrl(page.current + 1)}>Older →</a>}
          </nav>
        )}
      </main>
      <footer class="blog-footer">
        © {new Date().getFullYear()} {config.site.author || config.site.title}
      </footer>
    </div>
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add packages/astro-blog/src/themes/default/List.astro
git commit -m "feat(astro-blog): default theme List component"
```

---

## Task 14: Default theme — Post component

**Files:**
- Create: `packages/astro-blog/src/themes/default/Post.astro`

- [ ] **Step 1: Implement `packages/astro-blog/src/themes/default/Post.astro`**

```astro
---
import "./styles.css";
import config from "astro-blog:config";
import SEO from "../../components/SEO.astro";
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
  <body>
    <div class="blog-shell">
      <header class="blog-header">
        <h1><a href="/">{config.site.title}</a></h1>
        <nav><a href="/posts">All posts</a></nav>
      </header>
      <main>
        <article>
          <h1>{post.data.title}</h1>
          <p class="meta">
            {post.data.pubDate.toISOString().slice(0, 10)}
            {post.data.updatedDate && (
              <> · updated {post.data.updatedDate.toISOString().slice(0, 10)}</>
            )}
          </p>
          {post.data.tags.length > 0 && (
            <p class="tag-cloud">
              {post.data.tags.map((t) => <a href={`/tags/${t}`}>#{t}</a>)}
            </p>
          )}
          <div class="post-body">
            <Content />
          </div>
        </article>
      </main>
      <footer class="blog-footer">
        © {new Date().getFullYear()} {config.site.author || config.site.title}
      </footer>
    </div>
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add packages/astro-blog/src/themes/default/Post.astro
git commit -m "feat(astro-blog): default theme Post component"
```

---

## Task 15: Default theme — index.ts (theme barrel)

**Files:**
- Create: `packages/astro-blog/src/themes/default/index.ts`

- [ ] **Step 1: Implement `packages/astro-blog/src/themes/default/index.ts`**

```ts
export { default as Home } from "./Home.astro";
export { default as List } from "./List.astro";
export { default as Post } from "./Post.astro";

export const meta = {
  name: "default",
  description: "The default astro-blog theme.",
};
```

- [ ] **Step 2: Type check**

Run: `pnpm --filter astro-blog build`
Expected: tsc exits 0. (`.astro` imports may need `astro/client` types — already configured.)

- [ ] **Step 3: Commit**

```bash
git add packages/astro-blog/src/themes/default/index.ts
git commit -m "feat(astro-blog): default theme index.ts barrel"
```

---

## Task 16: Route — `/` (home)

**Files:**
- Create: `packages/astro-blog/src/routes/home.astro`

- [ ] **Step 1: Implement `packages/astro-blog/src/routes/home.astro`**

```astro
---
import { Home } from "astro-blog:current-theme";
import config from "astro-blog:config";
import { getPublishedPosts } from "../lib/posts";

const isDev = import.meta.env.DEV ?? false;
const all = await getPublishedPosts({ isDev });
const posts = all.slice(0, config.posts.perPage);
---
<Home posts={posts} />
```

- [ ] **Step 2: Commit**

```bash
git add packages/astro-blog/src/routes/home.astro
git commit -m "feat(astro-blog): home route delegates to theme.Home"
```

---

## Task 17: Route — `/posts` (list, page 1)

**Files:**
- Create: `packages/astro-blog/src/routes/list.astro`

- [ ] **Step 1: Implement `packages/astro-blog/src/routes/list.astro`**

```astro
---
import { List } from "astro-blog:current-theme";
import config from "astro-blog:config";
import { getPublishedPosts, paginate } from "../lib/posts";

const isDev = import.meta.env.DEV ?? false;
const all = await getPublishedPosts({ isDev });
const { items, page } = paginate(all, 1, config.posts.perPage);
---
<List posts={items} page={page} />
```

- [ ] **Step 2: Commit**

```bash
git add packages/astro-blog/src/routes/list.astro
git commit -m "feat(astro-blog): /posts list route (page 1)"
```

---

## Task 18: Route — `/posts/page/[page]` (list pagination)

**Files:**
- Create: `packages/astro-blog/src/routes/list-page.astro`

- [ ] **Step 1: Implement `packages/astro-blog/src/routes/list-page.astro`**

```astro
---
import type { GetStaticPaths } from "astro";
import { List } from "astro-blog:current-theme";
import config from "astro-blog:config";
import { getPublishedPosts, paginate } from "../lib/posts";

export const getStaticPaths: GetStaticPaths = async () => {
  const isDev = import.meta.env.DEV ?? false;
  const all = await getPublishedPosts({ isDev });
  const total = Math.max(1, Math.ceil(all.length / config.posts.perPage));
  // Page 1 is served by /posts; emit pages 2..total here.
  const paths = [];
  for (let n = 2; n <= total; n++) {
    paths.push({ params: { page: String(n) }, props: { pageNum: n } });
  }
  return paths;
};

const { pageNum } = Astro.props as { pageNum: number };
const isDev = import.meta.env.DEV ?? false;
const all = await getPublishedPosts({ isDev });
const { items, page } = paginate(all, pageNum, config.posts.perPage);
---
<List posts={items} page={page} />
```

- [ ] **Step 2: Commit**

```bash
git add packages/astro-blog/src/routes/list-page.astro
git commit -m "feat(astro-blog): /posts/page/[page] pagination route"
```

---

## Task 19: Route — `/posts/[slug]` (single post)

**Files:**
- Create: `packages/astro-blog/src/routes/post.astro`

- [ ] **Step 1: Implement `packages/astro-blog/src/routes/post.astro`**

```astro
---
import type { GetStaticPaths } from "astro";
import { Post } from "astro-blog:current-theme";
import { getPublishedPosts } from "../lib/posts";

export const getStaticPaths: GetStaticPaths = async () => {
  const isDev = import.meta.env.DEV ?? false;
  const posts = await getPublishedPosts({ isDev });
  return posts.map((post) => ({ params: { slug: post.slug }, props: { post } }));
};

const { post } = Astro.props;
---
<Post post={post} />
```

- [ ] **Step 2: Commit**

```bash
git add packages/astro-blog/src/routes/post.astro
git commit -m "feat(astro-blog): /posts/[slug] post detail route"
```

---

## Task 20: Route — `/tags/[tag]` (tag archive)

**Files:**
- Create: `packages/astro-blog/src/routes/tag.astro`

- [ ] **Step 1: Implement `packages/astro-blog/src/routes/tag.astro`**

```astro
---
import type { GetStaticPaths } from "astro";
import { List } from "astro-blog:current-theme";
import { getPublishedPosts, getAllTags, filterByTag } from "../lib/posts";

export const getStaticPaths: GetStaticPaths = async () => {
  const isDev = import.meta.env.DEV ?? false;
  const tags = await getAllTags({ isDev });
  return tags.map((tag) => ({ params: { tag }, props: { tag } }));
};

const { tag } = Astro.props as { tag: string };
const isDev = import.meta.env.DEV ?? false;
const all = await getPublishedPosts({ isDev });
const items = filterByTag(all, tag);
const page = { current: 1, total: 1, hasPrev: false, hasNext: false };
---
<List posts={items} page={page} tag={tag} />
```

- [ ] **Step 2: Commit**

```bash
git add packages/astro-blog/src/routes/tag.astro
git commit -m "feat(astro-blog): /tags/[tag] tag archive route"
```

---

## Task 21: Route — `/rss.xml`

**Files:**
- Create: `packages/astro-blog/src/routes/rss.xml.ts`

- [ ] **Step 1: Implement `packages/astro-blog/src/routes/rss.xml.ts`**

```ts
import rss from "@astrojs/rss";
import config from "astro-blog:config";
import { getPublishedPosts } from "../lib/posts";

export async function GET(context: { site?: URL }) {
  const isDev = import.meta.env.DEV ?? false;
  const posts = await getPublishedPosts({ isDev });
  return rss({
    title: config.site.title,
    description: config.site.description,
    site: context.site?.toString() ?? config.site.url,
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.pubDate,
      description: p.data.description,
      link: `/posts/${p.slug}/`,
    })),
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/astro-blog/src/routes/rss.xml.ts
git commit -m "feat(astro-blog): /rss.xml endpoint"
```

---

## Task 22: Wire route injection + sitemap into integration factory

**Files:**
- Modify: `packages/astro-blog/src/index.ts` — add `injectRoute` calls and `addIntegration(sitemap())` inside the `astro:config:setup` hook.

- [ ] **Step 1: Modify `packages/astro-blog/src/index.ts`**

Replace the current file content with:

```ts
import type { AstroIntegration } from "astro";
import sitemap from "@astrojs/sitemap";
import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { validateOptions, type AstroBlogOptions } from "./options.js";
import { generateConfigSource } from "./virtual.js";

const VIRTUAL_CONFIG_ID = "astro-blog:config";
const RESOLVED_VIRTUAL_CONFIG_ID = "\0astro-blog:config";
const VIRTUAL_THEME_ID = "astro-blog:current-theme";

export type { AstroBlogOptions, ResolvedOptions } from "./options.js";

function routeEntrypoint(name: string): string {
  return fileURLToPath(new URL(`./routes/${name}`, import.meta.url));
}

export default function blog(options: AstroBlogOptions): AstroIntegration {
  const config = validateOptions(options);

  return {
    name: "astro-blog",
    hooks: {
      "astro:config:setup": ({ updateConfig, injectRoute, addIntegration }) => {
        const themesDir = fileURLToPath(new URL("./themes/", import.meta.url));
        const themeIndex = fileURLToPath(
          new URL(`./themes/${config.theme}/index.ts`, import.meta.url)
        );

        if (!existsSync(themeIndex)) {
          const available = readdirSync(themesDir, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name);
          throw new Error(
            `[astro-blog] Theme "${config.theme}" not found in ${themesDir}.\n` +
              `Available themes: ${available.length ? available.join(", ") : "(none)"}.`
          );
        }

        const configSource = generateConfigSource(config);

        updateConfig({
          vite: {
            plugins: [
              {
                name: "astro-blog:virtual",
                enforce: "pre",
                resolveId(id) {
                  if (id === VIRTUAL_CONFIG_ID) return RESOLVED_VIRTUAL_CONFIG_ID;
                  if (id === VIRTUAL_THEME_ID) return themeIndex;
                  return null;
                },
                load(id) {
                  if (id === RESOLVED_VIRTUAL_CONFIG_ID) return configSource;
                  return null;
                },
              },
            ],
          },
        });

        injectRoute({ pattern: "/", entrypoint: routeEntrypoint("home.astro") });
        injectRoute({ pattern: "/posts", entrypoint: routeEntrypoint("list.astro") });
        injectRoute({
          pattern: "/posts/page/[page]",
          entrypoint: routeEntrypoint("list-page.astro"),
        });
        injectRoute({
          pattern: "/posts/[slug]",
          entrypoint: routeEntrypoint("post.astro"),
        });
        injectRoute({
          pattern: "/tags/[tag]",
          entrypoint: routeEntrypoint("tag.astro"),
        });
        injectRoute({
          pattern: "/rss.xml",
          entrypoint: routeEntrypoint("rss.xml.ts"),
        });

        addIntegration(sitemap());
      },
    },
  };
}
```

- [ ] **Step 2: Type check**

Run: `pnpm --filter astro-blog build`
Expected: tsc exits 0.

- [ ] **Step 3: Tests still pass**

Run: `pnpm --filter astro-blog test`
Expected: PASS — pure-logic tests untouched.

- [ ] **Step 4: Commit**

```bash
git add packages/astro-blog/src/index.ts
git commit -m "feat(astro-blog): inject routes and add sitemap integration"
```

---

## Task 23: Wire example site to use `astro-blog`

**Files:**
- Modify: `examples/blog-site/astro.config.mjs`
- Create: `examples/blog-site/src/content/config.ts`
- Delete: `examples/blog-site/src/pages/index.astro` (no longer needed; `astro-blog` injects `/`)

- [ ] **Step 1: Replace `examples/blog-site/astro.config.mjs`** with:

```js
import { defineConfig } from "astro/config";
import blog from "astro-blog";

export default defineConfig({
  site: "https://example.com",
  integrations: [
    blog({
      theme: "default",
      site: {
        title: "Example Blog",
        description: "A demo of astro-blog.",
        author: "Kyan",
        language: "en",
        url: "https://example.com",
      },
      social: {
        github: "https://github.com/kyan",
      },
      posts: {
        perPage: 2,                           // small to exercise pagination
        contentDir: "src/content/posts",
      },
    }),
  ],
});
```

- [ ] **Step 2: Create `examples/blog-site/src/content/config.ts`**

```ts
import { defineCollection } from "astro:content";
import { postSchema } from "astro-blog/content";

export const collections = {
  posts: defineCollection({ type: "content", schema: postSchema }),
};
```

- [ ] **Step 3: Delete the placeholder page**

Run: `rm examples/blog-site/src/pages/index.astro`

- [ ] **Step 4: Commit (build verification happens in Task 26 once content exists)**

```bash
git add examples/blog-site/astro.config.mjs examples/blog-site/src/content/config.ts
git rm examples/blog-site/src/pages/index.astro
git commit -m "chore(example): wire blog-site to astro-blog integration"
```

---

## Task 24: Add sample posts to example site

**Files:**
- Create: `examples/blog-site/src/content/posts/hello-world.md`
- Create: `examples/blog-site/src/content/posts/second-post.md`
- Create: `examples/blog-site/src/content/posts/third-post.md`
- Create: `examples/blog-site/src/content/posts/draft-post.md`

- [ ] **Step 1: Create `hello-world.md`**

```md
---
title: "Hello World"
description: "First post on the example blog."
pubDate: 2026-04-01
tags: ["intro", "meta"]
draft: false
---

This is the first post. It demonstrates the `default` theme rendering of a single post.

## A subheading

Some body text.
```

- [ ] **Step 2: Create `second-post.md`**

```md
---
title: "A Second Post"
description: "More content to exercise pagination."
pubDate: 2026-04-10
tags: ["meta"]
draft: false
---

Second post body text.
```

- [ ] **Step 3: Create `third-post.md`**

```md
---
title: "A Third Post"
description: "Third post pushes us to a second page (perPage=2)."
pubDate: 2026-04-20
tags: ["intro"]
draft: false
---

Third post body text.
```

- [ ] **Step 4: Create `draft-post.md`**

```md
---
title: "A Draft Post"
description: "Should not appear in production builds."
pubDate: 2026-04-25
tags: ["draft"]
draft: true
---

Draft body — only visible in `astro dev`.
```

- [ ] **Step 5: Commit**

```bash
git add examples/blog-site/src/content/posts/
git commit -m "chore(example): add sample posts including a draft"
```

---

## Task 25: Build verification script

**Files:**
- Create: `scripts/verify-example-build.mjs`

- [ ] **Step 1: Implement `scripts/verify-example-build.mjs`**

```js
#!/usr/bin/env node
import { existsSync } from "node:fs";
import { join } from "node:path";

const dist = join(process.cwd(), "examples/blog-site/dist");

const required = [
  "index.html",                              // /
  "posts/index.html",                        // /posts (page 1)
  "posts/page/2/index.html",                 // /posts/page/2 (perPage=2, 3 published posts → 2 pages)
  "posts/hello-world/index.html",            // /posts/hello-world
  "posts/second-post/index.html",
  "posts/third-post/index.html",
  "tags/intro/index.html",                   // /tags/intro
  "tags/meta/index.html",
  "rss.xml",
  "sitemap-index.xml",
];

const forbidden = [
  "posts/draft-post/index.html",             // draft must NOT be built in production
  "tags/draft/index.html",                   // tag with only drafts must not exist
];

let failed = 0;

for (const path of required) {
  const full = join(dist, path);
  if (!existsSync(full)) {
    console.error(`MISSING: ${path}`);
    failed++;
  } else {
    console.log(`OK:      ${path}`);
  }
}

for (const path of forbidden) {
  const full = join(dist, path);
  if (existsSync(full)) {
    console.error(`SHOULD NOT EXIST: ${path}`);
    failed++;
  } else {
    console.log(`OK:      (absent) ${path}`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} verification check(s) failed.`);
  process.exit(1);
}
console.log("\nAll example-build checks passed.");
```

- [ ] **Step 2: Commit**

```bash
git add scripts/verify-example-build.mjs
git commit -m "chore: example-build verification script"
```

---

## Task 26: First end-to-end build of the example site

This is the integration test. If anything in Tasks 10–25 is wrong, it surfaces here.

- [ ] **Step 1: Build the example site**

Run: `pnpm --filter blog-site build`
Expected: `astro build` succeeds; `examples/blog-site/dist/` is populated.

If failures, common issues:
- Theme alias mis-resolves → check Task 22's plugin `resolveId` returns absolute paths.
- `astro:content` schema mismatch → check Task 5 + sample posts' frontmatter.
- Route conflict → confirm `injectRoute` patterns match Task 22 exactly.

- [ ] **Step 2: Run verification**

Run: `node scripts/verify-example-build.mjs`
Expected: All `OK:` lines, no `MISSING` / `SHOULD NOT EXIST`. Exit 0.

- [ ] **Step 3: Spot-check produced HTML**

Run: `head -20 examples/blog-site/dist/posts/hello-world/index.html`
Expected: Contains `<title>Hello World · Example Blog</title>`, `<meta property="og:type" content="article">`, link to `/tags/intro`.

Run: `head -20 examples/blog-site/dist/rss.xml`
Expected: Valid XML, contains `<title>Example Blog</title>` and three `<item>` entries (no draft).

- [ ] **Step 4: (Optional) Run `astro dev` and confirm draft visibility**

Run: `pnpm --filter blog-site dev` in one terminal.
Open http://localhost:4321/posts/draft-post — expected: page renders (drafts visible in dev).

Stop the dev server.

- [ ] **Step 5: Commit any tweaks made while debugging**

```bash
# only if there were fix-up edits
git add <fixed files>
git commit -m "fix(astro-blog): <short description>"
```

---

## Task 27: CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Implement `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm -r build

      - name: Unit tests
        run: pnpm -r test

      - name: Build example site
        run: pnpm --filter blog-site build

      - name: Verify example build output
        run: node scripts/verify-example-build.mjs
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "chore(ci): build, test, and verify example site on PRs"
```

---

## Task 28: Package README

**Files:**
- Create: `packages/astro-blog/README.md`

- [ ] **Step 1: Implement `packages/astro-blog/README.md`**

```markdown
# astro-blog

An Astro integration that turns any Astro project into a multi-theme-capable blog.

## Install

```bash
pnpm add astro-blog
```

## Configure

`astro.config.mjs`:

```js
import { defineConfig } from "astro/config";
import blog from "astro-blog";

export default defineConfig({
  site: "https://example.com",
  integrations: [
    blog({
      theme: "default",
      site: {
        title: "My Blog",
        description: "Notes on building things.",
        author: "Me",
        language: "en",
        url: "https://example.com",
      },
      social: {
        github: "https://github.com/me",
      },
      posts: {
        perPage: 10,
        contentDir: "src/content/posts",
      },
    }),
  ],
});
```

`src/content/config.ts`:

```ts
import { defineCollection } from "astro:content";
import { postSchema } from "astro-blog/content";

export const collections = {
  posts: defineCollection({ type: "content", schema: postSchema }),
};
```

## Write posts

Drop markdown files into `src/content/posts/<slug>.md`:

```md
---
title: "Hello World"
description: "First post"
pubDate: 2026-04-29
tags: ["intro"]
draft: false
---

Body.
```

## Routes you get

| Path | Content |
|---|---|
| `/` | Home |
| `/posts` | Post list (page 1) |
| `/posts/page/2`, ... | Pagination |
| `/posts/<slug>` | Single post |
| `/tags/<tag>` | Tag archive |
| `/rss.xml` | RSS feed |
| `/sitemap-index.xml` | Sitemap (via `@astrojs/sitemap`) |

## Drafts

Posts with `draft: true` are visible in `astro dev` and excluded from `astro build`.

## Themes

v1 ships only the `default` theme. Additional themes can be contributed under `packages/astro-blog/src/themes/<name>/` and selected with `theme: "<name>"`.

## License

MIT
```

- [ ] **Step 2: Commit**

```bash
git add packages/astro-blog/README.md
git commit -m "docs(astro-blog): package README"
```

---

## Task 29: Repo root README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Implement `README.md`**

```markdown
# astro-blog monorepo

This repository contains the `astro-blog` Astro integration and an example site.

## Layout

- `packages/astro-blog/` — the integration (npm package)
- `examples/blog-site/` — example consumer site, used for development and as a CI smoke test

## Develop

```bash
pnpm install
pnpm dev:example          # run the example site against the local integration
pnpm test                 # run all unit tests
pnpm verify:example       # build the example site and check expected output
```

## Add a theme

1. Create `packages/astro-blog/src/themes/<name>/` with `Home.astro`, `List.astro`, `Post.astro`, `index.ts` (and optionally `styles.css`).
2. Reference it in `examples/blog-site/astro.config.mjs` via `theme: "<name>"`.
3. Verify with `pnpm verify:example`.

## License

MIT
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: monorepo README"
```

---

## Self-review (run after writing every task above)

**1. Spec coverage check** — every spec section has at least one task:

| Spec section | Tasks |
|---|---|
| §2 In scope: Astro integration package | Tasks 2, 10, 22 |
| §2 In scope: One bundled `default` theme | Tasks 12–15 |
| §2 In scope: Build-time theme selection | Task 22 (theme alias resolves at build time) |
| §2 In scope: Configurable site metadata | Task 4 (zod schema), Task 23 (consumed) |
| §2 In scope: Auto-injected routes | Tasks 16–22 |
| §2 In scope: `@astrojs/sitemap` automatic | Task 22 (`addIntegration(sitemap())`) |
| §2 In scope: `postSchema` export | Task 5, Task 23 |
| §2 In scope: Draft support (dev visible, build excluded) | Task 7 (`isDev` parameter), Tasks 16–21 (use `import.meta.env.DEV`) |
| §2 In scope: `<SEO />` component | Task 11 |
| §2 In scope: Pagination | Tasks 6, 17, 18 |
| §2 In scope: Tag archive | Task 20 |
| §2 In scope: Monorepo + example site | Tasks 1, 3, 23, 24 |
| §2 In scope: Vitest unit tests | Tasks 4, 6, 7, 8, 9 |
| §2 In scope: CI workflow | Task 27 |
| §3.1 Vite virtual module aliases | Task 10, Task 22 |
| §3.2 Lifecycle order | Task 22 |
| §3.3 Build-time data flow | Tasks 16–21 (route templates compose theme + lib + config) |
| §4 Repository layout | Tasks 1–3, 24 |
| §4 Module responsibilities | One module per task in Tasks 4–11, 12–15, 16–22 |
| §5 User interface (config, content/config.ts, frontmatter) | Tasks 4, 5, 23 |
| §5.6 Routes table | Tasks 16–21 |
| §5.7 Theme contract | Task 15 (Home/List/Post export) |
| §5.7 Component prop contracts | Tasks 16–20 (route templates pass exact props) |
| §6 Error handling — invalid options | Task 4 (`validateOptions` throws) |
| §6 Error handling — theme not found | Task 10 / Task 22 (`existsSync` check + helpful error) |
| §7 Edge cases — empty blog | Tasks 12, 13 (templates render empty state) |
| §7 Edge cases — tag with only drafts | Task 20 (`getAllTags` uses `getPublishedPosts` which filters drafts) |
| §7 Edge cases — drafts | Tasks 7, 16–21 |
| §7 Edge cases — pagination out of range | Task 18 (only emits real pages via `getStaticPaths`) |
| §8 Testing strategy | Tasks 4, 6, 7, 8, 9 (unit), Tasks 25, 26 (integration via example site) |
| §9 CI | Task 27 |

No spec section is unaddressed.

**2. Placeholder scan** — none. Every code block contains real code.

**3. Type consistency check:**

- `validateOptions(input: AstroBlogOptions): ResolvedOptions` — same type names used consistently in Tasks 4, 10, 22.
- `Post = CollectionEntry<"posts">` — same in Tasks 6, 7 and consumed in Tasks 12, 13, 14, 16, 17, 18, 19, 20.
- `PageInfo` shape `{ current, total, hasPrev, hasNext }` — defined Task 6, consumed Tasks 13, 17, 18, 20.
- `paginate(items, page, perPage)` — same signature in Tasks 6, 17, 18.
- `getPublishedPosts({ isDev })` — same single-options-arg signature in Tasks 7, 16, 17, 18, 19, 20, 21.
- Virtual module IDs `astro-blog:config` and `astro-blog:current-theme` — same in Tasks 10, 11, 22, and all routes (Tasks 16–21).

No drift detected.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-29-astro-blog-integration.md`. Two execution options:

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — execute tasks in this session using `executing-plans`, batch execution with checkpoints.

Which approach?
