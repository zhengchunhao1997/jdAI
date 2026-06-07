"use client";

import { FormEvent, useState } from "react";

const suggestedQuestions = [
  "即答适合我这个行业吗？",
  "¥599/月起包含什么？",
  "多久能上线试跑？",
  "AI答不上来怎么办？",
];

const pathItems = ["看内容", "进案例页", "问AI客服", "留资诊断"];

const useCases = [
  ["电商", "价格、发货、退换货、活动咨询"],
  ["教培", "课程介绍、适合人群、报名流程"],
  ["本地服务", "预约、项目、地址、套餐说明"],
];

const fitChecks = [
  "每天有 30 条以上重复咨询",
  "客户问题集中在价格、流程、售后、预约",
  "已有产品资料、FAQ、价格表或标准话术",
  "希望先接一个入口，跑通后再扩展",
];

const leadSources = ["小红书", "抖音", "公众号", "朋友推荐", "其他"];

function chatHref(question?: string) {
  return question ? `/chat?q=${encodeURIComponent(question)}` : "/chat";
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-[#0f1024]/95">
      <nav className="mx-auto flex h-14 max-w-4xl items-center justify-between px-3 min-[380px]:px-4" aria-label="案例页导航">
        <a href="/" className="flex min-w-0 items-center gap-2 font-black text-brand">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand text-sm text-white">
            答
          </span>
          <span className="truncate">即答</span>
        </a>
        <div className="flex items-center gap-2">
          <a
            href="/"
            className="hidden rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-brand-ink hover:border-brand hover:text-brand dark:border-white/20 dark:text-white min-[420px]:inline-flex"
          >
            查看官网
          </a>
          <a href="/chat" className="rounded-full bg-brand px-4 py-2 text-sm font-black text-white hover:bg-brand-dark">
            体验AI
          </a>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#f7f8ff] px-3 pb-10 pt-7 dark:bg-[#0f1024] min-[380px]:px-4 sm:pt-10">
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_82%_0%,rgba(124,58,237,0.22),transparent_36%),radial-gradient(circle_at_10%_4%,rgba(79,70,229,0.16),transparent_34%)]" />
      <div className="relative mx-auto grid max-w-4xl gap-5 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-8">
        <div className="animate-rise">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black text-brand shadow-[0_2px_8px_rgba(79,70,229,0.12)] dark:bg-white/10 dark:text-indigo-100 min-[380px]:text-sm">
            <span className="h-2 w-2 shrink-0 rounded-full bg-brand-green" />
            <span className="truncate">给小红书/抖音用户的AI客服体验页</span>
          </div>
          <h1 className="mt-5 max-w-[11ch] text-balance text-[clamp(2.3rem,12vw,4.75rem)] font-black leading-[1.04] tracking-[-0.035em] text-brand-ink dark:text-white md:max-w-[12ch]">
            手机打开，直接试即答AI客服
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-[1.02rem] leading-8 text-slate-700 dark:text-slate-300 min-[420px]:text-lg">
            不用先关注公众号。进入聊天页，直接问价格、搭建周期、适用行业和转人工规则。
          </p>
          <div className="mt-6 grid gap-3 min-[420px]:grid-cols-2">
            <a
              href="/chat"
              className="min-h-12 rounded-xl bg-brand px-5 py-3 text-center font-black text-white transition hover:-translate-y-1 hover:bg-brand-dark"
            >
              进入AI客服体验
            </a>
            <a
              href="#lead"
              className="min-h-12 rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-black text-brand-ink transition hover:-translate-y-1 hover:border-brand hover:text-brand dark:border-white/20 dark:bg-white/8 dark:text-white"
            >
              留资获取诊断
            </a>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 dark:bg-[#181935] min-[380px]:p-5 lg:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-black text-brand-ink dark:text-white">先问这4个问题</p>
              <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">
                点问题会进入聊天页并自动发送。
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800">
              在线
            </span>
          </div>
          <div className="mt-4 grid gap-2">
            {suggestedQuestions.map((question) => (
              <a
                key={question}
                href={chatHref(question)}
                className="min-h-12 rounded-xl bg-indigo-50 px-3.5 py-3 text-left text-sm font-bold leading-6 text-brand-ink transition hover:bg-indigo-100 dark:bg-white/10 dark:text-white dark:hover:bg-white/14"
              >
                {question}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PathStrip() {
  return (
    <section className="bg-brand-ink px-3 py-7 text-white dark:bg-[#080914] min-[380px]:px-4">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-black text-indigo-200">最短转化路径</p>
        <div className="mt-4 grid grid-cols-2 gap-2 min-[520px]:grid-cols-4">
          {pathItems.map((item, index) => (
            <div key={item} className="rounded-xl bg-white/10 p-3.5">
              <span className="text-xs font-black text-indigo-200">{index + 1}</span>
              <p className="mt-1 font-black">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UseCases() {
  return (
    <section className="bg-white px-3 py-12 dark:bg-[#111227] min-[380px]:px-4">
      <div className="mx-auto max-w-4xl">
        <div className="max-w-2xl">
          <p className="text-sm font-black text-brand">适合先试的场景</p>
          <h2 className="mt-3 text-balance text-[clamp(1.85rem,8vw,3rem)] font-black leading-tight tracking-[-0.025em] text-brand-ink dark:text-white">
            重复问题多，AI客服才容易跑出效果
          </h2>
          <p className="mt-4 leading-8 text-slate-700 dark:text-slate-300">
            这个页面不讲复杂系统，先让你判断即答能不能接住当前最烦的重复咨询。
          </p>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {useCases.map(([title, desc]) => (
            <article key={title} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/8">
              <h3 className="text-lg font-black text-brand-ink dark:text-white">{title}</h3>
              <p className="mt-2 leading-7 text-slate-700 dark:text-slate-300">{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FitCheck() {
  return (
    <section className="bg-brand-bg px-3 py-12 dark:bg-[#15162d] min-[380px]:px-4">
      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
        <div>
          <p className="text-sm font-black text-brand">适配判断</p>
          <h2 className="mt-3 text-[clamp(1.75rem,7vw,2.75rem)] font-black leading-tight tracking-[-0.025em] text-brand-ink dark:text-white">
            符合这些情况，建议先试跑3天
          </h2>
          <p className="mt-4 leading-8 text-slate-700 dark:text-slate-300">
            AI先处理重复、标准、低风险的问题，复杂情况继续交给人工。
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 dark:bg-[#1b1c39] min-[380px]:p-5">
          <ul className="space-y-3.5">
            {fitChecks.map((item) => (
              <li key={item} className="flex gap-3 leading-7 text-slate-700 dark:text-slate-300">
                <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-green text-xs font-black text-white">
                  ✓
                </span>
                <span>{item}</span>
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

  const fieldClass =
    "h-12 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-4 text-brand-ink outline-none placeholder:text-slate-600 focus:border-brand focus:ring-2 focus:ring-brand/15";

  return (
    <section id="lead" className="bg-gradient-to-r from-brand to-brand-purple px-3 py-12 min-[380px]:px-4">
      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="text-white">
          <p className="text-sm font-black text-indigo-100">免费诊断</p>
          <h2 className="mt-3 text-balance text-[clamp(1.9rem,8vw,3.2rem)] font-black leading-tight">
            想知道你的业务适不适合AI客服？
          </h2>
          <p className="mt-4 text-base leading-8 text-white/90 min-[420px]:text-lg">
            留下行业、咨询量和联系方式，我们帮你判断能不能先试跑。适合就给你一个3天体验建议。
          </p>
        </div>
        <form onSubmit={onSubmit} className="rounded-2xl bg-white p-4 min-[380px]:p-5 lg:p-6">
          <div className="grid gap-3.5 min-[560px]:grid-cols-2">
            <input required name="name" placeholder="称呼" className={fieldClass} />
            <input required name="company" placeholder="公司/行业" className={fieldClass} />
            <input required name="phone" placeholder="手机号" inputMode="tel" className={fieldClass} />
            <input name="wechat" placeholder="微信号" className={fieldClass} />
            <input
              name="dailyConsults"
              placeholder="每天大概多少咨询"
              className={`${fieldClass} min-[560px]:col-span-2`}
            />
            <select
              name="source"
              defaultValue=""
              className={`${fieldClass} min-[560px]:col-span-2`}
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
            className="mt-4 min-h-12 w-full rounded-xl bg-brand px-4 py-3 font-black text-white transition hover:-translate-y-1 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
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
    <section className="bg-white px-3 py-12 dark:bg-[#111227] min-[380px]:px-4">
      <div className="mx-auto max-w-4xl rounded-2xl bg-slate-50 p-5 dark:bg-white/8">
        <p className="text-sm font-black text-brand">公众号怎么用</p>
        <h2 className="mt-3 text-2xl font-black leading-tight text-brand-ink dark:text-white">
          公众号做后续承接，Case页做第一入口
        </h2>
        <p className="mt-4 leading-8 text-slate-700 dark:text-slate-300">
          从内容平台来的用户先打开这个页面体验。体验后，再引导关注公众号看案例、避坑内容和后续客服问答。
        </p>
      </div>
    </section>
  );
}

export function CasePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <PathStrip />
        <UseCases />
        <FitCheck />
        <LeadForm />
        <WechatFollowUp />
      </main>
      <footer className="bg-brand-ink px-3 py-8 text-white min-[380px]:px-4">
        <div className="mx-auto flex max-w-4xl flex-col justify-between gap-3 pb-16 text-sm lg:flex-row lg:pb-0">
          <p className="font-black">即答AI客服案例体验</p>
          <p className="text-white/65">© 2026 即答</p>
        </div>
      </footer>
    </>
  );
}
