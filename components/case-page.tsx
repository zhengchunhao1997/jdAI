"use client";

import { FormEvent, useEffect, useState } from "react";

const quickQuestions = [
  "即答AI客服适合哪些小微企业？",
  "¥599/月起包含什么？",
  "我的行业适合先试跑吗？",
  "搭建周期多久？",
  "AI回答不了怎么办？",
];

const scenarios = [
  {
    title: "电商零售",
    desc: "价格、库存、发货、退换货、优惠活动。",
  },
  {
    title: "教培咨询",
    desc: "课程介绍、适合人群、报名流程、试听预约。",
  },
  {
    title: "本地服务",
    desc: "服务项目、预约时间、地址路线、套餐说明。",
  },
];

const fitChecks = [
  "每天有 30 条以上重复咨询",
  "客户问题集中在价格、流程、售后、预约",
  "已有产品资料、价格表、FAQ 或标准话术",
  "希望先用一个入口试跑，再决定是否长期使用",
];

const leadSources = ["小红书", "抖音", "公众号", "朋友推荐", "其他"];

function openChatHint() {
  window.dispatchEvent(new CustomEvent("jidah:case-chat-hint"));
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/94 backdrop-blur dark:border-white/10 dark:bg-[#0f1024]/94">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4" aria-label="案例页导航">
        <a href="/" className="flex items-center gap-2 font-black text-brand">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm text-white">
            答
          </span>
          即答
        </a>
        <div className="flex items-center gap-2">
          <a
            href="/"
            className="hidden rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-brand-ink hover:border-brand hover:text-brand dark:border-white/20 dark:text-white sm:inline-flex"
          >
            查看官网
          </a>
          <button
            type="button"
            onClick={openChatHint}
            className="rounded-full bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark"
          >
            体验AI客服
          </button>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#f7f8ff] px-4 pb-12 pt-10 dark:bg-[#0f1024]">
      <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_72%_10%,rgba(124,58,237,0.2),transparent_36%),radial-gradient(circle_at_12%_0%,rgba(79,70,229,0.16),transparent_34%)]" />
      <div className="relative mx-auto grid max-w-5xl gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-center">
        <div className="animate-rise">
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-black text-brand shadow-[0_2px_8px_rgba(79,70,229,0.12)] dark:bg-white/10 dark:text-indigo-100">
            <span className="h-2 w-2 rounded-full bg-brand-green" />
            小微企业AI客服真实演示入口
          </p>
          <h1 className="mt-5 text-balance text-4xl font-black leading-[1.08] tracking-[-0.03em] text-brand-ink dark:text-white md:text-6xl">
            手机打开，直接体验即答AI客服
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-8 text-slate-700 dark:text-slate-300">
            你可以直接问价格、搭建周期、适用行业、会不会乱答、怎么接入公众号或官网。体验完再决定是否申请3天免费试跑。
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={openChatHint}
              className="rounded-full bg-brand px-6 py-3.5 text-center font-black text-white transition hover:-translate-y-1 hover:bg-brand-dark"
            >
              点击右下角开始体验
            </button>
            <a
              href="#lead"
              className="rounded-full border border-slate-300 bg-white px-6 py-3.5 text-center font-black text-brand-ink transition hover:-translate-y-1 hover:border-brand hover:text-brand dark:border-white/20 dark:bg-white/8 dark:text-white"
            >
              获取免费诊断
            </a>
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
            从小红书、抖音、公众号过来的用户，先体验这个页面就够了。
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-[0_18px_45px_rgba(47,43,109,0.14)] dark:bg-[#181935]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/10">
            <div>
              <p className="font-black text-brand-ink dark:text-white">建议你这样问</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                复制问题到右下角AI客服即可
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
              在线
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {quickQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={openChatHint}
                className="block w-full rounded-xl bg-indigo-50 px-4 py-3 text-left text-sm font-bold leading-6 text-brand-ink transition hover:bg-indigo-100 dark:bg-white/10 dark:text-white dark:hover:bg-white/14"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ConversionPath() {
  return (
    <section className="bg-brand-ink px-4 py-10 text-white dark:bg-[#080914]">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-black text-indigo-200">当前最短路径</p>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {["内容平台", "Case体验页", "AI客服判断", "留资人工跟进"].map((item, index) => (
            <div key={item} className="rounded-xl bg-white/10 p-4">
              <span className="text-sm font-black text-indigo-200">0{index + 1}</span>
              <p className="mt-2 font-black">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatToTest() {
  return (
    <section className="bg-white px-4 py-14 dark:bg-[#111227]">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <p className="text-sm font-black text-brand">体验目标</p>
          <h2 className="mt-3 text-balance text-3xl font-black tracking-[-0.02em] text-brand-ink dark:text-white md:text-5xl">
            不用先看完整官网，先判断它能不能解决你的重复咨询
          </h2>
          <p className="mt-4 leading-8 text-slate-700 dark:text-slate-300">
            这个案例页只保留和转化有关的信息：你适不适合、AI能做什么、不能做什么、怎么开始试跑。
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {scenarios.map((item) => (
            <article key={item.title} className="rounded-2xl bg-slate-50 p-5 dark:bg-white/8">
              <h3 className="text-xl font-black text-brand-ink dark:text-white">{item.title}</h3>
              <p className="mt-3 leading-7 text-slate-700 dark:text-slate-300">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FitCheck() {
  return (
    <section className="bg-brand-bg px-4 py-14 dark:bg-[#15162d]">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-start">
        <div>
          <p className="text-sm font-black text-brand">适配判断</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.02em] text-brand-ink dark:text-white">
            符合这些情况，建议先试跑3天
          </h2>
          <p className="mt-4 leading-8 text-slate-700 dark:text-slate-300">
            即答不是让AI替代全部人工，而是先处理重复、标准、低风险的问题。
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 dark:bg-[#1b1c39]">
          <ul className="space-y-4">
            {fitChecks.map((item) => (
              <li key={item} className="flex gap-3 leading-7 text-slate-700 dark:text-slate-300">
                <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-green text-xs font-black text-white">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function LeadForm() {
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
        body: JSON.stringify({ ...payload, landingPage: "case" }),
      });

      if (!response.ok) {
        throw new Error("submit failed");
      }

      setSubmitted(true);
      form.reset();
    } catch {
      setError("提交失败了，可以直接点击右下角AI客服留下联系方式。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="lead" className="bg-gradient-to-r from-brand to-brand-purple px-4 py-14">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div className="text-white">
          <p className="text-sm font-black text-indigo-100">免费诊断</p>
          <h2 className="mt-3 text-balance text-3xl font-black leading-tight md:text-5xl">
            想知道你的业务适不适合AI客服？
          </h2>
          <p className="mt-5 text-lg leading-8 text-white/88">
            留下行业、咨询量和联系方式，我们帮你判断适不适合先试跑。适合就给你一个3天体验方案。
          </p>
        </div>
        <form onSubmit={onSubmit} className="rounded-2xl bg-white p-5 md:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              required
              name="name"
              placeholder="称呼"
              className="h-12 rounded-lg border border-slate-300 px-4 text-brand-ink outline-none placeholder:text-slate-600 focus:border-brand"
            />
            <input
              required
              name="company"
              placeholder="公司/行业"
              className="h-12 rounded-lg border border-slate-300 px-4 text-brand-ink outline-none placeholder:text-slate-600 focus:border-brand"
            />
            <input
              required
              name="phone"
              placeholder="手机号"
              inputMode="tel"
              className="h-12 rounded-lg border border-slate-300 px-4 text-brand-ink outline-none placeholder:text-slate-600 focus:border-brand"
            />
            <input
              name="wechat"
              placeholder="微信号"
              className="h-12 rounded-lg border border-slate-300 px-4 text-brand-ink outline-none placeholder:text-slate-600 focus:border-brand"
            />
            <input
              name="dailyConsults"
              placeholder="每天大概多少咨询"
              className="h-12 rounded-lg border border-slate-300 px-4 text-brand-ink outline-none placeholder:text-slate-600 focus:border-brand md:col-span-2"
            />
            <select
              name="source"
              defaultValue=""
              className="h-12 rounded-lg border border-slate-300 bg-white px-4 text-brand-ink outline-none focus:border-brand md:col-span-2"
            >
              <option value="" disabled>
                从哪里看到即答？
              </option>
              {leadSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-5 h-12 w-full rounded-lg bg-brand font-black text-white transition hover:-translate-y-1 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "提交中..." : "提交，获取3天体验建议"}
          </button>
          {submitted ? (
            <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-800">
              提交成功，我们会在1个工作日内联系你。
            </p>
          ) : null}
          {error ? (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-black text-red-800">
              {error}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}

function WechatFollowUp() {
  return (
    <section className="bg-white px-4 py-14 dark:bg-[#111227]">
      <div className="mx-auto max-w-5xl rounded-2xl bg-slate-50 p-6 dark:bg-white/8">
        <p className="text-sm font-black text-brand">公众号的位置</p>
        <h2 className="mt-3 text-2xl font-black text-brand-ink dark:text-white">
          公众号做后续承接，不做第一入口
        </h2>
        <p className="mt-4 leading-8 text-slate-700 dark:text-slate-300">
          从小红书和抖音来的用户先进入这个Case页体验。体验后，如果想继续看案例、避坑内容或长期咨询，再引导关注公众号。
        </p>
      </div>
    </section>
  );
}

function ChatHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = () => {
      setVisible(true);
      window.setTimeout(() => setVisible(false), 6500);
    };

    window.addEventListener("jidah:case-chat-hint", show);
    return () => window.removeEventListener("jidah:case-chat-hint", show);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-5 right-5 z-[48] h-24 w-24 rounded-full border-4 border-brand-green shadow-[0_0_0_14px_rgba(16,185,129,0.16)] animate-pulse"
      />
      <div className="fixed inset-x-4 bottom-32 z-[49] mx-auto max-w-sm rounded-2xl bg-[#ecfeff] p-5 text-cyan-950 shadow-[0_10px_24px_rgba(8,145,178,0.18)] md:bottom-10 md:right-36 md:left-auto">
        <p className="text-lg font-black">点右下角蓝色客服图标</p>
        <p className="mt-2 text-sm leading-6 text-cyan-900">
          这是即答AI客服演示入口。点开后可以直接问推荐问题。
        </p>
      </div>
    </>
  );
}

export function CasePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ConversionPath />
        <WhatToTest />
        <FitCheck />
        <LeadForm />
        <WechatFollowUp />
      </main>
      <footer className="bg-brand-ink px-4 py-8 text-white">
        <div className="mx-auto flex max-w-5xl flex-col justify-between gap-4 text-sm md:flex-row">
          <p className="font-black">即答AI客服案例体验</p>
          <p className="text-white/65">© 2026 即答</p>
        </div>
      </footer>
      <ChatHint />
    </>
  );
}
