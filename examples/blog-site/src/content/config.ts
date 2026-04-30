import { defineCollection } from "astro:content";
import { postSchema, pageSchema } from "astro-blog/content";

export const collections = {
  posts: defineCollection({ type: "content", schema: postSchema }),
  pages: defineCollection({ type: "content", schema: pageSchema }),
};
