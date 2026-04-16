# TaskFlow MVP（单仓库演进）

Vue 开发者 Next.js 全栈学习项目：**Day 04–Day 14 全部在同一仓库完成**，无需每天复制新项目。

## 快速开始

1. 复制环境变量：

   ```bash
   cp .env.example .env
   ```

   编辑 `.env`，至少包含：

   - `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskflow_mvp?schema=public"`
   - `AUTH_SECRET`：任意足够长的随机字符串（开发环境）

2. 数据库与种子数据（确保本地 PostgreSQL 已创建数据库并可连接）：

   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

3. 开发：

   ```bash
   pnpm dev
   ```

4. 演示登录：`demo@example.com` / `demo1234`

## 主要路由

- `/login` — 登录
- `/tasks` — 任务列表（需登录）：服务端数据 + 客户端筛选、Server Actions CRUD
- `/dashboard/projects` — 我的项目（数据库）
- `/projects/[id]` — 项目详情 + 该项目下任务（权限校验）

## 脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 开发 |
| `pnpm build` | 生产构建（含 `prisma generate`） |
| `pnpm test` | Vitest 单测 |
| `pnpm db:migrate` | Prisma 迁移（开发） |
| `pnpm db:seed` | 写入演示数据 |

## 部署

见根目录 [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)。

## 原始脚手架说明

基于 [create-next-app](https://nextjs.org/docs/app/api-reference/cli/create-next-app) 与 [Next.js 文档](https://nextjs.org/docs)。
