import { describe, it, expect } from "vitest";
import { createT, createDateFormatter } from "../src/themes/default/i18n";

describe("createT", () => {
  it("returns English value for language 'en'", () => {
    const t = createT("en");
    expect(t("nav.home")).toBe("Home");
    expect(t("nav.posts")).toBe("Posts");
  });

  it("returns zh-CN value for language 'zh-CN'", () => {
    const t = createT("zh-CN");
    expect(t("nav.home")).toBe("首页");
    expect(t("nav.posts")).toBe("文章");
  });

  it("returns zh-CN value for language 'zh' (backwards compat alias)", () => {
    const t = createT("zh");
    expect(t("nav.home")).toBe("首页");
  });

  it("falls back to base language when exact match not found", () => {
    const t = createT("en-US");
    expect(t("nav.home")).toBe("Home");
  });

  it("falls back to English for unknown language", () => {
    const t = createT("fr");
    expect(t("nav.home")).toBe("Home");
  });

  it("interpolates {param} placeholders", () => {
    const t = createT("en");
    expect(t("posts.tagged", { tag: "astro" })).toBe('Posts tagged "astro"');
  });

  it("interpolates params in zh-CN", () => {
    const t = createT("zh-CN");
    expect(t("posts.tagged", { tag: "astro" })).toBe("标签「astro」的文章");
  });

  it("returns the key itself if not found in any dictionary", () => {
    const t = createT("en");
    expect(t("nonexistent.key" as any)).toBe("nonexistent.key");
  });
});

describe("createDateFormatter", () => {
  const date = new Date("2024-01-15T00:00:00Z");

  it("formats date in English locale", () => {
    const formatDate = createDateFormatter("en");
    const result = formatDate(date);
    expect(result).toContain("2024");
    expect(result).toContain("Jan");
    expect(result).toContain("15");
  });

  it("formats date in zh-CN locale", () => {
    const formatDate = createDateFormatter("zh-CN");
    const result = formatDate(date);
    expect(result).toContain("2024");
    expect(result).toContain("1");
    expect(result).toContain("15");
  });

  it("does not throw for unknown locale", () => {
    const formatDate = createDateFormatter("xx");
    expect(() => formatDate(date)).not.toThrow();
  });
});
