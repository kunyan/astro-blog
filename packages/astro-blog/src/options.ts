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
