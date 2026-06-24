insert into "v2_dictionaries" ("id", "tenantId", "dictType", "code", "label", "description", "sortOrder", "enabled", "createdAt", "updatedAt")
values
  ('dict_intent_a', null, 'intent_level', 'A', '高意向用户', '问价格、问套餐、说想买、愿意留联系方式或需要人工承接', 10, true, now(), now()),
  ('dict_intent_b', null, 'intent_level', 'B', '中意向用户', '提供关键信息，持续追问效果、方案、流程或适配条件', 20, true, now(), now()),
  ('dict_intent_c', null, 'intent_level', 'C', '低意向用户', '泛泛咨询，信息不完整，暂未表现出明确购买或合作动作', 30, true, now(), now()),
  ('dict_intent_d', null, 'intent_level', 'D', '风险用户', '存在投诉、禁忌、合规、售后争议或明显不适合继续自动销售的问题', 40, true, now(), now()),
  ('dict_intent_unknown', null, 'intent_level', 'UNKNOWN', '待判断', '暂未识别意向等级', 50, true, now(), now()),

  ('dict_conv_ai_serving', null, 'conversation_status', 'AI_SERVING', 'AI接待中', '会话由AI自动接待', 10, true, now(), now()),
  ('dict_conv_need_human', null, 'conversation_status', 'NEED_HUMAN', '需要人工', 'AI判断需要人工客服或销售介入', 20, true, now(), now()),
  ('dict_conv_human_serving', null, 'conversation_status', 'HUMAN_SERVING', '人工接待中', '会话已由人工接管', 30, true, now(), now()),
  ('dict_conv_closed', null, 'conversation_status', 'CLOSED', '已关闭', '会话已结束', 40, true, now(), now()),

  ('dict_stage_new', null, 'lead_stage', 'NEW', '新咨询', '新进入咨询，还未完成需求识别', 10, true, now(), now()),
  ('dict_stage_qualified', null, 'lead_stage', 'QUALIFIED', '已识别需求', '已提取客户需求或关键画像', 20, true, now(), now()),
  ('dict_stage_price_asked', null, 'lead_stage', 'PRICE_ASKED', '问价格', '客户咨询价格、费用、套餐或购买成本', 30, true, now(), now()),
  ('dict_stage_solution', null, 'lead_stage', 'SOLUTION_RECOMMENDED', '已推荐方案', 'AI或人工已给出推荐方案', 40, true, now(), now()),
  ('dict_stage_handoff', null, 'lead_stage', 'HANDOFF', '已转人工', '已转人工跟进或准备转人工', 50, true, now(), now()),
  ('dict_stage_won', null, 'lead_stage', 'WON', '已成交', '客户已成交或已付款', 60, true, now(), now()),
  ('dict_stage_lost', null, 'lead_stage', 'LOST', '已流失', '客户明确拒绝或长时间无响应', 70, true, now(), now()),
  ('dict_stage_invalid', null, 'lead_stage', 'INVALID', '无效', '无效咨询、测试、重复或非目标客户', 80, true, now(), now()),

  ('dict_lead_open', null, 'lead_status', 'OPEN', '待跟进', '线索已生成，等待跟进', 10, true, now(), now()),
  ('dict_lead_following', null, 'lead_status', 'FOLLOWING', '跟进中', '人工或系统正在持续跟进', 20, true, now(), now()),
  ('dict_lead_won', null, 'lead_status', 'WON', '已成交', '线索已成交', 30, true, now(), now()),
  ('dict_lead_lost', null, 'lead_status', 'LOST', '已流失', '线索已流失', 40, true, now(), now()),
  ('dict_lead_invalid', null, 'lead_status', 'INVALID', '无效', '无效线索', 50, true, now(), now()),

  ('dict_miss_no_kb', null, 'miss_type', 'NO_KB', '知识库缺失', '知识库没有覆盖该问题', 10, true, now(), now()),
  ('dict_miss_low_confidence', null, 'miss_type', 'LOW_CONFIDENCE', '低置信回答', 'AI回答置信度低，需要复核', 20, true, now(), now()),
  ('dict_miss_conflict', null, 'miss_type', 'CONFLICT', '知识冲突', '命中的知识之间存在冲突', 30, true, now(), now()),
  ('dict_miss_out_scope', null, 'miss_type', 'OUT_OF_SCOPE', '超出范围', '问题超出业务或合规允许范围', 40, true, now(), now()),
  ('dict_miss_bad_tone', null, 'miss_type', 'BAD_TONE', '语气不佳', '回答语气不像真人或不符合品牌人设', 50, true, now(), now()),
  ('dict_miss_rewrite_kb', null, 'miss_type', 'REWRITE_KB', '改写知识库', 'AI改变或放大了知识库原意', 60, true, now(), now()),

  ('dict_review_auto', null, 'review_status', 'AUTO', '自动质检', '系统自动生成的质检结果', 10, true, now(), now()),
  ('dict_review_need', null, 'review_status', 'NEED_REVIEW', '待人工复核', '需要人工复核', 20, true, now(), now()),
  ('dict_review_done', null, 'review_status', 'REVIEWED', '已复核', '人工已经复核', 30, true, now(), now())
on conflict ("id") do nothing;
