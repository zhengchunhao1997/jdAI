"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import {
  AnalyticsPanel,
  ConversationInsight,
  ConcernPanel,
  EffectOverviewPanel,
  FunnelPanel,
  HighIntentLeadsPanel,
  KnowledgePanel,
  LeadsPanel,
  MissedPanel,
  SessionsPanel,
  SettingsPanel,
} from "@/components/dashboard/admin-panels"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Sidebar } from "@/components/dashboard/sidebar"
import {
  type AdminConversation,
  type AdminLead,
  type AdminMerchant,
  type AdminMissedQuestion,
  type AdminOverview,
  type DashboardSection,
  type KnowledgeItem,
  adminFetch,
} from "@/lib/admin-api"
import { isLoggedIn } from "@/lib/auth-client"

type OverviewResponse = {
  metrics: AdminOverview["metrics"]
  sessions: AdminConversation[]
  handoffReasons: AdminOverview["handoffReasons"]
  missedQuestionsList: AdminMissedQuestion[]
  channelLeads: AdminOverview["channelLeads"]
  trend: AdminOverview["trend"]
  funnel?: AdminOverview["funnel"]
  concernRanking?: AdminOverview["concernRanking"]
  hotQuestions?: AdminOverview["hotQuestions"]
  highIntentLeads?: AdminOverview["highIntentLeads"]
}

type DashboardState = {
  overview: AdminOverview | null
  sessions: AdminConversation[]
  leads: AdminLead[]
  handoffs: AdminConversation[]
  missedQuestions: AdminMissedQuestion[]
  knowledgeItems: KnowledgeItem[]
  merchant: AdminMerchant | null
}

const initialState: DashboardState = {
  overview: null,
  sessions: [],
  leads: [],
  handoffs: [],
  missedQuestions: [],
  knowledgeItems: [],
  merchant: null,
}

export default function DashboardPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [active, setActive] = useState<DashboardSection>("overview")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [state, setState] = useState<DashboardState>(initialState)
  const [loading, setLoading] = useState(true)
  const [authChecked] = useState(() => typeof window !== "undefined" && isLoggedIn())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authChecked) {
      router.replace("/login?redirect=/dashboard")
    }
  }, [authChecked, router])

  useEffect(() => {
    if (!authChecked) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const overview = await adminFetch<OverviewResponse>("/api/admin/overview")
        const [sessions, leads, handoffs, missed, knowledge, settings] = await Promise.all([
          optionalAdminFetch<{ sessions: AdminConversation[] }>("/api/admin/sessions", { sessions: overview.sessions ?? [] }),
          optionalAdminFetch<{ leads: AdminLead[] }>("/api/admin/leads", { leads: overview.highIntentLeads ?? [] }),
          optionalAdminFetch<{ handoffs: AdminConversation[] }>("/api/admin/handoffs", { handoffs: [] }),
          optionalAdminFetch<{ missedQuestions: AdminMissedQuestion[] }>("/api/admin/missed-questions", {
            missedQuestions: overview.missedQuestionsList ?? [],
          }),
          optionalAdminFetch<{ knowledgeItems: KnowledgeItem[] }>("/api/admin/knowledge", { knowledgeItems: [] }),
          optionalAdminFetch<{ merchant: AdminMerchant | null }>("/api/admin/settings", { merchant: null }),
        ])

        if (cancelled) return

        setState({
          overview,
          sessions: sessions.sessions,
          leads: leads.leads,
          handoffs: handoffs.handoffs,
          missedQuestions: missed.missedQuestions,
          knowledgeItems: knowledge.knowledgeItems,
          merchant: settings.merchant,
        })
        setSelectedId((current) => current ?? sessions.sessions[0]?.id ?? null)
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "后台数据加载失败")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [authChecked])

  const selected = useMemo(
    () => state.sessions.find((item) => item.id === selectedId) ?? state.sessions[0] ?? null,
    [selectedId, state.sessions],
  )

  const badges = {
    leads: state.overview?.metrics.highIntentLeads,
    handoffs: state.overview?.metrics.pendingHandoffs,
    missed: state.overview?.metrics.missedQuestions,
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        open={sidebarOpen}
        active={active}
        badges={badges}
        onClose={() => setSidebarOpen(false)}
        onNavigate={setActive}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader onMenu={() => setSidebarOpen(true)} />

        <main className="flex-1 space-y-6 overflow-y-auto p-4 md:p-6">
          {!authChecked && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">正在检查登录状态...</div>
          )}
          {authChecked && loading && <DashboardSkeleton />}
          {authChecked && error && <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>}

          {authChecked && !loading && !error && (
            <>
              {active === "overview" && (
                <>
                  <EffectOverviewPanel overview={state.overview} />
                  <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <div className="xl:col-span-2">
                      <FunnelPanel overview={state.overview} />
                    </div>
                    <ConversationInsight session={selected} />
                  </div>
                  <HighIntentLeadsPanel leads={state.overview?.highIntentLeads ?? state.leads.filter((lead) => lead.intentLevel === "HIGH")} />
                  <ConcernPanel overview={state.overview} />
                  <MissedPanel questions={state.missedQuestions.slice(0, 6)} />
                  <SessionsPanel sessions={state.sessions} selectedId={selected?.id ?? null} onSelect={setSelectedId} />
                </>
              )}

              {active === "sessions" && (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                  <div className="xl:col-span-2">
                    <SessionsPanel sessions={state.sessions} selectedId={selected?.id ?? null} onSelect={setSelectedId} />
                  </div>
                  <ConversationInsight session={selected} />
                </div>
              )}

              {active === "leads" && <LeadsPanel leads={state.leads} />}
              {active === "handoffs" && <ConcernPanel overview={state.overview} />}
              {active === "missed" && <MissedPanel questions={state.missedQuestions} />}
              {active === "knowledge" && (
                <KnowledgePanel
                  readOnly
                  items={state.knowledgeItems}
                  onCreated={(item) =>
                    setState((current) => ({
                      ...current,
                      knowledgeItems: [item, ...current.knowledgeItems],
                    }))
                  }
                />
              )}
              {active === "analytics" && (
                <>
                  <EffectOverviewPanel overview={state.overview} />
                  <FunnelPanel overview={state.overview} />
                  <ConcernPanel overview={state.overview} />
                  <AnalyticsPanel overview={state.overview} />
                </>
              )}
              {active === "settings" && (
                <SettingsPanel
                  readOnly
                  merchant={state.merchant}
                  onSaved={(merchant) =>
                    setState((current) => ({
                      ...current,
                      merchant,
                    }))
                  }
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="rounded-xl border border-gray-200 bg-white p-4" key={index}>
            <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
            <div className="mt-4 h-8 w-16 animate-pulse rounded bg-gray-100" />
            <div className="mt-3 h-3 w-32 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl border border-gray-200 bg-white" />
    </div>
  )
}

async function optionalAdminFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    return await adminFetch<T>(path)
  } catch (error) {
    console.warn(`后台非核心数据加载失败：${path}`, error)
    return fallback
  }
}
