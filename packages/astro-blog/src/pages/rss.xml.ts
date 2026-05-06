import rss from "@astrojs/rss";
import config from "@kunyan/astro-blog:config";
import { getPublishedPosts } from "@kunyan/astro-blog/lib/posts";

export async function GET(context: { site?: URL }) {
  const isDev = import.meta.env.DEV ?? false;
  const posts = await getPublishedPosts({ isDev });
  return rss({
    title: config.site.title,
    description: config.site.description,
    site: context.site?.toString() ?? config.site.url,
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.pubDate,
      description: p.data.description,
      link: `/posts/${p.id}/`,
    })),
  });
}
