import type { AstroIntegration } from "astro";
import sitemap from "@astrojs/sitemap";
import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { validateOptions, type AstroBlogOptions } from "./options.js";
import { generateConfigSource } from "./virtual.js";

const VIRTUAL_CONFIG_ID = "astro-blog:config";
const RESOLVED_VIRTUAL_CONFIG_ID = "\0astro-blog:config";
const VIRTUAL_THEME_ID = "astro-blog:current-theme";

export type { AstroBlogOptions, ResolvedOptions } from "./options.js";

function routeEntrypoint(name: string): string {
  return fileURLToPath(new URL(`./routes/${name}`, import.meta.url));
}

export default function blog(options: AstroBlogOptions): AstroIntegration[] {
  const config = validateOptions(options);

  const blogIntegration: AstroIntegration = {
    name: "astro-blog",
    hooks: {
      "astro:config:setup": ({ updateConfig, injectRoute }) => {
        const themesDir = fileURLToPath(new URL("./themes/", import.meta.url));
        const themeIndex = fileURLToPath(
          new URL(`./themes/${config.theme}/index.ts`, import.meta.url)
        );

        if (!existsSync(themeIndex)) {
          const available = readdirSync(themesDir, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name);
          throw new Error(
            `[astro-blog] Theme "${config.theme}" not found in ${themesDir}.\n` +
              `Available themes: ${available.length ? available.join(", ") : "(none)"}.`
          );
        }

        const configSource = generateConfigSource(config);

        updateConfig({
          vite: {
            plugins: [
              {
                name: "astro-blog:virtual",
                enforce: "pre",
                resolveId(id) {
                  if (id === VIRTUAL_CONFIG_ID) return RESOLVED_VIRTUAL_CONFIG_ID;
                  if (id === VIRTUAL_THEME_ID) return themeIndex;
                  return null;
                },
                load(id) {
                  if (id === RESOLVED_VIRTUAL_CONFIG_ID) return configSource;
                  return null;
                },
              },
            ],
          },
        });

        injectRoute({ pattern: "/", entrypoint: routeEntrypoint("home.astro") });
        injectRoute({ pattern: "/posts", entrypoint: routeEntrypoint("list.astro") });
        injectRoute({
          pattern: "/posts/page/[page]",
          entrypoint: routeEntrypoint("list-page.astro"),
        });
        injectRoute({
          pattern: "/posts/[slug]",
          entrypoint: routeEntrypoint("post.astro"),
        });
        injectRoute({
          pattern: "/tags/[tag]",
          entrypoint: routeEntrypoint("tag.astro"),
        });
        injectRoute({
          pattern: "/rss.xml",
          entrypoint: routeEntrypoint("rss.xml.ts"),
        });
      },
    },
  };

  return [blogIntegration, sitemap()];
}
