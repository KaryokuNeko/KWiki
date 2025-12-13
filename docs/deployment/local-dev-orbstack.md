# 本地开发环境配置指南（macOS + OrbStack）

本文档介绍如何在 macOS 上使用 OrbStack 搭建 K-Wiki 开发环境。Next.js 运行在宿主机，后端服务运行在 Docker。

## 前置条件

- macOS 12.0+
- OrbStack 已安装并运行
- Node.js 18+ 已安装
- pnpm 8+ 已安装
- 已克隆项目代码

## 快速开始

### 1. 启动后端服务

```bash
# 启动 PostgreSQL、Keycloak 和 MinIO
docker compose up -d postgres keycloak minio

# 查看服务状态
docker compose ps
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.orbstack-dev.example .env.local

# 生成 NextAuth Secret
openssl rand -base64 32

# 编辑配置文件，更新 NEXTAUTH_SECRET
nano .env.local
```

**重要**：`.env.local` 中的 `KEYCLOAK_ISSUER` 使用 HTTP（不是 HTTPS）：
```bash
KEYCLOAK_ISSUER=http://keycloak.k-wiki.orb.local/realms/k-wiki
```

这是因为 OrbStack 的自签名证书会被 Node.js 拒绝。

### 3. 配置 Keycloak

访问 [https://keycloak.k-wiki.orb.local](https://keycloak.k-wiki.orb.local) 并完成以下配置：

1. 使用默认账号登录（admin/admin123）
2. 创建 realm：`k-wiki`
3. 创建 client：`k-wiki-client`
   - Client Protocol: `openid-connect`
   - Client authentication: `On`
   - Valid redirect URIs: `http://localhost:3000/api/auth/callback/keycloak`
   - Web origins: `http://localhost:3000`
4. 获取 Client Secret 并更新到 `.env.local` 的 `KEYCLOAK_CLIENT_SECRET`
5. 创建测试用户

详细步骤：[Keycloak Setup Guide](../getting-started/keycloak-setup.md)

### 4. 安装依赖并启动

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问：[http://localhost:3000](http://localhost:3000)

## 访问点

| 服务 | URL |
|-----|-----|
| Next.js 应用 | http://localhost:3000 |
| Keycloak 管理控制台 | https://keycloak.k-wiki.orb.local |
| MinIO Console | https://minio.k-wiki.orb.local:9001 |
| PostgreSQL | postgres.k-wiki.orb.local:5432 |

## 常用命令

```bash
# 查看后端服务日志
docker compose logs -f postgres keycloak minio

# 重启服务
docker compose restart keycloak

# 停止后端服务
docker compose down

# 运行 linter
pnpm lint

# 进入 PostgreSQL Shell
docker compose exec postgres psql -U kwiki -d k_wiki
```

## OrbStack 特性

### 自动域名

OrbStack 自动为容器提供 `.orb.local` 域名：
- `postgres.k-wiki.orb.local`
- `keycloak.k-wiki.orb.local`
- `minio.k-wiki.orb.local`

### HTTPS 自签名证书

OrbStack 提供的域名使用自签名证书。在浏览器中可以直接访问（忽略证书警告），但在 Node.js 中需要使用 HTTP。

## 相关文档

- [本地开发（标准 Docker）](./local-dev-docker.md)
- [生产环境部署](./standard.md)
- [常见问题](./faq.md)
