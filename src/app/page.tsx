import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Clock3,
  Database,
  MessageSquareText,
  MousePointer2,
  Sparkles,
  Tags,
  UserRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"

const painPoints = [
  {
    title: "回复慢",
    text: "抖音、小红书来的用户常常只停留几十秒，没人接待就会直接流失。",
    icon: Clock3,
  },
  {
    title: "问题重复",
    text: "价格、效果、反弹、安全问题每天反复出现，人工客服容易疲惫。",
    icon: MessageSquareText,
  },
  {
    title: "线索丢失",
    text: "问过价格、说考虑一下、想买套餐的人没有被及时标记和跟进。",
    icon: Tags,
  },
  {
    title: "复盘困难",
    text: "不知道用户最关心什么，也不知道哪一段话术影响转化。",
    icon: BarChart3,
  },
]

const capabilities = [
  {
    title: "7×24 自动接待",
    text: "用户随时提问，AI 先完成基础问答、需求追问和咨询分流。",
    icon: Bot,
  },
  {
    title: "基于知识库回答",
    text: "围绕产品资料、价格政策、使用说明和常见问题回答，减少乱答。",
    icon: Database,
  },
  {
    title: "意图识别与线索标记",
    text: "自动识别 A/B/C/D 意向等级，标记高意向、风险用户和待跟进用户。",
    icon: Tags,
  },
  {
    title: "数据沉淀到后台",
    text: "聊天记录、客户线索、未命中问题和统计数据自动进入控制台。",
    icon: BarChart3,
  },
]

const flowSteps = [
  "用户进入聊天",
  "AI 询问身高、体重、目标",
  "回答价格、效果、安全和反弹",
  "识别意向等级",
  "生成跟进建议",
  "进入后台线索列表",
]

const metrics = [
  { label: "今日接待人数", value: "128" },
  { label: "今日消息数", value: "476" },
  { label: "AI 自动回复数", value: "451" },
  { label: "有效线索数", value: "37" },
  { label: "高意向线索数", value: "12" },
  { label: "知识库未命中", value: "9" },
]

const backendModules = [
  {
    title: "高意向客户列表",
    text: "把问价格、问套餐、想下单的人从聊天里挑出来。",
  },
  {
    title: "客户主要问题统计",
    text: "看到价格、效果、安全、反弹等顾虑的真实出现频次。",
  },
  {
    title: "未命中知识库问题",
    text: "把 AI 没答好的问题沉淀下来，持续补充标准答案。",
  },
]

export default function Page() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50 text-gray-900">
      <LandingHeader />
      <main>
        <HeroSection />
        <PainPointSection />
        <SolutionSection />
        <FlowSection />
        <BackendValueSection />
        <ExperienceSection />
      </main>
      <LandingFooter />
    </div>
  )
}

function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link className="flex items-center gap-2" href="/">
          <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Bot className="size-5" />
          </span>
          <span className="text-base font-semibold tracking-tight text-gray-900">即答 AI 客服</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="hidden bg-white sm:inline-flex">
            <Link href="/dashboard">查看控制台</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/xiaolanmao/chat">体验 AI 客服</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

function HeroSection() {
  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center lg:py-18">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700">
            <Sparkles className="size-4" />
            小蓝帽减肥产品 AI 客服案例
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
            从一次咨询，生成一条可跟进线索
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-gray-600 sm:text-lg">
            即答为小蓝帽搭建了 AI 客服演示：自动接待用户、回答产品问题、收集减重目标、识别意向等级，并把线索沉淀到后台。
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/xiaolanmao/chat">
                进入聊天体验
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white">
              <Link href="/dashboard">查看后台效果</Link>
            </Button>
          </div>
          <div className="mt-7 flex flex-wrap gap-3 text-sm text-gray-600">
            <TrustItem text="Coze 工作流实时回复" />
            <TrustItem text="线索自动标记" />
            <TrustItem text="后台数据可复盘" />
          </div>
        </div>

        <ChatPreview />
      </div>
    </section>
  )
}

function TrustItem({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5">
      <CheckCircle2 className="size-4 text-emerald-500" />
      {text}
    </span>
  )
}

function ChatPreview() {
  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl border border-gray-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <div className="flex h-14 items-center gap-3 rounded-t-2xl bg-indigo-600 px-4 text-white">
        <div className="relative flex size-8 items-center justify-center rounded-full bg-white text-indigo-600">
          <Bot className="size-5" />
          <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-indigo-600 bg-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-medium">小蓝帽 AI 体重管理顾问</p>
          <p className="text-xs text-indigo-100">在线接待中</p>
        </div>
      </div>
      <div className="space-y-4 bg-gray-50 p-4">
        <PreviewMessage role="user" text="165，160斤，想瘦到120" />
        <PreviewMessage role="assistant" text="我先帮你判断适合的方案。你现在目标是减重 40 斤，我会结合周期、预算和顾虑给你建议。" />
        <PreviewMessage role="user" text="多少钱？" />
        <PreviewMessage role="assistant" text="不同套餐适合不同目标，我先确认你更关心见效周期还是价格，再推荐合适方案。" />
      </div>
      <div className="flex items-center gap-2 border-t border-gray-200 p-3">
        <div className="h-10 flex-1 rounded-full bg-gray-50 px-4 py-2 text-sm text-gray-500">输入您的问题...</div>
        <div className="flex size-10 items-center justify-center rounded-full bg-indigo-600 text-white">
          <ArrowRight className="size-4" />
        </div>
      </div>
    </div>
  )
}

function PreviewMessage({ role, text }: { role: "assistant" | "user"; text: string }) {
  const isUser = role === "user"
  return (
    <div className={`flex gap-2 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          <Bot className="size-4" />
        </span>
      )}
      <p
        className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-6 ${
          isUser ? "rounded-tr-none bg-indigo-500 text-white" : "rounded-tl-none border border-gray-100 bg-white text-gray-800"
        }`}
      >
        {text}
      </p>
      {isUser && (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <UserRound className="size-4" />
        </span>
      )}
    </div>
  )
}

function PainPointSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-18">
      <SectionHeading
        title="传统客服很难持续做好这几件事"
        text="小红书、抖音、私域来的用户节奏很快，客服不只是回答问题，还要判断谁值得马上跟进。"
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {painPoints.map((item) => (
          <article className="rounded-xl border border-gray-200 bg-white p-5 transition-transform duration-200 hover:-translate-y-1" key={item.title}>
            <item.icon className="size-6 text-indigo-600" />
            <h3 className="mt-4 text-base font-semibold text-gray-950">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function SolutionSection() {
  return (
    <section className="border-y border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-18">
        <SectionHeading
          title="即答 AI 客服为小蓝帽做了什么"
          text="这不是一个只会聊天的机器人，而是围绕产品知识库、销售线索和后台复盘搭建的接待系统。"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {capabilities.map((item) => (
            <article className="rounded-xl border border-gray-200 bg-gray-50 p-5" key={item.title}>
              <div className="flex items-start gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <item.icon className="size-5" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-gray-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{item.text}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function FlowSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-18">
      <SectionHeading
        title="从一次咨询到一条可跟进线索"
        text="聊天不是终点。真正有价值的是把客户状态变成销售可以行动的数据。"
      />
      <div className="mt-8 grid gap-3 lg:grid-cols-6">
        {flowSteps.map((step, index) => (
          <div className="rounded-xl border border-gray-200 bg-white p-4" key={step}>
            <span className="flex size-8 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700">
              {index + 1}
            </span>
            <p className="mt-4 text-sm font-medium leading-6 text-gray-900">{step}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function BackendValueSection() {
  return (
    <section className="border-y border-gray-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-18">
        <div>
          <SectionHeading
            align="left"
            title="每天打开后台，看到 AI 做了多少活"
            text="客户关心的不只是 AI 有没有回复，而是今天接待了多少人、筛出了多少线索、还有哪些知识库要补。"
          />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {metrics.map((item) => (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4" key={item.label}>
                <p className="text-2xl font-semibold text-gray-950">{item.value}</p>
                <p className="mt-1 text-sm text-gray-600">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {backendModules.map((item, index) => (
            <article className="rounded-xl border border-gray-200 bg-gray-50 p-5" key={item.title}>
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-indigo-700">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-gray-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{item.text}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ExperienceSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-18">
      <div className="rounded-2xl bg-indigo-600 px-5 py-8 text-white sm:px-8 lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">现在就体验小蓝帽 AI 客服</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-indigo-100 sm:text-base">
            像真实用户一样提问，测试 AI 如何接待、追问、回答顾虑，并把高意向客户同步到后台。
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0">
          <Button asChild variant="secondary" size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50">
            <Link href="/xiaolanmao/chat">
              进入聊天体验
              <MousePointer2 className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-white/40 bg-transparent text-white hover:bg-white/10">
            <Link href="/dashboard">查看控制台</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function SectionHeading({
  title,
  text,
  align = "center",
}: {
  title: string
  text: string
  align?: "left" | "center"
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <h2 className="text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">{title}</h2>
      <p className="mt-3 text-base leading-7 text-gray-600">{text}</p>
    </div>
  )
}

function LandingFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Bot className="size-5" />
          </span>
          <div>
            <p className="font-semibold text-gray-900">即答 AI 客服</p>
            <p>为小微企业搭建个性化 AI 智能客服</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link className="hover:text-gray-900" href="/xiaolanmao/chat">
            聊天体验
          </Link>
          <Link className="hover:text-gray-900" href="/dashboard">
            控制台
          </Link>
          <span>© 2026 即答 AI 客服</span>
        </div>
      </div>
    </footer>
  )
}
