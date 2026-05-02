---
title: "CSS Grid 布局实战教程"
description: "从基础到进阶，全面掌握 CSS Grid 布局技术"
pubDate: 2026-01-18
tags: ["css", "layout", "frontend", "web-design"]
draft: false
cover: "./covers/css-grid-layout.svg"
coverAlt: "CSS Grid 布局实战教程封面"
---

CSS Grid 是现代 Web 布局中最强大的工具之一。与 Flexbox 擅长一维布局不同，Grid 天生就是为二维布局设计的。理解 Grid 能让你轻松实现复杂的页面结构，告别 float 和各种 hack。

## 基础概念

Grid 布局由**容器**（Container）和**项目**（Item）组成。通过 `display: grid` 启用网格布局：

```css
.container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 16px;
}
```

`fr` 单位表示可用空间的比例分配。上面的代码创建了一个三列布局，中间列宽度是两侧的两倍。

## 命名网格区域

`grid-template-areas` 是 Grid 最直观的特性之一：

```css
.layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
```

这种写法让布局结构一目了然，维护起来也非常方便。

## 响应式设计

结合 `minmax()` 和 `auto-fill`/`auto-fit`，Grid 能实现无需媒体查询的响应式布局：

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}
```

这段代码会自动根据容器宽度调整列数，每列最小 250px，多余空间均匀分配。

## 对齐方式

Grid 提供了丰富的对齐属性：`justify-items`、`align-items`、`justify-content`、`align-content`，以及针对单个项目的 `justify-self` 和 `align-self`。

## 与 Flexbox 的配合

Grid 和 Flexbox 并非互斥关系。通常的实践是：用 Grid 做页面整体布局，用 Flexbox 处理组件内部的一维排列。两者结合使用能覆盖几乎所有布局需求，让你的 CSS 代码既简洁又可维护。
