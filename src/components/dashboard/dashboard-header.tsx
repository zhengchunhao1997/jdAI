"use client"

import { Bell, ExternalLink, LogOut, Menu, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { logoutSession } from "@/lib/auth-client"

export function DashboardHeader({ onMenu }: { onMenu: () => void }) {
  const router = useRouter()

  function handleLogout() {
    logoutSession()
    router.replace("/login?redirect=/dashboard")
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      <div className="flex flex-1 items-center gap-3">
        <button
          onClick={onMenu}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          aria-label="打开菜单"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative hidden w-full max-w-md md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <input
            aria-label="搜索客户"
            className="h-9 w-full rounded-lg border border-transparent bg-gray-50 pl-9 pr-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-500 focus:border-indigo-500 focus:bg-white focus:ring-3 focus:ring-indigo-500/15"
            placeholder="搜索客户昵称、手机号..."
            type="search"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 md:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-sm font-medium text-gray-700">Bot 运行中</span>
        </div>
        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link href="/xiaolanmao/chat">
            <ExternalLink className="h-4 w-4" />
            体验 AI 客服
          </Link>
        </Button>
        <button className="relative text-gray-500 transition-colors hover:text-gray-700" aria-label="通知">
          <Bell size={20} />
          <span className="absolute right-0 top-0 h-2 w-2 rounded-full border border-white bg-red-500" />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
          <User size={16} />
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="退出登录">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
