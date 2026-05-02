---
title: "前端测试策略全面指南"
description: "从单元测试到端到端测试，构建可靠的前端测试体系"
pubDate: 2026-03-22
tags: ["testing", "frontend", "vitest", "playwright"]
draft: false
cover: "./covers/testing-strategies.svg"
coverAlt: "前端测试策略全面指南封面"
---

## 测试的价值

没有测试的代码就像没有安全网的高空走钢丝。测试不仅能捕获 Bug，更重要的是给了开发者重构的信心。一个完善的测试体系是持续交付的基础。

## 测试金字塔

### 单元测试

单元测试是测试金字塔的基座，数量最多、速度最快。使用 Vitest 可以高效地测试纯函数和独立模块。

```typescript
import { describe, it, expect } from 'vitest';
import { formatPrice } from './utils';

describe('formatPrice', () => {
  it('应该正确格式化价格', () => {
    expect(formatPrice(1234.5)).toBe('¥1,234.50');
  });

  it('应该处理零值', () => {
    expect(formatPrice(0)).toBe('¥0.00');
  });
});
```

### 组件测试

使用 Testing Library 测试 React 组件的行为而非实现细节。关注用户能看到和操作的元素，而不是组件的内部状态。

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Counter from './Counter';

it('点击按钮应该增加计数', () => {
  render(<Counter />);
  fireEvent.click(screen.getByRole('button', { name: '增加' }));
  expect(screen.getByText('1')).toBeInTheDocument();
});
```

### 端到端测试

Playwright 是目前最强大的 E2E 测试框架。它支持多浏览器测试，提供自动等待和丰富的选择器 API。E2E 测试数量应该少而精，覆盖核心用户流程。

## 测试策略

不要追求 100% 的覆盖率。集中精力测试业务逻辑复杂的模块和容易出错的边界条件。对于 UI 组件，视觉回归测试（如 Chromatic）可以捕获样式变化。

Mock 和 Stub 是处理外部依赖的利器，但不要过度使用。过多的 Mock 会让测试变成对实现细节的验证，失去捕获真实 Bug 的能力。

## 总结

好的测试应该是可维护的、有意义的、快速的。从最有价值的测试开始写起，逐步扩展覆盖范围，建立团队的测试文化。
