---
title: "Python 异步编程从入门到实战"
description: "掌握 asyncio、async/await 和异步编程的核心概念"
pubDate: 2026-02-15
tags: ["python", "async", "asyncio", "backend"]
draft: false
cover: "./covers/python-async.svg"
coverAlt: "Python 异步编程从入门到实战封面"
---

Python 的异步编程在 3.5 版本引入 `async/await` 语法后变得日趋成熟。对于 I/O 密集型任务（如网络请求、文件操作、数据库查询），异步编程能显著提升吞吐量，让单个进程同时处理成千上万的并发连接。

## asyncio 基础

`asyncio` 是 Python 标准库中的异步框架，核心概念是事件循环（Event Loop）：

```python
import asyncio

async def fetch_data(url: str) -> str:
    # 模拟网络请求
    await asyncio.sleep(1)
    return f"Data from {url}"

async def main():
    result = await fetch_data("https://api.example.com")
    print(result)

asyncio.run(main())
```

## 并发执行

`asyncio.gather()` 和 `asyncio.TaskGroup` 让你并发执行多个协程：

```python
async def main():
    async with asyncio.TaskGroup() as tg:
        task1 = tg.create_task(fetch_data("url1"))
        task2 = tg.create_task(fetch_data("url2"))
        task3 = tg.create_task(fetch_data("url3"))
    # 三个请求并发执行，总耗时约 1 秒而非 3 秒
```

## 异步生成器

异步生成器适合处理流式数据：

```python
async def read_chunks(file_path: str):
    async with aiofiles.open(file_path) as f:
        async for line in f:
            yield line.strip()
```

## 常用异步库

- **aiohttp**：异步 HTTP 客户端/服务器
- **asyncpg**：高性能异步 PostgreSQL 驱动
- **aiofiles**：异步文件 I/O
- **aioredis**：异步 Redis 客户端

## 常见陷阱

避免在异步代码中调用阻塞函数（如 `time.sleep()`、同步数据库操作），这会阻塞整个事件循环。如果必须调用阻塞代码，使用 `asyncio.to_thread()` 将其放到线程池中执行。

## 与多线程的对比

异步编程适合 I/O 密集型任务，多线程适合 CPU 密集型任务。在实际项目中，两者往往需要配合使用。Python 的 `asyncio` 生态已经非常成熟，值得在新项目中优先考虑。
