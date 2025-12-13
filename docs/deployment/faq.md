# 常见问题 (FAQ)

本文档收集了开发和部署 K-Wiki 时的常见问题及解决方案。

## 连接问题

### 无法连接到后端服务

**症状**：应用无法连接到 PostgreSQL、Keycloak 或 MinIO

**检查步骤**：
```bash
# 确认服务正在运行
docker compose ps

# 测试端口连接
nc -zv localhost 5432  # PostgreSQL
nc -zv localhost 8080  # Keycloak
nc -zv localhost 9000  # MinIO
```

**解决方案**：
- 确保 Docker 正在运行
- 检查端口是否被占用：`lsof -i :5432` (macOS/Linux) 或 `netstat -ano | findstr :5432` (Windows)
- 重启后端服务：`docker compose restart`

### 端口冲突

**症状**：
```
Error: bind: address already in use
```

**解决方案**：
```bash
# 查找占用端口的进程 (macOS/Linux)
sudo lsof -i :3000
sudo lsof -i :5432
sudo lsof -i :8080

# Windows
netstat -ano | findstr :3000

# 停止冲突的进程或修改端口映射
```

### 数据库连接失败

**症状**：
```
Error: connect ECONNREFUSED localhost:5432
```

**解决方案**：
```bash
# 确认 PostgreSQL 正在运行
docker compose ps postgres

# 查看日志
docker compose logs postgres

# 测试连接
docker compose exec postgres psql -U kwiki -d k_wiki -c "SELECT 1;"

# 尝试重启
docker compose restart postgres
```

## Keycloak 问题

### Keycloak 连接失败

**症状**：应用无法连接到 Keycloak，出现认证错误

**检查步骤**：
```bash
# 测试 Keycloak 可访问性
curl http://localhost:8080/realms/k-wiki

# 查看日志
docker compose logs keycloak
```

**解决方案**：
- 确认 `KEYCLOAK_ISSUER` 配置正确
- 确认 realm 和 client 已正确创建
- 确认 `KEYCLOAK_CLIENT_SECRET` 与 Keycloak 中的一致

### 登录后重定向失败

**症状**：Keycloak 登录成功但无法返回应用

**解决方案**：
- 检查 Keycloak client 中的 "Valid Redirect URIs" 是否正确
- 确认 "Web Origins" 与 `NEXTAUTH_URL` 一致
- 检查 `.env` 中的 `NEXTAUTH_URL` 是否与实际访问地址匹配

## MinIO 问题

### Bucket 不存在

**症状**：文件上传失败，提示 bucket 不存在

**解决方案**：
```bash
# 检查初始化日志
docker compose logs minio-init

# 手动创建 bucket
docker compose exec minio mc mb local/k-wiki
```

### 无法访问 MinIO Console

**症状**：访问 http://localhost:9001 失败

**解决方案**：
- 确认 MinIO 服务正在运行：`docker compose ps minio`
- 检查端口映射是否正确
- 尝试重启：`docker compose restart minio`

## 开发环境问题

### pnpm 依赖安装失败

**症状**：`pnpm install` 报错

**解决方案**：
```bash
# 清理缓存
pnpm store prune

# 删除 node_modules
rm -rf node_modules pnpm-lock.yaml

# 重新安装
pnpm install
```

### 热重载不工作

**症状**：修改代码后页面不自动刷新

**解决方案**：
- 确认使用 `pnpm dev` 而不是 `pnpm start`
- 检查是否有文件监听限制（Linux）：`echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`
- 重启开发服务器

### WSL 2 (Windows) 性能问题

**症状**：在 Windows WSL 2 中开发时性能很慢

**解决方案**：
- 确保项目在 WSL 文件系统中（`/home/`），而不是 Windows 文件系统（`/mnt/c/`）
- 在 Docker Desktop 设置中启用 WSL 2 integration
- 增加 Docker Desktop 的资源分配（内存、CPU）

## 数据管理

### 重置开发环境

**完全重置**（删除所有数据）：
```bash
# 停止并删除所有容器和数据
docker compose down -v

# 重新启动
docker compose up -d postgres keycloak minio

# 重新配置 Keycloak
```

**仅重置应用数据**（保留 Keycloak 配置）：
```bash
docker compose exec postgres psql -U kwiki -c "DROP DATABASE k_wiki;"
docker compose exec postgres psql -U kwiki -c "CREATE DATABASE k_wiki;"
```

### 备份和恢复数据

**备份**：
```bash
# 备份 PostgreSQL
docker compose exec -T postgres pg_dump -U kwiki k_wiki > backup.sql

# 备份 MinIO
docker volume inspect k-wiki_minio_data
```

**恢复**：
```bash
# 恢复 PostgreSQL
docker compose exec -T postgres psql -U kwiki k_wiki < backup.sql
```

## 部署问题

### 容器无法启动

**症状**：`docker compose up` 后容器立即退出

**检查步骤**：
```bash
# 查看容器状态
docker compose ps

# 查看失败原因
docker compose logs <service-name>

# 检查资源使用
docker stats
free -h
df -h
```

### 502 Bad Gateway (生产环境)

**症状**：Nginx 返回 502 错误

**解决方案**：
```bash
# 确认 app 容器运行
docker compose ps app

# 测试内部连接
docker compose exec nginx curl http://app:3000

# 查看 Nginx 错误日志
docker compose logs nginx | grep error

# 重启服务
docker compose restart app nginx
```

### SSL 证书问题

**症状**：HTTPS 访问失败或证书错误

**解决方案**：
```bash
# 检查证书有效期
sudo certbot certificates

# 测试证书
openssl s_client -connect example.com:443 -servername example.com

# 手动续期
sudo certbot renew --force-renewal

# 重启 Nginx
docker compose restart nginx
```

## 性能优化

### Docker Desktop 资源配置

1. 打开 Docker Desktop 设置
2. 分配至少 4GB 内存
3. 分配至少 2 个 CPU 核心

### 启用 Next.js Turbopack

```bash
# 实验性功能，可能不稳定
pnpm dev --turbo
```

### Docker BuildKit

```bash
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
```

## 其他问题

### 找不到 .env 文件

**症状**：应用提示缺少环境变量

**解决方案**：
- 本地开发：确保已复制 `.env.docker-dev.example` 或 `.env.orbstack-dev.example` 到 `.env.local`
- 生产部署：确保已复制 `.env.standard.example` 到 `.env`

### 环境变量不生效

**症状**：修改 `.env` 文件后没有变化

**解决方案**：
- Next.js 本地开发：重启 `pnpm dev`
- Docker 容器：重启服务 `docker compose restart app`
- 检查是否使用了正确的 `.env` 文件（`.env.local` vs `.env`）

## 获取帮助

如果以上方案无法解决问题：

1. 检查 [GitHub Issues](https://github.com/your-repo/k-wiki/issues)
2. 查看 [开发文档](../../CLAUDE.md)
3. 提交新的 Issue 并附上：
   - 详细错误信息
   - 系统环境（OS、Docker 版本等）
   - 复现步骤
   - 相关日志输出
