"use client";

import { FormEvent, useEffect, useState } from "react";

const navItems = [
  { label: "适合谁", href: "#fit" },
  { label: "怎么搭", href: "#workflow" },
  { label: "场景", href: "#scenes" },
  { label: "价格", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const proofStats = [
  { value: "3-5天", label: "完成基础版上线" },
  { value: "30+", label: "先整理高频问题" },
  { value: "7x24", label: "接住非工作时间咨询" },
];

const painPoints = [
  "客户反复问价格、发货、售后、预约、课程细节",
  "晚上和周末没人回复，第二天客户已经找了别人",
  "客服话术不统一，新人培训慢，老板还要反复盯",
  "私域、企微、公众号、小程序都有咨询，人工顾不过来",
];

const features = [
  {
    icon: "01",
    title: "按你的业务资料回答",
    desc: "基于产品资料、FAQ、售后规则和销售话术搭建专属知识库，减少泛泛而谈。",
  },
  {
    icon: "02",
    title: "先接住重复咨询",
    desc: "优先处理价格、库存、发货、预约、报名、售后等高频问题，把人工留给复杂客户。",
  },
  {
    icon: "03",
    title: "用 Coze 工作流落地",
    desc: "配置判断、追问、留资、转人工和兜底话术，不只是放一个聊天窗口。",
  },
  {
    icon: "04",
    title: "试跑后继续优化",
    desc: "根据真实对话补充知识库，观察 AI 回复占比、转人工比例和客户追问情况。",
  },
];

const fitItems = [
  "每天咨询超过 30 条",
  "客户问题重复度高",
  "已有网页、企微、公众号、小程序或私域入口",
  "有产品资料、报价规则、售后政策或标准话术",
];

const notFitItems = [
  "每天只有零星咨询",
  "每个客户都需要高度定制方案",
  "没有任何业务资料可整理",
  "希望 AI 完全替代人工处理投诉和异常订单",
];

const workflowSteps = [
  {
    title: "诊断咨询内容",
    desc: "先看行业、咨询量、客服人数和客户最常问的问题，判断是否值得上 AI 客服。",
  },
  {
    title: "整理知识库和话术",
    desc: "把产品资料、FAQ、价格规则、售后政策整理成 AI 可用的回答范围。",
  },
  {
    title: "搭建 Coze 工作流",
    desc: "配置追问、分类、留资、转人工、兜底回复和不同场景的引导路径。",
  },
  {
    title: "接入渠道试跑",
    desc: "先接一个入口跑 3 天，查看回复效果，再决定是否扩展到更多渠道。",
  },
];

const scenes = [
  {
    title: "电商零售",
    desc: "商品咨询、优惠活动、发货时效、退换货、订单售后。",
    questions: ["多少钱？", "什么时候发货？", "能退换吗？"],
  },
  {
    title: "企业微信私域",
    desc: "私聊答疑、群内常见问题、活动引导、客户留资。",
    questions: ["怎么报名？", "还有名额吗？", "发我资料"],
  },
  {
    title: "教培/知识付费",
    desc: "课程介绍、适合人群、价格套餐、试听预约、报名流程。",
    questions: ["适合零基础吗？", "课程多少钱？", "怎么上课？"],
  },
  {
    title: "本地生活服务",
    desc: "门店预约、服务项目、价格说明、营业时间、到店指引。",
    questions: ["今天能约吗？", "地址在哪？", "有什么套餐？"],
  },
  {
    title: "工厂/批发商",
    desc: "规格参数、起订量、报价范围、交期、样品和售后说明。",
    questions: ["最低起订多少？", "能定制吗？", "交期多久？"],
  },
  {
    title: "SaaS/软件",
    desc: "产品功能、试用引导、版本区别、基础技术支持。",
    questions: ["支持哪些功能？", "怎么试用？", "能对接吗？"],
  },
];

const comparisons = [
  ["重复问题", "人工一遍遍回复", "AI 先回答高频问题"],
  ["服务时间", "下班后容易漏客户", "7x24 小时在线接待"],
  ["话术一致性", "不同客服口径不一", "按统一知识库回复"],
  ["线索收集", "聊完容易忘记登记", "对话中引导留资"],
  ["后续优化", "凭感觉培训客服", "根据真实对话补知识库"],
];

const plans = [
  {
    name: "诊断试跑",
    price: "免费",
    badge: "种子用户优先",
    features: ["咨询量诊断", "整理 30 条高频问题", "搭建一个试用版", "试跑 3 天看效果"],
    cta: "申请免费诊断",
    href: "#contact",
    primary: true,
  },
  {
    name: "基础落地版",
    price: "¥599/月起",
    features: ["1 个接入渠道", "基础知识库配置", "Coze 工作流搭建", "基础兜底和转人工"],
    cta: "咨询适配方案",
    href: "#contact",
  },
  {
    name: "定制运营版",
    price: "面议",
    features: ["多渠道接入", "复杂流程定制", "持续知识库优化", "月度对话复盘"],
    cta: "聊聊定制需求",
    href: "#contact",
  },
];

const faqs = [
  {
    q: "AI 客服会不会乱说？",
    a: "会通过知识库、兜底话术和转人工规则降低风险。早期会先接常见问题，复杂问题不硬答。",
  },
  {
    q: "为什么要先做免费诊断？",
    a: "不是所有企业都适合马上上 AI 客服。先看咨询量、重复度和资料完整度，能省时间再试跑。",
  },
  {
    q: "Coze 工作流能做什么？",
    a: "可以把客户问题分类，按不同场景追问、回答、留资、转人工，并把回答限制在你的业务资料内。",
  },
  {
    q: "多久能看到效果？",
    a: "基础版通常 3-5 天上线。试跑 3 天后，可以先看 AI 回复占比、转人工比例和客户追问情况。",
  },
  {
    q: "支持哪些接入方式？",
    a: "优先从一个入口开始，例如网页客服、公众号、企微私域或小程序，再根据效果扩展。",
  },
];

const leadSources = ["自媒体私信", "朋友推荐", "搜索/官网", "其他"];

function ChatButton({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}

function ChatGuide({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  if (!visible) {
    return null;
  }

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-7 right-7 z-[998] h-24 w-24 rounded-full border-4 border-brand-green shadow-[0_0_0_14px_rgba(16,185,129,0.16)] animate-pulse"
      />
      <div className="fixed inset-x-4 bottom-32 z-[999] mx-auto max-w-md rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-950 shadow-soft md:bottom-10 md:right-36 md:left-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-black">请点击右下角蓝色客服图标</p>
            <p className="mt-2 text-sm leading-6 text-amber-800">
              AI 客服入口在页面右下角。点击圆形客服按钮后，就可以直接体验对话。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-100 text-lg leading-none text-amber-950 hover:bg-amber-200"
            aria-label="关闭提示"
          >
            ×
          </button>
        </div>
      </div>
    </>
  );
}

function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      {eyebrow ? (
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-brand">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-bold text-brand-ink dark:text-white md:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-base leading-7 text-brand-body dark:text-gray-300 md:text-lg">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

function Header({ onShowChatGuide }: { onShowChatGuide: () => void }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-white/92 backdrop-blur transition-shadow dark:bg-brand-ink/92 ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="主导航"
      >
        <a href="#top" className="text-2xl font-black text-brand">
          即答
        </a>
        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-brand-body transition hover:text-brand dark:text-gray-200"
            >
              {item.label}
            </a>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <ChatButton
            onClick={onShowChatGuide}
            className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-brand-ink transition hover:border-brand hover:text-brand dark:border-white/20 dark:text-white"
          >
            体验AI客服
          </ChatButton>
          <a
            href="#contact"
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
          >
            免费诊断
          </a>
        </div>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-brand-ink dark:border-white/20 dark:text-white md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label="打开菜单"
        >
          <span className="text-xl">{open ? "×" : "☰"}</span>
        </button>
      </nav>
      {open ? (
        <div className="border-t border-gray-100 bg-white px-4 py-4 dark:border-white/10 dark:bg-brand-ink md:hidden">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 font-medium text-brand-body hover:bg-brand-bg dark:text-gray-200 dark:hover:bg-white/10"
              >
                {item.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onShowChatGuide();
              }}
              className="rounded-lg border border-gray-200 px-3 py-3 text-center font-semibold text-brand-ink dark:border-white/20 dark:text-white"
            >
              体验AI客服
            </button>
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-brand px-3 py-3 text-center font-semibold text-white"
            >
              免费诊断
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function Hero({ onShowChatGuide }: { onShowChatGuide: () => void }) {
  return (
    <section id="top" className="overflow-hidden bg-white pt-28 dark:bg-[#111126] md:pt-32">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 sm:px-6 md:grid-cols-[1fr_0.92fr] lg:px-8">
        <div className="animate-fadeUp">
          <p className="mb-4 inline-flex rounded-full bg-brand/10 px-4 py-2 text-sm font-semibold text-brand dark:bg-white/10 dark:text-indigo-200">
            基于 Coze 工作流搭建的中小企业 AI 客服
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-tight text-brand-ink dark:text-white md:text-6xl">
            客户重复咨询太多？先让 AI 接住常见问题
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-brand-body dark:text-gray-300 md:text-xl">
            帮电商、私域、教培、本地生活和工厂团队，把价格、发货、售后、预约、报名等高频咨询交给 AI 先回复。3-5 天上线，先试跑再付费。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#contact"
              className="rounded-full bg-brand px-7 py-3.5 text-center font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-1 hover:bg-brand-dark"
            >
              免费测一测能省多少客服时间
            </a>
            <ChatButton
              onClick={onShowChatGuide}
              className="rounded-full border border-gray-300 px-7 py-3.5 text-center font-semibold text-brand-ink transition hover:-translate-y-1 hover:border-brand hover:text-brand dark:border-white/20 dark:text-white"
            >
              体验页面右下角 AI 客服
            </ChatButton>
          </div>
          <p className="mt-5 text-sm text-brand-body dark:text-gray-400">
            免费诊断包含：咨询量判断、30 条高频问题梳理、一个 AI 客服试用版建议。
          </p>
          <div className="mt-8 grid max-w-2xl grid-cols-3 overflow-hidden rounded-lg border border-gray-100 bg-brand-bg dark:border-white/10 dark:bg-white/5">
            {proofStats.map((item) => (
              <div key={item.label} className="p-4 text-center">
                <p className="text-2xl font-black text-brand-ink dark:text-white">{item.value}</p>
                <p className="mt-1 text-xs leading-5 text-brand-body dark:text-gray-300">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={onShowChatGuide}
          className="animate-fadeUp overflow-hidden rounded-lg bg-white text-left shadow-soft ring-1 ring-gray-100 transition hover:-translate-y-1 hover:ring-brand dark:bg-[#191936] dark:ring-white/10"
        >
          <div className="flex items-center justify-between gap-4 bg-brand px-5 py-4 font-semibold text-white">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-brand-green" aria-hidden="true" />
              即答AI客服 · 可点击体验
            </span>
            <span className="rounded-full bg-white/18 px-3 py-1 text-xs">Coze 工作流</span>
          </div>
          <div className="space-y-5 p-5 md:p-7">
            <div className="max-w-[88%] rounded-lg rounded-tl-sm bg-brand-bg p-4 text-sm leading-6 text-brand-ink dark:bg-white/10 dark:text-gray-100">
              您好，我可以先回答商品、报价、发货、售后和预约问题。复杂情况会帮您转人工。
            </div>
            <div className="ml-auto max-w-[84%] rounded-lg rounded-tr-sm bg-brand p-4 text-sm leading-6 text-white">
              我们每天很多人问价格和发货，能自动回复吗？
            </div>
            <div className="max-w-[92%] rounded-lg rounded-tl-sm bg-brand-bg p-4 text-sm leading-6 text-brand-ink dark:bg-white/10 dark:text-gray-100">
              可以。先整理您的商品资料、价格规则和售后政策，再用工作流判断问题类型。答不上来时，我会引导留下联系方式或转人工。
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-brand-body dark:text-gray-300">
              <span className="rounded-lg bg-brand-bg px-3 py-2 dark:bg-white/10">高频问题回复</span>
              <span className="rounded-lg bg-brand-bg px-3 py-2 dark:bg-white/10">留资引导</span>
              <span className="rounded-lg bg-brand-bg px-3 py-2 dark:bg-white/10">转人工兜底</span>
              <span className="rounded-lg bg-brand-bg px-3 py-2 dark:bg-white/10">知识库优化</span>
            </div>
          </div>
        </button>
      </div>
    </section>
  );
}

function ProblemStrip() {
  return (
    <section className="bg-brand-ink py-12 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-200">
            Seed users
          </p>
          <h2 className="mt-3 text-3xl font-black">先解决老板最头疼的重复咨询</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {painPoints.map((item) => (
            <div key={item} className="rounded-lg bg-white/8 p-4 text-sm leading-6 text-white/82">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="bg-brand-bg py-20 dark:bg-[#15152d]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="why jidah"
          title="不是放一个聊天框，而是把客服流程跑起来"
          subtitle="早期最重要的是落地效果：先接住常见问题，能留资，能转人工，还能根据真实对话持续补知识库。"
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-lg border border-transparent bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand hover:shadow-soft dark:bg-[#1d1d3d]"
            >
              <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand text-sm font-black text-white">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-brand-ink dark:text-white">{feature.title}</h3>
              <p className="mt-3 leading-7 text-brand-body dark:text-gray-300">{feature.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Fit() {
  return (
    <section id="fit" className="bg-white py-20 dark:bg-[#111126]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="fit check"
          title="先判断适不适合，不适合就别硬上"
          subtitle="种子用户阶段，我们更希望把试跑机会给问题明确、资料能整理、上线后能看到数据的团队。"
        />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-brand/20 bg-brand/5 p-6 dark:bg-white/5">
            <h3 className="text-2xl font-bold text-brand-ink dark:text-white">适合先试跑</h3>
            <ul className="mt-6 space-y-4">
              {fitItems.map((item) => (
                <li key={item} className="flex gap-3 leading-7 text-brand-body dark:text-gray-300">
                  <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-green text-xs font-bold text-white">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#191936]">
            <h3 className="text-2xl font-bold text-brand-ink dark:text-white">暂时不建议</h3>
            <ul className="mt-6 space-y-4">
              {notFitItems.map((item) => (
                <li key={item} className="flex gap-3 leading-7 text-brand-body dark:text-gray-300">
                  <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gray-200 text-xs font-bold text-brand-body dark:bg-white/10 dark:text-gray-200">
                    -
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Workflow() {
  return (
    <section id="workflow" className="bg-brand-bg py-20 dark:bg-[#15152d]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="coze workflow"
          title="用 Coze 工作流搭一套能运营的 AI 客服"
          subtitle="从资料整理到上线试跑，先做一个可验证的小闭环，再扩展更多渠道和场景。"
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {workflowSteps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-lg bg-white p-6 shadow-sm dark:bg-[#1d1d3d]"
            >
              <p className="text-sm font-black text-brand">STEP {index + 1}</p>
              <h3 className="mt-4 text-xl font-bold text-brand-ink dark:text-white">{step.title}</h3>
              <p className="mt-3 leading-7 text-brand-body dark:text-gray-300">{step.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Scenes() {
  return (
    <section id="scenes" className="bg-white py-20 dark:bg-[#111126]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="scenes"
          title="优先服务这些中小企业场景"
          subtitle="先从重复问题最多、业务规则相对清晰的入口开始，降低试错成本。"
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {scenes.map((scene) => (
            <article
              key={scene.title}
              className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand hover:shadow-soft dark:border-white/10 dark:bg-[#191936]"
            >
              <h3 className="text-xl font-bold text-brand-ink dark:text-white">{scene.title}</h3>
              <p className="mt-3 leading-7 text-brand-body dark:text-gray-300">{scene.desc}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {scene.questions.map((question) => (
                  <span
                    key={question}
                    className="rounded-full bg-brand-bg px-3 py-1.5 text-xs font-semibold text-brand-body dark:bg-white/10 dark:text-gray-200"
                  >
                    {question}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Comparison() {
  return (
    <section className="bg-brand-bg py-20 dark:bg-[#15152d]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="before after"
          title="人工客服和 AI 先接待的区别"
          subtitle="目标不是替代所有人工，而是把重复、标准、低风险的问题先自动化。"
        />
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-soft dark:border-white/10">
          <table className="w-full min-w-[640px] border-collapse bg-white text-left dark:bg-[#191936]">
            <thead>
              <tr>
                <th className="p-4 text-brand-ink dark:text-white">维度</th>
                <th className="p-4 text-brand-ink dark:text-white">只靠人工</th>
                <th className="bg-brand p-4 text-white">AI 先接待</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map(([dimension, oldWay, jidah]) => (
                <tr key={dimension} className="border-t border-gray-100 dark:border-white/10">
                  <td className="p-4 font-semibold text-brand-ink dark:text-white">{dimension}</td>
                  <td className="p-4 text-brand-body dark:text-gray-300">{oldWay}</td>
                  <td className="bg-brand p-4 font-semibold text-white">{jidah}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="bg-white py-20 dark:bg-[#111126]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="pricing"
          title="先试跑，看见效果后再付费"
          subtitle="前期不建议直接买套餐。先用一个入口跑通，再决定是否长期使用和扩展渠道。"
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative rounded-lg bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-soft dark:bg-[#1d1d3d] ${
                plan.primary ? "border-2 border-brand" : "border border-gray-100 dark:border-white/10"
              }`}
            >
              {plan.badge ? (
                <div className="absolute right-5 top-5 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
                  {plan.badge}
                </div>
              ) : null}
              <h3 className="text-2xl font-bold text-brand-ink dark:text-white">{plan.name}</h3>
              <p className="mt-5 text-4xl font-black text-brand-ink dark:text-white">{plan.price}</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((item) => (
                  <li key={item} className="flex gap-3 text-brand-body dark:text-gray-300">
                    <span className="text-brand-green" aria-hidden="true">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={plan.href}
                className={`mt-8 block rounded-full px-5 py-3 text-center font-semibold transition ${
                  plan.primary
                    ? "bg-brand text-white hover:bg-brand-dark"
                    : "border border-brand text-brand hover:bg-brand hover:text-white"
                }`}
              >
                {plan.cta}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="bg-brand-bg py-20 dark:bg-[#15152d]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="faq" title="常见问题" />
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-lg border border-gray-100 bg-white p-5 shadow-sm transition open:shadow-soft dark:border-white/10 dark:bg-[#191936]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-brand-ink dark:text-white">
                {faq.q}
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-bg text-brand transition group-open:rotate-45 dark:bg-white/10">
                  +
                </span>
              </summary>
              <div className="grid grid-rows-[0fr] transition-all duration-300 group-open:grid-rows-[1fr]">
                <p className="overflow-hidden pt-4 leading-7 text-brand-body dark:text-gray-300">
                  {faq.a}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setSubmitted(false);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("提交失败");
      }

      setSubmitted(true);
      form.reset();
    } catch {
      setError("提交失败了，可以直接点击右下角 AI 客服留下联系方式。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="bg-gradient-to-r from-brand to-brand-purple py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="text-white">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-100">
            free diagnosis
          </p>
          <h2 className="mt-4 text-3xl font-black leading-tight md:text-4xl">
            申请一次免费的客服效率诊断
          </h2>
          <p className="mt-5 text-lg leading-8 text-white/85">
            留下行业和咨询情况，我会先判断你适不适合上 AI 客服。适合的话，再给你一个基于 Coze 工作流的试跑方案。
          </p>
          <div className="mt-8 space-y-3 text-sm text-white/82">
            <p>诊断会看 4 件事：</p>
            <p>咨询量、重复问题、现有渠道、是否有资料可整理。</p>
            <p>不适合的情况会直接告诉你，避免浪费搭建成本。</p>
          </div>
        </div>
        <form onSubmit={onSubmit} className="rounded-lg bg-white p-5 shadow-soft md:p-7">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              required
              name="name"
              placeholder="称呼"
              className="h-12 rounded-lg border border-gray-200 bg-white px-4 text-brand-ink outline-none ring-0 placeholder:text-gray-400 focus:border-brand"
            />
            <input
              required
              name="company"
              placeholder="公司/行业，例如女装电商"
              className="h-12 rounded-lg border border-gray-200 bg-white px-4 text-brand-ink outline-none ring-0 placeholder:text-gray-400 focus:border-brand"
            />
            <input
              required
              name="phone"
              placeholder="手机号"
              inputMode="tel"
              className="h-12 rounded-lg border border-gray-200 bg-white px-4 text-brand-ink outline-none ring-0 placeholder:text-gray-400 focus:border-brand"
            />
            <input
              name="wechat"
              placeholder="微信号"
              className="h-12 rounded-lg border border-gray-200 bg-white px-4 text-brand-ink outline-none ring-0 placeholder:text-gray-400 focus:border-brand"
            />
            <input
              name="dailyConsults"
              placeholder="每天大概多少咨询，例如 80 条"
              className="h-12 rounded-lg border border-gray-200 bg-white px-4 text-brand-ink outline-none ring-0 placeholder:text-gray-400 focus:border-brand md:col-span-2"
            />
            <select
              name="source"
              defaultValue=""
              className="h-12 rounded-lg border border-gray-200 bg-white px-4 text-brand-ink outline-none ring-0 focus:border-brand md:col-span-2"
            >
              <option value="" disabled>
                你是从哪里看到即答的？
              </option>
              {leadSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
            <textarea
              name="commonQuestions"
              placeholder="客户最常问的 3-5 个问题，例如多少钱、什么时候发货、能不能退换..."
              rows={4}
              className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-brand-ink outline-none ring-0 placeholder:text-gray-400 focus:border-brand md:col-span-2"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-5 h-12 w-full rounded-lg bg-brand font-bold text-white transition hover:-translate-y-1 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "提交中..." : "提交，获取免费诊断"}
          </button>
          {submitted ? (
            <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              提交成功，我们会尽快联系你。
            </p>
          ) : null}
          {error ? (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}
          <p className="mt-4 text-center text-xs leading-5 text-brand-body">
            提交后通常 1 个工作日内联系。也可以直接体验右下角 AI 客服。
          </p>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-brand-ink py-10 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <a href="#top" className="text-2xl font-black text-white">
              即答
            </a>
            <p className="mt-2 text-sm text-white/65">为中小企业搭建可试跑的 AI 客服工作流</p>
          </div>
          <div className="flex flex-wrap gap-5 text-sm text-white/75">
            {[...navItems, { label: "免费诊断", href: "#contact" }].map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-white">
                {item.label}
              </a>
            ))}
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6 text-sm text-white/55">
          © 2026 即答
        </div>
      </div>
    </footer>
  );
}

export function HomePage() {
  const [chatGuideVisible, setChatGuideVisible] = useState(false);

  const showChatGuide = () => {
    setChatGuideVisible(true);
    window.setTimeout(() => setChatGuideVisible(false), 7000);
  };

  return (
    <>
      <Header onShowChatGuide={showChatGuide} />
      <main>
        <Hero onShowChatGuide={showChatGuide} />
        <ProblemStrip />
        <Features />
        <Fit />
        <Workflow />
        <Scenes />
        <Comparison />
        <Pricing />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <ChatGuide visible={chatGuideVisible} onClose={() => setChatGuideVisible(false)} />
    </>
  );
}
