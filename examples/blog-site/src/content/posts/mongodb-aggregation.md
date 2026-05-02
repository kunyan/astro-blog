---
title: "MongoDB 聚合管道实战"
description: "掌握 MongoDB Aggregation Pipeline 的核心操作和优化技巧"
pubDate: 2026-04-01
tags: ["mongodb", "database", "nosql", "aggregation"]
draft: false
cover: "./covers/mongodb-aggregation.svg"
coverAlt: "MongoDB 聚合管道实战封面"
---

## 什么是聚合管道

MongoDB 的聚合管道（Aggregation Pipeline）是一种强大的数据处理框架。数据通过一系列阶段（Stage）进行流式处理，每个阶段对输入文档进行转换，并将结果传递给下一个阶段。这类似于 Unix 管道的概念。

## 核心阶段

### $match - 过滤

`$match` 阶段用于过滤文档，类似于 `find` 方法。尽早使用 `$match` 可以减少后续阶段处理的数据量。

```javascript
db.orders.aggregate([
  { $match: { status: "completed", createdAt: { $gte: new Date("2026-01-01") } } }
]);
```

### $group - 分组聚合

`$group` 是聚合管道最核心的阶段，可以按指定字段分组并计算聚合值。

```javascript
db.orders.aggregate([
  { $match: { status: "completed" } },
  { $group: {
      _id: "$category",
      totalRevenue: { $sum: "$amount" },
      avgOrderValue: { $avg: "$amount" },
      orderCount: { $sum: 1 }
  }},
  { $sort: { totalRevenue: -1 } }
]);
```

### $lookup - 关联查询

`$lookup` 实现了类似 SQL JOIN 的功能，可以关联其他集合的数据。

```javascript
{ $lookup: {
    from: "users",
    localField: "userId",
    foreignField: "_id",
    as: "userInfo"
}}
```

### $project 和 $addFields

`$project` 用于选择和重塑输出字段，`$addFields` 用于添加计算字段。两者配合使用可以精确控制输出文档的结构。

## 性能优化

聚合管道的性能优化遵循几个关键原则。首先，将 `$match` 和 `$sort` 放在管道的前面，这样可以利用索引。其次，使用 `$project` 尽早排除不需要的字段，减少内存占用。

当数据量超过 100MB 时，默认的内存限制会导致聚合失败。可以使用 `allowDiskUse: true` 允许将中间结果写入磁盘，但这会影响性能。

## 实际应用

聚合管道在数据分析、报表生成和数据迁移等场景中非常有用。结合 `$facet` 阶段可以在一次查询中执行多个聚合操作，非常适合构建仪表板类应用。

## 总结

掌握聚合管道是使用 MongoDB 进行复杂数据查询的关键。从简单的分组统计开始，逐步学习更多阶段操作符，最终能够构建出满足各种业务需求的数据处理管道。
