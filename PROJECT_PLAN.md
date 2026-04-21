# TaskFlow MVP 项目计划

> 这是项目的持续规划文档，用来记录阶段目标、待办事项、优先级和完成状态。
> 后续新计划可以继续追加，不需要每次重写。

## 使用方式

- `[ ]` 未开始
- `[~]` 进行中
- `[x]` 已完成
- 优先级建议：`P0` > `P1` > `P2`

---

## 当前目标

- 把 TaskFlow 从学习型 Demo 逐步演进为可展示、可部署、可扩展的 SaaS 风格项目
- 兼顾功能完善、工程能力、线上演示和面试展示

---

## 本周重点

- [x] `P0` 完成任务高级搜索与筛选第一版（含按更新时间日期范围 + 筛选标签）
- [~] `P0` 引入更适合 SaaS 风格的 UI 组件体系（App Shell 已上，持续补组件）
- [ ] `P1` 新增 1-2 个可展示模块/页面
- [x] `P1` 梳理并落地 ACL 权限设计第一版
- [ ] `P1` 提升 README 与项目说明的展示质量
- [~] `P0` 对标 Linear 第一波：App Shell 左侧导航、密度更高的列表样式

---

## 明日开发清单

目标：先完成 UI 基座第一步，为任务筛选页改造做准备。

- [x] `P0` 安装并接入 `lucide-react`
- [x] `P0` 确认 UI 组件方案以 `shadcn/ui + Radix` 为主
- [x] `P0` 盘点 `/tasks` 页面将要替换的基础组件
- [x] `P0` 完成筛选条草图：关键词 / 状态 / 项目
- [x] `P1` 补充 `Select` 组件
- [x] `P1` 补充 `Badge` 组件
- [x] `P1` 补充 `Popover` 组件
- [x] `P1` 把任务页顶部改造成更像 SaaS 工具栏的结构
- [ ] `P2` 记录一条 UI 改造原则，沉淀到 README 或后续文档

建议完成标准：

- `/tasks` 页面顶部结构已经为筛选功能预留空间
- 组件选型明确，不再来回切换
- 后续“高级搜索与筛选”可以直接进入实现阶段

---

## 阶段一：UI 基座升级

目标：快速提升界面质感，建立可复用的 SaaS 风格组件基础。

- [x] `P0` 选定 UI 方案：`shadcn/ui + Radix + lucide-react`
- [x] `P0` 建立基础组件清单
- [x] `P1` 增加 `Select`
- [x] `P1` 增加 `Popover`
- [ ] `P1` 增加 `Command`
- [x] `P1` 增加 `Badge`
- [ ] `P1` 增加 `Tabs`
- [ ] `P1` 增加 `Sheet`
- [~] `P1` 统一全局间距、阴影、圆角和色板
- [~] `P2` 优化 dashboard / tasks 页视觉层次

---

## 阶段二：高级搜索与筛选

目标：让 `/tasks` 成为真正可演示的任务工作台。

### 后端能力

- [x] `P0` 设计筛选参数：`keyword`
- [x] `P0` 设计筛选参数：`status`
- [x] `P0` 设计筛选参数：`projectId`
- [x] `P0` 设计筛选参数：`dateFrom`
- [x] `P0` 设计筛选参数：`dateTo`
- [x] `P0` 设计排序参数：`sort`
- [x] `P0` 抽离统一服务端查询函数
- [x] `P1` 为查询补充 Prisma 索引（`Task.userId + updatedAt`）

### 前端交互

- [x] `P0` 在 `/tasks` 顶部增加筛选条
- [x] `P0` 支持关键词搜索
- [x] `P0` 支持状态筛选
- [x] `P0` 支持项目筛选
- [x] `P1` 支持日期范围筛选（按 `updatedAt`，UTC 日界；快捷：近 7 / 30 天）
- [x] `P1` 支持 URL 参数同步
- [x] `P1` 支持刷新后保留筛选状态
- [x] `P1` 增加“清空筛选”
- [x] `P2` 增加“当前筛选条件标签”（可单独移除）

---

## 阶段三：ACL 权限系统

目标：让项目具备可讲述的权限设计，而不只是简单登录校验。

- [x] `P0` 设计 ACL 核心模型：`can(user, action, resource)`
- [x] `P0` 明确资源类型：任务 / 项目
- [x] `P0` 明确动作类型：read / create / update / delete
- [ ] `P1` 前端按钮级权限控制（当前全部归属单用户，UI 层无需差异化）
- [x] `P1` Server Actions 权限校验
- [x] `P1` 页面访问权限校验
- [x] `P1` 权限失败返回统一错误（`assertCan`）
- [x] `P2` 覆盖 Vitest 单元测试（8 项通过）
- [ ] `P2` 增加权限设计文档

---

## 阶段四：新增模块

目标：新增 1-2 个更有作品感的页面。

- [x] `P0` 新增 `/dashboard/insights`
- [x] `P1` 展示任务状态统计
- [x] `P1` 展示最近 7 天新增趋势
- [x] `P1` 展示项目分布情况
- [ ] `P2` 新增“筛选结果概览”模块
- [ ] `P2` 评估是否增加看板视图

---

## 阶段五：工程化

目标：提升项目稳定性、可维护性和面试含金量。

- [ ] `P0` 增加关键流程测试：登录
- [ ] `P0` 增加关键流程测试：创建任务
- [ ] `P0` 增加关键流程测试：权限拦截
- [x] `P1` 配置 CI：`lint + test + build`（GitHub Actions）
- [ ] `P1` 增加错误日志与边界处理
- [ ] `P1` 评估接入监控/埋点
- [ ] `P2` 迁移 Prisma 配置到 `prisma.config.ts`

---

## 阶段六：部署与展示

目标：保证项目可演示、可访问，并适合求职展示。

- [ ] `P0` 保持 Vercel 演示链路稳定
- [ ] `P0` 整理环境变量说明
- [ ] `P1` 增加一套兼顾国内访问的部署方案
- [ ] `P1` 形成部署手册
- [ ] `P1` 形成数据库迁移手册
- [ ] `P2` 梳理回滚方案

---

## 阶段七：文档包装

目标：让项目不仅能跑，还能讲清楚。

- [ ] `P0` 升级 README 结构
- [ ] `P0` 增加项目亮点说明
- [ ] `P1` 增加架构图
- [ ] `P1` 增加权限设计说明
- [ ] `P1` 增加部署说明
- [ ] `P2` 增加踩坑与复盘记录

---

## 以后可能做的功能

- [ ] 标签系统
- [ ] 项目成员协作
- [ ] 操作审计日志
- [ ] 看板视图
- [ ] 通知中心
- [ ] 文件上传
- [ ] 评论系统
- [ ] 数据导出

---

## 已完成记录

- [x] 接入 NextAuth 凭证登录
- [x] 接入 Prisma + PostgreSQL
- [x] 跑通基础迁移与 seed
- [x] 完成任务页与项目页基本链路
- [x] 增加基础 loading 骨架页
- [x] 优化 `/tasks` 页面查询为并行执行
- [x] 引入 `lucide-react` + Radix（Select / Popover）
- [x] 新增基础组件：`Badge` / `Select` / `Popover`
- [x] 任务页顶部改造为 SaaS 风格工具栏（关键词 + 状态 + 项目 + 清空）
- [x] `getTasksForUser` 支持 keyword/status/projectId/sort 服务端筛选
- [x] `/tasks` 筛选与 URL 参数同步，刷新后保留
- [x] 全站切换为 Linear 风格 App Shell（左侧导航 + 右侧工作区）
- [x] 任务列表改为密度更高的 Linear 风格行（状态图标、项目徽标、悬浮操作）
- [x] Dialog / Sheet 基础组件（Radix）
- [x] 新建项目改为 Dialog
- [x] 新建任务改为右侧 Drawer
- [x] 登录页新增注册 Dialog（含 `registerAction`）
- [x] 视觉升级：按钮与聚焦环引入 violet 强调色、Sidebar 顶部渐变质感
- [x] 首页与 About 页整体改造：Hero + 特性卡 + Roadmap，与应用风格统一
- [x] 登录页 C 方案炫酷特效：RetroGrid / Spotlight / Particles / Meteors / TiltCard / 渐变描边
- [x] 任务详情抽屉（点击任务标题右侧 Sheet 滑出，内含编辑/状态/删除）
- [x] 接入 sonner Toast：创建/保存/状态切换/删除/注册 全量反馈
- [x] 命令面板（Cmd+K）：cmdk 搜索/跳转/新建任务/新建项目/访问项目
- [x] 命令面板服务端任务搜索：`GET /api/command/search`，命中项跳转 `/tasks?taskId=` 并打开详情抽屉
- [x] GitHub Actions：`pnpm lint` + `pnpm test` + `pnpm build`
- [x] Sidebar 增加「搜索 / ⌘K」入口
- [x] Insights 数据洞察页：指标卡 / 近 7 天趋势 / 状态分布 / 项目分布
- [x] Sidebar + CommandMenu 新增 Insights 入口
- [x] ACL 第一版：`can()` / `assertCan()`，覆盖 Server Actions 与页面鉴权
- [x] Vitest 覆盖 ACL 规则（8 项通过）
- [x] 对标 Linear：`dateFrom`/`dateTo` + 筛选 Chips + `@@index([userId, updatedAt])`
- [x] Vitest：`date-query` 日历与区间（parse / normalize / filter）
- [x] 任务优先级（`TaskPriority`）+ 截止日期（`dueDate`），列表/详情/新建/命令面板展示，URL `priority=` 筛选，排序 `due_asc` / `due_desc`
- [x] `/tasks` 快捷键 `C`：打开新建任务 Sheet 并保留当前筛选参数
- [x] Prisma 索引：`@@index([userId, dueDate])`

