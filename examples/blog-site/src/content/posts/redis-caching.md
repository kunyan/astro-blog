---
title: "Redis 缓存策略详解"
description: "掌握 Redis 缓存模式、淘汰策略和常见问题的解决方案"
pubDate: 2026-03-05
tags: ["redis", "caching", "database", "performance"]
draft: false
cover: "./covers/redis-caching.svg"
coverAlt: "Redis 缓存策略详解封面"
---

Redis 作为内存数据库，以其极高的读写速度成为缓存层的首选。然而，用好 Redis 缓存远不止 `SET` 和 `GET` 那么简单。合理的缓存策略直接决定了系统的性能和稳定性。

## 常见缓存模式

**Cache Aside（旁路缓存）**：最常用的模式。读取时先查缓存，未命中则查数据库并回填缓存；写入时先更新数据库，再删除缓存。

```python
def get_user(user_id):
    cached = redis.get(f"user:{user_id}")
    if cached:
        return json.loads(cached)
    user = db.query("SELECT * FROM users WHERE id = %s", user_id)
    redis.setex(f"user:{user_id}", 3600, json.dumps(user))
    return user
```

**Write Through**：写入时同时更新缓存和数据库，保证缓存与数据库的一致性。

**Write Behind**：写入时只更新缓存，异步批量刷入数据库。吞吐量最高但有数据丢失风险。

## 缓存穿透

恶意请求查询不存在的数据，每次都穿透到数据库。解决方案：

- **布隆过滤器**：在缓存前加一层过滤
- **空值缓存**：将不存在的 key 也缓存起来，设置较短 TTL

## 缓存雪崩

大量缓存同时过期，请求涌向数据库。应对策略：

- 过期时间加随机偏移，避免同时失效
- 热点数据永不过期，后台定时刷新
- 多级缓存架构

## 缓存击穿

热点 key 失效瞬间，大量并发请求穿透。使用分布式锁（如 `SET NX`）保证只有一个请求回源，其他请求等待。

## 淘汰策略

Redis 提供多种淘汰策略：`allkeys-lru`、`volatile-lru`、`allkeys-lfu` 等。对于纯缓存场景，推荐 `allkeys-lfu`，它能保留访问频率最高的数据。合理配置 `maxmemory` 和淘汰策略，是 Redis 缓存稳定运行的基础。
