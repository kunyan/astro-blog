---
title: "PostgreSQL 索引优化策略"
description: "深入理解 PostgreSQL 索引类型与查询优化技巧"
pubDate: 2026-02-28
tags: ["postgresql", "database", "performance", "sql"]
draft: false
cover: "./covers/postgresql-indexing.svg"
coverAlt: "PostgreSQL 索引优化策略封面"
---

索引是数据库性能优化中最重要的工具。一个合适的索引可以让查询速度提升数个数量级，而错误的索引策略则可能拖慢写入性能。PostgreSQL 提供了丰富的索引类型，理解它们的适用场景至关重要。

## B-Tree 索引

B-Tree 是最常用的默认索引类型，适用于等值查询和范围查询：

```sql
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_orders_date ON orders (created_at DESC);
```

B-Tree 支持 `=`、`<`、`>`、`BETWEEN`、`IN`、`IS NULL` 等操作符。

## 复合索引

当查询经常同时过滤多个列时，复合索引比多个单列索引更高效：

```sql
CREATE INDEX idx_orders_user_date
ON orders (user_id, created_at DESC);
```

注意列的顺序很重要：最左前缀原则意味着这个索引也能加速仅按 `user_id` 过滤的查询。

## GIN 索引

GIN（Generalized Inverted Index）适用于包含多个值的数据类型，如数组、JSONB 和全文搜索：

```sql
CREATE INDEX idx_posts_tags ON posts USING GIN (tags);
CREATE INDEX idx_data_jsonb ON events USING GIN (metadata);
```

## 部分索引

只对满足条件的行建立索引，减小索引体积：

```sql
CREATE INDEX idx_active_users
ON users (email) WHERE active = true;
```

如果大部分查询都只关心活跃用户，部分索引能显著减少索引大小和维护开销。

## EXPLAIN ANALYZE

优化索引的前提是理解查询执行计划：

```sql
EXPLAIN ANALYZE
SELECT * FROM orders
WHERE user_id = 123 AND created_at > '2026-01-01';
```

关注 `Seq Scan`（全表扫描）、`Index Scan`、`Bitmap Index Scan` 等节点，理解查询的实际执行路径。

## 维护建议

定期执行 `VACUUM` 和 `ANALYZE` 保持统计信息准确。监控未使用的索引并及时清理，因为每个索引都会增加写入开销。使用 `pg_stat_user_indexes` 视图查看索引使用情况，做到心中有数。
