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
        author: "Kun Yan",
        language: "en",
        url: "https://example.com",
      },
      social: {
        github: "https://github.com/kunyan",
      },
      posts: {
        perPage: 2,
        contentDir: "src/content/posts",
      },
      nav: [
        { name: "About", path: "/about" },
      ],
    }),
  ],
});
