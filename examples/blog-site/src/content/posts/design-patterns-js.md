---
title: "JavaScript 设计模式精选"
description: "深入理解常用设计模式在 JavaScript 中的应用"
pubDate: 2026-04-05
tags: ["javascript", "design-patterns", "architecture", "oop"]
draft: false
cover: "./covers/design-patterns-js.svg"
coverAlt: "JavaScript 设计模式精选封面"
---

## 设计模式的意义

设计模式是前人总结的解决特定问题的最佳实践。理解设计模式不仅能帮你写出更优雅的代码，更重要的是提供了一套通用的词汇表，让团队沟通更高效。

## 创建型模式

### 单例模式

确保一个类只有一个实例，并提供全局访问点。在 JavaScript 中，ES 模块本身就是单例的。

```javascript
class Database {
  static #instance = null;
  
  static getInstance() {
    if (!Database.#instance) {
      Database.#instance = new Database();
    }
    return Database.#instance;
  }
  
  constructor() {
    if (Database.#instance) {
      throw new Error('使用 getInstance() 获取实例');
    }
    this.connection = createConnection();
  }
}
```

### 工厂模式

将对象的创建逻辑封装起来，根据条件创建不同类型的对象。

```javascript
function createNotification(type, message) {
  const notifications = {
    email: new EmailNotification(message),
    sms: new SMSNotification(message),
    push: new PushNotification(message),
  };
  return notifications[type] ?? new EmailNotification(message);
}
```

## 结构型模式

### 代理模式

Proxy 对象可以拦截并自定义基本操作。ES6 的 Proxy API 让代理模式的实现变得非常优雅。

```javascript
const createReactiveObject = (target, onChange) => {
  return new Proxy(target, {
    set(obj, prop, value) {
      obj[prop] = value;
      onChange(prop, value);
      return true;
    }
  });
};
```

## 行为型模式

### 观察者模式

定义对象间的一对多依赖关系，当一个对象状态改变时，所有依赖者都会收到通知。EventEmitter 和 DOM 事件都是观察者模式的实现。

### 策略模式

定义一组算法，将每个算法封装起来，使它们可以互相替换。这让算法的变化独立于使用它的客户端。

```javascript
const validators = {
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  phone: (value) => /^\d{11}$/.test(value),
  required: (value) => value !== '' && value != null,
};

function validate(value, rules) {
  return rules.every(rule => validators[rule](value));
}
```

## 总结

设计模式不是教条，而是工具。在 JavaScript 中，很多传统设计模式由于语言的灵活性可以有更简洁的实现。关键是理解每个模式解决的核心问题，在合适的场景中灵活运用。
