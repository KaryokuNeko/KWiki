# 生产环境部署指南

本文档说明如何将 K-Wiki 部署到生产环境。

## 前置条件

- Docker 和 Docker Compose 已安装
- 项目代码已上传到服务器
- 域名已配置并指向服务器
- 已进入项目根目录

## 快速部署

### 1. 配置环境变量

```bash
# 复制环境变量模板
cp .env.standard.example .env

# 编辑配置文件
nano .env
```

**必填项**：

```bash
# 将 localhost 替换为你的域名
NEXTAUTH_URL=https://example.com

# 生成随机密钥
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# 数据库密码
POSTGRES_PASSWORD=your_secure_password
POSTGRES_APP_PASSWORD=your_secure_password

# MinIO 密码
MINIO_ROOT_PASSWORD=your_secure_password

# Keycloak 密码
KEYCLOAK_ADMIN_PASSWORD=your_secure_password

# 稍后从 Keycloak 获取
KEYCLOAK_CLIENT_SECRET=<待配置>
```

### 2. 配置 SSL 证书（可选）

使用 Let's Encrypt 申请证书：

```bash
sudo certbot certonly --standalone -d example.com \
  --email your-email@example.com --agree-tos
```

然后在 `docker-compose.yml` 中挂载证书：

```yaml
nginx:
  volumes:
    - /etc/letsencrypt:/etc/letsencrypt:ro
```

### 3. 启动服务

```bash
docker compose up -d --build
```

### 4. 配置 Keycloak

1. 访问 `http://your-domain:8080`
2. 创建 realm 和 client
3. 获取 client secret 并更新到 `.env` 的 `KEYCLOAK_CLIENT_SECRET`
4. 重启服务：`docker compose restart app`

详细步骤：[Keycloak Setup Guide](../getting-started/keycloak-setup.md)

### 5. 验证

访问 `https://your-domain` 查看应用是否正常运行。

## 常用命令

```bash
# 查看日志
docker compose logs -f

# 重启服务
docker compose restart

# 停止服务
docker compose down

# 更新代码后重新构建
docker compose up -d --build app
```

## 相关文档

- [本地开发（macOS + OrbStack）](./local-dev-orbstack.md)
- [本地开发（标准 Docker）](./local-dev-docker.md)
- [Keycloak 详细配置](../getting-started/keycloak-setup.md)
