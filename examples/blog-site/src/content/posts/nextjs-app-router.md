---
title: "Next.js App Router 深入解析"
description: "全面理解 Next.js 13+ App Router 的架构设计与使用方法"
pubDate: 2026-03-13
tags: ["nextjs", "react", "frontend", "fullstack"]
draft: false
cover: "./covers/nextjs-app-router.svg"
coverAlt: "Next.js App Router 深入解析封面"
---

## App Router 的革新

Next.js 13 引入的 App Router 是 React 全栈框架的一次重大革新。基于 React Server Components，它重新定义了路由、数据获取和页面渲染的方式，带来了更好的性能和开发体验。

## 文件系统路由

App Router 使用 `app` 目录下的文件夹结构来定义路由。每个路由段对应一个文件夹，特殊文件名有特定含义。

```
app/
├── layout.tsx      # 根布局
├── page.tsx        # 首页
├── blog/
│   ├── page.tsx    # /blog
│   └── [slug]/
│       └── page.tsx # /blog/:slug
└── api/
    └── route.ts    # API 路由
```

### 布局与模板

`layout.tsx` 定义共享布局，在路由切换时保持状态不丢失。`template.tsx` 则在每次导航时重新创建实例。嵌套布局允许不同页面区域有不同的布局结构。

## 服务端组件 vs 客户端组件

在 App Router 中，组件默认是服务端组件（Server Component）。服务端组件可以直接访问数据库、读取文件系统，且不会增加客户端 JavaScript 包的大小。

```tsx
// 服务端组件 - 直接异步获取数据
export default async function BlogPage() {
  const posts = await db.posts.findMany();
  return (
    <ul>
      {posts.map(post => <li key={post.id}>{post.title}</li>)}
    </ul>
  );
}
```

需要交互性的组件（事件处理、状态管理、浏览器 API）使用 `'use client'` 声明为客户端组件。

## 数据获取

App Router 中的数据获取直接使用 `async/await`，不再需要 `getServerSideProps` 或 `getStaticProps`。`fetch` 函数被扩展以支持缓存和重新验证。

## 流式渲染

使用 `loading.tsx` 和 React Suspense 实现流式渲染，页面的不同部分可以独立加载。用户可以先看到页面框架，数据加载完成后逐步填充内容，大幅提升感知性能。

## 总结

App Router 代表了 React 全栈开发的未来方向。虽然学习曲线较陡，但其带来的性能提升和开发模式的简化是值得投入的。
