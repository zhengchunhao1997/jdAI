"use client"

import {
  useEffect,
  useState,
  type ComponentType,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
  type SVGProps,
} from "react"
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  CircleHelp,
  Database,
  Headset,
  MessageSquareText,
  Plus,
  RefreshCw,
  Search,
  Settings,
  UserRoundCheck,
  WalletCards,
} from "lucide-react"

import {
  type AdminConversation,
  type AdminLead,
  type AdminMerchant,
  type AdminMissedQuestion,
  type AdminOverview,
  type VolcKnowledgeResponse,
  type VolcKnowledgeStatus,
  adminPost,
  formatDateTime,
  intentLabel,
  knowledgeFetch,
  knowledgePost,
  statusLabel,
} from "@/lib/admin-api"
import { IntentBadge, StatusBadge } from "./badges"
import { Button } from "@/components/ui/button"

const metricTone = {
  primary: {
    card: "border-indigo-500 bg-indigo-600 text-white",
    label: "text-indigo-50",
    note: "text-indigo-100/85",
    value: "text-white",
    hint: "text-indigo-100/85",
    iconWrap: "bg-white/16 text-white",
  },
  info: {
    card: "border-sky-200 bg-sky-50/80",
    label: "text-sky-800",
    note: "text-sky-700/75",
    value: "text-sky-950",
    hint: "text-sky-700",
    iconWrap: "bg-sky-100 text-sky-700",
  },
  warning: {
    card: "border-amber-200 bg-amber-50/90",
    label: "text-amber-800",
    note: "text-amber-700/75",
    value: "text-amber-950",
    hint: "text-amber-700",
    iconWrap: "bg-amber-100 text-amber-700",
  },
  success: {
    card: "border-emerald-200 bg-emerald-50/90",
    label: "text-emerald-800",
    note: "text-emerald-700/75",
    value: "text-emerald-950",
    hint: "text-emerald-700",
    iconWrap: "bg-emerald-100 text-emerald-700",
  },
  violet: {
    card: "border-violet-200 bg-violet-50/90",
    label: "text-violet-800",
    note: "text-violet-700/75",
    value: "text-violet-950",
    hint: "text-violet-700",
    iconWrap: "bg-violet-100 text-violet-700",
  },
  danger: {
    card: "border-rose-200 bg-rose-50/90",
    label: "text-rose-800",
    note: "text-rose-700/75",
    value: "text-rose-950",
    hint: "text-rose-700",
    iconWrap: "bg-rose-100 text-rose-700",
  },
} as const

const summaryTone = {
  indigo: "border-indigo-200 bg-indigo-50 text-indigo-950 [&_p:first-child]:text-indigo-700 [&_p:last-child]:text-indigo-700",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-950 [&_p:first-child]:text-emerald-700 [&_p:last-child]:text-emerald-700",
  warning:
    "border-amber-200 bg-amber-50 text-amber-950 [&_p:first-child]:text-amber-700 [&_p:last-child]:text-amber-700",
} as const

const headerTone = {
  default: {
    row: "border-slate-200 bg-white",
    icon: "bg-indigo-50 text-indigo-700",
    title: "text-slate-950",
    description: "text-slate-600",
  },
  indigo: {
    row: "border-indigo-100 bg-gradient-to-r from-indigo-50 to-white",
    icon: "bg-indigo-600 text-white",
    title: "text-indigo-950",
    description: "text-indigo-700",
  },
  emerald: {
    row: "border-emerald-100 bg-gradient-to-r from-emerald-50 to-white",
    icon: "bg-emerald-600 text-white",
    title: "text-emerald-950",
    description: "text-emerald-700",
  },
  amber: {
    row: "border-amber-100 bg-gradient-to-r from-amber-50 to-white",
    icon: "bg-amber-500 text-white",
    title: "text-amber-950",
    description: "text-amber-700",
  },
  rose: {
    row: "border-rose-100 bg-gradient-to-r from-rose-50 to-white",
    icon: "bg-rose-600 text-white",
    title: "text-rose-950",
    description: "text-rose-700",
  },
  sky: {
    row: "border-sky-100 bg-gradient-to-r from-sky-50 to-white",
    icon: "bg-sky-600 text-white",
    title: "text-sky-950",
    description: "text-sky-700",
  },
  violet: {
    row: "border-violet-100 bg-gradient-to-r from-violet-50 to-white",
    icon: "bg-violet-600 text-white",
    title: "text-violet-950",
    description: "text-violet-700",
  },
  slate: {
    row: "border-slate-200 bg-gradient-to-r from-slate-50 to-white",
    icon: "bg-slate-800 text-white",
    title: "text-slate-950",
    description: "text-slate-600",
  },
} as const

const titleTone = {
  default: { title: "text-slate-950", description: "text-slate-600" },
  indigo: { title: "text-indigo-950", description: "text-indigo-700" },
  emerald: { title: "text-emerald-950", description: "text-emerald-700" },
  amber: { title: "text-amber-950", description: "text-amber-700" },
  rose: { title: "text-rose-950", description: "text-rose-700" },
  sky: { title: "text-sky-950", description: "text-sky-700" },
  violet: { title: "text-violet-950", description: "text-violet-700" },
  slate: { title: "text-slate-950", description: "text-slate-600" },
} as const

const panelShell = "rounded-xl border border-slate-200 bg-white"
const tableHeadRow = "border-b border-slate-200 bg-slate-50 text-xs text-slate-600"
const tableRow = "border-b border-slate-200 last:border-0 hover:bg-indigo-50/40"
const mutedCell = "text-slate-600"
const strongCell = "font-semibold text-slate-950"
const actionLink = "font-medium text-indigo-700 hover:text-indigo-900"

export function MetricGrid({ overview }: { overview: AdminOverview | null }) {
  const metrics = [
    {
      label: "接待人数",
      todayValue: overview?.metrics.todayVisitors ?? overview?.metrics.todayConversations ?? 0,
      totalValue: overview?.metrics.totalConversations ?? 0,
      icon: MessageSquareText,
      emphasis: "primary",
      note: "进线客户规模",
    },
    {
      label: "消息数",
      todayValue: overview?.metrics.todayMessages ?? overview?.metrics.todayQuestions ?? 0,
      totalValue: overview?.metrics.totalMessages ?? overview?.metrics.answeredQuestions ?? overview?.metrics.todayMessages ?? 0,
      icon: BarChart3,
      emphasis: "info",
      note: "客服工作量",
    },
    {
      label: "人工接管数",
      todayValue: overview?.metrics.humanHandoffs ?? overview?.metrics.pendingHandoffs ?? 0,
      totalValue: overview?.metrics.totalHumanHandoffs ?? overview?.metrics.pendingHandoffs ?? 0,
      icon: CheckCircle2,
      emphasis: "warning",
      note: "待销售跟进",
    },
    {
      label: "有效线索数",
      todayValue: overview?.metrics.effectiveLeads ?? 0,
      totalValue: overview?.metrics.totalEffectiveLeads ?? overview?.metrics.totalLeads ?? overview?.metrics.effectiveLeads ?? 0,
      icon: UserRoundCheck,
      emphasis: "success",
      note: "可转化客户",
    },
    {
      label: "已下单/待付款",
      todayValue: overview?.metrics.paidOrPending ?? 0,
      totalValue: overview?.metrics.totalPaidOrPending ?? overview?.metrics.paidOrPending ?? 0,
      icon: WalletCards,
      emphasis: "violet",
      note: "成交进度",
    },
    {
      label: "知识库未命中",
      todayValue: overview?.metrics.missedQuestions ?? 0,
      totalValue: overview?.metrics.totalMissedQuestions ?? overview?.metrics.missedQuestions ?? 0,
      icon: AlertTriangle,
      emphasis: "danger",
      note: "需要补知识库",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {metrics.map((item, index) => {
        const tone = metricTone[item.emphasis as keyof typeof metricTone]
        const Icon = item.icon

        return (
          <div key={item.label} className={`group rounded-xl border p-4 transition-colors duration-200 ${tone.card}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={`text-sm font-medium ${tone.label}`}>{item.label}</p>
                <p className={`mt-1 text-xs ${tone.note}`}>{item.note}</p>
              </div>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone.iconWrap}`}>
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <p className={`text-xs font-medium ${tone.hint}`}>今日</p>
                <p className={`mt-1 text-3xl font-semibold leading-none tracking-tight ${tone.value}`}>{item.todayValue}</p>
              </div>
              {index === 0 && (
                <span className="hidden rounded-full bg-white/18 px-2 py-1 text-xs font-medium text-white/90 2xl:inline-flex">
                  今日核心
                </span>
              )}
            </div>
            <div className={`mt-4 flex items-center justify-between rounded-lg px-3 py-2 text-xs ${
              index === 0 ? "bg-white/14 text-white/90" : "bg-white/70"
            }`}>
              <span className={index === 0 ? "text-white/80" : tone.hint}>累计</span>
              <span className={`font-semibold ${index === 0 ? "text-white" : tone.value}`}>{item.totalValue}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function EffectOverviewPanel({ overview }: { overview: AdminOverview | null }) {
  return (
    <div className={panelShell}>
      <PanelHeader
        title="客服效果总览"
        description="实时查看客服的工作数据"
        icon={BarChart3}
        accent="indigo"
      />
      <div className="p-4">
        <MetricGrid overview={overview} />
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <SummaryTile
            label="AI 解决率"
            value={`${overview?.metrics.aiResolutionRate ?? 0}%`}
            description="回答量和未命中问题综合估算"
            tone="success"
          />
          <SummaryTile
            label="节省人工时间"
            value={`${overview?.metrics.todayTimeSavedMinutes ?? 0} 分钟`}
            description="按每条消息节省 2 分钟估算"
            tone="indigo"
          />
          <SummaryTile
            label="待跟进客户"
            value={overview?.metrics.pendingHandoffs ?? 0}
            description="高意向、下单、风险或需要人工承接"
            tone="warning"
          />
        </div>
      </div>
    </div>
  )
}

export function FunnelPanel({ overview }: { overview: AdminOverview | null }) {
  const funnel = overview?.funnel ?? []
  const max = Math.max(1, funnel[0]?.value ?? 0)

  return (
    <div className={panelShell}>
      <PanelHeader title="线索转化漏斗" description="从咨询到成交，定位哪一环需要优化话术" icon={BarChart3} accent="violet" />
      <div className="space-y-3 p-4">
        {funnel.map((step, index) => (
          <div key={step.key} className="rounded-lg border border-violet-100 bg-violet-50/40 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-violet-950">{step.label}</p>
                <p className="mt-0.5 text-xs text-violet-700">占总咨询 {step.rate}% · 上一步转化 {step.previousRate}%</p>
              </div>
              <p className="text-lg font-semibold text-violet-950">{step.value}</p>
            </div>
            <div className="mt-3 h-2 rounded-full bg-violet-100">
              <div
                className={`h-full rounded-full ${index < 3 ? "bg-violet-600" : "bg-emerald-500"}`}
                style={{ width: `${Math.max(3, (step.value / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
        {funnel.length === 0 && <EmptyLine text="暂无漏斗数据，线索和聊天记录同步后会自动生成。" />}
      </div>
    </div>
  )
}

export function HighIntentLeadsPanel({ leads }: { leads: AdminLead[] }) {
  return (
    <div className={panelShell}>
      <PanelHeader title="高意向客户列表" description="每天优先跟进这些客户，减少销售漏单" icon={UserRoundCheck} accent="emerald" />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] text-left text-sm">
          <thead>
            <tr className={tableHeadRow}>
              <th className="px-4 py-3 font-medium">客户</th>
              <th className="px-4 py-3 font-medium">等级</th>
              <th className="px-4 py-3 font-medium">最近问题</th>
              <th className="px-4 py-3 font-medium">身高/体重/目标</th>
              <th className="px-4 py-3 font-medium">主要顾虑</th>
              <th className="px-4 py-3 font-medium">推荐套餐</th>
              <th className="px-4 py-3 font-medium">下一步动作</th>
              <th className="px-4 py-3 font-medium">最后沟通</th>
              <th className="px-4 py-3 font-medium">跟进建议</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className={tableRow}>
                <td className={`whitespace-nowrap px-4 py-3 ${strongCell}`}>{lead.name ?? lead.conversation?.visitorId ?? "未知客户"}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 px-2 text-xs font-semibold text-emerald-700">
                    {lead.intentGrade ?? "待判定"}
                  </span>
                </td>
                <td className={`max-w-[220px] truncate px-4 py-3 ${mutedCell}`}>{lead.lastQuestion ?? lead.conversation?.latestMessage ?? "-"}</td>
                <td className={`whitespace-nowrap px-4 py-3 ${mutedCell}`}>{[lead.height, lead.weight, lead.targetWeight].filter(Boolean).join(" / ") || "-"}</td>
                <td className={`max-w-[180px] truncate px-4 py-3 ${mutedCell}`}>{lead.mainConcern ?? lead.demand ?? "-"}</td>
                <td className={`max-w-[160px] truncate px-4 py-3 ${mutedCell}`}>{lead.recommendedPackage ?? "-"}</td>
                <td className={`max-w-[180px] truncate px-4 py-3 ${mutedCell}`}>{lead.nextAction ?? "-"}</td>
                <td className={`whitespace-nowrap px-4 py-3 ${mutedCell}`}>{formatDateTime(lead.updatedAt)}</td>
                <td className="max-w-[220px] truncate px-4 py-3 font-medium text-emerald-800">{lead.followUpSuggestion ?? "继续补齐需求信息"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && <EmptyLine text="暂无高意向客户。问价格、问套餐、说要下单或需要人工的客户会进入这里。" />}
      </div>
    </div>
  )
}

export function ConcernPanel({
  overview,
  onDemoUnavailable,
}: {
  overview: AdminOverview | null
  onDemoUnavailable?: () => void
}) {
  const ranking = overview?.concernRanking ?? []
  const hotQuestions = overview?.hotQuestions ?? []
  const max = Math.max(1, ...ranking.map((item) => item.count))

  return (
    <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
      <div className={panelShell}>
        <PanelHeader title="客户主要问题和顾虑" description="用真实咨询反推客服话术、短视频和小红书选题" icon={CircleHelp} accent="amber" />
        <div className="space-y-3 p-4">
          {ranking.map((item, index) => (
            <div key={item.key} className="grid gap-3 rounded-lg border border-amber-100 bg-amber-50/35 p-3 md:grid-cols-[120px_1fr_auto] md:items-center">
              <div>
                <p className="font-semibold text-amber-950">{item.label}</p>
                <p className="text-xs text-amber-700">{item.count} 次</p>
              </div>
              <div>
                <div className="h-2 rounded-full bg-amber-100">
                  <div
                    className={`h-full rounded-full ${index < 2 ? "bg-amber-500" : "bg-indigo-500"}`}
                    style={{ width: `${Math.max(3, (item.count / max) * 100)}%` }}
                  />
                </div>
                <p className="mt-2 truncate text-xs text-amber-800">{item.examples[0] ?? "暂无高频原话"}</p>
              </div>
              <Button
                variant="outline"
                className="border-amber-200 bg-white text-amber-800 hover:bg-amber-50"
                onClick={onDemoUnavailable}
              >
                查看原话
              </Button>
            </div>
          ))}
          {ranking.length === 0 && <EmptyLine text="暂无顾虑统计，聊天记录同步后会自动汇总。" />}
        </div>
      </div>
      <div className={panelShell}>
        <PanelHeader title="高频原话" description="客户反复问的问题" icon={MessageSquareText} accent="sky" />
        <div className="divide-y divide-slate-200">
          {hotQuestions.map((item) => (
            <div key={item.question} className="p-4 hover:bg-sky-50/50">
              <p className="text-sm font-semibold text-slate-950">{item.question}</p>
              <p className="mt-1 text-xs text-sky-700">出现 {item.count} 次</p>
            </div>
          ))}
          {hotQuestions.length === 0 && <EmptyLine text="暂无高频原话。" />}
        </div>
      </div>
    </div>
  )
}

export function SessionsPanel({
  sessions,
  selectedId,
  onSelect,
}: {
  sessions: AdminConversation[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className={panelShell}>
      <PanelHeader title="沟通记录" description="AI 已回答的问题与客户意向记录" icon={MessageSquareText} accent="sky" />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className={tableHeadRow}>
              <th className="px-4 py-3 font-medium">访客</th>
              <th className="px-4 py-3 font-medium">客户问题</th>
              <th className="px-4 py-3 font-medium">意向等级</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">来源渠道</th>
              <th className="px-4 py-3 font-medium">更新时间</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((item) => (
              <tr
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`cursor-pointer border-b border-slate-200 last:border-0 hover:bg-sky-50/50 ${
                  selectedId === item.id ? "bg-indigo-50/70" : ""
                }`}
              >
                <td className={`whitespace-nowrap px-4 py-3 ${strongCell}`}>{item.visitorId}</td>
                <td className={`max-w-[260px] truncate px-4 py-3 ${mutedCell}`}>
                  {item.latestMessage ?? item.messages?.[0]?.content ?? "-"}
                </td>
                <td className="px-4 py-3">
                  <IntentBadge intent={item.intentLevel} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={item.status} />
                </td>
                <td className={`whitespace-nowrap px-4 py-3 ${mutedCell}`}>{item.channel}</td>
                <td className={`whitespace-nowrap px-4 py-3 ${mutedCell}`}>{formatDateTime(item.updatedAt)}</td>
                <td className={`whitespace-nowrap px-4 py-3 ${actionLink}`}>查看</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sessions.length === 0 && <EmptyLine text="暂无沟通记录，Coze 数据同步后会在这里出现。" />}
      </div>
    </div>
  )
}

export function ConversationInsight({
  session,
  onDemoUnavailable,
}: {
  session: AdminConversation | null
  onDemoUnavailable?: () => void
}) {
  if (!session) {
    return (
      <div className={`${panelShell} p-5`}>
        <p className="text-sm font-semibold text-slate-950">客户画像与 AI 分析</p>
        <p className="mt-2 text-sm text-slate-600">选择一条会话后查看详情。</p>
      </div>
    )
  }

  return (
    <div className={panelShell}>
      <PanelHeader title="客户画像与 AI 分析" description="选中会话的实时洞察" icon={Database} accent="indigo" />
      <div className="space-y-4 p-4">
        <KeyValue label="访客 ID" value={session.visitorId} />
        <KeyValue label="来源渠道" value={session.channel} />
        <KeyValue label="意向等级" value={intentLabel(session.intentLevel)} />
        <KeyValue label="当前状态" value={statusLabel(session.status)} />
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">关注点标签</p>
          <div className="flex flex-wrap gap-2">
            {(session.lead?.tags.length ? session.lead.tags : ["待分析"]).map((tag) => (
              <span key={tag} className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <InfoBox title="会话摘要" text={session.summary ?? session.lead?.conversation?.summary ?? "等待 Worker 生成摘要。"} />
        <InfoBox title="AI 建议动作" text={session.lead?.nextAction ?? "暂无建议动作。"} accent />
        <Button className="w-full" onClick={onDemoUnavailable}>分配跟进</Button>
      </div>
    </div>
  )
}

export function LeadsPanel({ leads }: { leads: AdminLead[] }) {
  return (
    <div className={panelShell}>
      <PanelHeader title="客户线索" description="AI 识别出来需要跟进的潜在客户" icon={UserRoundCheck} accent="emerald" />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead>
            <tr className={tableHeadRow}>
              <th className="px-4 py-3 font-medium">客户</th>
              <th className="px-4 py-3 font-medium">来源</th>
              <th className="px-4 py-3 font-medium">关注点</th>
              <th className="px-4 py-3 font-medium">意向</th>
              <th className="px-4 py-3 font-medium">跟进状态</th>
              <th className="px-4 py-3 font-medium">建议动作</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className={tableRow}>
                <td className={`px-4 py-3 ${strongCell}`}>{lead.name ?? lead.conversation?.visitorId ?? "未知客户"}</td>
                <td className={`px-4 py-3 ${mutedCell}`}>{lead.targetChannel ?? lead.conversation?.channel ?? "Coze"}</td>
                <td className={`max-w-[260px] truncate px-4 py-3 ${mutedCell}`}>{lead.demand ?? "-"}</td>
                <td className="px-4 py-3">
                  <IntentBadge intent={lead.intentLevel} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={lead.followUpStatus} />
                </td>
                <td className="max-w-[260px] truncate px-4 py-3 font-medium text-emerald-800">{lead.nextAction ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && <EmptyLine text="暂无客户线索，AI 识别出有意向客户后会进入这里。" />}
      </div>
    </div>
  )
}

export function HandoffsPanel({
  handoffs,
  onDemoUnavailable,
}: {
  handoffs: AdminConversation[]
  onDemoUnavailable?: () => void
}) {
  return (
    <div className={panelShell}>
      <PanelHeader title="待跟进客户" description="高意向、风险或需要人工继续沟通的客户" icon={Headset} accent="rose" />
      <div className="divide-y divide-slate-200">
        {handoffs.map((item) => (
          <div key={item.id} className="grid gap-3 p-4 hover:bg-rose-50/40 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-950">{item.visitorId}</p>
                <StatusBadge status={item.status} />
                <IntentBadge intent={item.intentLevel} />
              </div>
              <p className={`mt-2 text-sm ${mutedCell}`}>{item.latestMessage ?? "-"}</p>
              <p className="mt-1 text-xs text-rose-700">
                原因：{item.handoffEvents?.[0]?.reason ?? "AI 判断需要人工确认"}
              </p>
            </div>
            <Button onClick={onDemoUnavailable}>接管会话</Button>
          </div>
        ))}
        {handoffs.length === 0 && <EmptyLine text="暂无待跟进客户，高意向或复杂问题会进入这里。" />}
      </div>
    </div>
  )
}

export function MissedPanel({
  questions,
  onDemoUnavailable,
}: {
  questions: AdminMissedQuestion[]
  onDemoUnavailable?: () => void
}) {
  return (
    <div className={panelShell}>
      <PanelHeader title="未命中问题" description="AI 没有答好的问题，用来补充客户知识库" icon={CircleHelp} accent="rose" />
      <div className="divide-y divide-slate-200">
        {questions.map((item) => (
          <div key={item.id} className="grid gap-3 p-4 hover:bg-rose-50/40 md:grid-cols-[1fr_auto]">
            <div className="min-w-0">
              <p className="font-semibold text-slate-950">{item.question}</p>
              <p className="mt-1 text-sm text-slate-600">{item.reason ?? "等待分析原因"}</p>
              <p className="mt-1 text-xs text-rose-700">建议：{item.suggestedAnswer ?? "补充标准答案"}</p>
            </div>
            <Button
              variant="outline"
              className="border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
              onClick={onDemoUnavailable}
            >
              <Plus className="h-4 w-4" />
              补充答案
            </Button>
          </div>
        ))}
        {questions.length === 0 && <EmptyLine text="暂无未命中问题，AI 无法回答的问题会沉淀到这里。" />}
      </div>
    </div>
  )
}

export function KnowledgePanel({
  tenantCode = "xiaolanmao",
}: {
  tenantCode?: string
}) {
  const [status, setStatus] = useState<VolcKnowledgeStatus | null>(null)
  const [configForm, setConfigForm] = useState({
    resource_id: "",
    collection_name: "",
    project: "default",
    doc_id: "",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResult, setSearchResult] = useState<unknown>(null)
  const [points, setPoints] = useState<unknown[]>([])
  const [pointForm, setPointForm] = useState({
    chunk_title: "",
    content: "",
  })
  const [saving, setSaving] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [loadingPoints, setLoadingPoints] = useState(false)
  const [searching, setSearching] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function refreshStatus() {
    setLoadingStatus(true)
    setMessage(null)
    try {
      const result = await knowledgeFetch<VolcKnowledgeStatus>(`/api/knowledge/status?tenant_code=${tenantCode}`)
      setStatus(result)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "知识库状态加载失败")
    } finally {
      setLoadingStatus(false)
    }
  }

  async function handleSaveConfig(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      await knowledgePost<VolcKnowledgeResponse>("/api/knowledge/tenant-config", {
        tenant_code: tenantCode,
        resource_id: configForm.resource_id,
        collection_name: configForm.collection_name,
        project: configForm.project || "default",
        doc_id: configForm.doc_id || undefined,
      })
      setMessage("租户知识库配置已保存")
      await refreshStatus()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "知识库配置保存失败")
    } finally {
      setSaving(false)
    }
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!searchQuery.trim()) return
    setSearching(true)
    setMessage(null)
    try {
      const result = await knowledgePost<VolcKnowledgeResponse>("/api/knowledge/search", {
        tenant_code: tenantCode,
        query: searchQuery.trim(),
        limit: 3,
      })
      setSearchResult(result.data ?? result)
      if (!result.ok) setMessage(result.error?.message ?? "火山知识库检索失败")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "知识库检索失败")
    } finally {
      setSearching(false)
    }
  }

  async function loadPoints() {
    setLoadingPoints(true)
    setMessage(null)
    try {
      const result = await knowledgePost<VolcKnowledgeResponse>("/api/knowledge/points", {
        tenant_code: tenantCode,
        offset: 0,
        limit: 50,
      })
      const list = extractArray(result.data)
      setPoints(list)
      if (!result.ok) setMessage(result.error?.message ?? "切片列表加载失败")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "切片列表加载失败")
    } finally {
      setLoadingPoints(false)
    }
  }

  async function handleAddPoint(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!pointForm.content.trim()) return
    setSaving(true)
    setMessage(null)
    try {
      const result = await knowledgePost<VolcKnowledgeResponse>("/api/knowledge/points-add", {
        tenant_code: tenantCode,
        chunk_title: pointForm.chunk_title || "标准话术",
        content: pointForm.content,
      })
      if (!result.ok) {
        setMessage(result.error?.message ?? "话术新增失败")
        return
      }
      setPointForm({ chunk_title: "", content: "" })
      setMessage("标准话术已写入火山知识库")
      await loadPoints()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "话术新增失败")
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function loadStatus() {
      try {
        const result = await knowledgeFetch<VolcKnowledgeStatus>(`/api/knowledge/status?tenant_code=${tenantCode}`)
        if (!cancelled) setStatus(result)
      } catch (error) {
        if (!cancelled) setMessage(error instanceof Error ? error.message : "知识库状态加载失败")
      }
    }

    void loadStatus()

    return () => {
      cancelled = true
    }
  }, [tenantCode])

  const configured = Boolean(status?.resource_id_configured && status?.collection_name_configured)

  return (
    <div className="space-y-6">
      <div className={panelShell}>
        <PanelHeader title="知识库管理" description="按租户维护火山引擎知识库内容" icon={BookOpen} accent="emerald" />
        <div className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="grid gap-3 md:grid-cols-4">
            <StatusTile label="当前租户" value={status?.tenant?.name ?? tenantCode} tone="emerald" />
            <StatusTile label="火山 Key" value={status?.configured ? "已配置" : "未配置"} tone={status?.configured ? "emerald" : "rose"} />
            <StatusTile label="知识库资源" value={configured ? "已绑定" : "未绑定"} tone={configured ? "emerald" : "amber"} />
            <StatusTile label="默认文档" value={status?.default_doc_id_configured ? "已配置" : "未配置"} tone={status?.default_doc_id_configured ? "emerald" : "slate"} />
          </div>
          <Button variant="outline" onClick={refreshStatus} disabled={loadingStatus}>
            <RefreshCw className={loadingStatus ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            刷新状态
          </Button>
        </div>
        {!configured && (
          <div className="border-t border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
            这个租户还没有绑定火山知识库。请填写 resource_id 和 collection_name 后保存；需要新增话术时还要配置默认 doc_id。
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <div className={panelShell}>
          <PanelHeader title="租户知识库配置" description="每个客户绑定自己的火山知识库" icon={Settings} accent="slate" />
          <form className="space-y-4 p-4" onSubmit={handleSaveConfig}>
            <TextField label="租户编码" value={tenantCode} onChange={() => undefined} disabled />
            <TextField
              label="Resource ID"
              value={configForm.resource_id}
              onChange={(value) => setConfigForm((current) => ({ ...current, resource_id: value }))}
              required
            />
            <TextField
              label="Collection Name"
              value={configForm.collection_name}
              onChange={(value) => setConfigForm((current) => ({ ...current, collection_name: value }))}
              required
            />
            <TextField
              label="Project"
              value={configForm.project}
              onChange={(value) => setConfigForm((current) => ({ ...current, project: value }))}
            />
            <TextField
              label="默认 Doc ID"
              value={configForm.doc_id}
              onChange={(value) => setConfigForm((current) => ({ ...current, doc_id: value }))}
            />
            <Button className="w-full" disabled={saving}>
              {saving ? "正在保存" : "保存租户配置"}
            </Button>
          </form>
        </div>

        <div className={panelShell}>
          <PanelHeader title="检索知识库" description="用真实问题测试火山返回的知识片段" icon={Search} accent="sky" />
          <form className="flex flex-col gap-3 p-4 md:flex-row" onSubmit={handleSearch}>
            <input
              className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-500 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="输入客户问题，例如：有副作用吗？"
            />
            <Button disabled={searching || !searchQuery.trim()}>
              <Search className="h-4 w-4" />
              {searching ? "检索中" : "检索"}
            </Button>
          </form>
          <div className="border-t border-slate-200 p-4">
            {searchResult ? (
              <KnowledgeDebug data={searchResult} />
            ) : (
              <EmptyLine text="输入问题后会展示火山知识库返回的片段。" />
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <div className={panelShell}>
          <PanelHeader title="新增标准话术" description="写入当前租户绑定的火山知识库" icon={Plus} accent="emerald" />
          <form className="space-y-4 p-4" onSubmit={handleAddPoint}>
            <TextField
              label="标题"
              value={pointForm.chunk_title}
              onChange={(value) => setPointForm((current) => ({ ...current, chunk_title: value }))}
            />
            <TextArea
              label="标准话术原文"
              value={pointForm.content}
              onChange={(value) => setPointForm((current) => ({ ...current, content: value }))}
              required
              rows={8}
            />
            <Button className="w-full" disabled={saving || !pointForm.content.trim()}>
              {saving ? "正在写入" : "写入知识库"}
            </Button>
          </form>
          {message && (
            <div className="border-t border-slate-200 px-4 py-3 text-sm leading-relaxed text-slate-700">
              {message}
            </div>
          )}
        </div>

        <div className={panelShell}>
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-white p-4">
            <PanelTitle title="知识库切片" description="查看火山返回的当前话术片段" tone="emerald" />
            <Button variant="outline" onClick={loadPoints} disabled={loadingPoints}>
              <RefreshCw className={loadingPoints ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              加载切片
            </Button>
          </div>
          <div className="divide-y divide-slate-200">
            {points.map((item, index) => (
              <KnowledgePointRow key={getPointKey(item, index)} item={item} />
            ))}
            {points.length === 0 && <EmptyLine text="点击加载切片后，会展示火山知识库中的内容。" />}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusTile({ label, value, tone }: { label: string; value: string; tone: "emerald" | "amber" | "rose" | "slate" }) {
  const toneClass = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-950 [&_p:first-child]:text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-950 [&_p:first-child]:text-amber-700",
    rose: "border-rose-200 bg-rose-50 text-rose-950 [&_p:first-child]:text-rose-700",
    slate: "border-slate-200 bg-slate-50 text-slate-950 [&_p:first-child]:text-slate-600",
  }[tone]

  return (
    <div className={`rounded-lg border px-3 py-2 ${toneClass}`}>
      <p className="text-xs font-medium">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  )
}

function KnowledgePointRow({ item }: { item: unknown }) {
  const record = toRecord(item)
  const title = getFirstString(record, ["chunk_title", "title", "doc_name", "point_id"]) ?? "未命名切片"
  const content = getFirstString(record, ["content", "chunk_content", "text", "question"]) ?? JSON.stringify(item)
  const pointId = getFirstString(record, ["point_id", "id"])

  return (
    <div className="p-4 hover:bg-emerald-50/35">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold text-slate-950">{title}</p>
        {pointId && <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">{pointId}</span>}
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{content}</p>
    </div>
  )
}

function KnowledgeDebug({ data }: { data: unknown }) {
  const rows = extractArray(data)
  if (rows.length > 0) {
    return (
      <div className="space-y-3">
        {rows.slice(0, 5).map((item, index) => (
          <KnowledgePointRow key={getPointKey(item, index)} item={item} />
        ))}
      </div>
    )
  }

  return (
    <pre className="max-h-[360px] overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-slate-100">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}

function extractArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data
  if (!data || typeof data !== "object") return []
  const record = data as Record<string, unknown>
  for (const key of ["data", "result", "items", "list", "points", "docs", "chunks"]) {
    const value = record[key]
    if (Array.isArray(value)) return value
    if (value && typeof value === "object") {
      const nested = extractArray(value)
      if (nested.length > 0) return nested
    }
  }
  return []
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function getFirstString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === "string" && value.trim()) return value
    if (typeof value === "number") return String(value)
  }
  return null
}

function getPointKey(item: unknown, index: number) {
  const record = toRecord(item)
  return getFirstString(record, ["point_id", "id", "chunk_id"]) ?? `point-${index}`
}

export function AnalyticsPanel({ overview }: { overview: AdminOverview | null }) {
  const trend = overview?.trend ?? []
  const max = Math.max(1, ...trend.map((item) => item.value))

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <div className={`${panelShell} p-4 xl:col-span-2`}>
        <PanelTitle title="今日回答趋势" description="按时段统计 AI 回答的问题量" tone="indigo" />
        <div className="mt-6 flex h-56 items-end justify-between gap-2">
          {trend.map((item) => (
            <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full justify-center">
                <div
                  className="w-full max-w-[42px] rounded-t-md bg-indigo-600"
                  style={{ height: `${Math.max(8, (item.value / max) * 190)}px` }}
                />
              </div>
              <span className="text-xs text-indigo-700">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={`${panelShell} p-4`}>
        <PanelTitle title="高意向线索来源" description="按渠道统计线索" tone="emerald" />
        <div className="mt-5 space-y-4">
          {(overview?.channelLeads ?? []).map((item) => (
            <div key={item.channel}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium text-slate-800">{item.channel}</span>
                <span className="text-emerald-700">{item.value} 条</span>
              </div>
              <div className="h-2 rounded-full bg-emerald-100">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, item.value * 10)}%` }} />
              </div>
            </div>
          ))}
          {(overview?.channelLeads ?? []).length === 0 && <p className="text-sm text-slate-600">暂无渠道线索数据。</p>}
        </div>
      </div>
    </div>
  )
}

export function SettingsPanel({
  merchant,
  onSaved,
  readOnly = false,
  onDemoUnavailable,
}: {
  merchant: AdminMerchant | null
  onSaved: (merchant: AdminMerchant) => void
  readOnly?: boolean
  onDemoUnavailable?: () => void
}) {
  if (!merchant) {
    return (
      <div className={panelShell}>
        <PanelHeader title="系统设置" description="商户资料、接待话术和 Coze 配置" icon={Settings} accent="slate" />
        <EmptyLine text="正在准备系统设置。" />
      </div>
    )
  }

  return <SettingsForm key={merchant.id} merchant={merchant} onSaved={onSaved} readOnly={readOnly} onDemoUnavailable={onDemoUnavailable} />
}

function SettingsForm({
  merchant,
  onSaved,
  readOnly,
  onDemoUnavailable,
}: {
  merchant: AdminMerchant
  onSaved: (merchant: AdminMerchant) => void
  readOnly: boolean
  onDemoUnavailable?: () => void
}) {
  const [form, setForm] = useState({
    publicName: merchant.publicName ?? "",
    websiteUrl: merchant.websiteUrl ?? "",
    adminEmail: merchant.adminEmail ?? "",
    notificationUrl: merchant.notificationUrl ?? "",
    businessHours: merchant.businessHours ?? "",
    contactInfo: merchant.contactInfo ?? "",
    cozeBotId: merchant.cozeBotId ?? "",
    cozeWorkflowId: merchant.cozeWorkflowId ?? "",
    welcomeMessage: merchant.welcomeMessage ?? "",
    handoffMessage: merchant.handoffMessage ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (readOnly) {
      onDemoUnavailable?.()
      return
    }
    setSaving(true)
    setMessage(null)

    try {
      const result = await adminPost<{ merchant: AdminMerchant }>("/api/admin/settings", form)
      onSaved(result.merchant)
      setMessage("系统设置已保存")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "系统设置保存失败")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={panelShell}>
      <PanelHeader title="系统设置" description="商户资料、接待话术和 Coze 配置" icon={Settings} accent="slate" />
      {readOnly && (
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          演示后台只展示脱敏配置，真实配置不会暴露给访客。
        </div>
      )}
      <form className="grid gap-4 p-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <TextField label="商户名称" value={form.publicName} onChange={(value) => setFormField(setForm, "publicName", value)} required disabled={readOnly} />
        <TextField label="官网地址" value={form.websiteUrl} onChange={(value) => setFormField(setForm, "websiteUrl", value)} disabled={readOnly} />
        <TextField label="管理员邮箱" value={form.adminEmail} onChange={(value) => setFormField(setForm, "adminEmail", value)} disabled={readOnly} />
        <TextField label="通知回调地址" value={form.notificationUrl} onChange={(value) => setFormField(setForm, "notificationUrl", value)} disabled={readOnly} />
        <TextField label="营业时间" value={form.businessHours} onChange={(value) => setFormField(setForm, "businessHours", value)} disabled={readOnly} />
        <TextField label="联系方式" value={form.contactInfo} onChange={(value) => setFormField(setForm, "contactInfo", value)} disabled={readOnly} />
        <TextField label="Coze Bot ID" value={form.cozeBotId} onChange={(value) => setFormField(setForm, "cozeBotId", value)} disabled={readOnly} />
        <TextField label="Coze Workflow ID" value={form.cozeWorkflowId} onChange={(value) => setFormField(setForm, "cozeWorkflowId", value)} disabled={readOnly} />
        <div className="md:col-span-2">
          <TextArea
            label="欢迎语"
            value={form.welcomeMessage}
            onChange={(value) => setFormField(setForm, "welcomeMessage", value)}
            rows={3}
            disabled={readOnly}
          />
        </div>
        <div className="md:col-span-2">
          <TextArea
            label="转人工提示"
            value={form.handoffMessage}
            onChange={(value) => setFormField(setForm, "handoffMessage", value)}
            rows={3}
            disabled={readOnly}
          />
        </div>
        <div className="flex items-center justify-between gap-3 md:col-span-2">
          <p className="text-sm text-slate-600">{message ?? (readOnly ? "当前为演示模式，不能修改真实配置。" : "保存后新会话会使用最新接待配置。")}</p>
          <Button disabled={saving} onClick={readOnly ? onDemoUnavailable : undefined} type={readOnly ? "button" : "submit"}>
            {readOnly ? "演示模式不可保存" : saving ? "正在保存" : "保存设置"}
          </Button>
        </div>
      </form>
    </div>
  )
}

function PanelHeader({
  title,
  description,
  icon: Icon,
  accent = "default",
}: {
  title: string
  description: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  accent?: keyof typeof headerTone
}) {
  const tone = headerTone[accent]

  return (
    <div className={`flex items-center gap-2 border-b p-4 ${tone.row}`}>
      <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone.icon}`}>
        <Icon className="h-4 w-4" />
      </span>
      <PanelTitle title={title} description={description} tone={accent} />
    </div>
  )
}

function PanelTitle({
  title,
  description,
  tone = "default",
}: {
  title: string
  description: string
  icon?: unknown
  tone?: keyof typeof titleTone
}) {
  const color = titleTone[tone]

  return (
    <div>
      <h2 className={`text-base font-semibold ${color.title}`}>{title}</h2>
      <p className={`text-sm ${color.description}`}>{description}</p>
    </div>
  )
}

function SummaryTile({
  label,
  value,
  description,
  tone = "indigo",
}: {
  label: string
  value: string | number
  description: string
  tone?: keyof typeof summaryTone
}) {
  return (
    <div className={`rounded-lg border px-4 py-3 ${summaryTone[tone]}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
      <p className="mt-1 text-xs leading-relaxed">{description}</p>
    </div>
  )
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-indigo-100 bg-indigo-50/45 px-3 py-2.5">
      <span className="text-sm text-indigo-700">{label}</span>
      <span className="min-w-0 truncate text-sm font-semibold text-indigo-950">{value}</span>
    </div>
  )
}

function InfoBox({ title, text, accent = false }: { title: string; text: string; accent?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${accent ? "border-emerald-200 bg-emerald-50" : "border-sky-200 bg-sky-50/50"}`}>
      <p className={`mb-1 text-xs font-medium ${accent ? "text-emerald-700" : "text-sky-700"}`}>{title}</p>
      <p className="text-sm leading-relaxed text-slate-950">{text}</p>
    </div>
  )
}

function EmptyLine({ text }: { text: string }) {
  return <div className="p-6 text-center text-sm text-slate-600">{text}</div>
}

function TextField({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  disabled?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-900">{label}</span>
      <input
        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition-colors placeholder:text-slate-500 disabled:bg-slate-50 disabled:text-slate-500 focus:border-indigo-500 focus:bg-white focus:ring-3 focus:ring-indigo-500/15"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        disabled={disabled}
      />
    </label>
  )
}

function TextArea({
  label,
  value,
  onChange,
  rows,
  required = false,
  disabled = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows: number
  required?: boolean
  disabled?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-900">{label}</span>
      <textarea
        className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-relaxed outline-none transition-colors placeholder:text-slate-500 disabled:bg-slate-50 disabled:text-slate-500 focus:border-indigo-500 focus:bg-white focus:ring-3 focus:ring-indigo-500/15"
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        disabled={disabled}
      />
    </label>
  )
}

function setFormField<T extends Record<string, string>>(
  setForm: Dispatch<SetStateAction<T>>,
  key: keyof T,
  value: string,
) {
  setForm((current) => ({ ...current, [key]: value }))
}
