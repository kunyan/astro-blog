---
title: "前端状态管理方案对比"
description: "从 Redux 到 Zustand，选择适合你项目的状态管理方案"
pubDate: 2026-04-18
tags: ["state-management", "react", "frontend", "zustand"]
draft: false
cover: "./covers/state-management.svg"
coverAlt: "前端状态管理方案对比封面"
---

## 状态管理的演进

React 应用的状态管理经历了从 Redux 一统天下到百花齐放的演变。了解各种方案的设计理念和适用场景，才能为项目做出最佳选择。

## 主流方案对比

### Redux Toolkit

Redux 是最老牌的状态管理方案。Redux Toolkit（RTK）大幅简化了 Redux 的样板代码。

```typescript
import { createSlice, configureStore } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1; },
    decrement: (state) => { state.value -= 1; },
  },
});

const store = configureStore({ reducer: { counter: counterSlice.reducer } });
```

RTK 适合大型团队和复杂应用，它的中间件生态和 DevTools 支持非常完善。

### Zustand

Zustand 是一个极简的状态管理库，API 设计非常直观。它不需要 Provider 包裹组件，直接通过 Hook 使用。

```typescript
import { create } from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

// 在组件中使用
function Counter() {
  const count = useStore((state) => state.count);
  const increment = useStore((state) => state.increment);
  return <button onClick={increment}>{count}</button>;
}
```

### Jotai

Jotai 采用原子化的状态管理方式，灵感来源于 Recoil。每个状态都是独立的 atom，组件只订阅它使用的 atom。

```typescript
import { atom, useAtom } from 'jotai';

const countAtom = atom(0);
const doubledAtom = atom((get) => get(countAtom) * 2);

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

## 服务端状态

对于从服务器获取的数据，TanStack Query（原 React Query）是更好的选择。它将服务端状态与客户端状态分离，提供自动缓存、重试、轮询和乐观更新等功能。

## 如何选择

小型项目或简单状态用 React Context + useReducer 即可。中型项目推荐 Zustand 或 Jotai，简单高效。大型企业级项目使用 Redux Toolkit，享受其成熟的生态和工具链。服务端状态统一使用 TanStack Query。

## 总结

没有银弹方案，选择适合团队规模和项目复杂度的工具。不要过早引入重量级方案，也不要在复杂场景中勉强使用简单工具。
