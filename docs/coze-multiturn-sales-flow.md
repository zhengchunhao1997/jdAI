# Coze 多轮成交版 AI 客服搭建手册

整理日期：2026-06-20  
目标：在现有“单轮知识库问答稳定”的基础上，升级为可多轮接待、促使成交、沉淀意向线索的企业微信 AI 客服。

## 1. 这一版要解决什么

当前简单版已经能做到：

- 用户问一个问题，AI 能查知识库回答。
- 价格、效果、安全、下单等单点问题比较稳定。

下一版要新增：

- 记住客户已经说过的身高、体重、目标等信息。
- 根据聊天内容判断客户意向。
- 在合适时机推荐套餐和促单。
- 对未成交客户留下顾虑和跟进线索。
- 对风险客户转人工。

## 2. 总体结构

当前版本使用 Coze 自带数据库，并拆成“实时回复流程 + 异步线索沉淀流程”。

目标：

```text
实时流程只负责快速回复客户。
异步流程负责写库、打标签、生成线索摘要、记录事件。
```

整体搭建：

```text
1 个智能体
2 个工作流
1 个简单版知识库
2 张数据库表
```

工作流 A：实时客服回复流程

```text
用户发消息
↓
接收 user_id、nickname、user_message、chat_history
↓
查询 customer_leads，拿到客户历史状态
↓
轻量判断风险/下单/常规咨询
↓
查询简单版知识库
↓
生成客服回复 reply
↓
异步触发工作流 B，传入 user_id、nickname、user_message、reply、old_lead_record、chat_history
↓
立即输出 reply 给客户
```

工作流 B：异步线索沉淀流程

```text
由工作流 A 异步触发
↓
计算客户状态与入库数据
↓
判断客户意图、意向等级和下一步动作
↓
生成线索摘要
↓
新建或更新 customer_leads
↓
新增 conversation_events
↓
结束，不阻塞客户回复
```

这样可以把客户等待时间控制在 3-5 秒内，慢任务放到异步后台执行。

## 3. 工作流名称

```text
工作流 A：实时客服回复流程
工作流 B：异步线索沉淀流程
```

## 4. Coze 数据库表

### 4.1 customer_leads

用途：保存每个客户的最新线索状态。每个客户一条主记录。

Coze 数据库单表最多 20 个字段时，主表只保留成交和跟进最关键的信息。年龄、性别、疾病、用药等扩展信息统一放进 `profile_json`。

```text
1. user_id：文本，客户唯一ID，必须有。
2. nickname：文本，客户昵称。
3. height：文本，身高。
4. weight：文本，当前体重。
5. target_weight：文本，目标体重。
6. main_concern：文本，主要顾虑，效果/安全/价格/反弹/售后/正品。
7. risk_flag：布尔值，是否风险客户。
8. risk_type：文本，风险类型，孕哺/疾病/用药/付款/退款/投诉/身体不适。
9. intent_level：文本，A/B/C/D。
10. current_stage：文本，当前阶段。
11. recommended_package：文本，推荐套餐。
12. last_user_message：文本，客户最后一句话。
13. last_ai_reply：文本，AI 最后回复。
14. lead_summary：文本，线索摘要。
15. next_action：文本，下一步动作。
16. follow_up_time：文本，建议跟进时间。
17. profile_json：文本，年龄、性别、减重目标、孕哺、未成年、疾病、用药、肠胃敏感、预算等扩展信息。
18. owner：文本，人工负责人，可先留空。
19. created_at：时间，创建时间。
20. updated_at：时间，更新时间。
```

`profile_json` 示例：

```json
{
  "age": "28",
  "gender": "女",
  "weight_loss_goal": "想减40斤",
  "pregnancy_or_lactation": "",
  "minor": "",
  "medical_condition": "",
  "current_medication": "",
  "stomach_sensitive": "",
  "budget_concern": ""
}
```

### 4.2 conversation_events

用途：保存每一轮用户和 AI 的具体对话。每次用户发消息并生成回复后，都新增一条记录。

建议字段：

```text
event_id：文本，事件ID。
lead_id：文本，关联线索ID。
user_id：文本，客户唯一ID。
nickname：文本，客户昵称。
event_type：文本，price/effect/safety/buy/refund/risk/follow_up/handoff/info_collected。
user_message：文本，用户原始消息。
ai_reply：文本，AI 完整回复。
intent_level：文本，当轮意向等级。
next_action：文本，当轮下一步动作。
risk_flag：布尔值，当轮是否风险。
risk_type：文本，当轮风险类型。
message_summary：文本，当轮对话摘要。
created_at：时间，创建时间。
```

这张表必须建。`customer_leads` 存客户最新状态，`conversation_events` 存每一轮具体对话。

## 5. 工作流输入

设置 4 个输入参数：

```text
user_id：客户唯一ID，来自企微/会话/测试输入。必须有。
nickname：客户昵称，可为空。
user_message：用户最新消息
chat_history：最近聊天记录
```

测试阶段没有真实企微 user_id 时，可以手动传：

```text
user_id = test_user_001
nickname = 测试客户
```

## 6. 客户状态字段

客户状态建议使用 JSON：

```json
{
  "age": "",
  "gender": "",
  "height": "",
  "weight": "",
  "target_weight": "",
  "weight_loss_goal": "",
  "pregnancy_or_lactation": "",
  "minor": "",
  "medical_condition": "",
  "current_medication": "",
  "stomach_sensitive": "",
  "main_concern": "",
  "budget_concern": "",
  "intent_level": "",
  "current_stage": "",
  "risk_flag": false,
  "risk_type": "",
  "recommended_package": "",
  "last_user_message": "",
  "last_ai_reply": "",
  "lead_summary": "",
  "next_action": "",
  "follow_up_time": ""
}
```

字段解释：

```text
height：身高
weight：当前体重
target_weight：目标体重
main_concern：主要顾虑，效果/安全/价格/反弹/售后/正品
intent_level：A 高意向 / B 中意向 / C 低意向 / D 风险
current_stage：当前阶段
next_action：下一步动作
```

阶段建议：

```text
new_user：新客户
collecting_info：收集基础信息
answering_concern：解答顾虑
recommending_package：推荐套餐
handoff_order：转人工下单
follow_up：待跟进
risk_handoff：风险转人工
```

## 7. 工作流 A：实时客服回复流程

这个流程必须快，只做回复客户需要的最小步骤。

输入：

```text
user_id
nickname
user_message
chat_history
```

节点顺序：

```text
A1 查询 customer_leads
↓
A2 轻量判断回复动作
↓
A3 条件分流：风险/下单/普通问答
↓
A4 知识库检索
↓
A5 生成 reply
↓
A6 异步触发“异步线索沉淀流程”
↓
A7 输出 reply
```

### A1 查询 customer_leads

节点类型：数据库查询

表：

```text
customer_leads
```

条件：

```text
user_id = {{user_id}}
```

输出：

```text
old_lead_record
```

### A2 轻量判断回复动作

节点类型：大模型节点或规则节点

输入：

```text
user_message
old_lead_record
```

短提示词：

```text
请快速判断用户消息属于哪类，只输出 JSON。

分类：
- risk_handoff：孕哺、未成年、疾病、用药、身体不适、投诉、退款、付款风险、要求保证效果
- handoff_order：下单、付款、发地址、要收款码、确认订单
- normal：价格、效果、安全、用法、正品、发货、考虑一下等普通咨询

输出：
{
  "route": "risk_handoff|handoff_order|normal",
  "intent": "price|effect|safety|usage|authenticity|delivery|buy|refund|hesitation|risk|faq",
  "reason": ""
}

用户消息：
{{user_message}}
```

### A3 条件分流

```text
route = risk_handoff → 直接输出风险转人工回复
route = handoff_order → 直接输出下单转人工回复
route = normal → 进入知识库检索
```

风险转人工回复：

```text
这个问题涉及你的身体情况/订单确认/售后政策，我不直接给你下结论。

我帮你转人工确认一下，这样更稳妥。
```

付款风险回复：

```text
如果付款页面出现风险提示，建议先暂停付款，转人工核对收款方式和订单信息。

资金安全优先，确认清楚再操作。
```

下单转人工回复：

```text
可以，我先帮你转人工确认订单。

下单前会和你确认产品数量、价格、赠品、收货信息、发货方式和售后规则，确认清楚再付款。
```

### A4 知识库检索

知识库：

```text
简单版减肥产品客服知识库
```

Query：

```text
{{user_message}}
```

返回：

```text
Top 3
```

### A5 生成 reply

节点类型：大模型节点

提示词：

```text
你是企业微信减肥产品售前客服。请根据用户问题、数据库里的客户历史状态和知识库检索结果，生成最终回复。

规则：
1. 用户问什么，先回答什么。
2. 优先使用知识库里的“标准回答”。
3. 如果知识库里有“禁止”，必须避开。
4. 不承诺固定减重斤数、固定周期、百分百有效、无副作用、不反弹。
5. 不做医疗诊断，不说产品能治疗疾病。
6. 每次最多追问 3 个问题。
7. 如果 old_lead_record 已有 height、weight、target_weight，不要重复问身高体重，要推进顾虑或套餐选择。
8. 如果用户问买几套，且已有身高体重目标，可以轻推荐 598 基础套装或 1196 完整周期，但不要承诺效果。
9. 只输出回复客户的话，不要输出分析过程。

用户消息：
{{user_message}}

客户历史状态：
{{old_lead_record}}

知识库检索结果：
{{knowledge_result}}
```

### A6 异步触发工作流 B

节点类型：异步调用工作流

调用：

```text
异步线索沉淀流程
```

传入：

```text
user_id = {{user_id}}
nickname = {{nickname}}
user_message = {{user_message}}
chat_history = {{chat_history}}
old_lead_record = {{old_lead_record}}
reply = {{reply}}
route_result = {{route_result}}
```

要求：

```text
不等待工作流 B 结果。
不因为写库失败影响客户回复。
```

### A7 输出

```json
{
  "reply": "{{reply}}"
}
```

## 8. 工作流 B：异步线索沉淀流程

这个流程可以慢一点，负责结构化、写库、打标签和线索摘要。

输入：

```text
user_id
nickname
user_message
chat_history
old_lead_record
reply
route_result
```

节点顺序：

```text
B1 计算客户状态与入库数据
↓
B2 判断客户意图和阶段
↓
B3 生成线索摘要
↓
B4 新建或更新 customer_leads
↓
B5 新增 conversation_events
```

## 9. B1：计算客户状态与入库数据

节点类型：大模型节点

节点名称：

```text
计算客户状态
```

输入：

```text
user_message
chat_history
old_lead_record
```

提示词：

```text
你负责根据“数据库旧记录、用户最新消息、最近聊天记录”，统一计算客户最新状态和要写入数据库的数据。

重要：不要区分老客户话术和新客户话术。无论数据库是否查到旧记录，都输出同一套结构。

字段字典和提取规则：

1. age：年龄。
   - 从“28岁、今年35、我40了”等表达提取。
   - 没说就空字符串。

2. gender：性别。
   - 从“男、女、宝妈、女生、男生”等表达判断。
   - 不确定就空字符串。

3. height：身高。
   - 从“165、165cm、1米65、一米六五”等表达提取。
   - 如果用户只说“165，160斤”，通常第一个数字是身高，第二个带“斤”的是体重。
   - 统一尽量写成“165cm”。

4. weight：当前体重。
   - 从“160斤、80kg、体重120”等表达提取。
   - 统一保留用户单位，例如“160斤”。

5. target_weight：目标体重。
   - 从“想瘦到120、目标100斤、减到两位数”等表达提取。
   - 统一尽量写成“120斤”。

6. weight_loss_goal：减重目标。
   - 由当前体重和目标体重推断，例如 160斤 到 120斤，写“想减40斤”。
   - 如果无法计算但用户说“想瘦20斤”，直接写“想瘦20斤”。

7. pregnancy_or_lactation：孕期/哺乳期信息。
   - 出现“怀孕、孕期、备孕、哺乳、喂奶、产后还在喂奶”等，记录原意。
   - 没提到就空字符串。

8. minor：未成年信息。
   - 出现“未成年、17岁、学生党且年龄小于18”等，记录“未成年”或具体年龄。
   - 只说“学生党”但没年龄，不要直接判定未成年。

9. medical_condition：基础疾病。
   - 出现“甲状腺、血糖高、糖尿病、高血压、心脏病、肝肾问题、多囊、胃病”等，记录客户原话。
   - 不要判断能不能吃，只记录。

10. current_medication：正在用药。
   - 出现“正在吃药、吃优甲乐、吃降糖药、吃处方药、在治疗”等，记录客户原话。

11. stomach_sensitive：肠胃敏感。
   - 出现“容易腹泻、胃不好、肠胃敏感、便秘严重、吃东西容易吐”等，记录。

12. main_concern：主要顾虑，只能从以下值中选一个或多个，用顿号分隔：
   - 价格
   - 效果
   - 安全
   - 副作用
   - 反弹
   - 售后
   - 正品
   - 用法
   - 发货
   - 退款
   - 下单
   识别例子：
   - “多少钱、太贵、优惠” = 价格
   - “能瘦多少、多久见效、怕没效果” = 效果
   - “安全吗、能不能吃、有副作用吗” = 安全/副作用
   - “会不会反弹” = 反弹
   - “是不是正品、防伪” = 正品
   - “怎么吃、忌口吗” = 用法
   - “怎么下单、付款” = 下单

13. budget_concern：预算顾虑。
   - 出现“太贵、没钱、预算不够、能便宜吗、攒钱”等，记录客户原话或“预算敏感”。

14. risk_flag：是否风险客户。
   - true：客户提到孕期、哺乳期、未成年、基础疾病、正在用药、身体不适、投诉、退款、付款风险、要求绝对承诺。
   - false：未出现以上风险。

15. risk_type：风险类型，只能从以下值中选择一个或多个，用顿号分隔：
   - 孕哺
   - 未成年
   - 疾病
   - 用药
   - 肠胃敏感
   - 身体不适
   - 投诉
   - 退款
   - 付款风险
   - 绝对承诺
   例子：
   - “我哺乳期能吃吗” = 孕哺
   - “我甲状腺有问题” = 疾病
   - “付款有风险提示” = 付款风险
   - “保证一个月瘦20斤吗” = 绝对承诺

16. recommended_package：推荐套餐。
   - 只有当客户已提供身高、体重、目标体重，且没有风险信息时，才可以填写。
   - 如果只是想先体验，填“598基础套装”。
   - 如果目标明显较大或明确想做完整周期，填“1196完整周期”。
   - 不确定就空字符串。

17. profile_json：扩展信息 JSON。
   - 必须包含 age、gender、weight_loss_goal、pregnancy_or_lactation、minor、medical_condition、current_medication、stomach_sensitive、budget_concern。

同时生成 db_payload，用于后面新建或更新 customer_leads。

规则：
1. 如果用户最新消息或聊天记录里有新信息，优先使用新信息。
2. 如果本轮没有新信息，保留数据库旧记录。
3. 不要用空值覆盖旧值。
4. 如果数据库没有旧记录，就用本轮信息生成新状态，缺失字段保持空字符串。
5. 数据库旧记录里的 profile_json 是扩展信息，读取其中 age、gender、weight_loss_goal、pregnancy_or_lactation、minor、medical_condition、current_medication、stomach_sensitive、budget_concern。
6. 如果客户提到怀孕、哺乳、未成年、基础疾病、正在吃药、身体不适、投诉、付款风险、退款，risk_flag=true，并填写 risk_type。
7. profile_json 必须是 JSON 字符串或 JSON 对象，包含扩展信息。
8. db_payload 必须只包含 customer_leads 表的 20 个字段，不要输出表里不存在的字段。
9. 如果客户没说某字段，不要猜；旧记录有就保留，旧记录没有就空字符串。
10. 输出 JSON，不要输出解释。

用户最新消息：
{{user_message}}

最近聊天记录：
{{chat_history}}

数据库中已有客户状态：
{{old_lead_record}}
```

节点 2 示例 1：

```text
用户最新消息：165，160斤，想瘦到120
数据库旧记录：空
```

输出应提取：

```json
{
  "customer_state": {
    "height": "165cm",
    "weight": "160斤",
    "target_weight": "120斤",
    "weight_loss_goal": "想减40斤",
    "main_concern": "",
    "risk_flag": false,
    "risk_type": "",
    "recommended_package": "1196完整周期"
  }
}
```

节点 2 示例 2：

```text
用户最新消息：我哺乳期能吃吗
数据库旧记录：{"user_id":"test","height":"165cm","weight":"160斤"}
```

输出应提取：

```json
{
  "customer_state": {
    "height": "165cm",
    "weight": "160斤",
    "pregnancy_or_lactation": "哺乳期",
    "main_concern": "安全",
    "risk_flag": true,
    "risk_type": "孕哺",
    "recommended_package": ""
  }
}
```

节点 2 示例 3：

```text
用户最新消息：有点贵，我怕没效果
数据库旧记录：{"height":"165cm","weight":"160斤","target_weight":"120斤"}
```

输出应提取：

```json
{
  "customer_state": {
    "height": "165cm",
    "weight": "160斤",
    "target_weight": "120斤",
    "main_concern": "价格、效果",
    "budget_concern": "有点贵",
    "risk_flag": false,
    "risk_type": "",
    "recommended_package": "598基础套装"
  }
}
```

输出格式：

```json
{
  "customer_state": {
    "age": "",
    "gender": "",
    "height": "165cm",
    "weight": "160斤",
    "target_weight": "120斤",
    "weight_loss_goal": "想减40斤",
    "pregnancy_or_lactation": "",
    "minor": "",
    "medical_condition": "",
    "current_medication": "",
    "stomach_sensitive": "",
    "main_concern": "价格",
    "budget_concern": "",
    "risk_flag": false,
    "risk_type": "",
    "recommended_package": "",
    "last_user_message": "165，160斤，想瘦到120",
    "profile_json": {
      "age": "",
      "gender": "",
      "weight_loss_goal": "想减40斤",
      "pregnancy_or_lactation": "",
      "minor": "",
      "medical_condition": "",
      "current_medication": "",
      "stomach_sensitive": "",
      "budget_concern": ""
    }
  },
  "db_payload": {
    "user_id": "{{user_id}}",
    "nickname": "{{nickname}}",
    "height": "165cm",
    "weight": "160斤",
    "target_weight": "120斤",
    "main_concern": "价格",
    "risk_flag": false,
    "risk_type": "",
    "recommended_package": "",
    "last_user_message": "165，160斤，想瘦到120",
    "profile_json": {
    "age": "",
    "gender": "",
    "weight_loss_goal": "想减40斤",
    "pregnancy_or_lactation": "",
    "minor": "",
    "medical_condition": "",
    "current_medication": "",
    "stomach_sensitive": "",
    "budget_concern": ""
    }
  }
}
```

## 10. B2：意图和阶段判断

节点类型：大模型节点

节点名称：

```text
判断客户意图
```

提示词：

```text
你负责判断减肥产品企微客户的当前意图、意向等级、风险和下一步动作。

意图分类：
- price：问价格、套餐、优惠
- effect：问能瘦多少、多久见效
- safety：问安全、副作用、能不能吃
- usage：问怎么吃、忌口、运动
- authenticity：问正品、防伪、小蓝帽、资质
- delivery：问发货、物流
- buy：问怎么下单、付款、发地址、要收款码
- refund：问退款、无效退款、吃了没用能不能退
- hesitation：说太贵、考虑一下、怕没效果、怕找不到人
- risk：孕期、哺乳期、未成年、基础疾病、正在用药、身体不适、投诉、付款风险
- faq：其他普通咨询

意向等级：
- A 高意向：问价格、套餐、下单、发货、付款、正品，并愿意提供基础信息
- B 中意向：问效果、安全、副作用、反弹、太贵、考虑一下
- C 低意向：只问低价、试用、无效退款，不愿提供信息
- D 风险：孕哺、未成年、疾病、用药、投诉、不适、付款风险、退款、要求绝对承诺

下一步动作：
- answer：回答问题
- collect_info：收集身高、体重、目标
- recommend_package：推荐套餐
- handoff_order：转人工下单
- risk_handoff：风险转人工
- follow_up：留存线索并跟进

判断规则：
1. 用户问下单、付款、发地址、收款码，next_action 必须是 handoff_order。
2. 用户提到孕哺、疾病、用药、身体不适、投诉、付款风险、退款，next_action 必须是 risk_handoff。
3. 如果用户已提供身高、体重、目标，并且没有风险，且问价格/套餐/效果，next_action 可以是 recommend_package。
4. 如果缺少身高、体重、目标，且不是风险问题，next_action 优先 collect_info。
5. 如果用户说考虑一下、太贵、怕没效果，next_action 是 follow_up。

输出 JSON，不要输出解释。

用户最新消息：
{{user_message}}

客户信息：
{{customer_state_result.customer_state}}

最近聊天记录：
{{chat_history}}
```

输出示例：

```json
{
  "intent": "price",
  "intent_level": "A",
  "current_stage": "collecting_info",
  "risk_flag": false,
  "risk_type": "",
  "missing_fields": ["height", "weight", "target_weight"],
  "next_action": "answer",
  "reason": "用户询问价格，但尚未提供基础信息"
}
```

## 11. B3：生成线索摘要

节点类型：大模型节点

节点名称：

```text
生成线索摘要
```

触发：

- 每轮都可以生成。
- 或者只在 A/B/D 意向时生成。

提示词：

```text
请根据客户状态、用户最新消息和聊天记录，生成一份销售跟进摘要。

输出 JSON：
{
  "lead_valid": true/false,
  "intent_level": "A/B/C/D",
  "customer_profile": "客户基础情况",
  "main_concern": "客户主要顾虑",
  "risk_notes": "风险信息",
  "recommended_next_step": "下一步建议",
  "follow_up_message": "下次跟进可发送的话"
}

判断：
- 有身高体重目标，或问价格/效果/安全/下单，lead_valid=true。
- 只闲聊且没有需求，lead_valid=false。
```

## 12. B4：新建或更新 customer_leads

节点类型：条件判断 + 数据库新建/更新

判断依据：

```text
节点 1 是否查到 old_lead_record
```

如果查到旧记录：

```text
更新 customer_leads
条件：user_id = {{user_id}}
```

如果没查到旧记录：

```text
新建 customer_leads
```

写入字段映射：

```text
user_id = {{user_id}}
nickname = {{nickname}}
height = {{customer_state_result.db_payload.height}}
weight = {{customer_state_result.db_payload.weight}}
target_weight = {{customer_state_result.db_payload.target_weight}}
main_concern = {{customer_state_result.db_payload.main_concern}}
risk_flag = {{customer_state_result.db_payload.risk_flag}}
risk_type = {{customer_state_result.db_payload.risk_type}}
intent_level = {{intent_result.intent_level}}
current_stage = {{intent_result.current_stage}}
recommended_package = {{customer_state_result.db_payload.recommended_package}}
last_user_message = {{user_message}}
last_ai_reply = {{reply}}
lead_summary = {{lead_summary}}
next_action = {{intent_result.next_action}}
follow_up_time = {{lead_summary.follow_up_time 或 空}}
profile_json = {{customer_state_result.db_payload.profile_json}}
owner = 旧值或空
updated_at = 当前时间
created_at = 新建时写当前时间，更新时保留旧值
```

`profile_json` 已由“计算客户状态”节点生成，直接写入 `customer_state_result.db_payload.profile_json`。

注意：

```text
不要用空值覆盖数据库里已有的身高、体重、目标体重等关键字段。
如果 Coze 的更新节点会用空值覆盖旧字段，请在“合并客户状态”节点先合并好，再统一写入合并后的状态。
```

## 13. B5：新增 conversation_events

每一轮对话都要新增一条记录，方便后续完整回看客户沟通过程。

节点类型：数据库新建

新建表：

```text
conversation_events
```

写入字段：

```text
event_id = 系统生成
lead_id = {{user_id}}
user_id = {{user_id}}
nickname = {{nickname}}
event_type = {{intent_result.intent}}
user_message = {{user_message}}
ai_reply = {{reply}}
intent_level = {{intent_result.intent_level}}
next_action = {{intent_result.next_action}}
risk_flag = {{intent_result.risk_flag}}
risk_type = {{intent_result.risk_type}}
message_summary = {{lead_summary.follow_up_message 或 lead_summary.recommended_next_step 或 空}}
created_at = 当前时间
```

## 14. 工作流 B 输出

最终输出字段：

```json
{
  "updated_customer_state": {},
  "lead_summary": {},
  "next_action": ""
}
```

工作流 B 是异步流程，不需要把结果展示给客户。`lead_summary` 和客户状态已经写入 Coze 数据库。

## 20. 多轮对话示例

### 示例 1：价格到信息采集

用户：

```text
多少钱？
```

AI：

```text
现在活动是 598 到手 2 盒正装，共 72 粒；1196 到手 4 盒正装。

具体适合哪套，要看你的体重基数和目标。你方便发我 3 个信息吗：身高、体重、想减到多少？我先帮你判断适合先试一套，还是做完整周期。
```

用户：

```text
165，160斤，想瘦到120
```

AI：

```text
你这个目标比较明确，不是只想简单体验一下。

可以先从 598 的基础套装启动，如果你想按完整周期来，也可以让人工帮你确认 1196 的 4 盒方案。你更想先试一套，还是直接按完整周期来？
```

### 示例 2：安全问题到转人工

用户：

```text
我哺乳期能吃吗？
```

AI：

```text
孕期和哺乳期不建议使用。这个涉及你的身体情况，我帮你转人工确认一下，更稳妥。
```

### 示例 3：犹豫到线索留存

用户：

```text
我考虑一下吧，有点怕没效果
```

AI：

```text
可以的，不着急下单。

你主要是在担心效果这一块，对吧？体重管理确实不能承诺固定斤数，具体会受体重基数、饮食、作息和配合度影响。

我先帮你记一下，你现在主要顾虑是效果。你方便告诉我身高、体重和目标吗？我先判断一下你这种情况适合先试一套，还是先别急着买。
```

## 21. 促单节点怎么判断

满足以下条件，可以轻促单：

```text
1. 用户已问过价格或套餐。
2. 用户已提供身高、体重、目标体重。
3. 没有孕哺、疾病、用药等风险信息。
4. 用户还在继续问效果、正品、发货、优惠、是否适合。
```

轻促单话术：

```text
结合你现在的目标，可以先从 598 的基础套装开始，先启动一个周期看看体感和变化。

如果你想做完整周期，也可以让人工帮你确认 1196 的 4 盒方案。你更想先试一套，还是按完整周期来？
```

强转人工时机：

```text
用户说我要买、怎么付款、发地址、有没有收款码、现在能发货吗。
```

转人工话术：

```text
可以，我先帮你转人工确认订单。

下单前会和你确认产品数量、价格、赠品、收货信息、发货方式和售后规则，确认清楚再付款。
```

## 22. 线索留存怎么判断

满足以下任意条件，视为有效线索：

```text
问价格
问效果
问安全
问用法
问正品
问发货
提供身高体重目标
说考虑一下
说太贵
说怕没效果
```

线索摘要格式：

```text
客户基础情况：
客户主要问题：
客户意向等级：
客户顾虑：
风险信息：
建议下一步：
```

## 23. 后续外部同步

第一版先把线索存到 Coze 数据库。后续如果要给老板、销售或运营看日报，再从 Coze 数据库同步到：

```text
飞书表格
腾讯文档
Google Sheet
CRM
企业微信客户备注
```

建议同步字段：

```text
时间
客户昵称/ID
身高
体重
目标
主要顾虑
意向等级
是否风险
下一步动作
聊天摘要
```

## 24. 上线测试用例

### 测试 1：价格

```text
多少钱？
```

必须回答价格，再问身高体重目标。

### 测试 2：多轮信息记忆

```text
用户：多少钱？
用户：165，160斤，想减到120
用户：那我买几套？
```

必须基于已提供信息推荐，不要重复问身高体重。

### 测试 3：促单

```text
用户：我165，160斤，想减到120，有点怕没效果
用户：现在活动还有吗？
```

应轻推荐 598 或 1196 方案，并问先试一套还是完整周期。

### 测试 4：风险

```text
我哺乳期能吃吗？
```

必须转人工。

### 测试 5：下单

```text
我要下单，怎么付款？
```

必须转人工确认订单。

### 测试 6：留存

```text
我考虑一下，怕没效果。
```

必须识别为 B 级意向，记录顾虑，并追问基础信息或跟进点。

## 25. 最小可用交付标准

这版完成后，至少要满足：

1. 能记住客户已经说过的身高、体重、目标。
2. 不重复问同样信息。
3. 问价格先报价，再追问。
4. 有基础信息后能轻促单。
5. 下单和付款必须转人工。
6. 风险问题必须转人工。
7. 犹豫客户能沉淀顾虑和线索摘要。
8. 每轮输出一份可给人工看的客户摘要。
