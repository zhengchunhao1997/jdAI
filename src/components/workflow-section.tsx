import { MessageCircle, Bot, BookOpen, Target, Headphones, Database } from "lucide-react"

const steps = [
  { icon: MessageCircle, title: "客户咨询", desc: "客户从网站、企业微信等渠道发起咨询。" },
  { icon: Bot, title: "AI 接待", desc: "AI 第一时间响应，理解客户问题。" },
  { icon: BookOpen, title: "知识库回答", desc: "基于企业资料给出准确、口径一致的回答。" },
  { icon: Target, title: "识别意向", desc: "提取关注点，判断意向等级。" },
  { icon: Headphones, title: "转人工 / 留资", desc: "复杂问题转人工，高意向客户留下线索。" },
  { icon: Database, title: "沉淀知识库", desc: "未命中问题补充答案，知识库持续优化。" },
]

export function WorkflowSection() {
  return (
    <section id="workflow" className="scroll-mt-16 border-b border-border bg-secondary/30">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-primary">工作流程</p>
          <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight text-foreground">
            从客户咨询到知识沉淀的完整闭环
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {steps.map((s, i) => (
            <div key={s.title} className="relative rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <s.icon className="size-4.5" />
                </span>
                <span className="text-sm font-semibold text-muted-foreground/60">0{i + 1}</span>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-foreground">{s.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
