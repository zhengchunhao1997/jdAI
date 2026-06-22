import { BookOpen, Headphones, Target, FileText, AlertCircle, ShieldCheck } from "lucide-react"

const capabilities = [
  {
    icon: BookOpen,
    title: "知识库问答",
    desc: "商家上传 FAQ、产品介绍、价格政策和售后规则，AI 优先基于企业资料回答客户问题。",
  },
  {
    icon: Headphones,
    title: "人工接管",
    desc: "客户要求人工，询问复杂报价、合同、退款、投诉或特殊渠道接入时，系统提醒人工接管，AI 暂停自动回复。",
  },
  {
    icon: Target,
    title: "线索识别",
    desc: "自动提取客户行业、咨询量、接入渠道、联系方式和关注点，生成意向等级和跟进建议。",
  },
  {
    icon: FileText,
    title: "会话摘要",
    desc: "每个会话自动生成摘要，销售接手时能快速知道客户问了什么、是否留资、是否需要跟进。",
  },
  {
    icon: AlertCircle,
    title: "未命中问题",
    desc: "AI 没答好的问题会进入未命中列表，商家可以补充标准答案，让知识库越来越准确。",
  },
  {
    icon: ShieldCheck,
    title: "安全兜底",
    desc: "AI 不确定时不编造，涉及价格、退款、合同、投诉、法律医疗等高风险问题时转人工确认。",
  },
]

export function CapabilitiesSection() {
  return (
    <section id="capabilities" className="scroll-mt-16 border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-primary">核心能力</p>
          <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight text-foreground">
            一套覆盖售前接待全流程的能力
          </h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            从回答问题到识别线索、转交人工、沉淀知识，每一步都围绕“接住客户、跟进生意”设计。
          </p>
        </div>

        <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c) => (
            <div key={c.title} className="bg-card p-6">
              <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <c.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
