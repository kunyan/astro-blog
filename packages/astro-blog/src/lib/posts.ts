import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;

export interface PageInfo {
  current: number;
  total: number;
  hasPrev: boolean;
  hasNext: boolean;
}

export interface Paginated<T> {
  items: T[];
  page: PageInfo;
}

export function paginate<T>(items: T[], page: number, perPage: number): Paginated<T> {
  const total = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.max(1, Math.min(Math.floor(page) || 1, total));
  const start = (current - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    page: {
      current,
      total,
      hasPrev: current > 1,
      hasNext: current < total,
    },
  };
}

export function filterDrafts(posts: Post[], isDev: boolean): Post[] {
  return isDev ? posts : posts.filter((p) => !p.data.draft);
}

export function filterByTag(posts: Post[], tag: string): Post[] {
  return posts.filter((p) => p.data.tags.includes(tag));
}

export function collectTags(posts: Post[]): string[] {
  const set = new Set<string>();
  for (const p of posts) for (const t of p.data.tags) set.add(t);
  return [...set].sort();
}

export function sortByDateDesc(posts: Post[]): Post[] {
  return [...posts].sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
}

export interface ContentOptions {
  isDev: boolean;
}

export async function getPublishedPosts(opts: ContentOptions): Promise<Post[]> {
  const all = await getCollection("posts");
  return sortByDateDesc(filterDrafts(all, opts.isDev));
}

export async function getPostBySlug(
  slug: string,
  opts: ContentOptions
): Promise<Post | undefined> {
  const all = await getPublishedPosts(opts);
  return all.find((p) => p.id === slug);
}

export async function getPostsByTag(
  tag: string,
  opts: ContentOptions
): Promise<Post[]> {
  const all = await getPublishedPosts(opts);
  return filterByTag(all, tag);
}

export async function getAllTags(opts: ContentOptions): Promise<string[]> {
  const all = await getPublishedPosts(opts);
  return collectTags(all);
}
