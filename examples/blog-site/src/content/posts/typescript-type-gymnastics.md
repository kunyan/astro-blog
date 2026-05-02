---
title: "TypeScript 类型体操入门指南"
description: "掌握 TypeScript 高级类型编程技巧，从条件类型到递归类型"
pubDate: 2026-01-10
tags: ["typescript", "type-system", "frontend"]
draft: false
cover: "./covers/typescript-type-gymnastics.svg"
coverAlt: "TypeScript 类型体操入门指南封面"
---

TypeScript 的类型系统是图灵完备的，这意味着你可以在类型层面实现几乎任何计算逻辑。社区将这种高级类型编程戏称为"类型体操"。虽然日常开发中未必需要最复杂的技巧，但掌握核心概念能让你写出更安全、更优雅的代码。

## 条件类型

条件类型是类型体操的基础，语法类似三元表达式：

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">; // true
type B = IsString<42>;      // false
```

## infer 关键字

`infer` 让我们能在条件类型中提取子类型：

```typescript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type UnpackPromise<T> = T extends Promise<infer U> ? U : T;
```

这在处理函数返回值、Promise 解包等场景中极为实用。

## 模板字面量类型

TypeScript 4.1 引入的模板字面量类型可以在类型层面进行字符串操作：

```typescript
type EventName<T extends string> = `on${Capitalize<T>}`;
type ClickEvent = EventName<"click">; // "onClick"
```

## 递归类型

递归类型可以处理深层嵌套的数据结构：

```typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};
```

## 实用内置工具类型

TypeScript 内置了许多常用的工具类型：`Partial<T>`、`Required<T>`、`Pick<T, K>`、`Omit<T, K>`、`Record<K, V>` 等。理解它们的实现原理，有助于你在需要时创建自定义工具类型。

## 建议

类型体操很有趣，但不要过度使用。项目中的类型应当服务于开发体验和代码安全性。如果一个类型表达式让团队中的大多数人都看不懂，那可能需要重新考虑设计方案。好的类型设计应该是自文档化的。
