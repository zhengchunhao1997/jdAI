# V2 客服事件写入接口文档

## 用途

Coze 工作流每一轮对话结束后，调用本接口，把用户消息、AI 最终回答、知识库引用、客户画像、线索状态、质检结果一次性写入即答后台数据库。

接口设计为通用型，不绑定小蓝帽或任何单一行业。行业差异字段统一放在 `profile.profile_json`、`lead`、`quality` 等扩展结构中。

## 接口地址

```http
POST /api/v2/customer-service/events
```

线上地址后续实现后为：

```http
POST https://jida.ink/api/v2/customer-service/events
```

当前接口尚未实现，本文档用于先搭建 Coze 工作流出参和 HTTP 节点。

## 认证方式

建议使用服务端 API Key。

```http
Authorization: Bearer <JIDAH_API_KEY>
Content-Type: application/json
```

后端会根据 API Key 识别允许写入的租户。为了 Coze 配置简单，请求体里也保留 `tenant.code` 或 `tenant_id`。

## 请求体总览

```json
{
  "tenant": {},
  "channel": {},
  "customer": {},
  "conversation": {},
  "messages": {},
  "ai_run": {},
  "knowledge_refs": [],
  "profile": {},
  "lead": {},
  "quality": {},
  "miss_question": {},
  "deal": {}
}
```

## 字段说明

### tenant

租户信息。二选一即可：优先使用 `tenant_id`，没有时使用 `code`。

```json
{
  "tenant_id": "cmcxxxx",
  "code": "xiaolanmao"
}
```

字段：

| 字段 | 必填 | 说明 |
|---|---:|---|
| tenant_id | 否 | 即答后台租户 ID |
| code | 否 | 租户业务编码，例如 `xiaolanmao` |

### channel

渠道和外部用户身份。

```json
{
  "type": "wechat_official",
  "name": "小蓝帽公众号",
  "external_app_id": "wx_app_id",
  "external_user_id": "openid_xxx",
  "external_open_id": "openid_xxx",
  "external_union_id": "unionid_xxx",
  "nickname": "客户昵称",
  "raw": {}
}
```

字段：

| 字段 | 必填 | 说明 |
|---|---:|---|
| type | 是 | 渠道类型 |
| name | 否 | 渠道名称 |
| external_app_id | 否 | 渠道应用 ID |
| external_user_id | 是 | 渠道侧用户唯一 ID |
| external_open_id | 否 | 微信 openid 等 |
| external_union_id | 否 | 微信 unionid 等 |
| nickname | 否 | 渠道昵称 |
| raw | 否 | 渠道原始 JSON |

推荐渠道类型：

```txt
website
wechat_official
wechat_work
douyin
xiaohongshu
app
feishu
dingtalk
manual_import
```

### customer

客户通用资料。

```json
{
  "nickname": "客户昵称",
  "avatar_url": "",
  "phone": "",
  "wechat": "",
  "email": "",
  "location": ""
}
```

所有字段都非必填，但建议至少传 `nickname`。

### conversation

会话信息。

```json
{
  "external_conversation_id": "coze_conversation_id",
  "source": "公众号",
  "source_detail": "菜单入口/关键词/二维码",
  "status_code": "AI_SERVING",
  "intent_level_code": "A",
  "stage_code": "PRICE_ASKED",
  "summary": "客户咨询价格，已表现出购买意向"
}
```

字段：

| 字段 | 必填 | 说明 |
|---|---:|---|
| external_conversation_id | 否 | Coze 或渠道侧会话 ID |
| source | 否 | 来源 |
| source_detail | 否 | 来源详情 |
| status_code | 否 | 会话状态 |
| intent_level_code | 否 | 意向等级 |
| stage_code | 否 | 当前阶段 |
| summary | 否 | 会话摘要 |

默认值：

```txt
status_code: AI_SERVING
intent_level_code: UNKNOWN
stage_code: NEW
```

### messages

本轮用户消息和 AI 回复。

```json
{
  "user_message": "多少钱？",
  "ai_answer": "您好，这个需要结合您的情况推荐方案...",
  "content_type": "text",
  "external_user_message_id": "coze_user_msg_id",
  "external_ai_message_id": "coze_ai_msg_id",
  "raw": {}
}
```

字段：

| 字段 | 必填 | 说明 |
|---|---:|---|
| user_message | 是 | 用户本轮问题 |
| ai_answer | 是 | 最终发给用户的回答 |
| content_type | 否 | 默认 `text` |
| external_user_message_id | 否 | 外部用户消息 ID |
| external_ai_message_id | 否 | 外部 AI 消息 ID |
| raw | 否 | 原始消息 JSON |

### ai_run

AI 工作流运行记录。

```json
{
  "workflow_provider": "coze",
  "workflow_id": "7653456639388303412",
  "workflow_version": "v1",
  "model_name": "doubao-seed-1.6",
  "prompt_version": "2026-06-24",
  "persona_version": "human_sales_v1",
  "input": {},
  "raw_output": "模型原始输出",
  "final_answer": "最终发给用户的回答",
  "latency_ms": 4200,
  "status": "SUCCESS",
  "error_message": ""
}
```

字段：

| 字段 | 必填 | 说明 |
|---|---:|---|
| workflow_provider | 否 | 默认 `coze` |
| workflow_id | 否 | Coze 工作流 ID |
| workflow_version | 否 | 工作流版本 |
| model_name | 否 | 模型名称 |
| prompt_version | 否 | 提示词版本 |
| persona_version | 否 | 人设版本 |
| input | 否 | 工作流输入 JSON |
| raw_output | 否 | 原始输出 |
| final_answer | 否 | 最终答案，不传则使用 `messages.ai_answer` |
| latency_ms | 否 | 总耗时，毫秒 |
| status | 否 | SUCCESS / FAILED |
| error_message | 否 | 错误信息 |

### knowledge_refs

知识库引用。用于判断 AI 是否改写知识库原意。

```json
[
  {
    "external_kb_id": "coze_kb_id",
    "external_doc_id": "doc_id",
    "title": "价格说明",
    "content_snapshot": "知识库原文快照",
    "matched_text": "命中的片段",
    "similarity_score": 0.91,
    "rank": 1
  }
]
```

如果本轮没有命中知识库，可以传空数组。

### profile

客户画像。通用字段放 JSON，不按行业写死。

```json
{
  "profile_json": {
    "budget": "500-1000",
    "main_concern": "价格",
    "height": "165",
    "weight": "160斤",
    "target_weight": "120斤"
  },
  "tags": ["价格敏感", "有购买意向"],
  "profile_score": 70
}
```

字段：

| 字段 | 必填 | 说明 |
|---|---:|---|
| profile_json | 否 | 行业动态画像 |
| tags | 否 | 标签数组 |
| profile_score | 否 | 画像完整度，0 到 100 |

### lead

线索信息。

```json
{
  "intent_level_code": "A",
  "stage_code": "PRICE_ASKED",
  "status_code": "OPEN",
  "score": 85,
  "main_need": "咨询价格",
  "main_concern": "预算",
  "recommended_solution": "基础方案",
  "next_action": "转人工确认下单",
  "event_reason": "客户主动询问价格"
}
```

字段：

| 字段 | 必填 | 说明 |
|---|---:|---|
| intent_level_code | 否 | A/B/C/D/UNKNOWN |
| stage_code | 否 | 线索阶段 |
| status_code | 否 | 线索状态 |
| score | 否 | 线索分，0 到 100 |
| main_need | 否 | 主要需求 |
| main_concern | 否 | 主要顾虑 |
| recommended_solution | 否 | 推荐方案 |
| next_action | 否 | 下一步动作 |
| event_reason | 否 | 本轮状态变化原因 |

默认意向等级：

```txt
A 高意向用户
B 中意向用户
C 低意向用户
D 风险用户
UNKNOWN 待判断
```

默认阶段：

```txt
NEW
QUALIFIED
PRICE_ASKED
SOLUTION_RECOMMENDED
HANDOFF
WON
LOST
INVALID
```

### quality

回答质检结果。

```json
{
  "fidelity_score": 90,
  "tone_score": 82,
  "helpfulness_score": 85,
  "sales_guidance_score": 75,
  "risk_level_code": "LOW",
  "issues": ["无明显问题"],
  "suggestion": "保持当前话术",
  "review_status_code": "AUTO"
}
```

重点：

- `fidelity_score` 用来判断是否忠实知识库。
- `tone_score` 用来判断是否像真人。
- `issues` 可以写入“改写知识库”“语气机械”等问题。

### miss_question

未命中或异常问题。只有出现问题时传；没有问题可不传或传 `null`。

```json
{
  "question": "客户原问题",
  "ai_answer": "AI回答",
  "miss_type_code": "REWRITE_KB",
  "miss_reason": "AI把知识库原文中的价格限制条件省略了",
  "suggested_answer": "建议严格按知识库原文回答",
  "status_code": "PENDING"
}
```

类型：

```txt
NO_KB              知识库缺失
LOW_CONFIDENCE    低置信回答
CONFLICT          知识冲突
OUT_OF_SCOPE      超出范围
BAD_TONE          语气不佳
REWRITE_KB        改写知识库
```

### deal

成交信息。没有成交时不传。

```json
{
  "amount": 598,
  "currency": "CNY",
  "deal_status_code": "PENDING_PAYMENT",
  "source": "COZE",
  "external_order_id": "order_xxx",
  "paid_at": "2026-06-24T12:00:00+08:00"
}
```

成交状态建议：

```txt
PENDING_PAYMENT
PAID
REFUNDED
CANCELLED
```

## 最小请求示例

Coze 先跑通可以只传这些字段：

```json
{
  "tenant": {
    "code": "xiaolanmao"
  },
  "channel": {
    "type": "wechat_official",
    "external_user_id": "{{user_id}}",
    "nickname": "{{nickname}}"
  },
  "messages": {
    "user_message": "{{user_message}}",
    "ai_answer": "{{final_answer}}"
  },
  "ai_run": {
    "workflow_provider": "coze",
    "workflow_id": "{{workflow_id}}",
    "model_name": "{{model_name}}",
    "raw_output": "{{raw_output}}",
    "final_answer": "{{final_answer}}"
  },
  "lead": {
    "intent_level_code": "{{intent_level}}",
    "stage_code": "{{stage}}",
    "main_need": "{{main_need}}",
    "main_concern": "{{main_concern}}",
    "next_action": "{{next_action}}"
  }
}
```

## Coze HTTP 节点配置

### 请求配置

```txt
Method: POST
URL: https://jida.ink/api/v2/customer-service/events
Content-Type: application/json
Authorization: Bearer <JIDAH_API_KEY>
```

接口正式实现前，先在 Coze 里按这个结构配置出参即可。`<JIDAH_API_KEY>` 后续由即答后台生成，不要使用 Coze 自己的 PAT。

### 推荐 Body 模板

```json
{
  "tenant": {
    "code": "xiaolanmao"
  },
  "channel": {
    "type": "wechat_official",
    "name": "公众号",
    "external_user_id": "{{user_id}}",
    "nickname": "{{nickname}}",
    "raw": {
      "coze_conversation_id": "{{conversation_id}}"
    }
  },
  "customer": {
    "nickname": "{{nickname}}"
  },
  "conversation": {
    "external_conversation_id": "{{conversation_id}}",
    "source": "wechat_official",
    "status_code": "AI_SERVING",
    "intent_level_code": "{{intent_level}}",
    "stage_code": "{{stage}}",
    "summary": "{{conversation_summary}}"
  },
  "messages": {
    "user_message": "{{user_message}}",
    "ai_answer": "{{final_answer}}",
    "content_type": "text",
    "raw": {
      "coze_run_id": "{{run_id}}"
    }
  },
  "ai_run": {
    "workflow_provider": "coze",
    "workflow_id": "{{workflow_id}}",
    "model_name": "{{model_name}}",
    "raw_output": "{{raw_output}}",
    "final_answer": "{{final_answer}}",
    "latency_ms": "{{latency_ms}}",
    "status": "SUCCESS"
  },
  "knowledge_refs": "{{knowledge_refs}}",
  "profile": {
    "profile_json": "{{profile_json}}",
    "tags": "{{tags}}",
    "profile_score": "{{profile_score}}"
  },
  "lead": {
    "intent_level_code": "{{intent_level}}",
    "stage_code": "{{stage}}",
    "status_code": "OPEN",
    "score": "{{lead_score}}",
    "main_need": "{{main_need}}",
    "main_concern": "{{main_concern}}",
    "recommended_solution": "{{recommended_solution}}",
    "next_action": "{{next_action}}",
    "event_reason": "{{event_reason}}"
  },
  "quality": {
    "fidelity_score": "{{fidelity_score}}",
    "tone_score": "{{tone_score}}",
    "helpfulness_score": "{{helpfulness_score}}",
    "sales_guidance_score": "{{sales_guidance_score}}",
    "risk_level_code": "{{risk_level}}",
    "issues": "{{quality_issues}}",
    "suggestion": "{{quality_suggestion}}",
    "review_status_code": "AUTO"
  },
  "miss_question": "{{miss_question}}",
  "deal": "{{deal}}"
}
```

如果 Coze HTTP 节点不方便传数组或对象变量，第一版可以先不传这些字段：

```txt
knowledge_refs
profile.tags
quality.issues
miss_question
deal
```

第一版必须稳定传入：

```txt
tenant.code
channel.type
channel.external_user_id
messages.user_message
messages.ai_answer
lead.intent_level_code
lead.stage_code
```

## 完整 curl 示例

```bash
curl -X POST 'https://jida.ink/api/v2/customer-service/events' \
  -H 'Authorization: Bearer <JIDAH_API_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{
    "tenant": {
      "code": "xiaolanmao"
    },
    "channel": {
      "type": "wechat_official",
      "name": "小蓝帽公众号",
      "external_user_id": "openid_xxx",
      "external_open_id": "openid_xxx",
      "nickname": "测试客户"
    },
    "customer": {
      "nickname": "测试客户",
      "wechat": ""
    },
    "conversation": {
      "external_conversation_id": "coze_conv_xxx",
      "source": "公众号",
      "status_code": "AI_SERVING",
      "intent_level_code": "A",
      "stage_code": "PRICE_ASKED",
      "summary": "客户咨询价格，存在购买意向"
    },
    "messages": {
      "user_message": "多少钱？",
      "ai_answer": "您好，价格需要结合您的使用周期和目标来确认，我可以先帮您整理需求，再转人工确认具体方案。",
      "content_type": "text"
    },
    "ai_run": {
      "workflow_provider": "coze",
      "workflow_id": "7653456639388303412",
      "workflow_version": "v1",
      "model_name": "doubao-seed-1.6",
      "prompt_version": "2026-06-24",
      "persona_version": "human_sales_v1",
      "raw_output": "模型原始输出",
      "final_answer": "您好，价格需要结合您的使用周期和目标来确认，我可以先帮您整理需求，再转人工确认具体方案。",
      "latency_ms": 4200,
      "status": "SUCCESS"
    },
    "knowledge_refs": [
      {
        "external_kb_id": "coze_kb_xxx",
        "external_doc_id": "doc_xxx",
        "title": "价格说明",
        "content_snapshot": "知识库原文快照",
        "matched_text": "命中的片段",
        "similarity_score": 0.91,
        "rank": 1
      }
    ],
    "profile": {
      "profile_json": {
        "budget": "500-1000",
        "main_concern": "价格"
      },
      "tags": ["价格敏感", "有购买意向"],
      "profile_score": 60
    },
    "lead": {
      "intent_level_code": "A",
      "stage_code": "PRICE_ASKED",
      "status_code": "OPEN",
      "score": 85,
      "main_need": "咨询价格",
      "main_concern": "预算",
      "recommended_solution": "待人工确认",
      "next_action": "转人工确认下单",
      "event_reason": "客户主动询问价格"
    },
    "quality": {
      "fidelity_score": 90,
      "tone_score": 82,
      "helpfulness_score": 85,
      "sales_guidance_score": 75,
      "risk_level_code": "LOW",
      "issues": [],
      "suggestion": "回答可用",
      "review_status_code": "AUTO"
    }
  }'
```

## 成功响应

```json
{
  "ok": true,
  "data": {
    "tenant_id": "cmcxxx",
    "customer_id": "cmcxxx",
    "conversation_id": "cmcxxx",
    "user_message_id": "cmcxxx",
    "ai_message_id": "cmcxxx",
    "ai_run_id": "cmcxxx",
    "lead_id": "cmcxxx"
  }
}
```

## 失败响应

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "messages.user_message is required"
  }
}
```

常见错误码：

```txt
UNAUTHORIZED
TENANT_NOT_FOUND
VALIDATION_ERROR
DATABASE_ERROR
```

## Coze 工作流建议输出字段

为了后续质检和排查，建议 Coze 最终节点至少输出：

```json
{
  "final_answer": "",
  "raw_output": "",
  "intent_level": "A",
  "stage": "PRICE_ASKED",
  "main_need": "",
  "main_concern": "",
  "next_action": "",
  "profile_json": {},
  "knowledge_refs": [],
  "fidelity_score": 90,
  "tone_score": 80,
  "miss_type": ""
}
```

## 注意事项

1. 价格、用法、安全、禁忌、承诺效果类问题，要尽量传 `knowledge_refs`。
2. 如果 AI 有改写知识库风险，`miss_question.miss_type_code` 传 `REWRITE_KB`。
3. 如果回答不像真人，`miss_question.miss_type_code` 传 `BAD_TONE`，同时 `quality.tone_score` 给低分。
4. `lead.intent_level_code` 暂时支持 A/B/C/D/UNKNOWN，后续每个租户可通过字典扩展。
5. 工作流失败也可以调用本接口，`ai_run.status` 传 `FAILED`，并写入 `error_message`。
