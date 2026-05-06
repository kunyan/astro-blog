import type { AstroIntegration } from "astro";
import sitemap from "@astrojs/sitemap";
import { cpSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { validateOptions, type AstroBlogOptions } from "./options.js";
import { generateConfigSource } from "./virtual.js";

const VIRTUAL_CONFIG_ID = "@kunyan/astro-blog:config";
const RESOLVED_VIRTUAL_CONFIG_ID = "\0@kunyan/astro-blog:config";
const VIRTUAL_THEME_ID = "@kunyan/astro-blog:current-theme";

export type { AstroBlogOptions, ResolvedOptions } from "./options.js";

function seedThemesDir(): string {
  return fileURLToPath(new URL("./themes/", import.meta.url));
}

function seedPagesDir(): string {
  return fileURLToPath(new URL("./pages/", import.meta.url));
}

export default function blog(options: AstroBlogOptions): AstroIntegration[] {
  const config = validateOptions(options);

  const blogIntegration: AstroIntegration = {
    name: "astro-blog",
    hooks: {
      "astro:config:setup": async ({ config: astroConfig, updateConfig, logger }) => {
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

        const userPagesDir = join(projectRoot, "src/pages");
        const userPagesIndex = join(userPagesDir, "index.astro");

        if (!existsSync(userPagesIndex)) {
          const seedDir = seedPagesDir();
          if (existsSync(seedDir)) {
            logger.info(`Copying page routes to src/pages/`);
            cpSync(seedDir, userPagesDir, { recursive: true });
          }
        }

        try {
          const require = createRequire(join(projectRoot, "package.json"));
          const tailwindPluginModule = require("@tailwindcss/vite");
          const tailwindPlugin = tailwindPluginModule.default || tailwindPluginModule;
          updateConfig({
            vite: {
              plugins: [tailwindPlugin()],
            },
          });
        } catch {
          throw new Error(
            `[astro-blog] Tailwind CSS v4 is required.\n` +
            `Run: pnpm add tailwindcss @tailwindcss/vite @tailwindcss/typography`
          );
        }

        const configSource = generateConfigSource(config);

        updateConfig({
          vite: {
            plugins: [
              {
                name: "@kunyan/astro-blog:virtual",
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
      },
    },
  };

  return [blogIntegration, sitemap()];
}
