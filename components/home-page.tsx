"use client";

import { FormEvent, useEffect, useState } from "react";
import { ChatPanel } from "@/components/chat-panel";

const navItems = [
  { label: "方案", href: "#solution" },
  { label: "流程", href: "#process" },
  { label: "场景", href: "#scenes" },
  { label: "价格", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const servicePoints = [
  "专属知识库",
  "Coze 工作流",
  "留资引导",
  "转人工兜底",
];

const customerQuestions = [
  "这个产品多少钱？",
  "今天下单什么时候发货？",
  "能不能退换？",
  "课程适合零基础吗？",
  "怎么预约到店？",
  "可以发一份报价单吗？",
];

const outcomes = [
  {
    title: "先接住重复咨询",
    desc: "价格、发货、售后、预约、报名等问题先由 AI 回复，人工处理真正需要判断的客户。",
  },
  {
    title: "回答限定在业务资料内",
    desc: "围绕企业资料、FAQ、规则和话术搭知识库，答不上来的问题进入兜底或转人工。",
  },
  {
    title: "把对话变成线索",
    desc: "在合适节点追问需求、收集联系方式、提示人工跟进，让体验不止停留在问答。",
  },
];

const proofItems = [
  { value: "3-5天", label: "基础版上线试跑" },
  { value: "1个入口", label: "先验证再扩展" },
  { value: "¥599/月起", label: "适合小微预算" },
];

const solutionItems = [
  {
    icon: "⚡",
    title: "秒级响应",
    desc: "访客进入页面、公众号或私域入口后，常见问题不用排队等待。",
  },
  {
    icon: "🧠",
    title: "懂你的业务",
    desc: "用产品资料、价格规则、售后政策和标准话术训练回答范围。",
  },
  {
    icon: "🔄",
    title: "多轮引导",
    desc: "根据客户问题继续追问型号、预算、使用场景或联系方式。",
  },
  {
    icon: "🎨",
    title: "品牌语气定制",
    desc: "可以偏专业、亲切、销售型或服务型，不让回答像通用机器人。",
  },
  {
    icon: "🤝",
    title: "复杂问题转人工",
    desc: "投诉、异常订单、强定制需求不硬答，把上下文交给人工继续处理。",
  },
  {
    icon: "📱",
    title: "多渠道接入",
    desc: "先从官网或公众号试跑，再扩展到企微、飞书、钉钉、小程序等入口。",
  },
];

const processSteps = [
  {
    title: "诊断咨询内容",
    desc: "看咨询量、重复问题、渠道入口和资料完整度，判断是否值得先试跑。",
  },
  {
    title: "整理知识库",
    desc: "把产品介绍、价格规则、售后政策、FAQ 和销售话术整理成可用资料。",
  },
  {
    title: "搭建工作流",
    desc: "配置分类、追问、回答、留资、转人工、兜底话术和不同场景路径。",
  },
  {
    title: "上线复盘",
    desc: "先跑一个入口，观察真实对话，再补充知识库和优化转化节点。",
  },
];

const scenes = [
  ["🛒", "电商零售", "售前咨询、订单查询、售后退换货"],
  ["💻", "SaaS/软件", "产品使用引导、功能说明、基础技术支持"],
  ["📚", "教育培训", "课程咨询、报名引导、试听预约"],
  ["🏦", "金融保险", "产品介绍、资料收集、合规问答兜底"],
  ["🏥", "医疗健康", "预约挂号、科室引导、服务项目说明"],
  ["🏢", "企业内部", "IT 服务台、HR 咨询、行政问答"],
];

const comparisons = [
  ["响应速度", "排队等待", "秒级回复"],
  ["服务时间", "工作日 8 小时", "7x24 全天候"],
  ["知识一致性", "因人而异", "统一标准"],
  ["并发能力", "受客服人数限制", "高峰期也能同时接待"],
  ["成本结构", "招聘、培训、管理", "一次搭建，持续优化"],
];

const plans = [
  {
    name: "基础版",
    price: "¥599/月",
    badge: "最受欢迎",
    desc: "适合先在一个入口验证 AI 客服效果。",
    features: ["1 个账号", "1 个渠道", "标准知识库 50 篇", "基础人设定制", "3 天免费体验"],
    cta: "立即体验基础版",
    primary: true,
  },
  {
    name: "专业版",
    price: "¥599/月起",
    desc: "适合咨询量较高，需要多渠道和转人工的团队。",
    features: ["多渠道接入", "定制知识库", "个性化人设", "转人工流程", "优先支持"],
    cta: "咨询专业方案",
    primary: false,
  },
  {
    name: "旗舰版",
    price: "面议",
    desc: "适合需要深度定制、长期运营和服务保障的团队。",
    features: ["全功能接入", "深度流程定制", "长期运维", "专属顾问", "SLA 保障"],
    cta: "联系定制顾问",
    primary: false,
  },
];

const faqs = [
  {
    q: "AI 客服会乱说话吗？",
    a: "不会放任它自由发挥。即答会基于企业专属知识库构建回答范围，缺少依据的问题进入兜底回复或转人工。",
  },
  {
    q: "搭建周期多久？",
    a: "基础版通常 3-5 个工作日上线试跑。涉及多渠道、复杂流程或大量资料整理的定制版，一般需要 1-2 周。",
  },
  {
    q: "AI 回答不了怎么办？",
    a: "会自动识别低置信度、投诉、异常订单和强定制问题，引导客户留下信息或转接人工，并保留对话上下文。",
  },
  {
    q: "支持哪些渠道？",
    a: "可以接入网页、微信公众号、企业微信、飞书、钉钉、APP 内嵌等。建议先选一个入口试跑，再逐步扩展。",
  },
  {
    q: "可以先试用吗？",
    a: "可以。我们建议先做 3 天免费体验，用真实咨询观察回复质量、转人工比例和线索收集效果。",
  },
];

const leadSources = ["官网", "公众号", "小红书/抖音", "朋友推荐", "其他"];

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition ${
        scrolled
          ? "border-slate-200 bg-white/94 shadow-[0_6px_18px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-[#0f1024]/94"
          : "border-transparent bg-white/78 backdrop-blur dark:bg-[#0f1024]/76"
      }`}
    >
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="主导航"
      >
        <a href="#top" className="flex items-center gap-2 text-2xl font-black text-brand">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-base text-white">
            答
          </span>
          即答
        </a>
        <div className="hidden items-center gap-7 md:flex" aria-hidden={open}>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-slate-700 transition hover:text-brand dark:text-slate-200"
            >
              {item.label}
            </a>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex" aria-hidden={open}>
          <a
            href="#experience"
            className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-brand-ink transition hover:border-brand hover:text-brand dark:border-white/20 dark:text-white"
          >
            体验 AI 客服
          </a>
          <a
            href="#contact"
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            获取免费体验
          </a>
        </div>
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300 text-xl text-brand-ink dark:border-white/20 dark:text-white md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label="打开菜单"
        >
          {open ? "×" : "☰"}
        </button>
      </nav>
      {open ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-[#0f1024] md:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 font-semibold text-slate-700 hover:bg-indigo-50 dark:text-slate-200 dark:hover:bg-white/10"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#experience"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-slate-300 px-3 py-3 text-center font-bold text-brand-ink dark:border-white/20 dark:text-white"
            >
              体验 AI 客服
            </a>
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-brand px-3 py-3 text-center font-bold text-white"
            >
              获取免费体验
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-[#f7f8ff] pt-24 dark:bg-[#0f1024] md:pt-28">
      <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_78%_18%,rgba(124,58,237,0.22),transparent_34%),radial-gradient(circle_at_18%_10%,rgba(79,70,229,0.16),transparent_32%)]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 sm:px-6 md:grid-cols-[1.02fr_0.98fr] lg:px-8">
        <div className="max-w-3xl animate-rise">
          <div className="mb-6 inline-flex flex-wrap items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-brand shadow-[0_3px_8px_rgba(79,70,229,0.12)] dark:bg-white/10 dark:text-indigo-100">
            <span className="h-2 w-2 rounded-full bg-brand-green" />
            为小微企业搭建个性化 AI 智能客服
          </div>
          <h1 className="text-balance text-4xl font-black leading-[1.08] tracking-[-0.03em] text-brand-ink dark:text-white md:text-6xl">
            让每个小微企业都拥有专业 AI 客服
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-slate-700 dark:text-slate-300 md:text-xl">
            7×24 在线，懂你的业务，会引导转化。基于 Coze 工作流和企业知识库，把重复咨询先交给 AI。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#experience"
              className="rounded-full bg-brand px-7 py-3.5 text-center font-bold text-white transition hover:-translate-y-1 hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              立即体验 AI 客服
            </a>
            <a
              href="#pricing"
              className="rounded-full border border-slate-300 bg-white px-7 py-3.5 text-center font-bold text-brand-ink transition hover:-translate-y-1 hover:border-brand hover:text-brand dark:border-white/20 dark:bg-white/8 dark:text-white"
            >
              查看价格方案
            </a>
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-600 dark:text-slate-400">
            3 天免费体验，满意再决定。基础方案 ¥599/月起。
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {servicePoints.map((point) => (
              <span
                key={point}
                className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-[0_2px_6px_rgba(15,23,42,0.06)] dark:bg-white/10 dark:text-slate-100"
              >
                {point}
              </span>
            ))}
          </div>
        </div>

        <a
          href="#experience"
          className="group relative animate-rise overflow-hidden rounded-2xl bg-white text-left transition hover:-translate-y-1 dark:bg-[#181935]"
          aria-label="进入 AI 客服体验区"
        >
          <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-brand to-brand-purple px-5 py-4 text-white">
            <span className="flex items-center gap-2 font-bold">
              <span className="h-3 w-3 rounded-full bg-brand-green" />
              即答 AI 客服 · 在线
            </span>
            <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-bold">
              API 对话
            </span>
          </div>
          <div className="space-y-5 p-5 md:p-7">
            <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-slate-100 p-4 text-sm leading-6 text-brand-ink dark:bg-white/10 dark:text-slate-100">
              您好，我可以回答产品、报价、发货、售后和预约问题。复杂情况会帮您转人工。
            </div>
            <div className="ml-auto max-w-[84%] rounded-2xl rounded-tr-md bg-brand p-4 text-sm leading-6 text-white">
              我们每天很多人问价格和发货，能自动回复吗？
            </div>
            <div className="max-w-[94%] rounded-2xl rounded-tl-md bg-slate-100 p-4 text-sm leading-6 text-brand-ink dark:bg-white/10 dark:text-slate-100">
              可以。先整理商品资料、价格规则和售后政策，再配置工作流判断问题类型。答不上来时，我会引导留下联系方式或转人工。
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-700 dark:text-slate-200">
              {["知识库回答", "多轮追问", "留资引导", "转人工"].map((item) => (
                <span key={item} className="rounded-lg bg-indigo-50 px-3 py-2 dark:bg-white/10">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </a>
      </div>
    </section>
  );
}

function QuestionBand() {
  return (
    <section className="bg-brand-ink py-12 text-white dark:bg-[#080914]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-bold text-indigo-200">客户每天都在重复问</p>
          <h2 className="mt-3 max-w-xl text-3xl font-black leading-tight md:text-4xl">
            这些问题不该一直靠人工复制粘贴
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {customerQuestions.map((question) => (
            <span
              key={question}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/88"
            >
              {question}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionTitle({
  label,
  title,
  subtitle,
  align = "center",
}: {
  label?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={`mb-11 ${align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}`}>
      {label ? <p className="mb-3 text-sm font-black text-brand">{label}</p> : null}
      <h2 className="text-balance text-3xl font-black leading-tight tracking-[-0.02em] text-brand-ink dark:text-white md:text-5xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-pretty text-base leading-7 text-slate-700 dark:text-slate-300 md:text-lg">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

function Outcomes() {
  return (
    <section className="bg-white py-20 dark:bg-[#111227]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-end">
          <SectionTitle
            align="left"
            label="即答做什么"
            title="不是卖机器人，而是交付一套可试跑的客服流程"
            subtitle="小微企业最需要的不是复杂后台，而是先把高频问题答准，把客户留下，把人工从重复回复里解放出来。"
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {proofItems.map((item) => (
              <div key={item.label} className="rounded-xl bg-indigo-50 p-5 dark:bg-white/8">
                <p className="text-3xl font-black text-brand-ink dark:text-white">{item.value}</p>
                <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {outcomes.map((item) => (
            <article key={item.title} className="rounded-2xl bg-slate-50 p-6 dark:bg-white/8">
              <h3 className="text-xl font-black text-brand-ink dark:text-white">{item.title}</h3>
              <p className="mt-3 leading-7 text-slate-700 dark:text-slate-300">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Solution() {
  return (
    <section id="solution" className="bg-brand-bg py-20 dark:bg-[#15162d]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          label="为什么选择即答"
          title="AI 客服该有的能力，按小微企业预算落地"
          subtitle="从常见问题到转人工，从品牌语气到渠道接入，先做能产生效果的部分。"
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {solutionItems.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-transparent bg-white p-6 transition hover:-translate-y-1 hover:border-brand dark:bg-[#1b1c39]"
            >
              <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-2xl dark:bg-white/10">
                {item.icon}
              </div>
              <h3 className="text-xl font-black text-brand-ink dark:text-white">{item.title}</h3>
              <p className="mt-3 leading-7 text-slate-700 dark:text-slate-300">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Comparison() {
  return (
    <section className="bg-white py-20 dark:bg-[#111227]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          label="对比"
          title="传统客服 vs 即答 AI 客服"
          subtitle="即答不取代所有人工，它先处理重复、标准、低风险的问题。"
        />
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
          <table className="w-full min-w-[680px] border-collapse bg-white text-left dark:bg-[#181935]">
            <thead>
              <tr>
                <th className="p-5 text-brand-ink dark:text-white">维度</th>
                <th className="p-5 text-brand-ink dark:text-white">传统客服</th>
                <th className="bg-brand p-5 text-white">即答 AI 客服</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map(([dimension, oldWay, jidah]) => (
                <tr key={dimension} className="border-t border-slate-100 dark:border-white/10">
                  <td className="p-5 font-bold text-brand-ink dark:text-white">{dimension}</td>
                  <td className="p-5 text-slate-700 dark:text-slate-300">{oldWay}</td>
                  <td className="bg-brand p-5 font-bold text-white">{jidah}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section id="process" className="bg-brand-bg py-20 dark:bg-[#15162d]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          label="落地流程"
          title="从资料到上线，先跑一个小闭环"
          subtitle="我们会先把范围控制住，用真实对话验证效果，再决定是否扩展更多渠道。"
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((step, index) => (
            <article key={step.title} className="rounded-2xl bg-white p-6 dark:bg-[#1b1c39]">
              <div className="mb-5 grid h-10 w-10 place-items-center rounded-full bg-brand text-sm font-black text-white">
                {index + 1}
              </div>
              <h3 className="text-xl font-black text-brand-ink dark:text-white">{step.title}</h3>
              <p className="mt-3 leading-7 text-slate-700 dark:text-slate-300">{step.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Scenes() {
  return (
    <section id="scenes" className="bg-white py-20 dark:bg-[#111227]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          label="适用场景"
          title="重复问题越多，越适合先上 AI 客服"
          subtitle="即答优先服务咨询规则清晰、客户问题重复度高、人工容易漏接的小微企业。"
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {scenes.map(([icon, title, desc]) => (
            <article
              key={title}
              className="rounded-2xl border border-slate-100 bg-white p-6 transition hover:-translate-y-1 hover:border-brand dark:border-white/10 dark:bg-[#181935]"
            >
              <div className="text-3xl">{icon}</div>
              <h3 className="mt-5 text-xl font-black text-brand-ink dark:text-white">{title}</h3>
              <p className="mt-3 leading-7 text-slate-700 dark:text-slate-300">{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="bg-brand-bg py-20 dark:bg-[#15162d]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          label="价格方案"
          title="从 3 天体验开始，预算可控再长期使用"
          subtitle="先让你看到 AI 客服在真实业务里的表现，再决定买哪种方案。"
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative rounded-2xl bg-white p-7 dark:bg-[#1b1c39] ${
                plan.primary ? "border-2 border-brand" : "border border-slate-100 dark:border-white/10"
              }`}
            >
              {plan.badge ? (
                <span className="absolute right-5 top-5 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
                  {plan.badge}
                </span>
              ) : null}
              <h3 className="text-2xl font-black text-brand-ink dark:text-white">{plan.name}</h3>
              <p className="mt-3 leading-7 text-slate-700 dark:text-slate-300">{plan.desc}</p>
              <p className="mt-6 text-4xl font-black tracking-[-0.02em] text-brand-ink dark:text-white">
                {plan.price}
              </p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((item) => (
                  <li key={item} className="flex gap-3 text-slate-700 dark:text-slate-300">
                    <span className="font-black text-brand-green">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`mt-8 block rounded-full px-5 py-3 text-center font-bold transition ${
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

function Experience() {
  return (
    <section id="experience" className="bg-white py-20 dark:bg-[#111227]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:px-8">
        <SectionTitle
          align="left"
          label="亲自体验"
          title="不用找悬浮按钮，直接在这里对话"
          subtitle="官网现在使用 Coze API 接入自有聊天框。你可以直接问价格、搭建周期、适用场景和转人工规则。"
        />
        <div className="overflow-hidden rounded-2xl bg-[#f7f8ff] dark:bg-[#0f1024]">
          <ChatPanel mode="embedded" />
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="bg-brand-bg py-20 dark:bg-[#15162d]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionTitle label="FAQ" title="常见问题" />
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl bg-white p-5 transition open:bg-indigo-50 dark:bg-[#1b1c39] dark:open:bg-white/10"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-black text-brand-ink dark:text-white">
                {faq.q}
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-brand transition group-open:rotate-45 dark:bg-white/10">
                  +
                </span>
              </summary>
              <div className="grid grid-rows-[0fr] transition-all duration-300 group-open:grid-rows-[1fr]">
                <p className="overflow-hidden pt-4 leading-7 text-slate-700 dark:text-slate-300">
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
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("submit failed");
      }

      setSubmitted(true);
      form.reset();
    } catch {
      setError("提交失败了，可以在上方 AI 客服里留下联系方式。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="bg-gradient-to-r from-brand to-brand-purple py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="text-white">
          <p className="text-sm font-black text-indigo-100">免费体验</p>
          <h2 className="mt-4 text-balance text-3xl font-black leading-tight md:text-5xl">
            3 天免费体验，感受 AI 客服的真实效果
          </h2>
          <p className="mt-5 text-lg leading-8 text-white/88">
            留下联系方式，我们安排一次免费定制演示。适合就试跑，不适合会直接告诉你原因。
          </p>
          <div className="mt-8 grid gap-3 text-sm font-semibold text-white/88 sm:grid-cols-2">
            <span className="rounded-xl bg-white/12 px-4 py-3">咨询量诊断</span>
            <span className="rounded-xl bg-white/12 px-4 py-3">高频问题梳理</span>
            <span className="rounded-xl bg-white/12 px-4 py-3">Coze 工作流建议</span>
            <span className="rounded-xl bg-white/12 px-4 py-3">上线试跑路径</span>
          </div>
        </div>
        <form onSubmit={onSubmit} className="rounded-2xl bg-white p-5 md:p-7">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              required
              name="name"
              placeholder="称呼"
              className="h-12 rounded-lg border border-slate-300 bg-white px-4 text-brand-ink outline-none placeholder:text-slate-600 focus:border-brand"
            />
            <input
              required
              name="company"
              placeholder="公司/行业"
              className="h-12 rounded-lg border border-slate-300 bg-white px-4 text-brand-ink outline-none placeholder:text-slate-600 focus:border-brand"
            />
            <input
              required
              name="phone"
              placeholder="手机号"
              inputMode="tel"
              className="h-12 rounded-lg border border-slate-300 bg-white px-4 text-brand-ink outline-none placeholder:text-slate-600 focus:border-brand"
            />
            <input
              name="wechat"
              placeholder="微信号"
              className="h-12 rounded-lg border border-slate-300 bg-white px-4 text-brand-ink outline-none placeholder:text-slate-600 focus:border-brand"
            />
            <input
              name="dailyConsults"
              placeholder="每天大概多少咨询，例如 80 条"
              className="h-12 rounded-lg border border-slate-300 bg-white px-4 text-brand-ink outline-none placeholder:text-slate-600 focus:border-brand md:col-span-2"
            />
            <select
              name="source"
              defaultValue=""
              className="h-12 rounded-lg border border-slate-300 bg-white px-4 text-brand-ink outline-none focus:border-brand md:col-span-2"
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
              placeholder="客户最常问的 3-5 个问题"
              rows={4}
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-brand-ink outline-none placeholder:text-slate-600 focus:border-brand md:col-span-2"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-5 h-12 w-full rounded-lg bg-brand font-black text-white transition hover:-translate-y-1 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "提交中..." : "提交，获取免费体验"}
          </button>
          {submitted ? (
            <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
              提交成功，我们会在 1 个工作日内联系您。
            </p>
          ) : null}
          {error ? (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
              {error}
            </p>
          ) : null}
          <p className="mt-4 text-center text-xs leading-5 text-slate-600">
            提交后我们会在 1 个工作日内联系您。
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
            <p className="mt-2 text-sm text-white/70">
              为小微企业搭建个性化 AI 智能客服。
            </p>
          </div>
          <div className="flex flex-wrap gap-5 text-sm font-semibold text-white/78">
            {[...navItems, { label: "联系", href: "#contact" }].map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-white">
                {item.label}
              </a>
            ))}
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6 text-sm text-white/60">
          © 2026 即答
        </div>
      </div>
    </footer>
  );
}

export function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <QuestionBand />
        <Outcomes />
        <Solution />
        <Comparison />
        <Process />
        <Scenes />
        <Pricing />
        <Experience />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
