import { getCollection, type CollectionEntry } from "astro:content";

export type Page = CollectionEntry<"pages">;

export async function getPageBySlug(slug: string): Promise<Page | undefined> {
  const pages = await getCollection("pages");
  return pages.find((p: Page) => p.slug === slug);
}
