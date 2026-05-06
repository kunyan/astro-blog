# CLAUDE.md

## Project Overview

**astro-blog** is an Astro integration that turns any Astro project into a themed blog. It provides page seeding, content schemas, theme seeding, dark mode, and i18n support out of the box.

## Repository Structure

pnpm monorepo (`pnpm-workspace.yaml`):

- `packages/astro-blog/` — the integration package (npm: `@kunyan/astro-blog`)
- `examples/blog-site/` — example Astro site using the integration

```
packages/astro-blog/
  src/
    index.ts          # Integration factory (astro:config:setup hook)
    options.ts        # Zod config schema + validation
    content.ts        # Content collection schemas (postSchema, pageSchema)
    virtual.ts        # Virtual module codegen (astro-blog:config)
    components/SEO.astro
    lib/posts.ts      # Post helpers (getPublishedPosts, paginate)
    lib/pages.ts      # Page helpers
    pages/            # Seed pages (copied to user's src/pages/ on first build)
    themes/default/   # Seed theme (copied to user's src/themes/ on first build)
  __tests__/          # Vitest unit tests
```

## Key Concepts

- **Theme seeding**: On first build, the integration copies `src/themes/<name>/` from the package to the user's project. Users then own and customize the theme files.
- **Page seeding**: On first build, the integration copies route pages to `src/pages/` in the user's project, following Astro's standard file-based routing convention. Users own and can customize the route files.
- **Virtual modules**: `astro-blog:config` provides resolved options at runtime; `astro-blog:current-theme` resolves to the user's theme barrel export.
- **Tailwind CSS v4**: Required peer dependency. Auto-configured via `@tailwindcss/vite` plugin in the integration hook using `createRequire` (not dynamic import).
- **Dark mode**: Class-based (`.dark` on `<html>`), toggle + system preference, no-flash via `<script is:inline>`.
- **i18n**: Theme components check `config.site.language.startsWith("zh")` for Chinese labels.

## Commands

```bash
# Install dependencies
pnpm install

# Run unit tests (packages/astro-blog)
pnpm --filter @kunyan/astro-blog test

# Run a single test file
pnpm --filter @kunyan/astro-blog test -- __tests__/options.test.ts

# Build example site
pnpm --filter blog-site build

# Dev server for example site
pnpm --filter blog-site dev

# Verify example build (build + check output)
pnpm verify:example
```

## Development Workflow

1. Edit source in `packages/astro-blog/src/`
2. Run `pnpm --filter @kunyan/astro-blog test` to verify unit tests
3. Sync theme files to example: `cp packages/astro-blog/src/themes/default/*.astro examples/blog-site/src/themes/default/`
4. Run `pnpm --filter blog-site build` to verify full build
5. All 33 tests should pass; build should produce 131+ pages

## Testing

- Framework: Vitest (`__tests__/*.test.ts`)
- Tests cover: options validation, post helpers, virtual module codegen, SEO component
- No mocking of the database or Astro runtime — tests validate pure functions only
- Run all: `pnpm --filter @kunyan/astro-blog test`

## Architecture Notes

- The integration factory (`src/index.ts`) returns `[blogIntegration, sitemap()]`
- Routes use Astro's standard file-based routing in `src/pages/`, seeded on first build
- Theme components receive data as props from route files (e.g., `<Post post={post} />`)
- `post.render()` returns `{ Content, headings }` — headings used for TOC sidebar
- Content collections: `posts` (with cover image support) and `pages` (static pages)
- Package exports: `.` (integration), `./content` (schemas), `./components/SEO`, `./lib/posts`, `./lib/pages`
