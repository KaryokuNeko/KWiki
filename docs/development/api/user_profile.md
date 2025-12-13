# 用户资料管理 API

## 概述

K-Wiki 使用 Keycloak 进行身份认证，同时在应用数据库中存储额外的用户资料信息，包括昵称和头像。

## 数据库架构

用户资料存储在 `user_profiles` 表中：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键（自增） |
| keycloak_id | VARCHAR(255) | Keycloak 用户 ID（唯一） |
| nickname | VARCHAR(100) | 用户昵称（可选） |
| avatar_url | TEXT | 头像 URL（可选） |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

## API 端点

### 获取当前用户资料

```
GET /api/profile
```

**认证**: 需要登录

**响应示例**:
```json
{
  "success": true,
  "profile": {
    "id": 1,
    "keycloakId": "123e4567-e89b-12d3-a456-426614174000",
    "nickname": "张三",
    "avatarUrl": "https://example.com/avatar.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 创建用户资料

```
POST /api/profile
```

**认证**: 需要登录

**请求体**:
```json
{
  "nickname": "张三",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**响应**: 同 GET 响应

### 更新用户资料

```
PUT /api/profile
```

**认证**: 需要登录

**请求体** (所有字段可选):
```json
{
  "nickname": "李四",
  "avatarUrl": "https://example.com/new-avatar.jpg"
}
```

**响应**: 同 GET 响应

## 数据库客户端工具

### 位置

`src/lib/user-profile.ts`

### 可用函数

- `getUserProfile(keycloakId: string)` - 获取用户资料
- `createUserProfile(data)` - 创建用户资料
- `updateUserProfile(keycloakId, data)` - 更新用户资料
- `getOrCreateUserProfile(keycloakId, defaultData?)` - 获取或创建用户资料
- `deleteUserProfile(keycloakId)` - 删除用户资料
- `userProfileExists(keycloakId)` - 检查用户资料是否存在

### 使用示例

```typescript
import { getUserProfile, updateUserProfile } from '@/lib/user-profile'

// 获取用户资料
const profile = await getUserProfile('keycloak-user-id')

// 更新昵称
const updated = await updateUserProfile('keycloak-user-id', {
  nickname: '新昵称'
})
```

## 数据库迁移

### 运行迁移

```bash
pnpm prisma migrate dev
```

### 生成 Prisma Client

```bash
pnpm prisma generate
```

### 查看数据库

```bash
pnpm prisma studio
```

## 环境配置

在 `.env` 文件中配置数据库连接：

```bash
# 本地开发（OrbStack）
DATABASE_URL="postgresql://kwiki:kwiki123@postgres.k-wiki.orb.local:5432/k_wiki"

# 本地开发（标准 Docker）
DATABASE_URL="postgresql://kwiki:kwiki123@localhost:5432/k_wiki"

# 生产部署
DATABASE_URL="postgresql://kwiki:kwiki123@postgres:5432/k_wiki"
```

## 技术栈

- **ORM**: Prisma 7.x
- **数据库**: PostgreSQL 15
- **类型安全**: TypeScript
- **验证**: 内置验证逻辑

## 注意事项

1. **昵称长度限制**: 最多 100 个字符
2. **头像 URL**: 建议使用 MinIO 存储的对象 URL
3. **Keycloak ID**: 从 NextAuth session 中的 `user.sub` 字段获取
4. **自动时间戳**: `createdAt` 和 `updatedAt` 由数据库自动管理
