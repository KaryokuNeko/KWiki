# OrbStack Docker 集成配置指南

本文档介绍如何在 OrbStack 的 Linux 虚拟机中配置 Docker，使其连接到宿主机（macOS）的 OrbStack Docker daemon。

## 背景

OrbStack 是 macOS 上的轻量级 Docker Desktop 替代方案。它提供：
- 在 macOS 上运行 Docker daemon
- 创建 Linux 虚拟机（machines）用于开发
- Linux 虚拟机可以共享宿主机的 Docker daemon

本指南适用于在 OrbStack Linux 虚拟机中开发，但希望使用 OrbStack 宿主机 Docker daemon 的场景。

## 前提条件

### macOS 宿主机
- 已安装并运行 OrbStack
- OrbStack Docker daemon 正在运行

验证方法（在 macOS 终端中执行）：
```bash
docker info
# 应该看到 Operating System: OrbStack
```

### OrbStack Linux 虚拟机
- 已创建 OrbStack Linux 机器（如 ubuntu）
- 可以通过 SSH 或 VS Code Remote 连接
- 有 sudo 权限

## 配置步骤

### 1. 安装 Docker CLI

在 OrbStack Linux 虚拟机中安装 Docker 客户端工具：

```bash
# 更新包列表
sudo apt-get update

# 安装 Docker CLI 和相关工具
sudo apt-get install -y docker.io docker-buildx
```

**注意**：我们只需要 CLI 工具，不需要运行 Docker daemon。

### 2. 停止本地 Docker 服务

安装 Docker 包后会自动启动本地 daemon，需要停止并禁用它：

```bash
# 停止服务
sudo systemctl stop docker.socket docker.service containerd.service

# 禁用自动启动
sudo systemctl disable docker.socket docker.service containerd.service
```

### 3. 连接到 OrbStack Docker Socket

OrbStack 会自动将 Docker socket 挂载到 Linux 虚拟机的特定位置。

#### 3.1 找到 OrbStack Socket

```bash
# OrbStack 的 Docker socket 位置
ls -la /opt/orbstack-guest/run/docker.sock
```

#### 3.2 创建符号链接

将标准的 Docker socket 路径链接到 OrbStack 的 socket：

```bash
# 删除本地 socket（如果存在）
sudo rm -f /var/run/docker.sock

# 创建到 OrbStack socket 的符号链接
sudo ln -s /opt/orbstack-guest/run/docker.sock /var/run/docker.sock
```

#### 3.3 配置权限

```bash
# 设置 OrbStack socket 权限（允许所有用户访问）
sudo chmod 666 /opt/orbstack-guest/run/docker.sock
```

**生产环境建议**：使用更安全的权限配置
```bash
# 创建 docker 组并添加用户
sudo groupadd -f docker
sudo usermod -aG docker $USER

# 设置 socket 权限为 660（仅 docker 组可访问）
sudo chown root:docker /opt/orbstack-guest/run/docker.sock
sudo chmod 660 /opt/orbstack-guest/run/docker.sock

# 重新登录以应用组权限
newgrp docker
```


## 验证配置

### 检查 Docker 版本

```bash
docker --version
# 输出示例: Docker version 28.2.2, build 28.2.2-0ubuntu1~24.04.1
```

### 检查 Docker Compose

```bash
docker compose version
# 输出示例: Docker Compose version v5.0.0
```

### 验证 Docker 连接

```bash
docker info --format '{{.ServerVersion}} - {{.OperatingSystem}}'
# 输出示例: 28.3.3 - OrbStack
```

如果输出显示 "OrbStack"，说明成功连接到宿主机的 Docker daemon。

### 测试基本功能

```bash
# 查看运行中的容器
docker ps

# 查看镜像
docker images

# 拉取测试镜像
docker pull hello-world

# 运行测试容器
docker run --rm hello-world
```

## 配置文件（可选）

### 永久配置 Docker Socket 路径

创建用户级配置文件：

```bash
mkdir -p ~/.docker
cat > ~/.docker/config.json << 'EOF'
{
  "hosts": ["unix:///var/run/docker.sock"]
}
EOF
```

### Shell 环境变量

在 `~/.bashrc` 或 `~/.zshrc` 中添加：

```bash
# Docker 配置
export DOCKER_HOST=unix:///var/run/docker.sock
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
```

重新加载配置：
```bash
source ~/.bashrc  # 或 source ~/.zshrc
```

## 故障排除

### 问题：无法连接到 Docker daemon

**错误信息**：
```
Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?
```

**解决方法**：

1. 检查符号链接是否正确：
```bash
ls -la /var/run/docker.sock
# 应该指向 /opt/orbstack-guest/run/docker.sock
```

2. 检查 OrbStack socket 是否存在：
```bash
ls -la /opt/orbstack-guest/run/docker.sock
```

3. 检查 macOS 上的 OrbStack 是否运行：
```bash
# 在 macOS 终端执行
docker info
```

4. 重新创建符号链接：
```bash
sudo rm -f /var/run/docker.sock
sudo ln -s /opt/orbstack-guest/run/docker.sock /var/run/docker.sock
sudo chmod 666 /opt/orbstack-guest/run/docker.sock
```

### 问题：权限被拒绝

**错误信息**：
```
permission denied while trying to connect to the Docker daemon socket
```

**解决方法**：

```bash
# 临时解决（开发环境）
sudo chmod 666 /opt/orbstack-guest/run/docker.sock

# 或将用户添加到 docker 组（推荐）
sudo usermod -aG docker $USER
newgrp docker
```

### 问题：docker compose 命令不可用

**错误信息**：
```
docker: unknown command: docker compose
```

**解决方法**：

重新安装 Docker Compose 插件（参见步骤 4）。

### 问题：本地 Docker daemon 仍在运行

检查并停止本地服务：

```bash
# 检查进程
ps aux | grep dockerd

# 停止服务
sudo systemctl stop docker.socket docker.service containerd.service
sudo systemctl disable docker.socket docker.service containerd.service
```

## 架构说明

```
┌─────────────────────────────────────────┐
│           macOS 宿主机                   │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │      OrbStack Docker Daemon       │  │
│  │   (port: 2375, socket: ...)       │  │
│  └───────────────┬───────────────────┘  │
│                  │                      │
│                  │ 自动挂载              │
│                  │                      │
│  ┌───────────────▼───────────────────┐  │
│  │   OrbStack Linux VM (ubuntu)     │  │
│  │                                   │  │
│  │  /opt/orbstack-guest/run/        │  │
│  │    docker.sock ◄────┐             │  │
│  │                     │             │  │
│  │  /var/run/          │             │  │
│  │    docker.sock ─────┘ (符号链接)  │  │
│  │                                   │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │   Docker CLI (客户端)       │  │  │
│  │  │   - docker                  │  │  │
│  │  │   - docker compose          │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## 与标准 Docker 安装的区别

| 项目 | 标准 Docker 安装 | OrbStack 集成 |
|------|-----------------|--------------|
| Docker Daemon | 运行在 Linux VM 内 | 运行在 macOS（共享） |
| 资源占用 | 每个 VM 独立资源 | 共享宿主机资源 |
| 镜像存储 | 每个 VM 独立 | 所有 VM 共享 |
| 性能 | 较低（嵌套虚拟化）| 较高（原生 macOS）|
| 配置复杂度 | 简单 | 中等 |

## 优势

1. **资源共享**：所有 Linux VM 共享同一个 Docker daemon，节省资源
2. **镜像共享**：下载的镜像可在所有环境中使用，避免重复下载
3. **性能更好**：避免嵌套虚拟化，使用 macOS 原生 Docker
4. **统一管理**：在 macOS 上统一管理所有容器和镜像