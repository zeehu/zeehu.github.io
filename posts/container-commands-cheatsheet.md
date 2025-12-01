---
title: Docker & Podman 容器操作命令速查手册
date: 2025-11-28 12:00:00
tags: [Docker, Podman, Containers, CLI, Cheatsheet]
categories: [DevOps]
description: 一份包含 Docker 和 Podman 常用命令的综合速查表，涵盖镜像管理、容器生命周期、日志排查及 Podman 特有指令。
---

在使用容器化技术时，无论是老牌的 **Docker** 还是新兴的 **Podman**，掌握命令行操作都是基本功。

好消息是，Podman 的 CLI 设计几乎与 Docker 完全兼容。在大多数 Linux 发行版中，你甚至可以配置 `alias docker=podman` 来无缝切换。本文整理了日常开发中最常用的命令。

> **说明**：除非特别标注，以下命令中的 `docker` 关键词均可替换为 `podman`。

## 1. 镜像管理 (Images)

镜像 (Image) 是容器的静态模板。

```bash
# 拉取镜像
# 格式: docker pull <registry>/<image>:<tag>
docker pull nginx:latest
# Podman 国内加速示例:
podman pull docker.aityp.com/library/nginx:latest

# 列出本地所有镜像
docker images
# 或者
docker image ls

# 删除镜像
docker rmi <image_id_or_name>
# 强制删除 (如果有容器正在使用该镜像)
docker rmi -f <image_id>

# 构建镜像 (在 Dockerfile 所在目录)
docker build -t my-app:v1 .

# 修改镜像标签 (Tag)
docker tag <source_image>:<tag> <new_image>:<new_tag>

# 查看镜像历史 (构建层)
docker history <image_name>
```

## 2. 容器生命周期 (Containers)

容器 (Container) 是镜像的运行实例。

### 启动与运行
```bash
# 启动容器 (最常用)
# -d: 后台运行 (Detached)
# -p: 端口映射 (宿主机端口:容器端口)
# --name: 指定容器名称
# -v: 挂载卷 (宿主机路径:容器路径)
docker run -d -p 8080:80 --name my-web -v ./html:/usr/share/nginx/html nginx:latest

# 启动一个临时容器 (退出后自动删除)
docker run --rm -it ubuntu bash
```

### 查看与控制
```bash
# 列出正在运行的容器
docker ps

# 列出所有容器 (包括已停止的)
docker ps -a

# 停止/启动/重启容器
docker stop <container_name>
docker start <container_name>
docker restart <container_name>

# 强制停止容器
docker kill <container_name>

# 删除容器 (必须先停止，或加 -f 强制)
docker rm <container_name>

# 清理所有已停止的容器
docker container prune
```

## 3. 排查与交互 (Debug & Interaction)

当容器运行不符合预期时，这些命令是你的救星。

```bash
# 查看容器日志 (非常重要)
docker logs <container_name>
# 实时跟随日志输出 (类似 tail -f)
docker logs -f <container_name>
# 查看最近 100 行
docker logs --tail 100 <container_name>

# 进入容器内部 Shell
# -it: 交互式终端
docker exec -it <container_name> /bin/bash
# 如果容器里没有 bash，尝试 sh
docker exec -it <container_name> /bin/sh

# 查看容器详细信息 (IP、挂载、环境变量等 JSON 格式)
docker inspect <container_name>

# 查看容器资源占用 (CPU/内存)
docker stats
```

## 4. Podman 特有指令 (Podman Specific)

虽然 Podman 兼容 Docker，但它也有自己独有的特性，特别是在 Windows/macOS 上运行时。

### Podman Machine (Win/Mac 专用)
由于 Podman 在 Windows/Mac 上需要通过虚拟机运行 Linux 内核：

```bash
# 初始化虚拟机
podman machine init

# 启动虚拟机服务
podman machine start

# 停止虚拟机
podman machine stop

# SSH 进入虚拟机内部 (调试深层问题时用)
podman machine ssh
```

### Pods (容器组)
Podman 支持 Kubernetes 风格的 Pod (一组共享网络和存储的容器)，这是 Docker CLI 原生不具备的。

```bash
# 创建一个 Pod，并在其中映射端口
podman pod create --name my-pod -p 8080:80

# 在 Pod 中启动容器 (共享 localhost)
podman run -dt --pod my-pod --name db postgres
podman run -dt --pod my-pod --name webapp my-image

# 查看 Pod 列表
podman pod ps

# 生成 Kubernetes YAML 文件 (神器)
# 可以将现有的容器/Pod 导出为 K8s 部署文件
podman generate kube my-pod > deployment.yaml
```

## 5. 速查表对比

| 动作 | Docker 命令 | Podman 命令 | 备注 |
| :--- | :--- | :--- | :--- |
| **查看版本** | `docker version` | `podman version` | |
| **登录仓库** | `docker login` | `podman login` | 参数基本一致 |
| **拉取镜像** | `docker pull` | `podman pull` | Podman 默认支持多仓库搜索 |
| **运行容器** | `docker run` | `podman run` | Podman 无需 root 权限 (Rootless) |
| **查看进程** | `docker ps` | `podman ps` | |
| **构建镜像** | `docker build` | `podman build` | |
| **清理系统** | `docker system prune` | `podman system prune`| 清理未使用的镜像、容器、网络 |

## 总结

*   如果你习惯了 Docker，直接用 `podman` 替换命令开头的 `docker` 即可满足 99% 的需求。
*   Podman 的 `podman generate kube` 功能非常适合从单机开发向 Kubernetes 迁移。
*   在 Windows 上，记得确保 `podman machine start` 已经运行。
