#!/usr/bin/env node
import { existsSync } from "node:fs";
import { join } from "node:path";

const dist = join(process.cwd(), "examples/blog-site/dist");

const required = [
  "index.html",
  "posts/index.html",
  "posts/page/2/index.html",
  "posts/hello-world/index.html",
  "posts/second-post/index.html",
  "posts/third-post/index.html",
  "tags/intro/index.html",
  "tags/meta/index.html",
  "rss.xml",
  "sitemap-index.xml",
  "about/index.html",
];

const forbidden = [
  "posts/draft-post/index.html",
  "tags/draft/index.html",
];

let failed = 0;

for (const path of required) {
  const full = join(dist, path);
  if (!existsSync(full)) {
    console.error(`MISSING: ${path}`);
    failed++;
  } else {
    console.log(`OK:      ${path}`);
  }
}

for (const path of forbidden) {
  const full = join(dist, path);
  if (existsSync(full)) {
    console.error(`SHOULD NOT EXIST: ${path}`);
    failed++;
  } else {
    console.log(`OK:      (absent) ${path}`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} verification check(s) failed.`);
  process.exit(1);
}
console.log("\nAll example-build checks passed.");
