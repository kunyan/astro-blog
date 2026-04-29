import { describe, it, expect } from "vitest";
import { validateOptions } from "../src/options";

describe("validateOptions", () => {
  it("applies defaults when only required fields are given", () => {
    const result = validateOptions({
      site: { title: "Test", url: "https://example.com" },
    });
    expect(result.theme).toBe("default");
    expect(result.posts.perPage).toBe(10);
    expect(result.posts.contentDir).toBe("src/content/posts");
    expect(result.site.language).toBe("en");
    expect(result.site.description).toBe("");
    expect(result.site.author).toBe("");
    expect(result.social).toEqual({});
  });

  it("throws when site.title is missing", () => {
    expect(() =>
      // @ts-expect-error: deliberately missing title
      validateOptions({ site: { url: "https://example.com" } })
    ).toThrow(/site\.title/);
  });

  it("throws when site.url is not a URL", () => {
    expect(() =>
      validateOptions({ site: { title: "Test", url: "not-a-url" } })
    ).toThrow();
  });

  it("preserves user overrides over defaults", () => {
    const result = validateOptions({
      site: { title: "T", url: "https://example.com", language: "zh-CN" },
      theme: "magazine",
      posts: { perPage: 5 },
    });
    expect(result.theme).toBe("magazine");
    expect(result.posts.perPage).toBe(5);
    expect(result.posts.contentDir).toBe("src/content/posts");
    expect(result.site.language).toBe("zh-CN");
  });

  it("validates social URLs and email when provided", () => {
    expect(() =>
      validateOptions({
        site: { title: "T", url: "https://example.com" },
        social: { github: "not-a-url" },
      })
    ).toThrow();
    expect(() =>
      validateOptions({
        site: { title: "T", url: "https://example.com" },
        social: { email: "not-an-email" },
      })
    ).toThrow();
  });
});
