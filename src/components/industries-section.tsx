import { GraduationCap, Paintbrush, Calculator, Server, Store, Globe, Stethoscope } from "lucide-react"

const industries = [
  { icon: GraduationCap, name: "教育培训", desc: "课程咨询、报名留资" },
  { icon: Paintbrush, name: "装修", desc: "户型报价、上门预约" },
  { icon: Calculator, name: "财税服务", desc: "套餐咨询、资质对接" },
  { icon: Server, name: "SaaS 软件", desc: "功能答疑、试用转化" },
  { icon: Store, name: "本地生活", desc: "门店信息、到店预约" },
  { icon: Globe, name: "跨境电商", desc: "多语言售前、物流答疑" },
  { icon: Stethoscope, name: "医美口腔", desc: "项目咨询、合规接待" },
]

export function IndustriesSection() {
  return (
    <section id="industries" className="scroll-mt-16 border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-primary">适用行业</p>
          <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight text-foreground">
            重咨询、重跟进的行业，都能用得上
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {industries.map((i) => (
            <div
              key={i.name}
              className="flex items-start gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <i.icon className="size-5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{i.name}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{i.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
