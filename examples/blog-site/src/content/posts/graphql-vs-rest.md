---
title: "GraphQL vs REST：如何选择"
description: "深入对比两种 API 设计范式的优缺点和适用场景"
pubDate: 2026-03-10
tags: ["graphql", "rest", "api-design", "architecture"]
draft: false
cover: "./covers/graphql-vs-rest.svg"
coverAlt: "GraphQL vs REST 如何选择封面"
---

GraphQL 和 REST 是当前最主流的两种 API 设计范式。它们各有优势，选择哪种取决于项目的具体需求。本文从多个维度对比两者，帮你做出更合理的技术决策。

## REST 的优势

REST 基于 HTTP 协议的语义，使用标准的 HTTP 方法和状态码：

```
GET    /api/users/123
POST   /api/users
PUT    /api/users/123
DELETE /api/users/123
```

REST 的优势在于简单直观、HTTP 缓存天然支持、工具链成熟，大多数开发者都熟悉 REST 风格的 API。

## GraphQL 的优势

GraphQL 允许客户端精确指定需要的数据：

```graphql
query {
  user(id: "123") {
    name
    email
    posts(last: 5) {
      title
      publishedAt
    }
  }
}
```

一次请求获取所有需要的数据，避免了 REST 中常见的过度获取（Over-fetching）和不足获取（Under-fetching）问题。

## 数据获取效率

REST 中，获取一个页面的数据可能需要多次请求。GraphQL 只需一次请求即可获取所有关联数据。这在移动端网络环境较差时优势明显。

## 缓存对比

REST 天然利用 HTTP 缓存机制，CDN 友好。GraphQL 由于使用 POST 请求，HTTP 缓存不适用，需要借助 Apollo Client 等工具实现客户端缓存。

## 类型系统

GraphQL 内置强类型的 Schema 定义语言，提供自文档化的 API。REST 需要借助 OpenAPI/Swagger 来实现类似效果。

## 实际选择建议

**选 REST**：公开 API、简单的 CRUD 应用、团队 REST 经验丰富、需要 HTTP 缓存。

**选 GraphQL**：复杂的关联数据查询、多端（Web/Mobile/TV）共用 API、前端驱动的开发团队、数据需求频繁变化。

两者也可以共存：核心业务用 REST，面向前端的 BFF 层用 GraphQL 聚合数据。技术选择没有绝对的对错，关键是匹配团队和项目的实际需求。
