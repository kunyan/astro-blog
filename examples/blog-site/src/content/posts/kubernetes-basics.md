---
title: "Kubernetes 基础概念"
description: "深入理解 Kubernetes 核心组件与容器编排的基本原理"
pubDate: 2026-02-08
tags: ["devops", "kubernetes"]
draft: false
cover: "./covers/kubernetes-basics.svg"
coverAlt: "Kubernetes 基础概念封面"
---

## 为什么需要容器编排

当应用从单体架构迁移到容器化部署后，管理成百上千个容器实例成为巨大挑战。手动管理容器的启停、扩缩容、网络配置和故障恢复既耗时又容易出错。Kubernetes 正是为解决这些问题而生的容器编排平台。

## 核心概念详解

### Pod：最小调度单元

Pod 是 Kubernetes 调度的基本单位，它封装了一个或多个紧密关联的容器。同一 Pod 内的容器共享网络命名空间和存储卷，可以通过 localhost 直接通信。设计 Pod 时应遵循单一职责原则，主容器负责业务逻辑，Sidecar 容器处理日志、监控等辅助功能。

### Deployment：声明式管理

Deployment 控制器通过声明式配置管理 Pod 的生命周期。你只需描述期望状态——运行几个副本、使用什么镜像版本——Kubernetes 就会自动将集群调整到目标状态。滚动更新策略确保版本升级时服务不中断，`maxSurge` 和 `maxUnavailable` 参数可以精细控制更新节奏。

### Service：服务发现与负载均衡

由于 Pod 的 IP 是临时分配的，Service 提供了稳定的访问入口。ClusterIP 类型用于集群内部通信，NodePort 将服务暴露到节点端口，LoadBalancer 在云环境中自动创建外部负载均衡器。Headless Service 则允许客户端直接发现所有后端 Pod。

### ConfigMap 与 Secret

ConfigMap 用于存储非敏感配置数据，Secret 用于管理密码、令牌等敏感信息。两者都支持以环境变量或挂载文件的方式注入 Pod，实现配置与代码的分离。

## 控制平面架构

API Server 是集群的统一入口，所有组件通过它进行通信。etcd 作为分布式键值存储保存集群状态。Scheduler 根据资源需求、亲和性规则将 Pod 调度到合适的节点。Controller Manager 持续监控集群状态，驱动实际状态向期望状态收敛。

## 入门建议

初学者推荐使用 Minikube 或 Kind 在本地搭建单节点集群进行实验。从创建一个简单的 Deployment 开始，逐步学习 Service 暴露、ConfigMap 配置注入、HPA 自动扩缩容等进阶特性，循序渐进地掌握 Kubernetes 生态。
