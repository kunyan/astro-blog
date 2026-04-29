import { defineCollection } from "astro:content";
import { postSchema } from "astro-blog/content";

export const collections = {
  posts: defineCollection({ type: "content", schema: postSchema }),
};
