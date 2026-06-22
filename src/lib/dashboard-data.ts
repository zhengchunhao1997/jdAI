export type IntentLevel = "high" | "medium" | "low"
export type SessionStatus = "ai_answered" | "need_human" | "lead_captured" | "kb_missed"

export interface Session {
  id: string
  visitor: string
  question: string
  intent: IntentLevel
  status: SessionStatus
  channel: string
  updatedAt: string
  focus: string[]
  summary: string
  suggestion: string
  needHuman: boolean
  contact: string
}

export const metrics = [
  { label: "今日会话", value: "1,284", trend: "+12.4%", trendUp: true, hint: "较昨日" },
  { label: "AI 解决率", value: "86.5%", trend: "+3.1%", trendUp: true, hint: "较上周" },
  { label: "高意向线索", value: "92", trend: "+8.2%", trendUp: true, hint: "较昨日" },
  { label: "待人工接管", value: "14", trend: "+2", trendUp: false, hint: "需尽快处理" },
  { label: "未命中问题", value: "23", trend: "-0.3s", trendUp: true, hint: "平均响应" },
]

export const sessions: Session[] = [
  {
    id: "2048",
    visitor: "访客 #2048",
    question: "企业版可以接入企业微信吗？",
    intent: "high",
    status: "need_human",
    channel: "官网",
    updatedAt: "2分钟前",
    focus: ["企业微信接入", "企业版价格"],
    summary: "客户关注企业微信接入和企业版价格，已触发报价转人工规则。",
    suggestion: "销售今天内联系，提供企业版报价和接入方案。",
    needHuman: true,
    contact: "已留手机号",
  },
  {
    id: "2047",
    visitor: "访客 #2047",
    question: "课程退款规则是怎样的？",
    intent: "medium",
    status: "ai_answered",
    channel: "小程序",
    updatedAt: "5分钟前",
    focus: ["退款规则", "课程服务"],
    summary: "客户询问课程退款政策，AI 已基于知识库给出 7 天无理由退款说明。",
    suggestion: "持续观察，暂无需人工介入。",
    needHuman: false,
    contact: "未留资",
  },
  {
    id: "2043",
    visitor: "访客 #2043",
    question: "想了解财税代理套餐",
    intent: "high",
    status: "lead_captured",
    channel: "官网",
    updatedAt: "12分钟前",
    focus: ["财税代理", "套餐报价"],
    summary: "客户主动咨询财税代理套餐，已留下联系方式，意向明确。",
    suggestion: "分配给财税顾问，2 小时内电话回访。",
    needHuman: true,
    contact: "已留微信",
  },
  {
    id: "2041",
    visitor: "访客 #2041",
    question: "你们支持私有化部署吗？合同怎么签？",
    intent: "high",
    status: "need_human",
    channel: "官网",
    updatedAt: "18分钟前",
    focus: ["私有化部署", "合同条款"],
    summary: "客户涉及合同与私有化部署问题，超出 AI 处理范围，已转人工。",
    suggestion: "由商务负责人对接，提供合同模板与部署方案。",
    needHuman: true,
    contact: "已留邮箱",
  },
  {
    id: "2038",
    visitor: "访客 #2038",
    question: "AI 客服可以自定义话术吗？",
    intent: "medium",
    status: "ai_answered",
    channel: "公众号",
    updatedAt: "25分钟前",
    focus: ["自定义话术", "功能咨询"],
    summary: "客户咨询话术自定义能力，AI 已说明可在知识库中配置。",
    suggestion: "推送产品功能文档，跟进试用意愿。",
    needHuman: false,
    contact: "未留资",
  },
  {
    id: "2035",
    visitor: "访客 #2035",
    question: "这个价格能不能再优惠一点？",
    intent: "medium",
    status: "kb_missed",
    channel: "小程序",
    updatedAt: "31分钟前",
    focus: ["价格优惠", "议价"],
    summary: "客户尝试议价，知识库未覆盖折扣政策，问题未命中。",
    suggestion: "补充折扣政策到知识库，转销售判断报价空间。",
    needHuman: false,
    contact: "未留资",
  },
]

export const handoffReasons = [
  { reason: "涉及报价", count: 6, tone: "high" as const },
  { reason: "涉及合同", count: 3, tone: "high" as const },
  { reason: "涉及退款", count: 2, tone: "medium" as const },
  { reason: "客户明确要求人工", count: 2, tone: "medium" as const },
  { reason: "投诉或高风险问题", count: 1, tone: "high" as const },
]

export const missedQuestions = [
  { question: "这个价格能不能再优惠一点？", count: 18, category: "价格/议价", suggestion: "补充折扣与议价话术" },
  { question: "支持开专票吗？税点多少？", count: 12, category: "财务/发票", suggestion: "补充发票政策说明" },
  { question: "和某竞品相比有什么优势？", count: 9, category: "竞品对比", suggestion: "整理竞品对比话术" },
  { question: "可以先免费试用多久？", count: 7, category: "试用政策", suggestion: "明确试用时长与权限" },
]

export const channelLeads = [
  { channel: "官网", value: 48, percent: 52 },
  { channel: "小程序", value: 24, percent: 26 },
  { channel: "公众号", value: 12, percent: 13 },
  { channel: "企业微信", value: 8, percent: 9 },
]

export const sessionTrend = [
  { label: "09:00", value: 42 },
  { label: "11:00", value: 88 },
  { label: "13:00", value: 64 },
  { label: "15:00", value: 120 },
  { label: "17:00", value: 96 },
  { label: "19:00", value: 138 },
  { label: "21:00", value: 72 },
]
