export interface SEOInput {
  title: string;
  description: string;
  url: string;
  siteTitle: string;
  image?: string;
  type?: "website" | "article";
}

export interface MetaTag {
  name?: string;
  property?: string;
  content: string;
}

export function buildSEO(input: SEOInput): MetaTag[] {
  const tags: MetaTag[] = [
    { name: "description", content: input.description },
    { property: "og:title", content: input.title },
    { property: "og:description", content: input.description },
    { property: "og:type", content: input.type ?? "website" },
    { property: "og:url", content: input.url },
    { property: "og:site_name", content: input.siteTitle },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: input.title },
    { name: "twitter:description", content: input.description },
  ];
  if (input.image) {
    tags.push({ property: "og:image", content: input.image });
    tags.push({ name: "twitter:image", content: input.image });
  }
  return tags;
}
