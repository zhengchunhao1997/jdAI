"use client"

import { LockKeyhole, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"

export function DemoUnavailableDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6" role="presentation" onMouseDown={onClose}>
      <div
        aria-modal="true"
        className="w-full max-w-md rounded-xl border border-indigo-100 bg-white shadow-lg"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-white p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <LockKeyhole className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-indigo-950">演示版本暂不开放</h2>
              <p className="mt-1 text-sm leading-relaxed text-indigo-700">
                当前功能属于正式后台操作能力，演示环境仅开放数据查看与客服体验。
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-4 p-5">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm leading-relaxed text-emerald-800">
            正式版本可开启完整权限，包括线索分配、人工接管、知识库维护、消息通知和系统配置。
          </div>
          <div className="flex justify-end">
            <Button onClick={onClose}>我知道了</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DemoUnavailablePanel({ onOpen }: { onOpen: () => void }) {
  return (
    <section className="rounded-xl border border-indigo-100 bg-white">
      <div className="border-b border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-emerald-50 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <LockKeyhole className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-indigo-950">知识库管理暂不开放</h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-indigo-700">
                演示版本只展示客服数据和分析结果，知识库新增、编辑和发布能力会在正式后台中开放。
              </p>
            </div>
          </div>
          <Button onClick={onOpen} className="w-full md:w-auto">
            查看开放说明
          </Button>
        </div>
      </div>
      <div className="grid gap-3 p-5 md:grid-cols-3">
        {[
          ["标准问答维护", "统一管理产品、价格、用法、售后等标准答案。"],
          ["未命中补充", "把客户问到但 AI 没答好的问题沉淀成知识。"],
          ["发布与回滚", "正式版本支持审核后发布，避免错误内容影响客服。"],
        ].map(([title, description]) => (
          <div key={title} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-indigo-700">
              <Sparkles className="h-4 w-4" />
            </div>
            <p className="font-semibold text-slate-950">{title}</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
