import { defineConfig } from "astro/config";
import blog from "@kunyan/astro-blog";

export default defineConfig({
  site: "https://kunyan.github.io",
  base: "/astro-blog",
  integrations: [
    blog({
      theme: "default",
      site: {
        title: "Example Blog",
        description: "A demo of astro-blog.",
        author: "Kun Yan",
        language: "zh",
        url: "https://kunyan.github.io/astro-blog",
      },
      social: {
        github: "https://github.com/kunyan",
      },
      posts: {
        perPage: 9,
        contentDir: "src/content/posts",
      },
      nav: [
        { name: "关于", path: "/about" },
      ],
    }),
  ],
});
