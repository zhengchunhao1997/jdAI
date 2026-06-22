"use client"

import { FormEvent, Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LockKeyhole, Loader2, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { isLoggedIn, loginSession } from "@/lib/auth-client"

const defaultUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME ?? "admin"
const defaultPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "xiaolanmao2026"

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginShell />}>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") ?? "/dashboard"
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoggedIn()) router.replace(redirect)
  }, [redirect, router])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    window.setTimeout(() => {
      if (username.trim() === defaultUsername && password === defaultPassword) {
        loginSession(username.trim())
        router.replace(redirect)
        return
      }

      setLoading(false)
      setError("账号或密码不正确")
    }, 350)
  }

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-secondary/50 px-4 py-8">
      <section className="w-full max-w-[420px] rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-card-foreground">即答控制台登录</h1>
            <p className="text-sm text-muted-foreground">登录后查看小蓝帽客服数据和线索</p>
          </div>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-card-foreground">账号</span>
            <input
              autoComplete="username"
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15"
              onChange={(event) => setUsername(event.target.value)}
              placeholder="请输入账号"
              value={username}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-card-foreground">密码</span>
            <input
              autoComplete="current-password"
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="请输入密码"
              type="password"
              value={password}
            />
          </label>

          {error && (
            <div className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button className="h-11 w-full" disabled={loading || !username.trim() || !password} type="submit">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}
            登录控制台
          </Button>
        </form>

        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          当前为试用后台登录，正式上线后会切换为服务端账号体系。
        </p>
      </section>
    </main>
  )
}

function LoginShell() {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-secondary/50 px-4 py-8">
      <section className="w-full max-w-[420px] rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
        正在准备登录页...
      </section>
    </main>
  )
}
