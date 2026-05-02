---
title: "Go 并发模式实战"
description: "深入理解 Goroutine、Channel 和常见并发模式"
pubDate: 2026-02-08
tags: ["go", "concurrency", "backend", "goroutine"]
draft: false
cover: "./covers/go-concurrency.svg"
coverAlt: "Go 并发模式实战封面"
---

Go 语言的并发支持是其最大卖点之一。Goroutine 比线程更轻量，Channel 让通信变得安全直观。Go 的并发哲学是"不要通过共享内存来通信，而要通过通信来共享内存"。

## Goroutine 基础

Goroutine 是 Go 运行时管理的轻量级线程。创建一个 Goroutine 只需在函数调用前加 `go` 关键字：

```go
go func() {
    fmt.Println("Hello from goroutine")
}()
```

一个 Goroutine 的初始栈仅有几 KB，可以轻松创建数十万个。

## Channel 通信

Channel 是 Goroutine 之间通信的管道：

```go
ch := make(chan string)

go func() {
    ch <- "消息" // 发送
}()

msg := <-ch // 接收
```

带缓冲的 Channel `make(chan int, 10)` 允许在缓冲区未满时非阻塞发送。

## 常见并发模式

**Fan-out/Fan-in**：将任务分发到多个 Goroutine 并行处理，然后汇总结果。适用于 CPU 密集型或 I/O 密集型的批量处理。

**Worker Pool**：固定数量的 Worker 从任务队列中取任务执行：

```go
func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        results <- j * 2
    }
}
```

**Select 多路复用**：`select` 语句让你同时等待多个 Channel：

```go
select {
case msg := <-ch1:
    handle(msg)
case msg := <-ch2:
    handle(msg)
case <-time.After(5 * time.Second):
    fmt.Println("timeout")
}
```

## Context 控制

`context.Context` 用于控制 Goroutine 的生命周期，支持取消、超时和截止时间。这是编写健壮并发代码的关键工具。在所有可能长时间运行的操作中传递 Context，确保资源能被及时释放。

## 注意事项

并发编程中最常见的错误是 Goroutine 泄漏。确保每个 Goroutine 都有明确的退出路径。使用 `go vet` 和竞态检测器 `-race` 来发现潜在问题。
