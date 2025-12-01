--- 
title: Windows下使用Podman搭建Linux开发环境：VS Code容器连接与代理配置全攻略
date: 2025-11-28 10:00:00
tags: [Windows, Podman, VS Code, Docker, WSL2, Proxy, Linux]
categories: [DevOps]
description: 详细记录如何在 Windows 系统下利用 Podman 替代 Docker Desktop，配合 VS Code 实现远程容器开发，并彻底解决容器内的网络代理配置问题。
---

在 Windows 上进行 Linux 开发，Docker Desktop 曾是首选，但随着其收费策略的调整以及对系统资源的占用，开源、轻量且无守护进程（Daemonless）的 **Podman** 成为了极佳的替代方案。

本文将手把手教你如何在 Windows (WSL2) 环境下安装 Podman，使用 VS Code 连接容器，并解决最让人头疼的**容器内代理配置**问题。

## 1. 环境准备

### 前置要求
*   **Windows 10/11** (建议更新到最新版本)
*   已启用 **WSL2** (Windows Subsystem for Linux)
*   **VS Code** 安装完毕

### 开启 WSL2
如果你还未开启 WSL2，请以管理员身份运行 PowerShell 并执行：
```powershell
wsl --install
```
重启电脑后，WSL2 即准备就绪。

## 2. 安装 Podman (Windows)

Podman 在 Windows 上实际上是运行在一个定制的 WSL2 发行版中。

1.  **下载安装包**：访问 [Podman GitHub Releases](https://github.com/containers/podman/releases) 页面，下载最新的 `podman-v*-setup.exe`。
2.  **安装**：双击安装，一路默认即可。
3.  **初始化虚拟机**：
    打开终端（PowerShell 或 CMD），执行以下命令初始化 Podman 机器：
    ```powershell
podman machine init
```
4.  **启动服务**：
    ```powershell
podman machine start
```

此时，你可以运行 `podman version` 来验证安装是否成功。

## 3. 拉取镜像与启动容器

### 3.1 国内镜像加速
由于国内网络环境原因，直接从 Docker Hub 拉取镜像可能会非常慢甚至失败。我们可以使用国内的镜像加速服务，例如 `docker.aityp.com`。

在 PowerShell 中执行以下命令拉取 Ubuntu 镜像：

```powershell
# 格式: podman pull docker.aityp.com/library/<image_name>:<tag>
podman pull docker.aityp.com/library/ubuntu:latest
```

### 3.2 启动开发容器
拉取成功后，我们启动一个后台运行的容器，并将其命名为 `my-dev-box`：

```powershell
podman run -dt --name my-dev-box docker.aityp.com/library/ubuntu:latest
```

### 3.3 常见问题：命令行看不到容器？
如果你在命令行运行 `podman ps` 却看不到任何容器，或者感觉服务没有响应：
1.  **检查状态**：可能是 Podman Machine 暂停了。
2.  **使用客户端**：打开安装好的 **Podman Desktop** 客户端（GUI 界面）。
3.  **手动开启**：在界面中找到你的容器或 Podman Machine，点击 "Start" 按钮手动开启。有时候图形界面能更直观地看到报错信息。

## 4. VS Code 连接容器

1.  打开 VS Code。
2.  进入扩展市场，搜索并安装 **Dev Containers** (ms-vscode-remote.remote-containers)。
3.  点击 VS Code 左下角的绿色图标（远程状态栏）。
4.  选择 **"Attach to Running Container..."** (附加到正在运行的容器)。
5.  在弹出的列表中选择我们刚才创建的 `my-dev-box`。

VS Code 会自动在容器内安装 Server 端，片刻后，左下角显示 `Container: ubuntu` 即表示连接成功。现在打开的终端就是容器内部的 Shell 了。

## 5. 核心难点：容器内代理配置

在容器内开发时（如 `apt update`, `pip install`, `git clone`），由于网络环境限制，我们通常需要配置代理。

**痛点**：容器内的 `localhost` (127.0.0.1) 指向的是容器本身，而不是宿主机（Windows）。因此，直接填写 `127.0.0.1:7890` 是无效的。

### 第一步：获取宿主机 IP (Windows)

目前在 Podman 容器内部较难自动获取到宿主机在局域网中的正确 IP，我们需要手动查询。

1.  回到 **Windows** 的终端（PowerShell 或 CMD）。
2.  运行命令：
    ```powershell
ipconfig
```
3.  寻找你的主要网络适配器（例如 "无线局域网适配器 WLAN" 或 "以太网适配器"）。
4.  记下其中的 **IPv4 地址**（例如 `192.168.1.5` 或 `10.0.0.x`）。

> **注意**：确保你的 Windows 防火墙允许了相关端口，或者你的代理软件开启了“允许局域网连接”。

### 第二步：Windows 代理软件设置
**非常重要**：你需要确保你的代理软件（如 v2rayN, Clash 等）开启了 **"允许来自局域网的连接" (Allow LAN)**。如果不开启，容器发出的请求会被代理软件直接拒绝。

请记下代理软件显示的**局域网端口**（通常是 7890, 10809 等，具体看软件设置）。

### 第三步：配置环境变量 (临时/永久)

回到 VS Code 的**容器终端**中。

#### 临时生效（当前终端）
假设刚才查到的宿主机 IP 为 `192.168.1.5`，代理端口为 `7890`：

```bash
export hostip=192.168.1.5
export proxy_port=7890
export ALL_PROXY="http://${hostip}:${proxy_port}"
export HTTP_PROXY="http://${hostip}:${proxy_port}"
export HTTPS_PROXY="http://${hostip}:${proxy_port}"
```

#### 永久生效 (推荐)
为了避免每次都要输入，可以将配置写入 Shell 配置文件。

编辑 `~/.bashrc`：
```bash
nano ~/.bashrc
```

在文件末尾添加（请替换为你的实际 IP 和端口）：
```bash
# 宿主机 IP (通过 ipconfig 获取)
export HOST_IP=192.168.1.5 
export PROXY_PORT=7890

export http_proxy="http://${HOST_IP}:${PROXY_PORT}"
export https_proxy="http://${HOST_IP}:${PROXY_PORT}"
export all_proxy="http://${HOST_IP}:${PROXY_PORT}"

# 排除不需要代理的地址
export no_proxy="localhost,127.0.0.1,::1,.local,.internal"
```
保存退出 (`Ctrl+O`, `Enter`, `Ctrl+X`)，然后让配置生效：
```bash
source ~/.bashrc
```

### 第四步：特定工具配置

有些工具不走系统环境变量，需要单独配置。

**Git 配置：**
```bash
git config --global http.proxy http://$HOST_IP:$PROXY_PORT
git config --global https.proxy http://$HOST_IP:$PROXY_PORT
```

**APT (Ubuntu/Debian) 配置：**
如果 `apt update` 慢，需创建配置文件：
```bash
echo "Acquire::http::Proxy \"http://$HOST_IP:$PROXY_PORT\";" > /etc/apt/apt.conf.d/proxy.conf
echo "Acquire::https::Proxy \"http://$HOST_IP:$PROXY_PORT\";" >> /etc/apt/apt.conf.d/proxy.conf
```

## 6. 验证

在 VS Code 的容器终端中测试：

```bash
curl -I https://www.google.com
```
如果返回 `HTTP/1.1 200 OK`，恭喜你，你已经拥有了一个可以畅通无阻访问互联网的 Podman 开发容器！
