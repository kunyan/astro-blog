---
title: "Web 安全防御实战指南"
description: "理解常见 Web 安全威胁及其防御策略"
pubDate: 2026-04-08
tags: ["security", "web", "xss", "csrf"]
draft: false
cover: "./covers/web-security.svg"
coverAlt: "Web 安全防御实战指南封面"
---

## 安全意识

Web 安全不是安全团队的专属责任，每个开发者都应该了解常见的安全威胁和防御手段。一次安全事故可能导致用户数据泄露、品牌信誉受损甚至法律风险。

## 常见攻击类型

### XSS（跨站脚本攻击）

XSS 攻击通过向页面注入恶意脚本来窃取用户信息。分为存储型、反射型和 DOM 型三种。

```javascript
// 危险：直接将用户输入插入 DOM
element.innerHTML = userInput;

// 安全：使用 textContent 或转义
element.textContent = userInput;
// 或使用 DOMPurify 库
element.innerHTML = DOMPurify.sanitize(userInput);
```

防御措施包括：对输出进行 HTML 转义，设置 `Content-Security-Policy` 头，使用 `HttpOnly` 标志保护 Cookie。

### CSRF（跨站请求伪造）

CSRF 攻击利用用户已认证的会话，在用户不知情的情况下执行恶意操作。

防御措施：使用 CSRF Token，验证 `Origin` 和 `Referer` 头，为 Cookie 设置 `SameSite` 属性。

### SQL 注入

虽然现代 ORM 框架已经大幅降低了 SQL 注入的风险，但直接拼接 SQL 语句的场景仍然存在。

```javascript
// 危险：字符串拼接
const query = `SELECT * FROM users WHERE id = ${userId}`;

// 安全：参数化查询
const query = 'SELECT * FROM users WHERE id = $1';
const result = await db.query(query, [userId]);
```

## 安全头部配置

```
Content-Security-Policy: default-src 'self'; script-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## HTTPS 与传输安全

所有生产环境的 Web 应用都必须使用 HTTPS。Let's Encrypt 提供免费的 TLS 证书。配置 HSTS 头可以防止 SSL 剥离攻击。

## 依赖安全

第三方依赖是安全漏洞的重要来源。定期运行 `npm audit` 检查已知漏洞，使用 Dependabot 或 Renovate 自动更新依赖。锁定依赖版本，避免供应链攻击。

## 总结

安全是一个持续的过程，需要在开发的每个环节中贯彻。从代码审查到自动化安全扫描，建立多层防御体系才能有效保护应用和用户。
