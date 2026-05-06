declare module "@kunyan/astro-blog:config" {
  import type { ResolvedOptions } from "./options.js";
  const config: ResolvedOptions;
  export default config;
}

declare module "@kunyan/astro-blog:current-theme" {
  export const Home: any;
  export const List: any;
  export const Post: any;
  export const Page: any;
}

declare module "*.astro" {
  const component: any;
  export default component;
}
