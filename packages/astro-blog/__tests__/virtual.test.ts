import { describe, it, expect } from "vitest";
import { generateConfigSource } from "../src/virtual";

const cfg = {
  theme: "default",
  site: {
    title: "T",
    description: "D",
    author: "A",
    language: "en",
    url: "https://example.com",
  },
  social: { github: "https://github.com/x" },
  posts: { perPage: 10, contentDir: "src/content/posts" },
};

describe("generateConfigSource", () => {
  it("returns valid JS that exports the config as default", async () => {
    const source = generateConfigSource(cfg as never);
    expect(source).toContain("export default");
    expect(source).toContain('"theme"');

    const dataUrl = "data:text/javascript;base64," + Buffer.from(source).toString("base64");
    const mod = await import(dataUrl);
    expect(mod.default).toEqual(cfg);
  });

  it("does not throw on values containing quotes/newlines", () => {
    const tricky = { ...cfg, site: { ...cfg.site, title: 'Title with "quotes"\nand newline' } };
    const source = generateConfigSource(tricky as never);
    expect(source).toContain("export default");
    expect(() => JSON.parse(JSON.stringify(tricky))).not.toThrow();
  });
});
