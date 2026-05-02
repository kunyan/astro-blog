---
title: "用 Rust 编写 WebAssembly 模块"
description: "从 Rust 到浏览器，构建高性能的 WebAssembly 应用"
pubDate: 2026-04-28
tags: ["webassembly", "rust", "wasm", "performance"]
draft: false
cover: "./covers/wasm-rust.svg"
coverAlt: "用 Rust 编写 WebAssembly 模块封面"
---

## 为什么用 Rust 写 WASM

Rust 是编写 WebAssembly 模块的理想语言。它没有垃圾回收器，编译产物小巧；零成本抽象保证了运行时性能；强大的类型系统减少了运行时错误。wasm-bindgen 和 wasm-pack 等工具链的成熟也让开发体验非常流畅。

## 环境搭建

```bash
# 安装 wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# 创建新项目
cargo new --lib wasm-demo
cd wasm-demo
```

在 `Cargo.toml` 中添加依赖：

```toml
[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"
```

## 编写 Rust 代码

```rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn fibonacci(n: u32) -> u64 {
    if n <= 1 {
        return n as u64;
    }
    let mut a: u64 = 0;
    let mut b: u64 = 1;
    for _ in 2..=n {
        let temp = b;
        b = a + b;
        a = temp;
    }
    b
}

#[wasm_bindgen]
pub struct ImageProcessor {
    width: u32,
    height: u32,
    pixels: Vec<u8>,
}

#[wasm_bindgen]
impl ImageProcessor {
    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32, pixels: Vec<u8>) -> Self {
        Self { width, height, pixels }
    }

    pub fn grayscale(&mut self) {
        for chunk in self.pixels.chunks_exact_mut(4) {
            let gray = (0.299 * chunk[0] as f64
                + 0.587 * chunk[1] as f64
                + 0.114 * chunk[2] as f64) as u8;
            chunk[0] = gray;
            chunk[1] = gray;
            chunk[2] = gray;
        }
    }

    pub fn pixels(&self) -> Vec<u8> {
        self.pixels.clone()
    }
}
```

## 在 JavaScript 中使用

```javascript
import init, { fibonacci, ImageProcessor } from './pkg/wasm_demo.js';

async function main() {
  await init();
  
  // 计算斐波那契数列
  console.log(fibonacci(50)); // 瞬间完成
  
  // 图像处理
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const processor = new ImageProcessor(
    canvas.width, canvas.height,
    new Uint8Array(imageData.data)
  );
  processor.grayscale();
}
```

## 性能对比

在计算密集型任务中，WASM 通常比 JavaScript 快 2-10 倍。图像处理、加密算法、物理模拟和数据压缩是 WASM 最适合的应用场景。但对于 DOM 操作和简单逻辑，JavaScript 仍然更合适。

## 总结

Rust + WebAssembly 为 Web 应用带来了接近原生的性能。随着 WASI 标准的推进，WebAssembly 的应用场景将从浏览器扩展到服务端和边缘计算。
