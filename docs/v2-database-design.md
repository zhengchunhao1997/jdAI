# V2 通用 AI 客服后台数据库设计

## 目标

V2 数据库面向通用 AI 客服后台，不绑定小蓝帽或任何单一行业流程。前端工作流可以按客户变化，后台数据结构保持稳定。

核心目标：

- 多租户隔离：每个客户项目都有独立 `tenant_id`。
- 用户聚合：同一用户跨渠道身份可以合并到同一个客户。
- 全渠道接入：网页、公众号、企微、抖音、小红书、飞书、钉钉、APP 都用统一渠道模型。
- 线索沉淀：意向等级、阶段、状态全部字典化，默认支持 A/B/C/D，后续可优化。
- AI 可追溯：每次 AI 回复保存原始输出、最终答案、工作流版本、模型、人设版本。
- 知识库可审计：知识库仍在 Coze，但保存引用快照，用于判断是否改写知识库原意。
- 质检可落地：记录忠实度、语气、帮助程度、销售引导和风险等级。

## 表分组

### 账号与租户

- `v2_tenants`：租户/客户项目。
- `v2_users`：后台账号。
- `v2_tenant_users`：账号分配到租户，并设置租户内角色。
- `v2_user_sessions`：后台登录会话。
- `v2_audit_logs`：后台操作审计。

### 渠道与用户

- `v2_channels`：渠道配置。
- `v2_customers`：按用户聚合后的客户主表。
- `v2_customer_identities`：客户在各渠道的身份。
- `v2_customer_profiles`：动态客户画像。

### 会话与消息

- `v2_conversations`：一次连续咨询。
- `v2_messages`：用户、AI、人工、系统消息。

### AI 与知识库

- `v2_workflows`：租户、渠道、用途对应的工作流配置。
- `v2_ai_runs`：每次 AI 回复的运行记录。
- `v2_message_knowledge_refs`：AI 回复引用的知识库快照。
- `v2_kb_miss_questions`：知识库未命中和异常问题。
- `v2_answer_quality_checks`：回答质检。

### 线索与成交

- `v2_leads`：销售线索。
- `v2_lead_events`：线索状态变化事件。
- `v2_follow_ups`：人工跟进记录。
- `v2_deals`：成交记录。

### 字典

- `v2_dictionaries`：租户可配置字典。平台默认字典 `tenant_id` 为空。

默认字典包括：

- `intent_level`：A/B/C/D/UNKNOWN。
- `conversation_status`：AI_SERVING/NEED_HUMAN/HUMAN_SERVING/CLOSED。
- `lead_stage`：NEW/QUALIFIED/PRICE_ASKED/SOLUTION_RECOMMENDED/HANDOFF/WON/LOST/INVALID。
- `lead_status`：OPEN/FOLLOWING/WON/LOST/INVALID。
- `miss_type`：NO_KB/LOW_CONFIDENCE/CONFLICT/OUT_OF_SCOPE/BAD_TONE/REWRITE_KB。
- `review_status`：AUTO/NEED_REVIEW/REVIEWED。

## 数据写入主线

Coze 或其他工作流每轮对话结束后，统一写入：

1. `v2_customers`
2. `v2_customer_identities`
3. `v2_customer_profiles`
4. `v2_conversations`
5. `v2_messages`
6. `v2_ai_runs`
7. `v2_message_knowledge_refs`
8. `v2_leads`
9. `v2_lead_events`
10. `v2_kb_miss_questions`
11. `v2_answer_quality_checks`

建议统一接口：

```http
POST /api/v2/customer-service/events
```

工作流只需要带通用结构，不需要关心具体业务表拆分。

## 关键设计说明

### 不写死行业字段

行业字段放在：

- `v2_customer_profiles.profileJson`
- `v2_workflows.configJson`
- `v2_dictionaries.metaJson`

例如减肥行业可以存身高、体重、目标体重；教育行业可以存年级、科目、预算、目标分数。

### AI 回答可追溯

每次 AI 回复同时保存：

- `v2_messages.content`：最终展示给用户的回答。
- `v2_ai_runs.rawOutput`：模型或工作流原始输出。
- `v2_ai_runs.finalAnswer`：最终答案。
- `v2_message_knowledge_refs.knowledgeContentSnapshot`：当次引用的知识库原文快照。

这能定位“AI 根据知识库回答时改了意思”的问题。

### 语气问题可质检

`v2_answer_quality_checks` 保存：

- `fidelityScore`：忠实知识库评分。
- `toneScore`：真人语气评分。
- `helpfulnessScore`：有用程度评分。
- `salesGuidanceScore`：销售引导评分。
- `issuesJson`：问题明细。

后续可以做质检看板和低分回答列表。

### 登录与权限

账号通过 `v2_users` 登录。

权限基本规则：

- `isPlatformAdmin = true`：平台管理员，可管理全部租户。
- 普通用户通过 `v2_tenant_users` 分配租户和角色。
- 所有业务查询必须加 `tenantId` 条件。

默认角色建议：

- `tenant_admin`：租户管理员。
- `staff`：客服/销售。
- `viewer`：只读查看。

## 已创建内容

本次已完成：

- Prisma schema 增加 21 张 `v2_*` 表。
- 生成已有数据库增量建表 SQL：`prisma/sql/20260624_v2_multi_tenant_customer_service.sql`。
- 增加表和字段注释：`prisma/v2-comments.sql`。
- 增加默认字典：`prisma/v2-default-dictionaries.sql`。
- 已在本地 PostgreSQL 创建表并验证。
