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
