# 部署到 Vercel（Day 14）

## 1. 准备数据库（PostgreSQL）

本项目已默认使用 PostgreSQL。生产建议：

1. 在 [Neon](https://neon.tech/) 或 [Supabase](https://supabase.com/) 创建 PostgreSQL。
2. 复制连接串，在 Vercel 项目 **Environment Variables** 中设置 `DATABASE_URL`。
3. 本地先验证迁移可执行，再推送部署。

## 2. 环境变量（Vercel）

在 Vercel 控制台为 **Production / Preview** 配置：

| 变量 | 说明 |
| --- | --- |
| `DATABASE_URL` | PostgreSQL 连接串 |
| `AUTH_SECRET` | 随机长密钥，可用 `openssl rand -base64 32` 生成 |
| `NEXT_PUBLIC_SITE_URL` | 线上站点根地址，例如 `https://your-app.vercel.app`（用于 metadata / OG） |

## 3. Build 命令

仓库根目录即本应用时，默认：

- **Build Command**：`pnpm run build`（已包含 `prisma generate`）
- **Install Command**：`pnpm install`

首次部署后，在 Neon SQL 控制台或本地对生产库执行：

```bash
DATABASE_URL="你的生产库连接串" pnpm exec prisma migrate deploy
```

（若你改用 `db push` 流程，请改为 `prisma db push`，团队项目更推荐 migrate。）

## 4. 演示账号

种子数据中的演示用户为：`demo@example.com` / `demo1234`。生产环境请删除种子逻辑或改为安全注册流程。
