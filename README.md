# 即答 AI客服系统

第一版 AI 客服项目骨架，包含：

- 落地页
- AI 客服体验页
- 后台预览页
- 聊天 API
- Coze 主工作流调用层
- PostgreSQL + Prisma 数据模型
- 异步任务表结构

## 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Coze Workflow / ChatFlow

## 本地启动

```bash
pnpm install
cp .env.example .env
pnpm dev
```

访问：

```text
http://localhost:3000
http://localhost:3000/chat
http://localhost:3000/dashboard
```

后端 API 独立启动：

```bash
pnpm api:dev
```

异步任务 Worker 独立启动：

```bash
pnpm worker:dev
```

## 数据库初始化

先在 `.env` 中配置：

```text
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jidah_ai_customer_service?schema=public"
DEFAULT_MERCHANT_ID="jidah-demo"
```

然后执行：

```bash
pnpm db:generate
pnpm db:push
pnpm db:seed
```

## 部署方式

本项目按前后端分离部署：

- 前端页面部署到 EdgeOne Pages / PageOne。
- 服务端 API、Worker、PostgreSQL 部署到自有服务器。
- PostgreSQL 不需要开放公网端口，API 和 Worker 在同一台服务器上通过 `127.0.0.1:5432` 访问。

服务器环境变量示例：

```text
DATABASE_URL="postgresql://jidah_app:你的数据库密码@127.0.0.1:5432/jidah_ai_customer_service?schema=public"
DEFAULT_MERCHANT_ID="jidah-demo"
API_PORT="4000"
CORS_ORIGINS="https://你的前端域名"

COZE_API_BASE_URL="https://api.coze.com"
COZE_API_TOKEN=""
COZE_MAIN_WORKFLOW_ID=""
COZE_LEAD_WORKFLOW_ID=""
COZE_SUMMARY_WORKFLOW_ID=""
COZE_MISSED_WORKFLOW_ID=""
COZE_QUALITY_WORKFLOW_ID=""
```

前端 PageOne 环境变量示例：

```text
NEXT_PUBLIC_API_BASE_URL="https://你的后端 API 域名"
NEXT_PUBLIC_COZE_CHAT_URL="https://你的 Coze 对话链接"
```

第一版服务端接口：

```text
GET  /health
POST /api/chat
GET  /api/conversations
GET  /api/conversations/:id
POST /api/handoff
```

## Coze 配置

主工作流保持快速：

```text
开始
↓
知识库检索
↓
生成客服回复
↓
结束
```

`.env` 中配置：

```text
COZE_API_BASE_URL="https://api.coze.com"
COZE_API_TOKEN=""
COZE_MAIN_WORKFLOW_ID=""
```

如果没有配置 Coze，项目会使用 mock 回复，方便先跑通前后端。

## Coze 对话框体验页

`/chat` 页面用于直接嵌入 Coze 发布后的 Web 对话链接。配置：

```text
NEXT_PUBLIC_COZE_CHAT_URL="https://你的-coze-对话链接"
```

配置后重启：

```bash
pnpm dev
```

客户访问 `/chat` 时会直接看到 Coze 对话框，不再使用临时自建聊天窗口。

## 异步任务设计

每次聊天后，`/api/chat` 会写入 `async_jobs`：

```text
extract_lead
summarize_conversation
detect_missed_question
quality_check
```

后续要补一个 Worker：

```text
读取 async_jobs
↓
调用 Coze 异步工作流
↓
写回 leads / missed_questions / quality_checks / conversations
```

## 核心目录

```text
src/app/page.tsx                  落地页
src/app/chat/page.tsx             客服体验页
src/app/dashboard/page.tsx        后台预览页
src/app/api/chat/route.ts         聊天接口
src/app/api/conversations         会话接口
src/app/api/handoff/route.ts      人工接管接口
src/lib/coze.ts                   Coze 调用封装
src/lib/prisma.ts                 Prisma 客户端
prisma/schema.prisma              数据库模型
prisma/seed.ts                    默认商家 seed
```
