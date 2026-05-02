---
title: "React Server Components 全面解读"
description: "理解 RSC 的设计理念、工作原理和最佳实践"
pubDate: 2026-01-25
tags: ["react", "frontend", "server-components", "javascript"]
draft: false
cover: "./covers/react-server-components.svg"
coverAlt: "React Server Components 全面解读封面"
---

React Server Components（RSC）是 React 架构的一次重大演进。它让组件可以在服务端执行，直接访问数据库和文件系统，同时将渲染结果以流的方式传输到客户端。这不是传统的 SSR，而是一种全新的渲染范式。

## 核心理念

RSC 将组件分为两类：

- **Server Components**：在服务端运行，不包含在客户端 bundle 中。可以直接 `await` 数据获取，访问后端资源。
- **Client Components**：在客户端运行（也可以 SSR），处理交互逻辑和状态。需要文件顶部标记 `'use client'`。

```tsx
// Server Component（默认）
async function PostList() {
  const posts = await db.query('SELECT * FROM posts');
  return (
    <ul>
      {posts.map(post => <PostItem key={post.id} post={post} />)}
    </ul>
  );
}
```

## 零 Bundle 体积

Server Components 的代码不会发送到客户端。这意味着你可以自由使用大型库（如 markdown 解析器、语法高亮器）而不影响客户端包大小。这对性能优化是巨大的利好。

## 数据获取模式

RSC 天然支持"请求瀑布"的消除。每个组件可以独立获取数据，React 会自动并行化这些请求，并以流式方式逐步渲染页面。用户能更快看到有意义的内容。

## 组合模式

Server Components 和 Client Components 可以自由组合。关键规则是：Server Component 可以引入 Client Component，但 Client Component 不能直接引入 Server Component。不过，你可以通过 children prop 将 Server Component 作为子组件传递。

## 实际影响

RSC 改变了前端应用的架构思路。数据获取逻辑从客户端移到了服务端，减少了 API 层的复杂性。对于内容驱动型应用，RSC 带来的性能提升尤为显著。建议从新项目开始尝试，逐步积累经验后再在现有项目中迁移。
