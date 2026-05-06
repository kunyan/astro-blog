import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { postSchema, pageSchema } from "@kunyan/astro-blog/content";

export const collections = {
  posts: defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
    schema: postSchema,
  }),
  pages: defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/pages" }),
    schema: pageSchema,
  }),
};
