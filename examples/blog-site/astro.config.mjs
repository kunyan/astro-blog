import { defineConfig } from "astro/config";
import blog from "astro-blog";

export default defineConfig({
  site: "https://example.com",
  integrations: [
    blog({
      theme: "default",
      site: {
        title: "Example Blog",
        description: "A demo of astro-blog.",
        author: "Kyan",
        language: "en",
        url: "https://example.com",
      },
      social: {
        github: "https://github.com/kyan",
      },
      posts: {
        perPage: 2,
        contentDir: "src/content/posts",
      },
    }),
  ],
});
