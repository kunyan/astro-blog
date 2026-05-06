import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  paginate,
  filterDrafts,
  filterByTag,
  collectTags,
  sortByDateDesc,
} from "../src/lib/posts";

vi.mock("astro:content", () => ({
  getCollection: vi.fn(),
}));

const post = (overrides: Record<string, unknown> = {}) => {
  const { id, ...dataOverrides } = overrides;
  return {
    id: id ?? "x",
    data: {
      title: "x",
      description: "x",
      pubDate: new Date("2026-01-01"),
      tags: [],
      draft: false,
      ...dataOverrides,
    },
  } as never;
};

describe("paginate", () => {
  it("returns page 1 with first N items", () => {
    const r = paginate([1, 2, 3, 4, 5], 1, 2);
    expect(r.items).toEqual([1, 2]);
    expect(r.page.current).toBe(1);
    expect(r.page.total).toBe(3);
    expect(r.page.hasPrev).toBe(false);
    expect(r.page.hasNext).toBe(true);
  });

  it("returns last partial page", () => {
    const r = paginate([1, 2, 3, 4, 5], 3, 2);
    expect(r.items).toEqual([5]);
    expect(r.page.current).toBe(3);
    expect(r.page.total).toBe(3);
    expect(r.page.hasPrev).toBe(true);
    expect(r.page.hasNext).toBe(false);
  });

  it("empty list yields total=1, current=1", () => {
    const r = paginate([], 1, 10);
    expect(r.items).toEqual([]);
    expect(r.page.total).toBe(1);
    expect(r.page.current).toBe(1);
    expect(r.page.hasPrev).toBe(false);
    expect(r.page.hasNext).toBe(false);
  });

  it("clamps current to [1, total]", () => {
    const r1 = paginate([1, 2, 3], 99, 10);
    expect(r1.page.current).toBe(1);
    const r2 = paginate([1, 2, 3], -5, 10);
    expect(r2.page.current).toBe(1);
  });
});

describe("filterDrafts", () => {
  const posts = [
    post({ draft: false, title: "a" }),
    post({ draft: true, title: "b" }),
    post({ draft: false, title: "c" }),
  ];

  it("removes drafts when isDev is false", () => {
    const r = filterDrafts(posts, false);
    expect(r.length).toBe(2);
    expect(r.every((p) => !p.data.draft)).toBe(true);
  });

  it("keeps drafts when isDev is true", () => {
    expect(filterDrafts(posts, true).length).toBe(3);
  });
});

describe("filterByTag", () => {
  const posts = [
    post({ tags: ["foo", "bar"] }),
    post({ tags: ["baz"] }),
    post({ tags: ["foo"] }),
  ];

  it("returns only posts containing the tag", () => {
    expect(filterByTag(posts, "foo").length).toBe(2);
    expect(filterByTag(posts, "baz").length).toBe(1);
    expect(filterByTag(posts, "missing").length).toBe(0);
  });
});

describe("collectTags", () => {
  it("returns unique tags sorted alphabetically", () => {
    const posts = [post({ tags: ["b", "a"] }), post({ tags: ["c", "a"] })];
    expect(collectTags(posts)).toEqual(["a", "b", "c"]);
  });

  it("returns empty array when no posts", () => {
    expect(collectTags([])).toEqual([]);
  });
});

describe("sortByDateDesc", () => {
  it("sorts most-recent first", () => {
    const posts = [
      post({ pubDate: new Date("2026-01-01") }),
      post({ pubDate: new Date("2026-03-01") }),
      post({ pubDate: new Date("2026-02-01") }),
    ];
    const sorted = sortByDateDesc(posts);
    expect(sorted[0]!.data.pubDate.getMonth()).toBe(2);
    expect(sorted[1]!.data.pubDate.getMonth()).toBe(1);
    expect(sorted[2]!.data.pubDate.getMonth()).toBe(0);
  });

  it("does not mutate input", () => {
    const posts = [
      post({ pubDate: new Date("2026-01-01"), title: "a" }),
      post({ pubDate: new Date("2026-02-01"), title: "b" }),
    ];
    const original = [...posts];
    sortByDateDesc(posts);
    expect(posts).toEqual(original);
  });
});

// --- Content access wrappers (mocked astro:content) ---

import { getCollection } from "astro:content";
import {
  getPublishedPosts,
  getPostBySlug,
  getPostsByTag,
  getAllTags,
} from "../src/lib/posts";

const sample = [
  post({ id: "old", pubDate: new Date("2026-01-01"), tags: ["a"] }),
  post({ id: "draft", pubDate: new Date("2026-02-01"), draft: true, tags: ["a", "b"] }),
  post({ id: "new", pubDate: new Date("2026-03-01"), tags: ["b"] }),
];

describe("getPublishedPosts", () => {
  beforeEach(() => {
    vi.mocked(getCollection).mockReset();
  });

  it("excludes drafts and sorts most-recent first when isDev=false", async () => {
    vi.mocked(getCollection).mockResolvedValue(sample);
    const result = await getPublishedPosts({ isDev: false });
    expect(result.map((p) => p.id)).toEqual(["new", "old"]);
  });

  it("includes drafts when isDev=true, still sorted desc", async () => {
    vi.mocked(getCollection).mockResolvedValue(sample);
    const result = await getPublishedPosts({ isDev: true });
    expect(result.map((p) => p.id)).toEqual(["new", "draft", "old"]);
  });
});

describe("getPostBySlug", () => {
  beforeEach(() => {
    vi.mocked(getCollection).mockReset();
    vi.mocked(getCollection).mockResolvedValue(sample);
  });

  it("returns the matching published post", async () => {
    const r = await getPostBySlug("new", { isDev: false });
    expect(r?.id).toBe("new");
  });

  it("does not return a draft when isDev=false", async () => {
    const r = await getPostBySlug("draft", { isDev: false });
    expect(r).toBeUndefined();
  });

  it("returns a draft when isDev=true", async () => {
    const r = await getPostBySlug("draft", { isDev: true });
    expect(r?.id).toBe("draft");
  });
});

describe("getPostsByTag", () => {
  beforeEach(() => {
    vi.mocked(getCollection).mockReset();
    vi.mocked(getCollection).mockResolvedValue(sample);
  });

  it("returns only published posts with that tag, sorted desc", async () => {
    const r = await getPostsByTag("b", { isDev: false });
    expect(r.map((p) => p.id)).toEqual(["new"]);
  });
});

describe("getAllTags", () => {
  beforeEach(() => {
    vi.mocked(getCollection).mockReset();
    vi.mocked(getCollection).mockResolvedValue(sample);
  });

  it("returns unique sorted tags from published posts only", async () => {
    const r = await getAllTags({ isDev: false });
    expect(r).toEqual(["a", "b"]);
  });
});
