"use client";

import Script from "next/script";
import { FormEvent, useEffect, useState } from "react";

const navItems = [
  { label: "功能", href: "#features" },
  { label: "场景", href: "#scenes" },
  { label: "价格", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const features = [
  { icon: "⚡", title: "秒级响应", desc: "告别排队等待，客户问题即时回复" },
  { icon: "🧠", title: "懂你的业务", desc: "基于企业专属知识库，回答精准不乱编" },
  { icon: "🔄", title: "多轮对话", desc: "理解上下文，引导客户逐步解决问题" },
  { icon: "🎨", title: "个性化人设", desc: "按品牌调性定制语气和风格" },
  { icon: "🤝", title: "无缝转人工", desc: "复杂问题自动转接，上下文不丢失" },
  { icon: "📱", title: "多渠道接入", desc: "网页、微信、飞书、钉钉、APP" },
];

const scenes = [
  { icon: "🛒", title: "电商零售", desc: "售前咨询、订单查询、售后退换货" },
  { icon: "💻", title: "SaaS/软件", desc: "产品使用引导、功能说明、技术支持" },
  { icon: "📚", title: "教育培训", desc: "课程咨询、报名引导、常见问题" },
  { icon: "🏦", title: "金融保险", desc: "产品介绍、理赔指引、合规问答" },
  { icon: "🏥", title: "医疗健康", desc: "预约挂号、科室引导、健康咨询" },
  { icon: "🏢", title: "企业内部", desc: "IT服务台、HR咨询、行政问答" },
];

const comparisons = [
  ["响应速度", "排队等待", "秒级回复"],
  ["服务时间", "工作日8小时", "7x24全天候"],
  ["知识一致性", "因人而异", "统一标准"],
  ["并发能力", "有限", "无上限"],
  ["成本", "招聘+培训+管理", "一次性搭建，长期低成本"],
];

const faqs = [
  {
    q: "AI客服会乱说话吗？",
    a: "不会。基于企业专属知识库构建，回答严格限定在您提供的资料范围内。",
  },
  { q: "搭建周期多久？", a: "基础版3-5个工作日上线，定制版1-2周。" },
  {
    q: "AI回答不了怎么办？",
    a: "自动识别并转接人工客服，对话上下文一并传递。",
  },
  {
    q: "支持哪些渠道？",
    a: "网页、微信公众号、企业微信、飞书、钉钉、APP内嵌等。",
  },
  { q: "可以先试用吗？", a: "可以！3天免费体验，亲身感受效果再决定。" },
];

const plans = [
  {
    name: "基础版",
    price: "¥599/月",
    badge: "最受欢迎",
    features: ["1个账号", "1个渠道", "标准知识库50篇", "基础人设定制", "3天免费体验"],
    cta: "立即体验",
    primary: true,
  },
  {
    name: "专业版",
    price: "¥599/月起",
    features: ["多渠道接入", "定制知识库", "个性化人设", "转人工", "优先支持"],
    cta: "咨询方案",
  },
  {
    name: "旗舰版",
    price: "面议",
    features: ["全功能", "深度定制", "长期运维", "专属顾问", "SLA保障"],
    cta: "联系我们",
  },
];

function openCozeChat() {
  const client = window.__jidahCozeChatClient;

  if (typeof client?.showChat === "function") {
    client.showChat();
    return;
  }

  if (typeof client?.open === "function") {
    client.open();
    return;
  }

  const cozeButton = document.querySelector<HTMLElement>(
    '[class*="coze" i], [id*="coze" i], [aria-label*="chat" i], [aria-label*="客服" i]',
  );
  cozeButton?.click();
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
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

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur transition-shadow dark:bg-brand-ink/90 ${
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
          <button
            type="button"
            onClick={() => setDark((value) => !value)}
            className="h-10 rounded-full border border-gray-200 px-4 text-sm font-medium text-brand-ink transition hover:border-brand hover:text-brand dark:border-white/20 dark:text-white"
            aria-label="切换暗色模式"
          >
            {dark ? "浅色" : "暗色"}
          </button>
          <button
            type="button"
            onClick={openCozeChat}
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
          >
            免费体验
          </button>
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
              onClick={() => setDark((value) => !value)}
              className="rounded-lg px-3 py-2 text-left font-medium text-brand-body hover:bg-brand-bg dark:text-gray-200 dark:hover:bg-white/10"
            >
              {dark ? "切换浅色模式" : "切换暗色模式"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openCozeChat();
              }}
              className="rounded-lg bg-brand px-3 py-3 text-center font-semibold text-white"
            >
              免费体验
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="overflow-hidden bg-white pt-28 dark:bg-[#111126] md:pt-32">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 sm:px-6 md:grid-cols-[1fr_0.9fr] lg:px-8">
        <div className="animate-fadeUp">
          <p className="mb-4 inline-flex rounded-full bg-brand/10 px-4 py-2 text-sm font-semibold text-brand dark:bg-white/10 dark:text-indigo-200">
            为小微企业定制的AI客服搭建服务
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-tight text-brand-ink dark:text-white md:text-6xl">
            让每个小微企业都拥有专业AI客服
          </h1>
          <p className="mt-6 text-lg font-semibold text-brand-body dark:text-gray-300 md:text-xl">
            7x24在线 · 懂你的业务 · 会引导转化 · ¥599/月起
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={openCozeChat}
              className="rounded-full bg-brand px-7 py-3.5 text-center font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-1 hover:bg-brand-dark"
            >
              立即体验AI客服
            </button>
            <a
              href="#pricing"
              className="rounded-full border border-gray-300 px-7 py-3.5 text-center font-semibold text-brand-ink transition hover:-translate-y-1 hover:border-brand hover:text-brand dark:border-white/20 dark:text-white"
            >
              查看价格
            </a>
          </div>
          <p className="mt-5 text-sm text-brand-body dark:text-gray-400">
            3天免费体验，满意再决定
          </p>
        </div>
        <div className="animate-fadeUp rounded-2xl bg-white shadow-soft ring-1 ring-gray-100 dark:bg-[#191936] dark:ring-white/10">
          <div className="flex items-center gap-2 rounded-t-2xl bg-brand px-5 py-4 font-semibold text-white">
            <span className="h-3 w-3 rounded-full bg-brand-green" aria-hidden="true" />
            即答AI客服 · 在线
          </div>
          <div className="space-y-5 p-5 md:p-7">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-brand-bg p-4 text-sm leading-6 text-brand-ink dark:bg-white/10 dark:text-gray-100">
              您好，我是即答AI客服。可以帮您介绍产品、查询订单、引导报价，也能在需要时转接人工。
            </div>
            <div className="ml-auto max-w-[82%] rounded-2xl rounded-tr-sm bg-brand p-4 text-sm leading-6 text-white">
              我们是小型电商团队，想做售前咨询自动回复，可以吗？
            </div>
            <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-brand-bg p-4 text-sm leading-6 text-brand-ink dark:bg-white/10 dark:text-gray-100">
              可以。我们会基于您的商品资料、售后政策和常见问题搭建专属知识库，并按品牌语气训练客服话术，基础版3-5个工作日可上线。
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="bg-brand-bg py-20 dark:bg-[#15152d]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle title="为什么选择即答" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-lg border border-transparent bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand hover:shadow-soft dark:bg-[#1d1d3d]"
            >
              <div className="mb-5 text-4xl" aria-hidden="true">
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

function Comparison() {
  return (
    <section className="bg-white py-20 dark:bg-[#111126]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionTitle title="传统客服 vs 即答AI客服" />
        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-soft dark:border-white/10">
          <table className="w-full border-collapse bg-white text-left dark:bg-[#191936]">
            <thead>
              <tr>
                <th className="p-4 text-brand-ink dark:text-white">维度</th>
                <th className="p-4 text-brand-ink dark:text-white">传统客服</th>
                <th className="bg-brand p-4 text-white">即答AI客服</th>
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

function Scenes() {
  return (
    <section id="scenes" className="bg-white py-20 dark:bg-[#111126]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle title="适用场景" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {scenes.map((scene) => (
            <article
              key={scene.title}
              className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand hover:shadow-soft dark:border-white/10 dark:bg-[#191936]"
            >
              <div className="mb-4 text-4xl" aria-hidden="true">
                {scene.icon}
              </div>
              <h3 className="text-xl font-bold text-brand-ink dark:text-white">{scene.title}</h3>
              <p className="mt-3 leading-7 text-brand-body dark:text-gray-300">{scene.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="bg-brand-bg py-20 dark:bg-[#15152d]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle title="价格方案" />
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
                href="#contact"
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
    <section id="faq" className="bg-white py-20 dark:bg-[#111126]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionTitle title="常见问题" />
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

function CozeChatWidget() {
  const cozeToken = process.env.NEXT_PUBLIC_COZE_PAT;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!cozeToken || cozeToken.includes("*")) {
      console.warn("缺少有效 Coze Token");
      return;
    }

    if (!ready) {
      return;
    }

    const sdk = window.CozeWebSDK;
    if (!sdk) {
      console.warn("Coze SDK 未挂载到 window");
      return;
    }

    if (!sdk || window.__jidahCozeChatMounted) {
      return;
    }

    try {
      window.__jidahCozeChatMounted = true;
      window.__jidahCozeChatClient = new sdk.WebChatClient({
        config: {
          bot_id: "7647138797452410889",
        },
        componentProps: {
          title: "即答AI客服",
        },
        auth: {
          type: "token",
          token: cozeToken,
          onRefreshToken: function () {
            return cozeToken;
          },
        },
      }) as Window["__jidahCozeChatClient"];
    } catch (error) {
      window.__jidahCozeChatMounted = false;
      console.warn("Coze 客服初始化失败", error);
    }
  }, [ready, cozeToken]);

  return (
    <Script
      src="https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.19/libs/cn/index.js"
      strategy="afterInteractive"
      onLoad={() => setReady(true)}
      onError={() => console.warn("Coze SDK 加载失败")}
    />
  );
}

function Contact() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      event.currentTarget.reset();
    }, 900);
  };

  return (
    <section id="contact" className="bg-gradient-to-r from-brand to-brand-purple py-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black text-white md:text-4xl">
          3天免费体验，感受AI客服的真实效果
        </h2>
        <p className="mt-4 text-lg text-white/85">留下您的联系方式，我们安排免费定制演示</p>
        <form onSubmit={onSubmit} className="mx-auto mt-9 max-w-3xl">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              required
              name="name"
              placeholder="称呼"
              className="h-12 rounded-lg border-0 bg-white px-4 text-brand-ink outline-none ring-0 placeholder:text-gray-400 focus:ring-2 focus:ring-white/70"
            />
            <input
              required
              name="company"
              placeholder="公司/行业"
              className="h-12 rounded-lg border-0 bg-white px-4 text-brand-ink outline-none ring-0 placeholder:text-gray-400 focus:ring-2 focus:ring-white/70"
            />
            <input
              required
              name="phone"
              placeholder="手机号"
              inputMode="tel"
              className="h-12 rounded-lg border-0 bg-white px-4 text-brand-ink outline-none ring-0 placeholder:text-gray-400 focus:ring-2 focus:ring-white/70"
            />
            <input
              name="wechat"
              placeholder="微信号"
              className="h-12 rounded-lg border-0 bg-white px-4 text-brand-ink outline-none ring-0 placeholder:text-gray-400 focus:ring-2 focus:ring-white/70"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-5 h-12 w-full rounded-lg bg-white font-bold text-brand transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-70 md:w-auto md:px-12"
          >
            {loading ? "提交中..." : "提交，获取免费体验"}
          </button>
        </form>
        {submitted ? (
          <p className="mt-5 font-semibold text-white">提交成功，我们会尽快联系您。</p>
        ) : null}
        <p className="mt-4 text-sm text-white/75">提交后我们会在1个工作日内联系您</p>
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
            <p className="mt-2 text-sm text-white/65">为小微企业提供个性化AI智能客服搭建服务</p>
          </div>
          <div className="flex flex-wrap gap-5 text-sm text-white/75">
            {[...navItems, { label: "联系", href: "#contact" }].map((item) => (
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
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <Comparison />
        <Scenes />
        <Pricing />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <CozeChatWidget />
    </>
  );
}
