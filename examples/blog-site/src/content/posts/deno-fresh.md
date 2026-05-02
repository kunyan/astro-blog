---
title: "Deno 与 Fresh 框架探索"
description: "了解 Deno 运行时和 Fresh 全栈框架的独特优势"
pubDate: 2026-04-12
tags: ["deno", "fresh", "javascript", "runtime"]
draft: false
cover: "./covers/deno-fresh.svg"
coverAlt: "Deno 与 Fresh 框架探索封面"
---

## Deno 是什么

Deno 是由 Node.js 的创始人 Ryan Dahl 开发的新一代 JavaScript/TypeScript 运行时。它从设计之初就解决了 Node.js 的一些历史遗留问题：原生支持 TypeScript、内置安全权限系统、使用 URL 导入模块、遵循 Web 标准 API。

## Deno 的核心特性

### 安全优先

Deno 默认不允许访问文件系统、网络和环境变量。需要通过显式的权限标志来授予权限。

```bash
# 只允许访问 ./data 目录和 example.com
deno run --allow-read=./data --allow-net=example.com app.ts
```

### 原生 TypeScript

Deno 内置了 TypeScript 编译器，无需配置 tsconfig.json 或安装额外的编译工具链。直接运行 .ts 文件就像运行 .js 文件一样简单。

### Web 标准 API

Deno 尽可能使用浏览器兼容的 API，如 `fetch`、`Request`、`Response`、`URL` 等。这意味着在 Deno 和浏览器之间共享代码变得更加容易。

## Fresh 框架

Fresh 是基于 Deno 的全栈 Web 框架，采用了独特的岛屿架构（Islands Architecture）。

### 岛屿架构

页面默认是纯 HTML，只有需要交互的部分（"岛屿"）才会加载 JavaScript。这种方式默认实现了零 JS 的服务端渲染，只在需要时才发送客户端代码。

```typescript
// islands/Counter.tsx - 交互式岛屿组件
import { useState } from "preact/hooks";

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <span>{count}</span>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
```

### 即时部署

Fresh 基于 Deno Deploy 平台，支持边缘部署。应用在全球各地的边缘节点运行，延迟极低。没有构建步骤，代码推送后即刻上线。

## 与 Node.js 的对比

Deno 的包管理方式与 Node.js 截然不同——没有 node_modules 和 package.json。模块通过 URL 直接导入并被全局缓存。虽然 Deno 也支持 npm 包兼容，但原生 Deno 模块体验更佳。

## 总结

Deno 代表了 JavaScript 运行时的新方向。如果你正在开始新项目，尤其是边缘计算和全栈 Web 应用，Deno + Fresh 是一个值得认真考虑的技术栈。
