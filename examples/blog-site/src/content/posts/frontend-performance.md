---
title: "前端性能优化指南"
description: "从加载速度到运行时性能的全方位优化策略"
pubDate: 2026-03-01
tags: ["前端", "性能"]
draft: false
cover: "./covers/frontend-performance.svg"
coverAlt: "前端性能优化指南封面"
---

## 性能指标体系

性能优化的第一步是建立可量化的指标体系。Core Web Vitals 是 Google 提出的核心体验指标：LCP（最大内容绘制）衡量加载速度，应控制在 2.5 秒内；INP（交互到下一次绘制）衡量交互响应性，应低于 200 毫秒；CLS（累积布局偏移）衡量视觉稳定性，应小于 0.1。

## 加载性能优化

### 资源压缩与分包

使用 Tree Shaking 移除未使用的代码，配合代码分割（Code Splitting）按路由或组件进行懒加载。现代打包工具如 Vite 和 Rspack 默认支持这些优化。图片资源应使用 WebP 或 AVIF 格式，并通过 `<picture>` 元素提供多种分辨率。

### 缓存策略

静态资源采用内容哈希命名配合长期缓存：`main.a1b2c3.js` 这样的文件名可以安全地设置一年的缓存时间。API 响应则根据数据时效性设置适当的 `Cache-Control` 和 `ETag`。Service Worker 可以实现离线缓存和预加载策略。

### 关键渲染路径

内联首屏关键 CSS，异步加载非关键样式。使用 `<link rel="preload">` 预加载关键字体和脚本。将阻塞渲染的 JavaScript 标记为 `defer` 或 `async`，避免阻塞 DOM 解析。

## 运行时性能优化

### 虚拟列表

当页面需要展示大量列表数据时，虚拟列表只渲染可视区域内的元素，将 DOM 节点数量从数千个降低到几十个，显著减少内存占用和渲染开销。

### 防抖与节流

高频触发的事件（如滚动、输入、窗口调整）应使用防抖（debounce）或节流（throttle）控制回调执行频率。搜索框输入建议使用 300ms 防抖，滚动事件监听使用 16ms 节流以匹配 60fps 刷新率。

### 避免强制同步布局

在 JavaScript 中交替读写 DOM 属性会触发强制同步布局（Layout Thrashing）。应将所有 DOM 读取操作集中执行，再统一进行写入操作，或使用 `requestAnimationFrame` 批量处理 DOM 更新。

## 监控与持续优化

性能优化不是一次性工作。集成 Lighthouse CI 到流水线中监控性能回归，使用 Web Vitals 库收集真实用户数据（RUM），建立性能预算并在超出阈值时发出告警。数据驱动的优化方式比凭直觉猜测更高效。
