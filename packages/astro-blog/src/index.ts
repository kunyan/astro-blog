import type { AstroIntegration } from "astro";
import sitemap from "@astrojs/sitemap";
import { cpSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
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

function seedThemesDir(): string {
  return fileURLToPath(new URL("./themes/", import.meta.url));
}

export default function blog(options: AstroBlogOptions): AstroIntegration[] {
  const config = validateOptions(options);

  const blogIntegration: AstroIntegration = {
    name: "astro-blog",
    hooks: {
      "astro:config:setup": ({ config: astroConfig, updateConfig, injectRoute, logger }) => {
        const projectRoot = fileURLToPath(astroConfig.root);
        const userThemesDir = join(projectRoot, "src/themes");
        const userThemeDir = join(userThemesDir, config.theme);
        const userThemeIndex = join(userThemeDir, "index.ts");

        if (!existsSync(userThemeIndex)) {
          const seedDir = join(seedThemesDir(), config.theme);
          if (existsSync(seedDir)) {
            logger.info(`Copying "${config.theme}" theme to src/themes/${config.theme}/`);
            cpSync(seedDir, userThemeDir, { recursive: true });
          } else {
            const available = readdirSync(seedThemesDir(), { withFileTypes: true })
              .filter((d) => d.isDirectory())
              .map((d) => d.name);
            throw new Error(
              `[astro-blog] Theme "${config.theme}" not found.\n` +
                `Create it at src/themes/${config.theme}/ or use one of: ${available.join(", ")}.`
            );
          }
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
                  if (id === VIRTUAL_THEME_ID) return userThemeIndex;
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
        injectRoute({
          pattern: "/[slug]",
          entrypoint: routeEntrypoint("page.astro"),
        });
      },
    },
  };

  return [blogIntegration, sitemap()];
}
