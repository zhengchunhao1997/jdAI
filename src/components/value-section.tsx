import { TrendingDown, Repeat, Zap, UserCheck } from "lucide-react"

const values = [
  {
    icon: TrendingDown,
    title: "少漏单",
    desc: "下班、深夜、节假日的咨询也有 AI 第一时间接待，客户不再因为没人回复而流失。",
  },
  {
    icon: Repeat,
    title: "少重复",
    desc: "高频问题由 AI 基于知识库统一回答，客服不用反复回复相同问题，把精力留给重要客户。",
  },
  {
    icon: Zap,
    title: "快响应",
    desc: "客户提问秒级响应，回答口径一致且专业，不再让客户等待和被晾着。",
  },
  {
    icon: UserCheck,
    title: "可跟进",
    desc: "自动识别高意向客户并生成跟进建议，销售拿到的是筛选过的线索，而不是杂乱的消息。",
  },
]

export function ValueSection() {
  return (
    <section className="border-b border-border bg-secondary/30">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="max-w-2xl">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground">
            不只是自动回复，更是帮商家把咨询变成生意
          </h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            即答 AI客服关注的是商家真正在意的结果：每一个进来的客户都被接住，每一个高意向的人都被跟进。
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <div key={v.title} className="rounded-xl border border-border bg-card p-6">
              <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <v.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
