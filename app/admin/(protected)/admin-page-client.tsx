"use client"

import { useTheme } from "@/components/theme-provider"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Moon, Sun } from "lucide-react"
import { logoutAdmin } from "@/app/admin/actions"
import { AdminDashboard } from "@/app/admin/(protected)/admin-dashboard"
import type { AdminDashboardData } from "@/lib/admin-metrics"

// ─── ThemeToggle ──────────────────────────────────────────────────────────────

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      type="button"
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      title={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/8 text-white/80 transition hover:bg-white/14 hover:text-white"
    >
      {isDark ? <Sun aria-hidden="true" size={18} /> : <Moon aria-hidden="true" size={18} />}
    </button>
  )
}

// ─── AdminPageClient ──────────────────────────────────────────────────────────

export function AdminPageClient({
  dashboardData,
  loadError,
}: {
  dashboardData: AdminDashboardData
  loadError: string | null
}) {
  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--background)" }}
    >
      {/* ── wrapper centralizado ── */}
      <div className="mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <div className="flex flex-col gap-8">

          {/* ── header card ── */}
          <div
            className="relative overflow-hidden rounded-[28px]"
            style={{
              background: "linear-gradient(135deg, #180f1b 0%, #161018 100%)",
              boxShadow: "0 18px 50px rgba(24,15,27,0.18)",
            }}
          >
            {/* glow decorativo */}
            <div
              aria-hidden
              className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(149, 30, 201, 0.12) 0%, transparent 70%)",
              }}
            />

            {/* ── topbar: badge + controles ── */}
            <div className="relative flex flex-col gap-4 border-b border-white/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <img src="/images/happy-hot-logo.svg" alt="Happy Hot Admin" className="h-8 w-36 object-contain object-left" />

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Link href="/admin/modelos" className="inline-flex h-9 items-center rounded-xl bg-purple-600 px-4 text-xs font-semibold text-white transition hover:bg-purple-500">
                  Gerenciar modelos
                </Link>
                <ThemeToggle />
                <form action={logoutAdmin}>
                  <button
                    type="submit"
                    className="inline-flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/6 px-4 text-xs font-medium text-white/80 transition hover:bg-white/12 hover:text-white"
                  >
                    Sair
                  </button>
                </form>
              </div>
            </div>

            {/* ── headline ── */}
            <div className="relative px-5 py-8 sm:px-8 sm:py-10 lg:py-12">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-purple-300">Visão do negócio</p>
              <h1 className="max-w-5xl text-3xl font-medium tracking-tight text-white sm:text-4xl sm:leading-snug">
                Receita, clientes e recorrência em um único painel.
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/55">
                Dados agregados por e-mail · leitura rápida da base · status de acesso · histórico de pagamentos.
              </p>
            </div>
          </div>

          {/* ── error banner ── */}
          {loadError && (
            <div
              className="rounded-2xl border border-amber-300/40 px-6 py-5"
              style={{ background: "var(--muted)" }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500">
                Falha ao carregar dados
              </p>
              <h2 className="mt-1 text-lg font-normal" style={{ color: "var(--foreground)" }}>
                O painel abriu, mas a base não respondeu.
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                {loadError}
              </p>
            </div>
          )}

          {/* ── dashboard ── */}
          <AdminDashboard data={dashboardData} />

        </div>
      </div>
    </main>
  )
}
