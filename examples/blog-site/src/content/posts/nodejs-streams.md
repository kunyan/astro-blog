---
title: "Node.js 流处理完全指南"
description: "掌握 Node.js Stream API，高效处理大规模数据"
pubDate: 2026-02-02
tags: ["nodejs", "javascript", "backend", "streams"]
draft: false
cover: "./covers/nodejs-streams.svg"
coverAlt: "Node.js 流处理完全指南封面"
---

Node.js 的 Stream（流）是处理大规模数据的核心抽象。无论是读取大文件、处理 HTTP 请求还是实时数据管道，流都能让你以极低的内存消耗完成任务。理解流的工作原理是成为 Node.js 高手的必经之路。

## 四种基本流类型

Node.js 提供四种流：

- **Readable**：可读流，如 `fs.createReadStream()`
- **Writable**：可写流，如 `fs.createWriteStream()`
- **Duplex**：双工流，如 TCP Socket
- **Transform**：转换流，如 `zlib.createGzip()`

## 为什么使用流

假设你需要处理一个 2GB 的日志文件。直接 `fs.readFile()` 会把整个文件加载到内存，很可能导致 OOM。而使用流，数据以小块（chunk）的方式逐步处理：

```javascript
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream('huge-log.txt'),
});

rl.on('line', (line) => {
  if (line.includes('ERROR')) {
    console.log(line);
  }
});
```

## 管道（Pipeline）

`pipeline()` 是组合多个流的推荐方式，它能正确处理错误传播和资源清理：

```javascript
const { pipeline } = require('stream/promises');
const zlib = require('zlib');

await pipeline(
  fs.createReadStream('input.txt'),
  zlib.createGzip(),
  fs.createWriteStream('input.txt.gz')
);
```

## 背压（Backpressure）

当写入速度跟不上读取速度时，流机制会自动暂停读取，等待写入端消化完数据后再继续。这就是背压机制，它防止了内存无限增长。

## Web Streams API

Node.js 18+ 也支持了 Web Streams API，与浏览器端保持一致。新项目可以考虑使用 `ReadableStream` 和 `WritableStream`，实现前后端流处理逻辑的复用。掌握流思维，能让你的 Node.js 应用在处理大数据量时游刃有余。
