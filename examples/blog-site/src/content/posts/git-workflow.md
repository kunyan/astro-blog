---
title: "Git 工作流最佳实践"
description: "团队协作中的 Git 分支策略与提交规范"
pubDate: 2026-02-18
tags: ["git", "工具"]
draft: false
cover: "./covers/git-workflow.svg"
coverAlt: "Git 工作流最佳实践封面"
---

## 选择合适的分支策略

Git 工作流没有唯一正解，关键是根据团队规模和发布节奏选择合适的策略。常见的三种模式各有优劣，理解它们的适用场景能帮助团队避免不必要的流程摩擦。

### Git Flow

Git Flow 定义了 `main`、`develop`、`feature`、`release`、`hotfix` 五种分支类型。它适合有明确版本发布周期的项目，比如移动应用或桌面软件。但对于持续部署的 Web 应用来说，Git Flow 的流程往往显得过于繁重。

### GitHub Flow

GitHub Flow 极度简化：只有 `main` 分支和功能分支。开发者从 `main` 创建功能分支，完成后发起 Pull Request，代码审查通过即合并。这种模式适合持续部署的项目，每次合并到 `main` 都触发自动部署。

### Trunk-Based Development

主干开发要求所有开发者频繁地将小粒度变更合并到主干。通过特性开关（Feature Flag）控制未完成功能的可见性。这种模式减少了长寿命分支带来的合并冲突，但对团队的工程纪律要求更高。

## 提交信息规范

好的提交信息是项目可维护性的基石。推荐采用 Conventional Commits 规范：

```
feat(auth): add OAuth2 login support
fix(api): handle null response in user endpoint
docs(readme): update deployment instructions
refactor(core): extract validation logic to utils
```

类型前缀让团队一目了然地理解每次变更的性质，也便于自动生成 CHANGELOG。

## 代码审查要点

Pull Request 不仅是质量门禁，更是知识共享的机会。审查时应关注：逻辑正确性、边界条件处理、命名是否清晰、是否有充分的测试覆盖。避免纠结于代码风格——这些应该由 linter 自动处理。

## 实用技巧

善用 `git rebase -i` 在推送前整理提交历史，将琐碎的中间提交合并为有意义的逻辑单元。使用 `git bisect` 快速定位引入 Bug 的提交。配置 `.gitattributes` 统一团队的换行符处理，避免跨平台协作时的差异噪音。

保持分支短命（不超过两三天）、提交粒度适中、信息清晰规范，这些看似简单的习惯能显著提升团队协作效率。
