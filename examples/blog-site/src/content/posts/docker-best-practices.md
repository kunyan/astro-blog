---
title: "Docker 容器化最佳实践"
description: "构建高效、安全的 Docker 镜像和容器化工作流"
pubDate: 2026-02-22
tags: ["docker", "devops", "containerization", "deployment"]
draft: false
cover: "./covers/docker-best-practices.svg"
coverAlt: "Docker 容器化最佳实践封面"
---

Docker 已经成为现代软件开发和部署的标准工具。但仅仅会写 Dockerfile 远远不够，掌握最佳实践才能构建出高效、安全且可维护的容器化应用。

## 多阶段构建

多阶段构建（Multi-stage Build）是减小镜像体积的关键技术：

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 运行阶段
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/main.js"]
```

构建产物与开发依赖分离，最终镜像只包含运行所需的文件。

## 镜像层优化

Docker 镜像由多层组成，每条指令创建一层。优化策略：

1. **合并 RUN 指令**：减少层数
2. **合理排序指令**：变化频率低的放前面，充分利用缓存
3. **使用 .dockerignore**：排除不需要的文件

## 安全实践

- 使用非 root 用户运行容器：`USER node`
- 选择最小基础镜像：`alpine` 或 `distroless`
- 定期扫描镜像漏洞：`docker scout` 或 `trivy`
- 不在镜像中存储敏感信息，使用 secrets 或环境变量

## 健康检查

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/health || exit 1
```

健康检查让编排工具能自动检测和替换不健康的容器。

## Docker Compose

开发环境推荐使用 Docker Compose 管理多容器应用。定义好 `docker-compose.yml` 后，一条命令启动整个开发环境。利用 `volumes` 挂载源码实现热重载，用 `depends_on` 管理服务依赖。

## 总结

好的容器化实践能让你的 CI/CD 流水线更快、部署更可靠、系统更安全。从小镜像、多阶段构建、安全扫描这些基础做起，逐步完善你的容器化工作流。
