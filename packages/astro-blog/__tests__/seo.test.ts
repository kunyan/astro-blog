import { describe, it, expect } from "vitest";
import { buildSEO } from "../src/lib/seo";

describe("buildSEO", () => {
  it("returns title and description in meta", () => {
    const meta = buildSEO({
      title: "Hello",
      description: "World",
      url: "https://example.com/posts/hello",
      siteTitle: "Site",
      type: "article",
    });
    const find = (name: string) => meta.find((m) => m.name === name || m.property === name);
    expect(find("description")?.content).toBe("World");
    expect(find("og:title")?.content).toBe("Hello");
    expect(find("og:description")?.content).toBe("World");
    expect(find("og:type")?.content).toBe("article");
    expect(find("og:url")?.content).toBe("https://example.com/posts/hello");
    expect(find("og:site_name")?.content).toBe("Site");
    expect(find("twitter:card")?.content).toBe("summary_large_image");
  });

  it("uses 'website' as default og:type when not specified", () => {
    const meta = buildSEO({
      title: "T",
      description: "D",
      url: "https://example.com",
      siteTitle: "S",
    });
    const ogType = meta.find((m) => m.property === "og:type");
    expect(ogType?.content).toBe("website");
  });

  it("includes og:image when image is provided", () => {
    const meta = buildSEO({
      title: "T",
      description: "D",
      url: "https://example.com",
      siteTitle: "S",
      image: "https://example.com/cover.jpg",
    });
    const img = meta.find((m) => m.property === "og:image");
    expect(img?.content).toBe("https://example.com/cover.jpg");
  });

  it("omits og:image when image is not provided", () => {
    const meta = buildSEO({
      title: "T",
      description: "D",
      url: "https://example.com",
      siteTitle: "S",
    });
    const img = meta.find((m) => m.property === "og:image");
    expect(img).toBeUndefined();
  });
});
