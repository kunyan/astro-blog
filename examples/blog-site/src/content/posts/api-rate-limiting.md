---
title: "API 限流策略与实现"
description: "深入理解各种限流算法及其在生产环境中的应用"
pubDate: 2026-04-15
tags: ["api", "rate-limiting", "backend", "system-design"]
draft: false
cover: "./covers/api-rate-limiting.svg"
coverAlt: "API 限流策略与实现封面"
---

## 为什么需要限流

API 限流是保护服务稳定性的第一道防线。没有限流的 API 就像没有红绿灯的十字路口——流量一大就会崩溃。限流可以防止恶意攻击、保护下游服务、确保公平使用资源。

## 常见限流算法

### 固定窗口计数器

最简单的限流算法。将时间划分为固定窗口（如每分钟），在每个窗口内计数请求次数，超过阈值则拒绝请求。

```python
import time
from collections import defaultdict

class FixedWindowLimiter:
    def __init__(self, max_requests, window_seconds):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.counters = defaultdict(int)
    
    def is_allowed(self, client_id):
        window = int(time.time() / self.window_seconds)
        key = f"{client_id}:{window}"
        self.counters[key] += 1
        return self.counters[key] <= self.max_requests
```

缺点是存在边界问题：在窗口切换瞬间可能出现突发流量。

### 滑动窗口日志

记录每个请求的时间戳，统计窗口内的请求数量。解决了固定窗口的边界问题，但内存消耗较大。

### 令牌桶算法

以固定速率向桶中添加令牌，每个请求消耗一个令牌。桶满时丢弃多余的令牌。这种算法允许一定程度的突发流量，同时限制了平均速率。

### 漏桶算法

请求进入一个固定容量的队列，以恒定速率处理。超出队列容量的请求被丢弃。漏桶算法输出的流量非常平滑。

## 分布式限流

单机限流只能保护单个节点。在微服务架构中，需要使用 Redis 等集中式存储来实现分布式限流。

```lua
-- Redis Lua 脚本实现滑动窗口限流
local key = KEYS[1]
local window = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
local count = redis.call('ZCARD', key)

if count < limit then
    redis.call('ZADD', key, now, now .. math.random())
    redis.call('EXPIRE', key, window)
    return 1
end
return 0
```

## 最佳实践

返回 429 状态码时，附带 `Retry-After` 头告知客户端何时可以重试。在响应头中提供 `X-RateLimit-Limit`、`X-RateLimit-Remaining` 等信息，帮助客户端合理控制请求频率。
