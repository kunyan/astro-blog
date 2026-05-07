# i18n Support Design

## Goal

Replace hardcoded inline `isZh ? "中文" : "English"` ternaries across theme components with a structured, extensible translation system. Ship with English and Simplified Chinese; allow users to add any language by dropping a new file.

## Current State

- 4 theme components (Nav, Home, List, Post) each repeat `const isZh = (config.site.language ?? "").startsWith("zh")`
- ~15 user-facing strings, of which ~7 have Chinese translations; the rest are English-only
- Footer text "Powered by astro-blog" duplicated in 4 files
- Dates rendered as `toISOString().slice(0, 10)` regardless of locale
- `config.site.language` (default `"en"`) already exposed via virtual module

## Design

### File Structure

```
packages/astro-blog/src/themes/default/
  i18n/
    en.ts          # English translations (fallback language)
    zh-CN.ts       # Simplified Chinese translations
    index.ts       # Translation aggregation, createT(), createDateFormatter()
  Footer.astro     # New shared footer component
  Nav.astro        # Modified
  Home.astro       # Modified
  List.astro       # Modified
  Post.astro       # Modified
  Page.astro       # Modified (uses Footer.astro)
```

The `i18n/` directory is seeded alongside other theme files — no changes to the seeding mechanism required.

### Translation File Format

Each language file exports a flat key-value object. Keys use dot-separated namespaces.

```ts
// en.ts
export default {
  "nav.home": "Home",
  "nav.posts": "Posts",
  "posts.viewAll": "View all posts →",
  "posts.empty": "No posts yet.",
  "posts.all": "All posts",
  "posts.tagged": 'Posts tagged "{tag}"',
  "post.toc": "Table of Contents",
  "post.updated": "updated",
  "footer.poweredBy": "Powered by",
  "aria.toggleDark": "Toggle dark mode",
  "aria.toggleMenu": "Toggle menu",
  "aria.github": "GitHub",
  "aria.twitter": "Twitter",
  "aria.email": "Email",
} as const;
```

```ts
// zh-CN.ts
export default {
  "nav.home": "首页",
  "nav.posts": "文章",
  "posts.viewAll": "查看全部文章 →",
  "posts.empty": "暂无文章",
  "posts.all": "所有文章",
  "posts.tagged": "标签「{tag}」的文章",
  "post.toc": "目录",
  "post.updated": "更新于",
  "footer.poweredBy": "由",
  "aria.toggleDark": "切换暗色模式",
  "aria.toggleMenu": "切换菜单",
  "aria.github": "GitHub",
  "aria.twitter": "Twitter",
  "aria.email": "邮件",
} as const;
```

### Language Matching

The `createT()` function matches `config.site.language` against available translations using BCP 47 rules:

1. **Exact match**: `"zh-CN"` → `zh-CN.ts`
2. **Base language fallback**: `"zh-CN"` → `zh.ts` (if no `zh-CN.ts`)
3. **Default fallback**: → `en.ts`

File naming follows BCP 47 / HTML `lang` attribute conventions. `zh-CN` and `zh-TW` are distinct locales with separate files.

```ts
// i18n/index.ts
import en from "./en";
import zhCN from "./zh-CN";

type TranslationKey = keyof typeof en;
type TranslationDict = Record<TranslationKey, string>;
type Translations = Record<string, TranslationDict>;

const translations: Translations = { en, "zh-CN": zhCN };

export function createT(language: string) {
  const dict =
    translations[language] ??
    translations[language.split("-")[0]] ??
    translations.en;

  return function t(key: TranslationKey, params?: Record<string, string>): string {
    let value = dict[key] ?? translations.en[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replace(`{${k}}`, v);
      }
    }
    return value;
  };
}
```

### Date Formatting

Replace `toISOString().slice(0, 10)` with `Intl.DateTimeFormat`:

```ts
// i18n/index.ts
export function createDateFormatter(language: string) {
  return function formatDate(date: Date): string {
    return new Intl.DateTimeFormat(language, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };
}
```

Output by locale:
- `en` → "Jan 15, 2024"
- `zh-CN` → "2024年1月15日"
- `zh-TW` → "2024年1月15日"
- `ja` → "2024年1月15日"

### Component Changes

Each component replaces the `isZh` pattern with `createT` and `createDateFormatter`:

```astro
---
import { createT, createDateFormatter } from "./i18n";
const t = createT(config.site.language);
const formatDate = createDateFormatter(config.site.language);
---
```

#### Nav.astro
- Remove `isZh` and `labels` object
- Use `t("nav.home")`, `t("nav.posts")`
- Add `t("aria.toggleDark")`, `t("aria.toggleMenu")`, `t("aria.github")`, `t("aria.twitter")`, `t("aria.email")` for aria-labels

#### Home.astro
- Remove `isZh`
- `"No posts yet."` → `t("posts.empty")`
- `"View all posts →"` → `t("posts.viewAll")`
- Date: `toISOString().slice(0, 10)` → `formatDate(p.data.pubDate)`
- Footer → `<Footer config={config} />`

#### List.astro
- Remove `isZh`
- Heading: `t("posts.all")` or `t("posts.tagged", { tag })`
- Empty: `t("posts.empty")`
- Date: `toISOString().slice(0, 10)` → `formatDate(p.data.pubDate)`
- Footer → `<Footer config={config} />`

#### Post.astro
- Remove `isZh`
- `tocTitle` → `t("post.toc")`
- `"updated"` → `t("post.updated")`
- Date: `toISOString().slice(0, 10)` → `formatDate(...)` for both pubDate and updatedDate
- Footer → `<Footer config={config} />`

#### Page.astro
- Footer → `<Footer config={config} />`

#### Footer.astro (new)
- Extracted from the 4 components
- Uses `t("footer.poweredBy")`
- Receives `config` as prop

### Adding a New Language

User workflow:

1. Copy `en.ts` as e.g. `ja.ts`
2. Translate all values
3. In `i18n/index.ts`, add: `import ja from "./ja";` and add `ja` to the `translations` object
4. Set `language: "ja"` in `astro.config.mjs`

### Scope Boundaries

**In scope:**
- All user-facing UI strings in theme components
- All aria-labels
- Date formatting via Intl API
- Footer extraction to shared component

**Out of scope:**
- System/error messages in `index.ts` and `options.ts` (developer-facing, stay English)
- `options.ts` schema — `language` remains `z.string().default("en")`, no enum restriction
- `virtual.ts` — no changes needed
- Content collection schemas — no changes
- Multi-language content/routing (Astro's own i18n handles that)

### Testing

- Unit tests for `createT()`: correct key resolution, parameter interpolation, fallback chain
- Unit tests for `createDateFormatter()`: verify output format by locale
- Existing tests should continue to pass unchanged
- Build verification with example site (which uses `language: "zh"` — will need to update to `"zh-CN"`)

### Migration

The example site (`examples/blog-site/astro.config.mjs`) currently uses `language: "zh"`. This should be updated to `language: "zh-CN"` to match BCP 47.

For backwards compatibility, the `translations` object in `i18n/index.ts` will register `zh-CN.ts` under both `"zh-CN"` and `"zh"` keys. This way, existing users with `language: "zh"` get an exact match without relying on the base-language fallback step, and the transition is seamless.

```ts
const translations: Translations = {
  en,
  "zh-CN": zhCN,
  zh: zhCN,  // alias for backwards compatibility
};
```
