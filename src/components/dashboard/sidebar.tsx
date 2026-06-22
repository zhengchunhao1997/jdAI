"use client"

import {
  LayoutDashboard,
  MessagesSquare,
  Users,
  Filter,
  CircleHelp,
  BookOpen,
  PieChart,
  Settings,
  Bot,
  X,
} from "lucide-react"
import type { DashboardSection } from "@/lib/admin-api"

const nav = [
  { id: "overview", label: "今日效果总览", icon: LayoutDashboard },
  { id: "analytics", label: "线索转化漏斗", icon: Filter },
  { id: "leads", label: "高意向客户", icon: Users },
  { id: "handoffs", label: "客户问题统计", icon: PieChart },
  { id: "sessions", label: "沟通记录", icon: MessagesSquare },
  { id: "missed", label: "未命中问题", icon: CircleHelp },
  { id: "knowledge", label: "知识库管理", icon: BookOpen },
  { id: "settings", label: "系统设置", icon: Settings },
]

export function Sidebar({
  open,
  active,
  badges,
  onClose,
  onNavigate,
}: {
  open: boolean
  active: DashboardSection
  badges: Partial<Record<DashboardSection, number>>
  onClose: () => void
  onNavigate: (section: DashboardSection) => void
}) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between gap-2 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-white px-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Bot className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-950">即答 AI 客服</p>
              <p className="text-xs text-indigo-700">客户控制台</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-indigo-50 hover:text-indigo-700 lg:hidden"
            aria-label="关闭菜单"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          {nav.map((item) => {
            const Icon = item.icon
            const activeItem = active === item.id
            const badge = badges[item.id as DashboardSection]
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  onNavigate(item.id as DashboardSection)
                  onClose()
                }}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                  activeItem
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                </span>
                {typeof badge === "number" && badge > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      activeItem
                        ? "bg-white/20 text-white"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="mb-2 text-xs font-medium text-emerald-700">当前项目</p>
            <p className="text-sm font-semibold text-emerald-950">小蓝帽减肥产品</p>
            <p className="mt-1 text-xs text-emerald-700">Coze 数据每 3 分钟同步</p>
          </div>
        </div>
      </aside>
    </>
  )
}
