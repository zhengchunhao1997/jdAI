import { ShieldCheck, XCircle, CheckCircle2 } from "lucide-react"

const principles = [
  "不乱报价，价格相关问题转人工确认",
  "不乱承诺，不替商家做无法兑现的保证",
  "不处理合同、退款的结论性答复",
  "不确定的问题不编造，主动转人工",
]

const highRisk = ["价格报价", "合同条款", "退款处理", "客户投诉", "法律咨询", "医疗医美"]

export function SecuritySection() {
  return (
    <section id="security" className="scroll-mt-16 border-b border-border bg-secondary/30">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="size-5.5" />
            </span>
            <h2 className="mt-5 text-balance text-3xl font-bold tracking-tight text-foreground">
              让 AI 帮你接待，而不是替你乱承诺
            </h2>
            <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
              即答 AI客服在设计上严守边界。涉及钱、合同、责任和专业判断的高风险问题，一律转人工确认，确保对外口径可控、可信。
            </p>

            <ul className="mt-6 space-y-3">
              {principles.map((p) => (
                <li key={p} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                  <span className="text-sm leading-relaxed text-foreground">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm font-medium text-foreground">以下高风险问题会自动转人工</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {highRisk.map((r) => (
                <div
                  key={r}
                  className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2.5"
                >
                  <XCircle className="size-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm text-foreground">{r}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-lg bg-accent px-3 py-2.5 text-xs leading-relaxed text-accent-foreground">
              触发以上场景时，AI 会暂停自动回复并通知人工，避免错误信息影响成交和口碑。
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
