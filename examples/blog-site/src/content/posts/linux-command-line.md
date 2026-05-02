---
title: "Linux 命令行高效技巧"
description: "提升开发效率的 Linux 命令行工具和技巧合集"
pubDate: 2026-03-02
tags: ["linux", "command-line", "shell", "productivity"]
draft: false
cover: "./covers/linux-command-line.svg"
coverAlt: "Linux 命令行高效技巧封面"
---

## 为什么要精通命令行

图形界面固然友好，但命令行才是开发者的效率倍增器。熟练掌握命令行工具，可以让你在文件操作、文本处理、系统管理等方面获得数量级的效率提升。

## 文本处理三剑客

### grep - 文本搜索

`grep` 是最常用的文本搜索工具。配合正则表达式，可以在海量文件中快速定位目标内容。

```bash
# 递归搜索包含 "TODO" 的文件
grep -rn "TODO" --include="*.ts" src/

# 使用正则表达式搜索
grep -E "function\s+\w+\(" src/**/*.js
```

### sed - 流编辑器

`sed` 可以对文本进行替换、删除和插入等操作，特别适合批量修改文件。

```bash
# 批量替换文件内容
sed -i 's/oldName/newName/g' src/*.ts
```

### awk - 数据处理

`awk` 是强大的文本处理语言，擅长处理结构化数据。它可以按列提取数据、进行计算和格式化输出。

## 现代命令行工具

传统工具历久弥新，但现代替代品提供了更好的用户体验。`fd` 替代 `find`，搜索速度更快且语法更简洁；`ripgrep`（rg）替代 `grep`，默认忽略 .gitignore 中的文件；`bat` 替代 `cat`，提供语法高亮和行号；`exa` 替代 `ls`，支持 Git 状态显示和树形视图。

## Shell 脚本技巧

```bash
# 使用 set -euo pipefail 增强脚本健壮性
set -euo pipefail

# 使用变量默认值
DB_HOST=${DB_HOST:-localhost}

# 并行执行任务
find . -name "*.png" | xargs -P 4 -I {} convert {} -resize 50% {}
```

## 终端复用

tmux 和 screen 允许你在一个终端窗口中管理多个会话。即使 SSH 连接断开，tmux 中的任务仍然继续运行。这对远程服务器管理来说至关重要。

## 总结

投入时间学习命令行工具的回报是巨大的。建议从日常高频操作入手，逐步替换图形界面操作，让命令行成为你的第二本能。
