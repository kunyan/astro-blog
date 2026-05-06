import { z } from "astro/zod";
import type { SchemaContext } from "astro:content";

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

export const pageSchema = z.object({
  title: z.string(),
  description: z.string(),
});

export type PageFrontmatter = z.infer<typeof pageSchema>;
