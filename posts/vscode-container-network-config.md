# 解决 VSCode 容器开发中的网络难题：自动代理与内网直连方案

## 1. 痛点描述

在 Windows (WSL2 / Docker Desktop) 环境下使用 VSCode Dev Containers 进行开发时，开发者通常面临“双路网络”冲突：
1. **外网需求**：访问 GitHub、下载各种语言的依赖包，需要配置指向宿主机的代理（如 Clash/v2rayN）。
2. **内网需求**：访问公司内部代码仓库、API 或镜像站，必须绕过代理进行直连。

**核心挑战：**
*   **宿主机 IP 变动**：WSL2 每次重启后，宿主机在容器侧的 IP 都会变化，硬编码代理地址极其麻烦。
*   **代理污染**：配置了全量代理后，内网域名被错误地转发到外网服务器。
*   **环境隔离**：容器内的 `/etc/hosts` 在重建后会失效。

---

## 2. 核心原理：找准宿主机的“真身”

在 Docker Desktop (WSL2 Backend) 中，容器内存在多个虚拟网卡。
*   **错误做法**：读取 `/etc/resolv.conf` 中的 `nameserver`。这通常是 `10.255.255.254`，它只是一个 DNS 代理，不运行你的代理软件。
*   **正确做法**：查询 Linux 内核路由表，寻找 **默认网关 (Default Gateway)**。这个网关 IP 才是宿主机在虚拟网络中的投影，也是代理软件监听的真实地址。

---

## 3. 终极解决方案

### 3.1 容器内：动态配置代理脚本
将以下代码片段加入容器的 `~/.bashrc` 中。该脚本能自动侦测网关 IP，并精准配置代理与排除列表。

```bash
# =================================================
# 自动获取宿主机 IP 并配置代理环境变量
# =================================================

# 1. 获取宿主机在虚拟网络中的真实 IP (默认网关)
# 逻辑：优先询问内核去往公网的路径，其次读取内核路由表文件
export PROXY_SERVER_IP=$(ip route get 8.8.8.8 2>/dev/null | grep -oP 'via \K\S+' || \
    awk '$2 == "00000000" {printf "%d.%d.%d.%d\n", strtonum("0x"substr($3,7,2)), strtonum("0x"substr($3,5,2)), strtonum("0x"substr($3,3,2)), strtonum("0x"substr($3,1,2))}' /proc/net/route | head -n 1)
#可以#export test_ip_2=$(python3 -c "import socket, struct; print(socket.inet_ntoa(struct.pack('<L', int([line.split()[2] for line in open('/proc/net/route').readlines() if line.split()[1] == '00000000'][0], 16))))" 2>/dev/null)
#可以#export test_ip=$(ip route get 8.8.8.8 2>/dev/null | grep -oP 'via \K\S+' || ip route show | grep default | awk '{print $3}' | head -n 1)
#不行#export test_ip_1=$(ip addr show eth0 | grep "inet " | awk '{print $2}' | cut -d/ -f1 | sed 's/[0-9]*$/1/')
#不行#export test_ip_3=$(grep nameserver /etc/resolv.conf | awk '{print $2}')

export PROXY_SERVER_PORT="7897" # 你的代理软件端口

# 2. 校验 IP 并应用配置
if [[ -n "$PROXY_SERVER_IP" && "$PROXY_SERVER_IP" == 172* ]]; then
    export PROXY_URL="http://${PROXY_SERVER_IP}:${PROXY_SERVER_PORT}"
    
    export http_proxy="${PROXY_URL}"
    export https_proxy="${PROXY_URL}"
    export ALL_PROXY="${PROXY_URL}"
    export HTTP_PROXY="${PROXY_URL}"
    export HTTPS_PROXY="${PROXY_URL}"
    
    # 3. 关键：绕过公司内网地址 (支持 IP 段和域名后缀)
    # 请根据实际情况修改 internal.example.com
    export no_proxy="localhost,127.0.0.1,::1,10.*,172.16.*,192.168.*,.example.com,internal.example.com"
    export NO_PROXY=$no_proxy
    
    echo "Container Proxy set to: $PROXY_URL"
fi
```

### 3.2 容器配置：持久化内网 Hosts
为了避免每次手动修改 `/etc/hosts`，在项目的 `.devcontainer/devcontainer.json` 中配置域名映射：
```json
{
    "name": "My Dev Environment",
    "runArgs": [
        "--add-host=internal.service.example.com:10.x.x.x"
    ]
}
```
或者在容器/etc/hosts文件中加入以下配置
```bash
10.x.x.x   internal.service.example.com
```

### 3.3 宿主机：打通入站权限
即使容器配置正确，宿主机的安全防火墙也可能拦截请求：
1. **允许局域网连接**：在 Windows 代理软件中开启 **"Allow LAN"**。
2. **放行防火墙端口**：以管理员身份运行 PowerShell，确保容器流量能触达代理端口：
   ```powershell
   New-NetFirewallRule -DisplayName "Allow DevContainer Proxy" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 7897
   ```

---

## 4. 验证测试

配置完成后，开启一个新的终端，执行以下命令验证：

1. **验证 IP 获取**：
   `echo $PROXY_SERVER_IP` —— 应输出 `172.x.x.x` 网段的地址。
   
2. **测试外网连接（走代理）**：
   `curl -I https://www.google.com` —— 应返回 `200 OK`。

3. **测试内网直连（绕过代理）**：
   `curl -v http://internal.service.example.com`
   *   **成功标志**：日志显示 `* Trying 10.x.x.x:80...` 且直接连接成功。
   *   **失败标志**：日志显示 `* Trying 172.x.x.x:7897...`，说明 `no_proxy` 未生效。

---

## 5. 小结

处理 Dev Container 网络问题的精髓在于：**动态感知网关** + **精细化域名过滤**。通过脚本自动化获取宿主机 IP，不仅解决了 IP 变动的烦恼，也通过 `no_proxy` 确保了内网开发环境的稳定性。

---
