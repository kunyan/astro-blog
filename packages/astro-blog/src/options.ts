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

const postsInnerSchema = z.object({
  perPage: z.number().int().positive().default(10),
  contentDir: z.string().default("src/content/posts"),
});

const postsSchema = postsInnerSchema.default(postsInnerSchema.parse({}));

export type NavLeaf = { name: string; path: string };
export type NavGroup = { name: string; children: NavItem[] };
export type NavItem = NavLeaf | NavGroup;

const navItemSchema: z.ZodType<NavItem> = z.lazy(() =>
  z.union([
    z.object({ name: z.string().min(1), path: z.string().startsWith("/") }),
    z.object({ name: z.string().min(1), children: z.array(navItemSchema).min(1) }),
  ])
);

const navSchema = z.array(navItemSchema).default([]);

export const optionsSchema = z.object({
  theme: z.string().default("default"),
  site: siteSchema,
  social: socialSchema,
  posts: postsSchema,
  nav: navSchema,
});

export type AstroBlogOptions = z.input<typeof optionsSchema>;
export type ResolvedOptions = z.output<typeof optionsSchema>;

export function validateOptions(input: AstroBlogOptions): ResolvedOptions {
  const result = optionsSchema.safeParse(input);
  if (!result.success) {
    const detail = result.error.issues
      .map((e) => `  - ${e.path.join(".") || "(root)"}: ${e.message}`)
      .join("\n");
    throw new Error(`[astro-blog] Invalid options:\n${detail}`);
  }
  return result.data;
}
