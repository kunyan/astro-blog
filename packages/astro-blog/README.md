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
