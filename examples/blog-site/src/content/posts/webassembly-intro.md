---
title: "WebAssembly 入门：让浏览器飞起来"
description: "了解 WebAssembly 的核心概念、应用场景和开发流程"
pubDate: 2026-03-15
tags: ["webassembly", "wasm", "performance", "web"]
draft: false
cover: "./covers/webassembly-intro.svg"
coverAlt: "WebAssembly 入门封面"
---

WebAssembly（简称 Wasm）是一种低级的二进制指令格式，可以在现代浏览器中以接近原生的速度运行。它不是要取代 JavaScript，而是与 JavaScript 互补，让 Web 平台能胜任更多计算密集型任务。

## 什么是 WebAssembly

Wasm 是一种编译目标，你可以用 C/C++、Rust、Go 等语言编写代码，然后编译为 `.wasm` 二进制文件在浏览器中运行。它的设计目标是安全、高效和可移植。

```rust
// Rust 代码编译为 Wasm
#[wasm_bindgen]
pub fn fibonacci(n: u32) -> u32 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}
```

## 应用场景

- **游戏引擎**：Unity 和 Unreal Engine 都支持导出为 Wasm
- **音视频处理**：FFmpeg 的 Wasm 版本可以在浏览器中做视频编辑
- **图像处理**：Photoshop Web 版使用了大量 Wasm
- **科学计算**：数学库、物理模拟、数据可视化
- **CAD/3D 建模**：AutoCAD Web 版

## 与 JavaScript 的交互

Wasm 可以与 JavaScript 无缝交互：

```javascript
const { instance } = await WebAssembly.instantiateStreaming(
  fetch('module.wasm')
);
const result = instance.exports.fibonacci(40);
```

通过 `wasm-bindgen`（Rust）或 `emscripten`（C/C++），可以生成胶水代码简化互操作。

## WASI：走出浏览器

WebAssembly System Interface（WASI）让 Wasm 可以在浏览器之外运行，提供标准化的系统调用接口。这开辟了服务端 Wasm 的可能性，如 Cloudflare Workers、Fastly Compute 等边缘计算平台都支持 Wasm。

## 性能对比

对于计算密集型任务，Wasm 通常比 JavaScript 快 2-10 倍。但对于 DOM 操作等场景，JavaScript 仍然更合适。合理的策略是将性能敏感的计算逻辑放在 Wasm 中，UI 逻辑保留在 JavaScript。Wasm 是 Web 平台能力边界的重要扩展。
